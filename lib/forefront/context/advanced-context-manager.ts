/**
 * Advanced Context Manager for Forefront Intelligence
 * Intelligently manages conversation context with token budgeting, summarization, and semantic compression
 *
 * Features:
 * - Token-conscious context windows per model
 * - Intelligent summarization of older messages
 * - Semantic importance scoring
 * - Model-specific context formatting
 */

import { getGroqModel, calculateTokenBudget, type GroqModelSpec } from '../models/groq-registry'

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  timestamp?: number
  metadata?: {
    toolName?: string
    imageUrl?: string
    citations?: any[]
    importance?: number  // 0-1 semantic importance score
  }
}

export interface ContextWindow {
  messages: Message[]
  tokenCount: number
  compressionApplied: boolean
  summarizedCount: number
  originalMessageCount: number
}

export interface ContextCompressionStrategy {
  // Keep most recent N messages verbatim
  recentMessagesKeepVerbatim: number

  // Summarize older messages in chunks
  summarizationEnabled: boolean
  summarizationChunkSize: number  // Group N messages for summarization

  // Semantic filtering
  semanticFilteringEnabled: boolean
  minImportanceScore: number  // 0-1, drop messages below this score

  // Token budgeting
  targetTokenBudget: number
  maxTokenBudget: number
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Calculate semantic importance score for a message
 * Higher score = more important to preserve
 */
function calculateImportanceScore(message: Message, context: {
  conversationLength: number
  position: number  // 0-based index in conversation
  hasToolCalls: boolean
}): number {
  let score = 0.5  // Base score

  // Recent messages are more important
  const recency = 1 - (context.position / context.conversationLength)
  score += recency * 0.3

  // Tool results are important
  if (message.role === 'tool' || message.metadata?.toolName) {
    score += 0.2
  }

  // User messages are important (questions, requests)
  if (message.role === 'user') {
    score += 0.15
  }

  // Long messages often contain important information
  if (message.content.length > 500) {
    score += 0.1
  }

  // Messages with citations/references are important
  if (message.metadata?.citations && message.metadata.citations.length > 0) {
    score += 0.1
  }

  // Images are important
  if (message.metadata?.imageUrl) {
    score += 0.15
  }

  return Math.min(score, 1.0)
}

/**
 * Summarize a chunk of messages into a concise summary
 */
async function summarizeMessageChunk(
  messages: Message[],
  groqClient: any
): Promise<string> {
  const conversationText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  const summaryPrompt = `Summarize the following conversation segment concisely, preserving key information, decisions, and context:

${conversationText}

Provide a brief summary (2-4 sentences) that captures the essence of this conversation segment:`

  try {
    const response = await groqClient.chat({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: summaryPrompt }
      ],
      temperature: 0.3,  // Low temperature for factual summarization
      maxTokens: 500,
      stream: false
    }) as any

    return response.choices?.[0]?.message?.content || conversationText
  } catch (error) {
    console.error('[Context Manager] Summarization failed:', error)
    // Fallback: simple truncation
    return conversationText.substring(0, 400) + '...'
  }
}

/**
 * Advanced Context Manager Class
 */
export class AdvancedContextManager {
  private groqClient: any

  constructor(groqClient: any) {
    this.groqClient = groqClient
  }

  /**
   * Get optimized context for a specific model
   */
  async getContextForModel(
    modelId: string,
    messages: Message[],
    userMessage: string,
    options?: {
      strategy?: Partial<ContextCompressionStrategy>
      systemPrompt?: string
    }
  ): Promise<ContextWindow> {
    const model = getGroqModel(modelId)

    if (!model) {
      console.error(`[Context Manager] Model ${modelId} not found`)
      return {
        messages: [],
        tokenCount: 0,
        compressionApplied: false,
        summarizedCount: 0,
        originalMessageCount: messages.length
      }
    }

    // Calculate token budget
    const systemPromptTokens = options?.systemPrompt ? estimateTokens(options.systemPrompt) : 500
    const userMessageTokens = estimateTokens(userMessage)
    const reserveForOutput = model.maxOutputTokens

    const budget = calculateTokenBudget(
      modelId,
      systemPromptTokens + userMessageTokens,
      reserveForOutput
    )

    // Build compression strategy based on model
    const strategy = this.buildCompressionStrategy(model, budget, options?.strategy)

    console.log(`[Context Manager] Model: ${model.name}`)
    console.log(`[Context Manager] Context window: ${model.contextWindow} tokens`)
    console.log(`[Context Manager] Available for history: ${budget.recommendedContextTokens} tokens`)
    console.log(`[Context Manager] Messages to process: ${messages.length}`)

    // Apply compression
    const compressedContext = await this.compressContext(messages, strategy, budget)

    return compressedContext
  }

  /**
   * Build compression strategy based on model capabilities
   */
  private buildCompressionStrategy(
    model: GroqModelSpec,
    budget: ReturnType<typeof calculateTokenBudget>,
    overrides?: Partial<ContextCompressionStrategy>
  ): ContextCompressionStrategy {
    // Default strategy for 128K context models
    let defaultStrategy: ContextCompressionStrategy = {
      recentMessagesKeepVerbatim: 20,  // Keep last 20 messages verbatim
      summarizationEnabled: true,
      summarizationChunkSize: 10,  // Summarize in chunks of 10 messages
      semanticFilteringEnabled: false,  // 128K models can handle full context usually
      minImportanceScore: 0.3,
      targetTokenBudget: budget.recommendedContextTokens,
      maxTokenBudget: budget.maxContextTokens
    }

    // Adjust for smaller context models (8K)
    if (model.contextWindow <= 8_192) {
      defaultStrategy = {
        recentMessagesKeepVerbatim: 8,  // Keep last 8 messages only
        summarizationEnabled: true,
        summarizationChunkSize: 6,
        semanticFilteringEnabled: true,  // Need aggressive filtering
        minImportanceScore: 0.5,  // Drop less important messages
        targetTokenBudget: budget.recommendedContextTokens,
        maxTokenBudget: budget.maxContextTokens
      }
    }

    // Reasoning models benefit from more context
    if (model.specialization === 'reasoning') {
      defaultStrategy.recentMessagesKeepVerbatim = 30
      defaultStrategy.semanticFilteringEnabled = false
    }

    return {
      ...defaultStrategy,
      ...overrides
    }
  }

  /**
   * Compress context using strategy
   */
  private async compressContext(
    messages: Message[],
    strategy: ContextCompressionStrategy,
    budget: ReturnType<typeof calculateTokenBudget>
  ): Promise<ContextWindow> {
    if (messages.length === 0) {
      return {
        messages: [],
        tokenCount: 0,
        compressionApplied: false,
        summarizedCount: 0,
        originalMessageCount: 0
      }
    }

    // Step 1: Calculate importance scores
    const messagesWithScores = messages.map((msg, idx) => ({
      ...msg,
      metadata: {
        ...msg.metadata,
        importance: calculateImportanceScore(msg, {
          conversationLength: messages.length,
          position: idx,
          hasToolCalls: msg.role === 'tool'
        })
      }
    }))

    // Step 2: Split into recent (keep verbatim) and old (compress)
    const recentMessages = messagesWithScores.slice(-strategy.recentMessagesKeepVerbatim)
    const oldMessages = messagesWithScores.slice(0, -strategy.recentMessagesKeepVerbatim)

    console.log(`[Context Manager] Recent messages (verbatim): ${recentMessages.length}`)
    console.log(`[Context Manager] Old messages (compress): ${oldMessages.length}`)

    // Step 3: Apply semantic filtering to old messages if enabled
    let filteredOldMessages = oldMessages
    if (strategy.semanticFilteringEnabled && oldMessages.length > 0) {
      filteredOldMessages = oldMessages.filter(
        msg => (msg.metadata?.importance || 0) >= strategy.minImportanceScore
      )
      console.log(`[Context Manager] Filtered out ${oldMessages.length - filteredOldMessages.length} low-importance messages`)
    }

    // Step 4: Summarize old messages if enabled
    let processedOldMessages: Message[] = filteredOldMessages
    let summarizedCount = 0

    if (strategy.summarizationEnabled && filteredOldMessages.length > strategy.summarizationChunkSize) {
      const chunks: Message[][] = []
      for (let i = 0; i < filteredOldMessages.length; i += strategy.summarizationChunkSize) {
        chunks.push(filteredOldMessages.slice(i, i + strategy.summarizationChunkSize))
      }

      const summarizedChunks: Message[] = []

      for (const chunk of chunks) {
        const summary = await summarizeMessageChunk(chunk, this.groqClient)
        summarizedChunks.push({
          role: 'system',
          content: `[Summary of ${chunk.length} messages]: ${summary}`,
          metadata: {
            importance: 0.7  // Summaries are important
          }
        })
        summarizedCount += chunk.length
      }

      processedOldMessages = summarizedChunks
      console.log(`[Context Manager] Summarized ${summarizedCount} messages into ${summarizedChunks.length} summaries`)
    }

    // Step 5: Combine processed old + recent messages
    const finalMessages = [...processedOldMessages, ...recentMessages]

    // Step 6: Calculate final token count
    const totalTokens = finalMessages.reduce(
      (sum, msg) => sum + estimateTokens(msg.content),
      0
    )

    console.log(`[Context Manager] Final context: ${finalMessages.length} messages, ~${totalTokens} tokens`)
    console.log(`[Context Manager] Budget: ${strategy.targetTokenBudget} tokens (${totalTokens <= strategy.targetTokenBudget ? '✓' : '⚠️ OVER'}  )`)

    return {
      messages: finalMessages,
      tokenCount: totalTokens,
      compressionApplied: summarizedCount > 0 || (strategy.semanticFilteringEnabled && oldMessages.length !== filteredOldMessages.length),
      summarizedCount,
      originalMessageCount: messages.length
    }
  }

  /**
   * Format context specifically for DeepSeek R1 models
   * (DeepSeek R1 wants all instructions in user messages, not system prompts)
   */
  formatForDeepSeekR1(
    context: ContextWindow,
    systemInstructions: string,
    userMessage: string
  ): Message[] {
    // Prepend system instructions to first user message
    const messages = context.messages.map(msg => ({ ...msg }))

    // Find first user message and prepend instructions
    const firstUserIndex = messages.findIndex(m => m.role === 'user')

    if (firstUserIndex !== -1) {
      messages[firstUserIndex] = {
        ...messages[firstUserIndex],
        content: `${systemInstructions}\n\n---\n\n${messages[firstUserIndex].content}`
      }
    } else {
      // No user messages yet, add as first message
      messages.unshift({
        role: 'user',
        content: `${systemInstructions}\n\n---\n\n${userMessage}`
      })
    }

    return messages
  }
}
