import { classifyQuery, quickRoute, type QueryIntent, type RouterContext } from './router'
import { groqClient } from '@/lib/groq/client'
import { perplexityClient } from '@/lib/perplexity/client'
import { GoogleGenAI } from '@google/genai'
import { getModelById } from '@/lib/models/all-models'

export interface OrchestratorRequest {
  message: string
  context: RouterContext & {
    userId?: string
    moduleId?: string
    slideId?: string
  }
  userId?: string
}

export interface OrchestratorResponse {
  content: string
  model: string
  intent: QueryIntent
  metadata: {
    executionTime: number
    modelUsed: string
    fallbackUsed: boolean
    citations?: any[]
    searchResults?: any[]
    videos?: any[]
    images?: any[]
  }
}

export class ForefrontOrchestrator {
  private geminiClient: GoogleGenAI

  constructor() {
    this.geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!
    })
  }

  /**
   * Main orchestration method - routes query to optimal model(s)
   */
  async execute(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const startTime = Date.now()

    try {
      // Step 1: Quick heuristic routing (no LLM call)
      const quickModel = quickRoute(request.message)
      if (quickModel) {
        console.log(`[Forefront] Quick route to: ${quickModel}`)
        return await this.executeOnModel(quickModel, request, startTime)
      }

      // Step 2: Full classification with context
      console.log('[Forefront] Classifying query intent...')
      const intent = await classifyQuery(request.message, request.context)
      console.log(`[Forefront] Intent: ${intent.type}, Model: ${intent.suggestedModel}, Confidence: ${intent.confidence}`)

      // Step 3: Execute on suggested model
      const response = await this.executeOnModel(intent.suggestedModel, request, startTime, intent)

      // Step 4: Validate response quality
      if (intent.confidence < 0.7 && response.content.length < 100) {
        console.log(`[Forefront] Low confidence, trying fallback: ${intent.fallbackModel}`)
        return await this.executeOnModel(intent.fallbackModel!, request, startTime, intent, true)
      }

      return response
    } catch (error) {
      console.error('[Forefront] Orchestration error:', error)
      // Ultimate fallback to reliable model
      return await this.executeOnModel('gemini-2.0-flash', request, startTime, undefined, true)
    }
  }

  /**
   * Execute query on specific model
   */
  private async executeOnModel(
    modelId: string,
    request: OrchestratorRequest,
    startTime: number,
    intent?: QueryIntent,
    isFallback = false
  ): Promise<OrchestratorResponse> {
    const modelData = getModelById(modelId)

    if (!modelData) {
      throw new Error(`Model not found: ${modelId}`)
    }

    const systemPrompt = this.buildSystemPrompt(request.context, intent)
    const conversationHistory = request.context.conversationHistory || []

    try {
      // Route to appropriate provider
      if (modelData.provider === 'Perplexity') {
        return await this.executePerplexity(modelId, request, systemPrompt, conversationHistory, startTime, intent, isFallback)
      } else if (modelData.provider === 'Groq') {
        return await this.executeGroq(modelId, request, systemPrompt, conversationHistory, startTime, intent, isFallback)
      } else if (modelData.provider === 'Google') {
        return await this.executeGemini(modelId, request, systemPrompt, conversationHistory, startTime, intent, isFallback)
      } else {
        throw new Error(`Provider not supported: ${modelData.provider}`)
      }
    } catch (error) {
      console.error(`[Forefront] Error executing on ${modelId}:`, error)
      throw error
    }
  }

  /**
   * Execute on Perplexity models (web search)
   */
  private async executePerplexity(
    modelId: string,
    request: OrchestratorRequest,
    systemPrompt: string,
    conversationHistory: any[],
    startTime: number,
    intent?: QueryIntent,
    isFallback = false
  ): Promise<OrchestratorResponse> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: request.message }
    ]

    const response = await perplexityClient.chat({
      messages,
      model: modelId as 'sonar' | 'sonar-pro',
      includeVideos: true,
      includeImages: true,
      searchRecency: 'week'
    })

    const content = response.choices[0]?.message?.content || ''

    return {
      content,
      model: modelId,
      intent: intent!,
      metadata: {
        executionTime: Date.now() - startTime,
        modelUsed: modelId,
        fallbackUsed: isFallback,
        citations: response.citations || [],
        searchResults: response.search_results || [],
        videos: response.videos || [],
        images: response.images || []
      }
    }
  }

  /**
   * Execute on Groq models (fast inference)
   */
  private async executeGroq(
    modelId: string,
    request: OrchestratorRequest,
    systemPrompt: string,
    conversationHistory: any[],
    startTime: number,
    intent?: QueryIntent,
    isFallback = false
  ): Promise<OrchestratorResponse> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: request.message }
    ]

    const response = await groqClient.chat({
      model: modelId,
      messages,
      temperature: 0.7,
      maxTokens: 4096,
      stream: false
    })

    const content = response.choices[0]?.message?.content || ''

    return {
      content,
      model: modelId,
      intent: intent!,
      metadata: {
        executionTime: Date.now() - startTime,
        modelUsed: modelId,
        fallbackUsed: isFallback
      }
    }
  }

  /**
   * Execute on Gemini models (multimodal)
   */
  private async executeGemini(
    modelId: string,
    request: OrchestratorRequest,
    systemPrompt: string,
    conversationHistory: any[],
    startTime: number,
    intent?: QueryIntent,
    isFallback = false
  ): Promise<OrchestratorResponse> {
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    const fullPrompt = `${systemPrompt}\n\nConversation:\n${messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n\n')}\n\nStudent: ${request.message}\n\nAssistant:`

    const response = await this.geminiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fullPrompt,
    })

    const content = response.text || ''

    return {
      content,
      model: modelId,
      intent: intent!,
      metadata: {
        executionTime: Date.now() - startTime,
        modelUsed: modelId,
        fallbackUsed: isFallback
      }
    }
  }

  /**
   * Build context-aware system prompt
   */
  private buildSystemPrompt(context: RouterContext & any, intent?: QueryIntent): string {
    let prompt = `You are Forefront Intelligence, an advanced AI learning assistant that orchestrates multiple specialized models to provide the best possible educational experience.

CURRENT LEARNING CONTEXT:
- Module: ${context.moduleTitle || 'General Learning'}
- Current Slide: ${context.currentSlide?.title || 'N/A'}
${context.highlightedText ? `- Student highlighted: "${context.highlightedText}"` : ''}

YOUR CAPABILITIES:`

    if (intent?.needsWebSearch) {
      prompt += `
- Real-time web search with cited sources
- Access to Reddit, X.com, and AI forums for community insights
- Latest developments and current information`
    }

    if (intent?.needsReasoning) {
      prompt += `
- Advanced reasoning and logical analysis
- Step-by-step problem solving
- Mathematical and analytical capabilities`
    }

    if (intent?.needsToolUse) {
      prompt += `
- Code execution and validation
- Mathematical calculations via Wolfram Alpha
- Web search and data retrieval`
    }

    prompt += `

YOUR ROLE:
1. Provide accurate, well-structured responses tailored to the learning context
2. Use clear explanations with examples relevant to the student's level
3. Cite sources when using external information
4. Break down complex concepts into digestible parts
5. Encourage critical thinking and exploration
6. Stay focused on educational value

RESPONSE GUIDELINES:
- Be concise yet comprehensive
- Use markdown formatting for clarity (headers, lists, code blocks)
- Include inline citations: [Source Name](url)
- Provide practical examples when helpful
- Connect concepts to real-world applications
- Adapt to the student's understanding level

Remember: You're not just answering questions - you're fostering deep understanding and practical skills.`

    return prompt
  }
}
