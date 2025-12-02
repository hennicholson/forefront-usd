import { groqClient } from '@/lib/groq/client'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  type?: string
  metadata?: any
}

export interface ContextConfig {
  level: 'minimal' | 'standard' | 'full' | 'extended'
  maxTokens?: number
  includeRecent?: number  // Number of recent messages to always include
  relevanceThreshold?: number  // 0-1 score for relevance filtering
}

export interface ManagedContext {
  conversationHistory: ConversationMessage[]
  tokenCount: number
  summary?: string  // Summary of older messages not included
  contextLevel: string
  filteredCount: number
  totalAvailable: number
  hasSummary: boolean  // Whether a summary was generated
  summarizedCount: number  // How many messages were summarized
}

/**
 * Smart conversation context manager with token counting, relevance filtering, and summarization
 * Implements 2025 best practices: hybrid approach (recent messages + summarized history)
 */
export class ConversationContextManager {
  private static readonly TOKENS_PER_CHAR = 0.25  // Rough estimate: 4 chars per token
  private static readonly SUMMARY_RESERVE_TOKENS = 500  // Reserve tokens for summary

  /**
   * Get managed context based on query and configuration
   */
  async getContext(
    query: string,
    conversationHistory: ConversationMessage[],
    config: ContextConfig = { level: 'standard' }
  ): Promise<ManagedContext> {
    // Set defaults based on context level
    const settings = this.getContextLevelSettings(config.level)
    const maxTokens = config.maxTokens || settings.maxTokens
    const includeRecent = config.includeRecent ?? settings.includeRecent
    const relevanceThreshold = config.relevanceThreshold ?? settings.relevanceThreshold

    console.log(`[Context Manager] Level: ${config.level}, Max tokens: ${maxTokens}, Recent: ${includeRecent}`)

    // If conversation is empty or minimal context requested
    if (conversationHistory.length === 0 || config.level === 'minimal') {
      return {
        conversationHistory: [],
        tokenCount: 0,
        contextLevel: config.level,
        filteredCount: 0,
        totalAvailable: conversationHistory.length,
        hasSummary: false,
        summarizedCount: 0
      }
    }

    // If full context requested and within token limit
    if (config.level === 'full' || config.level === 'extended') {
      const fullContext = conversationHistory
      const tokenCount = this.estimateTokenCount(fullContext)

      if (tokenCount <= maxTokens) {
        return {
          conversationHistory: fullContext,
          tokenCount,
          contextLevel: config.level,
          filteredCount: fullContext.length,
          totalAvailable: conversationHistory.length,
          hasSummary: false,
          summarizedCount: 0
        }
      }
    }

    // HYBRID APPROACH: Recent messages + Summarized older messages
    // This implements 2025 best practice "Conversation Summary Buffer Memory"
    const hybridContext = await this.buildHybridContext(
      query,
      conversationHistory,
      maxTokens,
      includeRecent,
      relevanceThreshold
    )

    return hybridContext
  }

  /**
   * Get settings for each context level
   */
  private getContextLevelSettings(level: string) {
    const settings = {
      minimal: {
        maxTokens: 500,        // Just the current query
        includeRecent: 0,
        relevanceThreshold: 0.9
      },
      standard: {
        maxTokens: 2000,       // Last few messages + relevant context
        includeRecent: 4,      // Last 2 exchanges (4 messages)
        relevanceThreshold: 0.6
      },
      full: {
        maxTokens: 8000,       // Most of the conversation
        includeRecent: 10,
        relevanceThreshold: 0.4
      },
      extended: {
        maxTokens: 16000,      // Nearly everything
        includeRecent: 20,
        relevanceThreshold: 0.2
      }
    }

    return settings[level as keyof typeof settings] || settings.standard
  }

  /**
   * Build hybrid context: recent messages + summary of older messages
   * Implements Conversation Summary Buffer Memory pattern
   */
  private async buildHybridContext(
    query: string,
    conversationHistory: ConversationMessage[],
    maxTokens: number,
    includeRecent: number,
    relevanceThreshold: number
  ): Promise<ManagedContext> {
    // Step 1: Split into recent and older messages
    const recentMessages = conversationHistory.slice(-includeRecent)
    const olderMessages = conversationHistory.slice(0, -includeRecent)

    // Step 2: Check recent messages token count
    const recentTokens = this.estimateTokenCount(recentMessages)

    console.log(`[Context Manager] Recent: ${recentMessages.length} msgs (${recentTokens} tokens), Older: ${olderMessages.length} msgs`)

    // If recent messages already exceed budget, truncate them
    if (recentTokens >= maxTokens) {
      const truncated = this.truncateToTokenLimit(recentMessages, maxTokens)
      return {
        conversationHistory: truncated,
        tokenCount: this.estimateTokenCount(truncated),
        contextLevel: 'standard',
        filteredCount: truncated.length,
        totalAvailable: conversationHistory.length,
        hasSummary: false,
        summarizedCount: 0
      }
    }

    // Step 3: If no older messages, just return recent
    if (olderMessages.length === 0) {
      return {
        conversationHistory: recentMessages,
        tokenCount: recentTokens,
        contextLevel: 'standard',
        filteredCount: recentMessages.length,
        totalAvailable: conversationHistory.length,
        hasSummary: false,
        summarizedCount: 0
      }
    }

    // Step 4: We have room for more context - try to summarize older messages
    const remainingBudget = maxTokens - recentTokens - ConversationContextManager.SUMMARY_RESERVE_TOKENS

    // If we have budget for summary, generate it
    if (remainingBudget > 200 && olderMessages.length > 2) {
      console.log(`[Context Manager] Generating summary of ${olderMessages.length} older messages...`)

      const summary = await this.summarizeConversation(olderMessages, query)
      const summaryTokens = this.estimateTokenCount([{ role: 'assistant', content: summary }])

      console.log(`[Context Manager] Summary generated: ${summaryTokens} tokens`)

      // Add summary as a synthetic "assistant" message at the beginning
      const summaryMessage: ConversationMessage = {
        role: 'assistant',
        content: `[Summary of earlier conversation (${olderMessages.length} messages)]: ${summary}`,
        metadata: { isSummary: true, summarizedCount: olderMessages.length }
      }

      return {
        conversationHistory: [summaryMessage, ...recentMessages],
        tokenCount: summaryTokens + recentTokens,
        summary,
        contextLevel: 'standard',
        filteredCount: recentMessages.length + 1,
        totalAvailable: conversationHistory.length,
        hasSummary: true,
        summarizedCount: olderMessages.length
      }
    }

    // Step 5: Not enough budget for summary - try selective filtering instead
    const filteredOlder = await this.filterRelevantContext(
      query,
      olderMessages,
      remainingBudget,
      0,
      relevanceThreshold
    )

    return {
      conversationHistory: [...filteredOlder, ...recentMessages],
      tokenCount: this.estimateTokenCount([...filteredOlder, ...recentMessages]),
      contextLevel: 'standard',
      filteredCount: filteredOlder.length + recentMessages.length,
      totalAvailable: conversationHistory.length,
      hasSummary: false,
      summarizedCount: 0
    }
  }

  /**
   * Summarize older conversation messages using fast LLM
   * Uses Llama 3.1 8B for quick, cheap summarization
   */
  private async summarizeConversation(
    messages: ConversationMessage[],
    currentQuery: string
  ): Promise<string> {
    try {
      // Build conversation text
      const conversationText = messages.map(m =>
        `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`
      ).join('\n\n')

      // Summarization prompt
      const systemPrompt = `You are a conversation summarizer. Your job is to create a concise summary of a student's learning conversation that preserves key concepts, questions, and explanations.

IMPORTANT: Keep the summary focused on information that would be relevant to this current query: "${currentQuery}"

Focus on:
1. Main topics discussed
2. Key concepts explained
3. Important questions the student asked
4. Student's learning progress or confusion points

Keep it concise (2-4 sentences) but informative.`

      const response = await groqClient.chat({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Summarize this conversation:\n\n${conversationText}` }
        ],
        temperature: 0.3,
        maxTokens: 300,
        stream: false
      }) as any

      const summary = response.choices?.[0]?.message?.content || 'Earlier conversation about AI concepts.'
      return summary
    } catch (error) {
      console.error('[Context Manager] Summarization error:', error)
      // Fallback: simple concatenation summary
      return `Earlier discussion covered ${messages.length} topics including ${messages.slice(0, 3).map(m => m.content.substring(0, 50)).join(', ')}`
    }
  }

  /**
   * Filter conversation history based on relevance to current query
   */
  private async filterRelevantContext(
    query: string,
    conversationHistory: ConversationMessage[],
    maxTokens: number,
    includeRecent: number,
    relevanceThreshold: number
  ): Promise<ConversationMessage[]> {
    // Always include the most recent N messages
    const recentMessages = conversationHistory.slice(-includeRecent)
    const olderMessages = conversationHistory.slice(0, -includeRecent)

    // If recent messages are within token limit, we're done
    const recentTokens = this.estimateTokenCount(recentMessages)
    if (recentTokens >= maxTokens) {
      // Truncate recent messages to fit
      return this.truncateToTokenLimit(recentMessages, maxTokens)
    }

    // We have room for more context - score and filter older messages
    const remainingTokenBudget = maxTokens - recentTokens

    if (olderMessages.length === 0) {
      return recentMessages
    }

    // Score older messages for relevance
    const scoredMessages = await this.scoreMessageRelevance(query, olderMessages)

    // Filter by threshold and sort by score
    const relevantOlderMessages = scoredMessages
      .filter(m => m.score >= relevanceThreshold)
      .sort((a, b) => b.score - a.score)

    // Add relevant messages until we hit token limit
    const selectedOlderMessages: ConversationMessage[] = []
    let currentTokens = 0

    for (const scoredMsg of relevantOlderMessages) {
      const msgTokens = this.estimateTokenCount([scoredMsg.message])
      if (currentTokens + msgTokens <= remainingTokenBudget) {
        selectedOlderMessages.push(scoredMsg.message)
        currentTokens += msgTokens
      } else {
        break
      }
    }

    // Combine selected older messages with recent messages (preserve chronological order)
    return [...selectedOlderMessages.sort((a, b) => {
      const aIndex = conversationHistory.indexOf(a)
      const bIndex = conversationHistory.indexOf(b)
      return aIndex - bIndex
    }), ...recentMessages]
  }

  /**
   * Score messages based on relevance to current query
   * Enhanced semantic scoring (prepares for future embeddings integration)
   */
  private async scoreMessageRelevance(
    query: string,
    messages: ConversationMessage[]
  ): Promise<Array<{ message: ConversationMessage; score: number }>> {
    const queryLower = query.toLowerCase()
    const queryTerms = this.extractKeyTerms(queryLower)
    const queryExpanded = this.expandSemanticTerms(queryTerms)

    return messages.map((message, index) => {
      const contentLower = message.content.toLowerCase()

      // 1. ENHANCED TERM MATCHING with semantic expansion
      const exactMatches = queryTerms.filter(term => contentLower.includes(term)).length
      const semanticMatches = queryExpanded.filter(term => contentLower.includes(term)).length

      const exactScore = queryTerms.length > 0 ? exactMatches / queryTerms.length : 0
      const semanticScore = queryExpanded.length > 0 ? semanticMatches / queryExpanded.length : 0
      const termScore = (exactScore * 0.7) + (semanticScore * 0.3)

      // 2. TF-IDF-LIKE scoring: rare terms matter more
      const rareTermScore = this.calculateRareTermScore(queryTerms, contentLower, messages)

      // 3. Message quality scoring
      const lengthScore = Math.min(message.content.length / 500, 1)
      const isSubstantive = message.content.length > 100 ? 0.2 : 0

      // 4. Role-based scoring (prefer assistant responses with details)
      const roleScore = message.role === 'assistant' && message.content.length > 150 ? 0.3 : 0

      // 5. Position in conversation (messages closer together often have thematic connection)
      const positionScore = 0.05 // Small baseline

      // 6. Technical term bonus (code blocks, technical keywords)
      const technicalScore = this.hasTechnicalContent(message.content) ? 0.15 : 0

      // Weighted combination
      const score = (
        (termScore * 0.35) +
        (rareTermScore * 0.2) +
        (lengthScore * 0.15) +
        (isSubstantive * 0.1) +
        (roleScore * 0.1) +
        (positionScore * 0.05) +
        (technicalScore * 0.05)
      )

      return { message, score }
    })
  }

  /**
   * Extract key terms from query (filter stop words, focus on content words)
   */
  private extractKeyTerms(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for',
      'of', 'as', 'by', 'from', 'that', 'this', 'it', 'be', 'are', 'was', 'were', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might'
    ])

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 3 && !stopWords.has(term))
  }

  /**
   * Expand query terms with semantic variants
   * Prepares for future embeddings-based search
   */
  private expandSemanticTerms(terms: string[]): string[] {
    const expansions: Record<string, string[]> = {
      // AI/ML terms
      'neural': ['network', 'deep', 'learning', 'model'],
      'model': ['neural', 'machine', 'learning', 'train'],
      'training': ['train', 'learning', 'optimization', 'gradient'],
      'gradient': ['descent', 'backpropagation', 'optimization'],
      'backprop': ['backpropagation', 'gradient', 'training'],
      'backpropagation': ['backprop', 'gradient', 'chain rule'],

      // Programming terms
      'function': ['method', 'procedure', 'subroutine'],
      'variable': ['parameter', 'argument', 'value'],
      'error': ['bug', 'issue', 'problem', 'exception'],
      'debug': ['debugging', 'troubleshoot', 'fix'],

      // General learning terms
      'explain': ['describe', 'clarify', 'elaborate'],
      'understand': ['comprehend', 'grasp', 'learn'],
      'example': ['sample', 'demonstration', 'instance']
    }

    const expanded = new Set<string>()

    for (const term of terms) {
      expanded.add(term)
      if (expansions[term]) {
        expansions[term].forEach(exp => expanded.add(exp))
      }
    }

    return Array.from(expanded)
  }

  /**
   * Calculate rare term score (terms that appear infrequently are more valuable)
   */
  private calculateRareTermScore(
    queryTerms: string[],
    content: string,
    allMessages: ConversationMessage[]
  ): number {
    let rareScore = 0
    const totalDocs = allMessages.length

    for (const term of queryTerms) {
      const docsContainingTerm = allMessages.filter(m =>
        m.content.toLowerCase().includes(term)
      ).length

      if (docsContainingTerm > 0) {
        // IDF-like score: rarer terms get higher scores
        const idf = Math.log(totalDocs / docsContainingTerm)
        const tf = content.includes(term) ? 1 : 0
        rareScore += tf * idf
      }
    }

    return Math.min(rareScore / Math.max(queryTerms.length, 1), 1)
  }

  /**
   * Check if message contains technical content (code, technical terms)
   */
  private hasTechnicalContent(content: string): boolean {
    const technicalIndicators = [
      '```',  // Code blocks
      'function', 'const', 'let', 'var', 'class', 'import', 'export',
      'async', 'await', 'return', 'if', 'else', 'for', 'while',
      '()', '{}', '=>', '==', '===',
      'API', 'HTTP', 'JSON', 'SQL', 'URL'
    ]

    return technicalIndicators.some(indicator => content.includes(indicator))
  }

  /**
   * Estimate token count for messages
   */
  private estimateTokenCount(messages: ConversationMessage[]): number {
    const totalChars = messages.reduce((sum, msg) => {
      return sum + msg.content.length + (msg.role.length * 2)  // Account for role labels
    }, 0)

    return Math.ceil(totalChars * ConversationContextManager.TOKENS_PER_CHAR)
  }

  /**
   * Truncate messages to fit within token limit
   */
  private truncateToTokenLimit(
    messages: ConversationMessage[],
    maxTokens: number
  ): ConversationMessage[] {
    const result: ConversationMessage[] = []
    let currentTokens = 0

    // Add messages from most recent backward
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      const msgTokens = this.estimateTokenCount([msg])

      if (currentTokens + msgTokens <= maxTokens) {
        result.unshift(msg)
        currentTokens += msgTokens
      } else {
        break
      }
    }

    return result
  }

  /**
   * Create a summary of filtered context for logging
   */
  createContextSummary(managedContext: ManagedContext): string {
    const base = `Context: ${managedContext.filteredCount}/${managedContext.totalAvailable} messages, ${managedContext.tokenCount} tokens (level: ${managedContext.contextLevel})`

    if (managedContext.hasSummary) {
      return `${base} [📝 ${managedContext.summarizedCount} messages summarized]`
    }

    return base
  }

  /**
   * Determine optimal context level based on query intent
   */
  suggestContextLevel(intent: {
    type: string
    needsChaining?: boolean
    complexity?: string
  }): 'minimal' | 'standard' | 'full' | 'extended' {
    // Chained queries may need extended context
    if (intent.needsChaining) {
      return 'full'
    }

    // High complexity queries benefit from more context
    if (intent.complexity === 'high') {
      return 'full'
    }

    // Simple queries don't need much context
    if (intent.type === 'simple' || intent.complexity === 'low') {
      return 'minimal'
    }

    // Image generation doesn't need conversation context
    if (intent.type === 'image-generation') {
      return 'minimal'
    }

    // Default to standard
    return 'standard'
  }
}

// Export singleton instance
export const contextManager = new ConversationContextManager()
