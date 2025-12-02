import { classifyQuery, quickRoute, type QueryIntent, type RouterContext, type ChainStep } from './router'
import { generateExecutionPlan, type PlannedStep, type ExecutionPlan } from './planner'
import { groqClient } from '@/lib/groq/client'
import { perplexityClient } from '@/lib/perplexity/client'
import { GoogleGenAI } from '@google/genai'
import { getModelById } from '@/lib/models/all-models'
import { contextManager, type ConversationMessage, type ManagedContext } from './context-manager'
import { FOREFRONT_TOOLS, type ToolDefinition } from './tools/registry'
import { executeToolCalls, type ToolCall, type ToolExecutionResult } from './tools/executor'
import { parseInstructions, validateAgainstInstructions, type ParsedInstructions } from './memory/instruction-parser'
import { ConversationEntityTracker, ReferenceResolver, trackToolResult } from './memory/entity-tracker'
import { getGroqModel, getBestGroqModelFor } from './models/groq-registry'
import { AdvancedContextManager, type Message } from './context/advanced-context-manager'
// import { forefrontIntelligence, type IntelligenceRequest } from './forefront-intelligence-core'  // Disabled

// Progress callback types for SSE streaming
export interface StepStartEvent {
  step: number
  purpose: string
  modelId: string
  totalSteps: number
}

export interface StepCompleteEvent {
  step: number
  purpose: string
  model: string
  content: string
  type: 'text' | 'image' | 'video'
  executionTime: number
  metadata?: any
}

export interface CoordinatorUpdateEvent {
  notes: string
}

export interface ProgressCallbacks {
  onStepStart?: (event: StepStartEvent) => void
  onStepComplete?: (event: StepCompleteEvent) => void
  onCoordinatorUpdate?: (event: CoordinatorUpdateEvent) => void
}

export interface OrchestratorRequest {
  message: string
  model?: string  // Optional model override
  sessionId?: string  // Optional session ID
  context: RouterContext & {
    userId?: string
    moduleId?: string
    slideId?: string
  }
  userId?: string
}

export interface ChainStepResult {
  step: number
  model: string
  content: string  // Human-readable narrative (markdown)
  type: 'text' | 'image' | 'video' | 'code'
  purpose: string
  executionTime: number

  // Structured data fields (from JSON outputs)
  keyFindings?: string[]  // Main insights or takeaways
  artifacts?: Array<{     // Generated content (images, code, documents)
    type: 'image' | 'code' | 'document' | 'data' | 'video'
    url?: string          // For hosted content (images, videos)
    content?: string      // For inline content (code, text)
    language?: string     // For code artifacts
    metadata?: any        // Additional artifact-specific data
  }>
  citations?: string[]    // Source URLs and references
  confidence?: number     // Quality/confidence score (0-1)

  metadata?: any          // Legacy catch-all for backwards compatibility
}

export interface ChainedOrchestratorResponse {
  isChained: true
  steps: ChainStepResult[]
  totalExecutionTime: number
  intent: QueryIntent
}

export interface OrchestratorResponse {
  content: string  // Could be text OR image URL
  model: string
  intent: QueryIntent
  metadata: {
    executionTime: number
    modelUsed: string
    fallbackUsed: boolean
    type?: 'text' | 'image'  // Response type
    aspectRatio?: string      // For image responses
    citations?: any[]
    searchResults?: any[]
    videos?: any[]
    images?: any[]
    toolsUsed?: string[]      // Tools that were called (for tool-calling system)
    finalResponse?: string    // Final text response from model (when image is returned)
    wasRetried?: boolean      // Whether the request was retried due to error
  }
}

export type OrchestratorResult = OrchestratorResponse | ChainedOrchestratorResponse

export class ForefrontOrchestrator {
  private geminiClient: GoogleGenAI
  private entityTracker: ConversationEntityTracker
  private referenceResolver: ReferenceResolver
  private advancedContextManager: AdvancedContextManager

  constructor() {
    this.geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!
    })
    this.entityTracker = new ConversationEntityTracker()
    this.referenceResolver = new ReferenceResolver(this.entityTracker)
    this.advancedContextManager = new AdvancedContextManager(groqClient)
  }

  /**
   * Detect if request needs V2's intelligent multi-domain orchestration
   */
  /**
   * Check if we should use the new Intelligence Core for this request
   * NOW MUCH SMARTER - Detects ANY multi-step intent
   */
  private shouldUseIntelligenceCore(message: string): boolean {
    const lowerMessage = message.toLowerCase()

    // AGGRESSIVE detection - if ANY of these patterns match, use Intelligence Core
    const intelligenceIndicators = [
      // ANY combination of study/research/analyze + create/generate
      /\b(study|research|analyze|look at|examine|explore|learn about|understand)\b.*\b(create|generate|make|build|design|produce)/i,

      // Sequential operations (then, after, before, first, next)
      /\b(then|after|before|first|next|finally|subsequently)\b/i,

      // Multiple actions with "and"
      /\b(and)\b.*\b(create|generate|make|then|after)/i,

      // Style/philosophy/approach mentions with creation
      /\b(style|philosophy|approach|method|technique)\b.*\b(create|generate|image|design)/i,

      // Studio Ghibli and similar patterns
      /\b(studio\s+ghibli|hayao\s+miyazaki|anime|pixar|disney)\b/i,

      // Art style patterns
      /\b(art\s+style|artistic|visual\s+style|design\s+philosophy)\b/i,

      // Optimization requests
      /\b(optimize|optimized|improve|enhance|better|refined)\b.*\b(prompt|generation|create)/i,

      // Using specific tools/models
      /\b(using|with|via)\b.*\b(seed|dream|sonar|search)/i,

      // Multi-domain indicators
      /\b(art|design|style)\b.*\b(generate|create)/i
    ]

    // Additional boolean checks (not regex patterns)
    const hasResearchAndCreation = /\b(study|research|learn)\b/i.test(message) && /\b(create|generate|make)\b/i.test(message)
    const isLongGenerationRequest = message.length > 50 && /\b(generate|create|make|build)\b/i.test(message)

    // If ANY pattern matches OR message is complex, use Intelligence Core
    const shouldUse = intelligenceIndicators.some(pattern => pattern instanceof RegExp && pattern.test(message)) ||
                      hasResearchAndCreation ||
                      isLongGenerationRequest ||
                      message.split(/[,;]/).length > 1 || // Multiple clauses
                      message.split(' ').length > 15 // Long detailed request

    if (shouldUse) {
      console.log('[Orchestrator] ✅ Intelligence Core triggered for multi-step analysis')
    }

    return shouldUse
  }

  private shouldUseV2Intelligence(message: string): boolean {
    // Deprecated - kept for compatibility
    // V2 had issues, now replaced by Intelligence Core
    return false
  }

  /**
   * Main orchestration method - routes query to optimal model(s)
   */
  async execute(request: OrchestratorRequest, callbacks?: ProgressCallbacks): Promise<OrchestratorResult> {
    const startTime = Date.now()

    try {
      // Step 0: Intelligence Core (TEMPORARILY DISABLED - performance issues with 5+ steps)
      // Using proven V1 chain execution instead for now
      const useIntelligenceCore = false

      if (useIntelligenceCore && this.shouldUseIntelligenceCore(request.message)) {
        console.log('[Forefront] 🧠 Using TRUE Forefront Intelligence Core (DISABLED)')

        try {
          const intelligenceRequest: any = {
            message: request.message,
            context: request.context.conversationHistory || [],
            userId: request.context.userId || 'anonymous',
            sessionId: request.sessionId || 'default',
            preferences: {
              speed: 'balanced',
              depth: 'comprehensive',
              style: 'educational'
            }
          }

          // const intelligenceResponse = await forefrontIntelligence.process(intelligenceRequest)
          throw new Error('Intelligence Core disabled')

          // // Convert to orchestrator result format
          // if (intelligenceResponse.execution.results.length > 1) {
          //   // Multi-step execution - show as chain
          //   const steps: ChainStepResult[] = intelligenceResponse.execution.results.map((result, index) => ({
          //     step: index + 1,
          //     model: result.model,
          //     content: result.output || '',
          //     type: 'text',
          //     purpose: result.stepId,
          //     executionTime: result.executionTime,
          //     metadata: {
          //       confidence: result.confidence,
          //       success: result.success,
          //       stepId: result.stepId
          //     }
          //   }))

          //   return {
          //     isChained: true,
          //     steps,
          //     totalExecutionTime: intelligenceResponse.execution.totalTime,
          //     intent: intelligenceResponse.plan.requestAnalysis as any,
          //     metadata: {
          //       qualityScore: intelligenceResponse.execution.qualityScore,
          //       modelsUsed: intelligenceResponse.execution.modelsUsed,
          //       consensusAchieved: intelligenceResponse.execution.consensusAchieved,
          //       insights: intelligenceResponse.insights,
          //       system: 'forefront-intelligence-core'
          //     }
          //   }
          // }

          // // Single response
          // return {
          //   content: intelligenceResponse.response,
          //   model: 'forefront-intelligence',
          //   metadata: {
          //     executionTime: intelligenceResponse.execution.totalTime,
          //     modelUsed: intelligenceResponse.execution.modelsUsed.join(', '),
          //     qualityScore: intelligenceResponse.execution.qualityScore,
          //     type: 'text',
          //     system: 'forefront-intelligence-core'
          //   }
          // }
        } catch (coreError) {
          console.error('[Forefront Intelligence Core] Error:', coreError)
          // Continue with standard orchestration
        }
      }

      // Step 0.5: Check if V2 intelligence is needed (deprecated, disabled)
      // if (false && this.shouldUseV2Intelligence(request.message)) {
      //   console.log('[Forefront V2] 🧠 Complex multi-domain request detected - using V2 intelligence')
      //   try {
      //     // V2 disabled due to type errors
      //     // const { ForefrontOrchestratorV2 } = await import('./orchestrator-v2')
      //     const v2Orchestrator = new ForefrontOrchestratorV2()
      //     const v2Response = await v2Orchestrator.executeV2({
      //       ...request,
      //       enableQualityValidation: true,
      //       enableReResearch: false, // Conservative for now
      //       enableConsensus: true
      //     })

      //     // Convert V2 response to V1 format for now (until UI supports V2)
      //     if (v2Response.workflowExecution?.steps?.length > 0) {
      //       // Build chain-like response from V2 workflow
      //       const steps: ChainStepResult[] = v2Response.workflowExecution.steps.map((step: any, index: number) => ({
      //         step: index + 1,
      //         model: step.metadata?.model || 'unknown',
      //         content: step.output || '',
      //         type: step.stepType === 'generation' && v2Response.intent.deliveryFormat === 'visual' ? 'image' : 'text',
      //         purpose: step.stepType,
      //         executionTime: step.metadata?.duration || 0,
      //         metadata: step.metadata
      //       }))

      //       return {
      //         isChained: true,
      //         steps,
      //         totalExecutionTime: v2Response.executionTime,
      //         intent: v2Response.intent as any
      //       }
      //     }

      //     // Fallback to simple response if workflow format is different
      //     return {
      //       content: v2Response.response,
      //       model: 'forefront-intelligence-v2',
      //       intent: v2Response.intent as any,
      //       metadata: {
      //         executionTime: v2Response.executionTime,
      //         modelUsed: 'forefront-intelligence-v2',
      //         fallbackUsed: false,
      //         type: 'text'
      //       }
      //     }
      //   } catch (v2Error) {
      //     console.error('[Forefront V2] Error in V2 orchestration, falling back to V1:', v2Error)
      //     // Continue with V1 if V2 fails
      //   }
      // }

      // Step 1: Quick heuristic routing (DISABLED to force AI classification)
      const quickModel = quickRoute(request.message)
      if (quickModel) {
        console.log(`[Forefront] ⚠️ Quick route attempted but should be disabled: ${quickModel}`)
        // Don't use quick route - continue to AI classification
      }

      // Step 2: Full classification with context
      console.log('[Forefront] Classifying query intent...')
      const intent = await classifyQuery(request.message, request.context)
      console.log(`[Forefront] Intent: ${intent.type}, Model: ${intent.suggestedModel}, Confidence: ${intent.confidence}`)
      console.log(`[Forefront] Chaining: ${intent.needsChaining}, WebSearch: ${intent.needsWebSearch}, ImageGen: ${intent.needsImageGeneration}`)
      if (intent.chainSteps) {
        console.log(`[Forefront] Chain steps (${intent.chainSteps.length}):`, intent.chainSteps.map(s => `${s.step}. ${s.modelId} (${s.purpose})`).join(' → '))
      }

      // Step 2.5: Determine optimal context level based on intent
      const contextLevel = contextManager.suggestContextLevel(intent)
      console.log(`[Forefront] Suggested context level: ${contextLevel}`)

      // Step 2.75: Get managed context
      const managedContext = await contextManager.getContext(
        request.message,
        (request.context.conversationHistory || []) as ConversationMessage[],
        { level: contextLevel }
      )
      console.log(`[Forefront] ${contextManager.createContextSummary(managedContext)}`)

      // Attach managed context to request
      const requestWithManagedContext = {
        ...request,
        context: {
          ...request.context,
          conversationHistory: managedContext.conversationHistory,
          managedContext
        }
      }

      // === CRITICAL PRIORITY: DYNAMIC WORKFLOW ORCHESTRATION (2025 LLM Conductor Pattern) ===
      // Step 2.8: Check for multi-step workflow FIRST (before tool-calling)
      // Router detected needsChaining=true but NO chainSteps (planner will build workflow)
      if (intent.needsChaining || intent.suggestedModel === 'chained') {
        console.log('[Forefront] ✅ Dynamic workflow detected, invoking planner...')
        console.log('[Forefront] 🚫 Tool-calling disabled (workflow mode)')
        return await this.executePlannedWorkflow(requestWithManagedContext, intent, startTime, callbacks)
      }

      // === FALLBACK: AGENTIC TOOL-CALLING (only for non-chained requests) ===
      // Step 2.9: Use tool-calling for simple queries that don't need chaining
      // Note: Image generation should NEVER reach here (filtered by router)
      if (intent.needsImageGeneration) {
        console.warn('[Forefront] ⚠️  Image generation without chaining - forcing chain mode')
        // Build emergency chain
        const emergencyChain: ChainStep[] = [
          { step: 1, modelId: 'llama-3.3-70b-versatile', purpose: 'prompt-enhancement', inputFrom: undefined },
          { step: 2, modelId: 'seedream-4', purpose: 'image-generation', inputFrom: 1 }
        ]
        intent.needsChaining = true
        intent.chainSteps = emergencyChain
        return await this.executeChain(requestWithManagedContext, intent, startTime, callbacks)
      }

      console.log('[Forefront] 🤖 Using agentic tool-calling with Llama-3-Groq-70B-Tool-Use')
      const toolCallingResult = await this.executeWithToolCalling(requestWithManagedContext, startTime)
      if (toolCallingResult) {
        return toolCallingResult
      }

      // Step 4: Execute on suggested model
      const response = await this.executeOnModel(intent.suggestedModel, requestWithManagedContext, startTime, intent)

      // Step 5: Validate response quality
      if (intent.confidence < 0.7 && response.content.length < 100) {
        console.log(`[Forefront] Low confidence, trying fallback: ${intent.fallbackModel}`)
        return await this.executeOnModel(intent.fallbackModel!, requestWithManagedContext, startTime, intent, true)
      }

      return response
    } catch (error) {
      console.error('[Forefront] Orchestration error:', error)
      // Ultimate fallback to reliable model
      return await this.executeOnModel('gemini-2.0-flash', request, startTime, undefined, true)
    }
  }

  /**
   * Execute with Agentic Tool-Calling + Enhanced Memory System
   * Uses Llama-3.3-70B-Versatile (128K context, production-ready)
   * with advanced context management, instruction parsing, and reference resolution
   */
  private async executeWithToolCalling(
    request: OrchestratorRequest,
    startTime: number
  ): Promise<OrchestratorResult | null> {
    try {
      // Increment conversation turn
      this.entityTracker.nextTurn()

      // === PHASE 0: MODEL SELECTION ===
      // Use production Llama 3.3 70B Versatile (128K context, tool calling)
      const orchestratorModel = 'llama-3.3-70b-versatile'
      const modelSpec = getGroqModel(orchestratorModel)

      if (!modelSpec) {
        console.error('[Orchestrator] Model not found:', orchestratorModel)
        return null
      }

      console.log(`[Orchestrator] Using ${modelSpec.name} (${modelSpec.contextWindow} context)`)

      // === PHASE 1: INSTRUCTION PARSING ===
      // Extract explicit user requirements (model preferences, tool requirements, references)
      const parsedInstructions = parseInstructions(request.message)
      console.log('[Memory] Parsed instructions:', {
        modelPreferences: parsedInstructions.modelPreferences,
        toolRequirements: parsedInstructions.toolRequirements,
        hasReferences: parsedInstructions.references.hasReferences,
        referenceType: parsedInstructions.references.referenceType
      })

      // === PHASE 2: REFERENCE RESOLUTION ===
      // Resolve references like "that prompt" → actual prompt content
      let resolvedMessage = request.message
      if (parsedInstructions.references.hasReferences) {
        resolvedMessage = this.referenceResolver.resolveAll(
          request.message,
          parsedInstructions.references
        )

        if (resolvedMessage !== request.message) {
          console.log('[Memory] Resolved references:')
          console.log('  Original:', request.message)
          console.log('  Resolved:', resolvedMessage.substring(0, 200) + '...')
        }
      }

      // === PHASE 2.5: ADVANCED CONTEXT MANAGEMENT ===
      // Build system prompt for tool-calling agent
      const systemPrompt = `You are Forefront Intelligence, an advanced AI learning assistant with access to powerful tools.

CURRENT LEARNING CONTEXT:
- Module: ${request.context.moduleTitle || 'General'}
- Current Slide: ${request.context.currentSlide?.title || 'N/A'}
${request.context.highlightedText ? `- Student highlighted: "${request.context.highlightedText}"` : ''}

${this.buildInstructionConstraints(parsedInstructions)}

AVAILABLE TOOLS:
You have access to tools for image generation, web search, code execution, prompt enhancement, and more.
Use tools when appropriate. Think about what the user really wants.

YOUR ROLE:
1. Understand user intent and context from conversation
2. Follow user's explicit instructions about which models/tools to use
3. Select appropriate tools
4. Provide helpful, educational responses`

      // Convert conversation history to advanced context format
      const conversationHistory = (request.context.conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: Date.now(),
        metadata: msg.metadata || {}
      }) as Message)

      // Get optimized context using advanced context manager
      const optimizedContext = await this.advancedContextManager.getContextForModel(
        orchestratorModel,
        conversationHistory,
        resolvedMessage,
        { systemPrompt }
      )

      console.log('[Context] Optimized context:', {
        originalMessages: conversationHistory.length,
        finalMessages: optimizedContext.messages.length,
        tokenCount: optimizedContext.tokenCount,
        compressionApplied: optimizedContext.compressionApplied,
        summarizedCount: optimizedContext.summarizedCount
      })

      // Build conversation messages with optimized context
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...optimizedContext.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: resolvedMessage }  // Use RESOLVED message with actual content
      ]

      // === TOOL FILTERING (2025 Best Practice) ===
      // 1. Filter based on user's explicit instructions
      let availableTools = this.filterToolsForInstructions(parsedInstructions)

      // 2. CRITICAL: Remove image tools to prevent conflicts with chain execution
      // Image generation should ALWAYS use educational chain, not tool-calling
      availableTools = availableTools.filter(t =>
        !['generate_image', 'enhance_prompt'].includes(t.function.name)
      )
      console.log(`[Tool-Calling] Calling ${modelSpec.name} with ${availableTools.length}/${FOREFRONT_TOOLS.length} tools`)
      console.log(`[Tool-Calling] ⚠️  Image tools disabled (use chain for educational experience)`)
      if (availableTools.length < FOREFRONT_TOOLS.length) {
        console.log(`[Tool-Calling] Available: ${availableTools.map(t => t.function.name).join(', ')}`)
      }

      const response = await groqClient.chat({
        model: orchestratorModel,
        messages,
        tools: availableTools,
        tool_choice: 'auto',
        temperature: modelSpec.temperature.recommended,
        maxTokens: modelSpec.maxOutputTokens,
        stream: false
      }) as any

      const choice = response.choices?.[0]
      if (!choice) {
        console.log('[Tool-Calling] No response from tool-calling model')
        return null
      }

      // Check if model wants to use tools
      const toolCalls = choice.message?.tool_calls
      if (!toolCalls || toolCalls.length === 0) {
        // No tools needed - model provided direct response
        console.log('[Tool-Calling] No tools called, using direct response')
        const content = choice.message?.content || ''

        // Track the response as an entity if it's substantial
        if (content.length > 100) {
          this.entityTracker.trackEntity('explanation', content, {
            model: orchestratorModel
          })
        }

        return {
          content,
          model: orchestratorModel,
          intent: { type: 'simple', needsWebSearch: false, needsReasoning: false, needsMultimodal: false, needsToolUse: false, needsImageGeneration: false, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: true, complexity: 'low', confidence: 0.8, suggestedModel: orchestratorModel },
          metadata: {
            executionTime: Date.now() - startTime,
            modelUsed: orchestratorModel,
            fallbackUsed: false,
            type: 'text'
          }
        }
      }

      // === PHASE 3: TOOL EXECUTION ===
      console.log(`[Tool-Calling] Executing ${toolCalls.length} tool(s):`, toolCalls.map((tc: any) => tc.function.name).join(', '))
      const toolResults = await executeToolCalls(
        toolCalls as ToolCall[],
        request.userId || request.context.userId
      )

      // === PHASE 4: ENTITY TRACKING ===
      // Track tool results as entities for future reference resolution
      toolResults.forEach(result => {
        trackToolResult(this.entityTracker, result.name, result, {
          model: orchestratorModel
        })
      })

      // Add tool results to conversation
      messages.push(choice.message)  // Add assistant's tool call message
      toolResults.forEach(result => {
        messages.push({
          role: 'tool',
          tool_call_id: result.tool_call_id,
          name: result.name,
          content: result.content
        })
      })

      // Get final response from model with tool results
      console.log('[Tool-Calling] Getting final response with tool results')
      const finalResponse = await groqClient.chat({
        model: orchestratorModel,
        messages,
        temperature: modelSpec.temperature.recommended,
        maxTokens: modelSpec.maxOutputTokens,
        stream: false
      }) as any

      const finalContent = finalResponse.choices?.[0]?.message?.content || ''

      // === PHASE 5: VALIDATION & RETRY ===
      // Validate that tool selection respects user's explicit instructions
      const toolsUsed = toolResults.map(r => r.name)
      const selectedModel = toolResults.length > 0 ? toolResults[0].metadata?.model || orchestratorModel : orchestratorModel

      const validation = validateAgainstInstructions(parsedInstructions, selectedModel, toolsUsed)
      if (!validation.valid) {
        console.warn('[Memory] INSTRUCTION VIOLATIONS detected:')
        validation.violations.forEach(v => console.warn('  -', v))
        console.warn('[Memory] Retrying with stronger constraints...')

        // Build retry system prompt with much stronger constraints
        const retrySystemPrompt = `You are Forefront Intelligence, an advanced AI learning assistant with access to powerful tools.

CURRENT LEARNING CONTEXT:
- Module: ${request.context.moduleTitle || 'General'}
- Current Slide: ${request.context.currentSlide?.title || 'N/A'}
${request.context.highlightedText ? `- Student highlighted: "${request.context.highlightedText}"` : ''}

${this.buildInstructionConstraints(parsedInstructions, true)}

AVAILABLE TOOLS:
You have access to tools for image generation, web search, code execution, prompt enhancement, and more.
Use tools when appropriate. Think about what the user really wants.

YOUR ROLE:
1. Understand user intent and context from conversation
2. Follow user's explicit instructions about which models/tools to use
3. Select appropriate tools
4. Provide helpful, educational responses`

        // Rebuild messages with stronger system prompt
        const retryMessages: any[] = [
          { role: 'system', content: retrySystemPrompt },
          ...optimizedContext.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: resolvedMessage }
        ]

        try {
          // Retry with filtered tools and stronger prompt
          console.log('[Memory] Retrying tool call with explicit constraints')
          const retryResponse = await groqClient.chat({
            model: orchestratorModel,
            messages: retryMessages,
            tools: availableTools,
            tool_choice: 'auto',
            temperature: 0.1, // Lower temperature for more deterministic behavior
            maxTokens: modelSpec.maxOutputTokens,
            stream: false
          }) as any

          const retryChoice = retryResponse.choices?.[0]
          const retryToolCalls = retryChoice?.message?.tool_calls

          if (retryToolCalls && retryToolCalls.length > 0) {
            console.log('[Memory] Retry successful, executing tools:', retryToolCalls.map((tc: any) => tc.function.name).join(', '))

            // Execute retry tool calls
            const retryToolResults = await executeToolCalls(
              retryToolCalls as ToolCall[],
              request.userId || request.context.userId
            )

            // Track retry tool results
            retryToolResults.forEach(result => {
              trackToolResult(this.entityTracker, result.name, result, {
                model: orchestratorModel
              })
            })

            // Validate retry
            const retryValidation = validateAgainstInstructions(
              parsedInstructions,
              retryToolResults[0]?.metadata?.model || orchestratorModel,
              retryToolResults.map(r => r.name)
            )

            if (retryValidation.valid) {
              console.log('[Memory] ✅ Retry successful - instructions followed!')

              // Build final messages for retry
              retryMessages.push(retryChoice.message)
              retryToolResults.forEach(result => {
                retryMessages.push({
                  role: 'tool',
                  tool_call_id: result.tool_call_id,
                  name: result.name,
                  content: result.content
                })
              })

              // Get final response with retry results
              const retryFinalResponse = await groqClient.chat({
                model: orchestratorModel,
                messages: retryMessages,
                temperature: modelSpec.temperature.recommended,
                maxTokens: modelSpec.maxOutputTokens,
                stream: false
              }) as any

              const retryFinalContent = retryFinalResponse.choices?.[0]?.message?.content || ''

              // Return retry result (replacing original invalid result)
              const retryImageResult = retryToolResults.find(r => r.metadata?.type === 'image')
              if (retryImageResult) {
                return {
                  content: retryImageResult.metadata?.imageUrl || retryImageResult.content,
                  model: `${orchestratorModel} + tools (retry)`,
                  intent: { type: 'image-generation', needsWebSearch: false, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: true, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: false, complexity: 'medium', confidence: 0.9, suggestedModel: 'seedream-4' },
                  metadata: {
                    executionTime: Date.now() - startTime,
                    modelUsed: `${orchestratorModel} + seedream-4`,
                    fallbackUsed: false,
                    type: 'image',
                    aspectRatio: retryImageResult.metadata?.aspectRatio,
                    toolsUsed: retryToolResults.map(r => r.name),
                    finalResponse: retryFinalContent,
                    wasRetried: true
                  }
                }
              }

              const retrySearchResult = retryToolResults.find(r => r.metadata?.citations)
              if (retrySearchResult) {
                return {
                  content: retryFinalContent,
                  model: `${orchestratorModel} + tools (retry)`,
                  intent: { type: 'factual', needsWebSearch: true, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: false, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: true, complexity: 'medium', confidence: 0.9, suggestedModel: 'sonar-pro' },
                  metadata: {
                    executionTime: Date.now() - startTime,
                    modelUsed: `${orchestratorModel} + sonar-pro`,
                    fallbackUsed: false,
                    type: 'text',
                    citations: retrySearchResult.metadata?.citations,
                    searchResults: retrySearchResult.metadata?.searchResults,
                    videos: retrySearchResult.metadata?.videos,
                    images: retrySearchResult.metadata?.images,
                    toolsUsed: retryToolResults.map(r => r.name),
                    wasRetried: true
                  }
                }
              }

              return {
                content: retryFinalContent,
                model: `${orchestratorModel} + tools (retry)`,
                intent: { type: 'tool-use', needsWebSearch: false, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: false, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: true, complexity: 'medium', confidence: 0.9, suggestedModel: orchestratorModel },
                metadata: {
                  executionTime: Date.now() - startTime,
                  modelUsed: orchestratorModel,
                  fallbackUsed: false,
                  type: 'text',
                  toolsUsed: retryToolResults.map(r => r.name),
                  wasRetried: true
                }
              }
            } else {
              console.warn('[Memory] ❌ Retry still has violations:', retryValidation.violations)
              console.warn('[Memory] Proceeding with original result despite violations')
            }
          } else {
            console.warn('[Memory] Retry did not use tools, proceeding with original result')
          }
        } catch (retryError) {
          console.error('[Memory] Retry failed:', retryError)
          console.warn('[Memory] Proceeding with original result despite validation failure')
        }
      } else {
        console.log('[Memory] ✅ Validation passed - user instructions followed correctly')
      }

      // Check if any tool returned an image
      const imageResult = toolResults.find(r => r.metadata?.type === 'image')
      if (imageResult) {
        return {
          content: imageResult.metadata?.imageUrl || imageResult.content,
          model: `${orchestratorModel} + tools`,
          intent: { type: 'image-generation', needsWebSearch: false, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: true, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: false, complexity: 'medium', confidence: 0.9, suggestedModel: 'seedream-4' },
          metadata: {
            executionTime: Date.now() - startTime,
            modelUsed: `${orchestratorModel} + seedream-4`,
            fallbackUsed: false,
            type: 'image',
            aspectRatio: imageResult.metadata?.aspectRatio,
            toolsUsed: toolResults.map(r => r.name),
            finalResponse: finalContent
          }
        }
      }

      // Check if any tool returned search results
      const searchResult = toolResults.find(r => r.metadata?.citations)
      if (searchResult) {
        return {
          content: finalContent,
          model: `${orchestratorModel} + tools`,
          intent: { type: 'factual', needsWebSearch: true, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: false, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: true, complexity: 'medium', confidence: 0.9, suggestedModel: 'sonar-pro' },
          metadata: {
            executionTime: Date.now() - startTime,
            modelUsed: `${orchestratorModel} + sonar-pro`,
            fallbackUsed: false,
            type: 'text',
            citations: searchResult.metadata?.citations,
            searchResults: searchResult.metadata?.searchResults,
            videos: searchResult.metadata?.videos,
            images: searchResult.metadata?.images,
            toolsUsed: toolResults.map(r => r.name)
          }
        }
      }

      // Default: return text response with tool metadata
      return {
        content: finalContent,
        model: `${orchestratorModel} + tools`,
        intent: { type: 'tool-use', needsWebSearch: false, needsReasoning: false, needsMultimodal: false, needsToolUse: true, needsImageGeneration: false, needsImagePromptHelp: false, needsChaining: false, needsCodeGeneration: false, needsTextGeneration: true, complexity: 'medium', confidence: 0.9, suggestedModel: orchestratorModel },
        metadata: {
          executionTime: Date.now() - startTime,
          modelUsed: orchestratorModel,
          fallbackUsed: false,
          type: 'text',
          toolsUsed: toolResults.map(r => r.name)
        }
      }

    } catch (error: any) {
      console.error('[Tool-Calling] Error:', error)
      // Return null to fall back to old routing system
      return null
    }
  }

  /**
   * Build instruction constraints for system prompt based on parsed instructions
   */
  private buildInstructionConstraints(parsed: ParsedInstructions, isRetry: boolean = false): string {
    const constraints: string[] = []

    // Model preferences - make more explicit on retry
    if (parsed.modelPreferences.imageGeneration?.length) {
      const models = parsed.modelPreferences.imageGeneration.join(' or ')
      if (isRetry) {
        constraints.push(`🚨 MANDATORY: User EXPLICITLY requested image generation with ${models}. You MUST use the generate_image tool. This is NON-NEGOTIABLE.`)
      } else {
        constraints.push(`USER EXPLICITLY REQUESTED image generation using: ${models}`)
      }
    }
    if (parsed.modelPreferences.search?.length) {
      const models = parsed.modelPreferences.search.join(' or ')
      if (isRetry) {
        constraints.push(`🚨 MANDATORY: User EXPLICITLY requested web search with ${models}. You MUST use the search_web tool. This is NON-NEGOTIABLE.`)
      } else {
        constraints.push(`USER EXPLICITLY REQUESTED web search using: ${models}`)
      }
    }
    if (parsed.modelPreferences.reasoning?.length) {
      constraints.push(`USER EXPLICITLY REQUESTED reasoning with: ${parsed.modelPreferences.reasoning.join(' or ')}`)
    }

    // Tool requirements - make more explicit on retry
    if (parsed.toolRequirements.mustUseTools.length > 0) {
      if (isRetry) {
        constraints.push(`🚨 MANDATORY: YOU MUST CALL THESE EXACT TOOLS: ${parsed.toolRequirements.mustUseTools.join(', ')}. DO NOT respond without calling these tools.`)
      } else {
        constraints.push(`YOU MUST USE these tools: ${parsed.toolRequirements.mustUseTools.join(', ')}`)
      }
    }

    // Reference resolution guidance
    if (parsed.references.hasReferences) {
      constraints.push(`USER MESSAGE CONTAINS REFERENCES (like "that", "it", "the previous"). The message has been PRE-RESOLVED for you - use the exact content provided, NOT the literal reference phrase.`)
    }

    if (constraints.length === 0) {
      return ''
    }

    const prefix = isRetry ? 'CRITICAL - RETRY WITH EXPLICIT ENFORCEMENT' : 'CRITICAL - USER\'S EXPLICIT INSTRUCTIONS'
    return `${prefix}:\n${constraints.map(c => `⚠️  ${c}`).join('\n')}\n`
  }

  /**
   * Filter tools based on parsed instructions
   * If user explicitly requests specific tools/models, only provide those tools
   */
  private filterToolsForInstructions(parsed: ParsedInstructions): ToolDefinition[] {
    const requiredTools = new Set(parsed.toolRequirements.mustUseTools)

    // If user explicitly requested image generation, include generate_image and enhance_prompt
    if (parsed.modelPreferences.imageGeneration?.length) {
      requiredTools.add('generate_image')
      requiredTools.add('enhance_prompt')
    }

    // If user explicitly requested search, include search_web
    if (parsed.modelPreferences.search?.length) {
      requiredTools.add('search_web')
    }

    // If specific tools are required, filter to only those
    if (requiredTools.size > 0) {
      return FOREFRONT_TOOLS.filter(tool => requiredTools.has(tool.function.name))
    }

    // Otherwise, provide all tools
    return FOREFRONT_TOOLS
  }

  /**
   * Execute dynamically planned workflow using Llama 3.3 Planner
   * This is the new LLM Conductor pattern (2025)
   */
  private async executePlannedWorkflow(
    request: OrchestratorRequest,
    intent: QueryIntent,
    startTime: number,
    callbacks?: ProgressCallbacks
  ): Promise<ChainedOrchestratorResponse> {
    console.log('[Planner] 🎯 Starting dynamic workflow generation...')

    try {
      // Step 1: Generate execution plan using Llama 3.3
      const plan = await generateExecutionPlan({
        userMessage: request.message,
        intent,
        context: request.context
      })

      console.log(`[Planner] ✅ Plan generated: ${plan.steps.length} steps`)
      console.log(`[Planner] Reasoning: ${plan.reasoning}`)
      console.log(`[Planner] Estimated time: ${plan.estimatedTotalTime}`)

      // Convert PlannedSteps to ChainSteps for execution
      const chainSteps: ChainStep[] = plan.steps.map(step => ({
        step: step.stepNumber,
        modelId: step.recommendedModel,
        purpose: step.purpose as any,
        inputFrom: step.inputFrom
      }))

      // Store plan in managedContext for UI/debugging
      if (request.context.managedContext) {
        request.context.managedContext.executionPlan = plan
      }

      // Update intent with generated chainSteps
      const updatedIntent: QueryIntent = {
        ...intent,
        chainSteps
      }

      // Step 2: Execute the planned workflow using existing chain executor
      return await this.executeChain(request, updatedIntent, startTime, callbacks)
    } catch (plannerError: any) {
      // If planner fails (rate limit), use fallback plan but ONLY replace Groq models
      console.warn('[Planner] ⚠️  Planner failed, using fallback plan with model substitutions')

      // Import fallback plan generator
      const { generateFallbackPlan } = await import('./planner')
      const fallbackPlan = (generateFallbackPlan as any)(request.message, intent)

      // ONLY replace Groq/Llama models with Gemini - keep other providers intact
      const chainSteps: ChainStep[] = fallbackPlan.steps.map((step: any) => {
        const model = step.recommendedModel
        let substitutedModel = model

        // Check if this is a Groq-hosted model (rate limited)
        if (model.includes('llama') || model.includes('groq') || model.includes('qwen')) {
          substitutedModel = 'gemini-2.0-flash'
          console.log(`[Planner] 🔄 Substituting ${model} → gemini-2.0-flash (Groq rate limit)`)
        }
        // Keep other providers: sonar-pro (Perplexity), seedream-4 (ByteDance), etc.
        else {
          console.log(`[Planner] ✅ Keeping ${model} (different provider, not rate limited)`)
        }

        return {
          step: step.stepNumber,
          modelId: substitutedModel,
          purpose: step.purpose as any,
          inputFrom: step.inputFrom
        }
      })

      const updatedIntent: QueryIntent = {
        ...intent,
        chainSteps
      }

      console.log(`[Planner] 🔄 Executing ${chainSteps.length}-step fallback workflow`)
      return await this.executeChain(request, updatedIntent, startTime, callbacks)
    }
  }

  /**
   * Execute multi-step model chain
   * (Now used by both legacy hardcoded chains and dynamic planner-generated chains)
   */
  private async executeChain(
    request: OrchestratorRequest,
    intent: QueryIntent,
    startTime: number,
    callbacks?: ProgressCallbacks
  ): Promise<ChainedOrchestratorResponse> {
    const steps: ChainStepResult[] = []
    let currentInput = request.message
    const stepResults = new Map<number, string>()
    const originalUserMessage = request.message  // Store original message
    const totalSteps = intent.chainSteps?.length || 0

    for (const chainStep of intent.chainSteps!) {
      const stepStartTime = Date.now()
      console.log(`[Forefront] Executing step ${chainStep.step}: ${chainStep.purpose} with ${chainStep.modelId}`)

      // Emit step start event
      callbacks?.onStepStart?.({
        step: chainStep.step,
        purpose: chainStep.purpose,
        modelId: chainStep.modelId,
        totalSteps
      })

      // Determine input for this step
      if (chainStep.inputFrom !== undefined) {
        currentInput = stepResults.get(chainStep.inputFrom) || currentInput
      }

      // Build step-specific prompt
      let stepPrompt = currentInput
      let systemPrompt = ''

      // Determine context level for this step
      let stepContextLevel: 'minimal' | 'standard' | 'full' | 'extended' = 'minimal'

      // Step 1: Prompt enhancement - needs minimal context (just focus on enhancing)
      if (chainStep.purpose === 'prompt-enhancement') {
        stepContextLevel = 'minimal'  // Don't need conversation history for enhancement

        // Check if previous step was web search (coordinator has already extracted key insights)
        const previousStepResult = chainStep.inputFrom ? stepResults.get(chainStep.inputFrom) : null
        const hasCoordinatedResearch = previousStepResult && (previousStepResult.includes('**Key Insights:**') || previousStepResult.includes('**User\'s Core Request:**'))

        if (hasCoordinatedResearch) {
          // Coordinator has already extracted the relevant insights and user request
          // Now create an optimized output based on that guidance
          stepPrompt = `${previousStepResult}

YOUR TASK: Create an optimized response that fulfills the user's core request while applying the key insights above.`

          // Determine what kind of optimization we're doing based on next step
          const currentStepIndex = intent.chainSteps!.findIndex(s => s.step === chainStep.step)
          const nextStep = intent.chainSteps![currentStepIndex + 1]
          const isImageGeneration = nextStep?.purpose === 'image-generation'
          const isTextGeneration = nextStep?.purpose === 'text-generation'
          const isCodeGeneration = nextStep?.purpose === 'code-generation'

          systemPrompt = `You are an expert at creating optimized ${isImageGeneration ? 'image generation prompts' : isCodeGeneration ? 'code generation prompts' : isTextGeneration ? 'text generation prompts' : 'task prompts'} based on research insights.

The coordinator has extracted:
1. Key insights from research/documentation
2. The user's core request (what they want ${isImageGeneration ? 'to create visually' : isCodeGeneration ? 'to build in code' : 'accomplished'})
3. Guidance on how to combine them

YOUR RESPONSE MUST FOLLOW THIS STRUCTURE:

**Applying Research to User's Request:**
[In 1-2 sentences, briefly explain which key insights you're applying to enhance the user's request]

**Optimized ${isImageGeneration ? 'Image' : isCodeGeneration ? 'Code' : isTextGeneration ? 'Text' : 'Task'} Prompt:**
[The final detailed ${isImageGeneration ? 'visual description' : isCodeGeneration ? 'code specification' : 'task description'} - 2-4 sentences describing exactly what the user asked for, enhanced with research insights.${isImageGeneration ? ' Include: subject, setting, style, lighting, mood, composition, camera angle, visual details.' : isCodeGeneration ? ' Include: language/framework, architecture, key functions, requirements, constraints.' : ' Include: clear objectives, constraints, desired format/structure.'}]

CRITICAL REQUIREMENTS:
- The optimized prompt MUST create what the user originally requested
- DO NOT just list best practices or repeat research verbatim
- DO create a clear, actionable ${isImageGeneration ? 'visual scene description' : isCodeGeneration ? 'code specification' : 'task specification'}
- Weave in research insights naturally to improve quality
- Be specific and detailed
- Focus on the USER'S request, enhanced by research

Now create the optimized prompt:`
        } else {
          systemPrompt = `You are an expert at enhancing image generation prompts. Take the user's input and transform it into a detailed, vivid prompt optimized for AI image generation.

REQUIREMENTS:
1. Make it detailed and descriptive (include style, lighting, mood, composition)
2. Use clear, visual language that image models understand
3. Include artistic style references when appropriate
4. Keep it concise but comprehensive (2-4 sentences max)
5. Return ONLY the enhanced prompt text, no explanations or meta-commentary

Example transformations:
- "a cat" → "A majestic orange tabby cat sitting on a velvet cushion, soft studio lighting, detailed fur texture, warm color palette, professional pet photography style"
- "sunset beach" → "A serene tropical beach at golden hour, vibrant orange and pink sunset reflecting on calm turquoise waters, silhouetted palm trees, cinematic composition, photorealistic, 8K quality"

Now enhance this prompt:`
        }
      } else if (chainStep.purpose === 'image-generation') {
        stepContextLevel = 'minimal'  // Image generation doesn't use conversation context
      } else if (chainStep.purpose === 'web-search') {
        stepContextLevel = 'standard'  // Web search benefits from some context
      } else if (chainStep.purpose === 'reasoning') {
        stepContextLevel = 'full'  // Reasoning may need full context
      } else if (chainStep.purpose === 'text-generation') {
        stepContextLevel = 'standard'  // Standard context for text generation
      }

      // Get managed context for this step (if it needs context at all)
      let stepRequest = request
      if (stepContextLevel !== 'minimal' && request.context.conversationHistory) {
        const stepManagedContext = await contextManager.getContext(
          stepPrompt,
          request.context.conversationHistory as ConversationMessage[],
          { level: stepContextLevel }
        )
        console.log(`[Forefront] Step ${chainStep.step} context: ${contextManager.createContextSummary(stepManagedContext)}`)

        stepRequest = {
          ...request,
          context: {
            ...request.context,
            conversationHistory: stepManagedContext.conversationHistory,
            managedContext: stepManagedContext
          }
        }
      } else {
        // Use empty context for minimal
        stepRequest = {
          ...request,
          context: {
            ...request.context,
            conversationHistory: [],
            managedContext: { conversationHistory: [], tokenCount: 0, contextLevel: 'minimal', filteredCount: 0, totalAvailable: 0 }
          }
        }
      }

      // Execute the step
      const stepResult = await this.executeStepOnModel(
        chainStep.modelId,
        stepPrompt,
        systemPrompt,
        stepRequest,
        intent
      )

      // Use coordinator to intelligently extract input for next step
      let nextStepInput = stepResult.content
      let coordinatorNotes = ''

      // Find the next step in the chain
      const currentStepIndex = intent.chainSteps!.findIndex(s => s.step === chainStep.step)
      const nextStep = intent.chainSteps![currentStepIndex + 1]

      if (nextStep) {
        // Call coordinator to parse this step's output for the next step
        const coordinated = await this.coordinateBetweenSteps(
          originalUserMessage,
          stepResult.content,
          chainStep.purpose,
          nextStep.purpose,
          nextStep.modelId
        )

        nextStepInput = coordinated.extractedInput
        coordinatorNotes = coordinated.coordinatorNotes
        console.log(`[Coordinator] ${coordinatorNotes}`)

        // Emit coordinator update event
        callbacks?.onCoordinatorUpdate?.({
          notes: coordinatorNotes
        })
      }

      stepResults.set(chainStep.step, nextStepInput)

      const stepType: 'text' | 'image' | 'video' | 'code' =
        (stepResult.type === 'image' || stepResult.type === 'video' || stepResult.type === 'code')
          ? stepResult.type
          : 'text'

      const completedStep = {
        step: chainStep.step,
        model: chainStep.modelId,
        content: stepResult.content,
        type: stepType,
        purpose: chainStep.purpose,
        executionTime: Date.now() - stepStartTime,
        metadata: {
          ...stepResult.metadata,
          coordinatorNotes,
          extractedForNextStep: nextStep ? nextStepInput : undefined
        }
      }

      steps.push(completedStep)

      console.log(`[Forefront] Step ${chainStep.step} completed in ${Date.now() - stepStartTime}ms`)

      // Emit step complete event
      callbacks?.onStepComplete?.(completedStep as any)
    }

    return {
      isChained: true,
      steps,
      totalExecutionTime: Date.now() - startTime,
      intent
    }
  }

  /**
   * Coordinator model - intelligently parses previous step output and prepares input for next step
   * This is the "meta" orchestrator that maintains context of the original user request
   * Enhanced for JSON parsing and multi-domain workflows (2025 LLM Conductor Pattern)
   */
  private async coordinateBetweenSteps(
    originalUserRequest: string,
    previousStepOutput: string,
    previousStepPurpose: string,
    nextStepPurpose: string,
    nextStepModel: string
  ): Promise<{ extractedInput: string; coordinatorNotes: string; structuredData?: any }> {
    console.log(`[Coordinator] Parsing ${previousStepPurpose} output for ${nextStepPurpose}`)

    // === ATTEMPT JSON PARSING FIRST ===
    // If step outputs conform to JSON schema (from role-based prompts), parse structured data
    let structuredData: any = null
    try {
      // Try to extract JSON from markdown code blocks or raw JSON
      const jsonMatch = previousStepOutput.match(/```json\s*([\s\S]*?)\s*```/) ||
                        previousStepOutput.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[1] || jsonMatch[0])
        console.log('[Coordinator] ✅ Successfully parsed JSON from previous step')
      }
    } catch (e) {
      // Not JSON, will use text-based coordination
    }

    // === BUILD COORDINATION PROMPT DYNAMICALLY ===
    let coordinatorPrompt = ''

    // Web search → Any generation step
    if (previousStepPurpose === 'web-search' && ['prompt-enhancement', 'code-generation', 'text-generation', 'reasoning'].includes(nextStepPurpose)) {
      coordinatorPrompt = `You are an AI workflow coordinator. Parse research output and extract key insights for the next step.

ORIGINAL USER REQUEST:
"${originalUserRequest}"

RESEARCH OUTPUT:
${previousStepOutput}

YOUR TASK:
Extract 3-5 key insights relevant to the user's request. Return in this format:

**Key Insights:**
- [Insight 1]
- [Insight 2]
- [Insight 3]

**User's Core Request:**
[1 sentence summary]

**Guidance for ${nextStepPurpose}:**
[How to apply insights in next step]`
    }
    // Prompt enhancement → Image generation
    else if (previousStepPurpose === 'prompt-enhancement' && nextStepPurpose === 'image-generation') {
      coordinatorPrompt = `Extract ONLY the final image prompt from this output. Remove explanations/headers/notes.

OUTPUT:
${previousStepOutput}

Return ONLY the clean image prompt text.`
    }
    // Code generation → Explanation/Documentation
    else if (previousStepPurpose === 'code-generation' && ['text-generation', 'final-composition'].includes(nextStepPurpose)) {
      coordinatorPrompt = `Extract the generated code and key details for documentation.

CODE OUTPUT:
${previousStepOutput}

Return the code block and a brief summary of what it does.`
    }
    // Generic coordination for any other combination
    else {
      coordinatorPrompt = `Extract key information from this ${previousStepPurpose} output for the next step (${nextStepPurpose}):

OUTPUT:
${previousStepOutput}

Provide concise, relevant information for the next step.`
    }

    // Call coordinator model (fast, smart llama-3.3)
    try {
      const coordinatorResponse = await groqClient.chat({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an AI workflow coordinator. Parse outputs from one step and prepare inputs for the next step. Be precise and concise.'
          },
          {
            role: 'user',
            content: coordinatorPrompt
          }
        ],
        temperature: 0.3, // Low temperature for consistent extraction
        maxTokens: 1000,
        stream: false // CRITICAL: Must be false to get choices array
      }) as any

      const coordinatorOutput = coordinatorResponse?.choices?.[0]?.message?.content || previousStepOutput

      console.log(`[Coordinator] Successfully extracted: ${coordinatorOutput.substring(0, 100)}...`)

      return {
        extractedInput: coordinatorOutput,
        coordinatorNotes: `Coordinated transition from ${previousStepPurpose} to ${nextStepPurpose}`,
        structuredData // Include parsed JSON if available
      }
    } catch (error) {
      console.error('[Coordinator] Error calling coordinator model:', error)
      console.log('[Coordinator] Falling back to passing through raw output')
      return {
        extractedInput: previousStepOutput,
        coordinatorNotes: `Coordinator failed, passed through raw output from ${previousStepPurpose}`,
        structuredData // Still include any JSON that was parsed before the error
      }
    }
  }

  /**
   * Execute a single step in a chain
   */
  private async executeStepOnModel(
    modelId: string,
    prompt: string,
    systemPrompt: string,
    request: OrchestratorRequest,
    intent: QueryIntent
  ): Promise<{ content: string; type?: string; metadata?: any }> {
    // Special case: web search (Perplexity Sonar)
    if (modelId === 'sonar-pro' || modelId === 'sonar') {
      // Determine if this is part of an image generation chain
      const isImageGenerationChain = intent.chainSteps?.some(step => step.purpose === 'image-generation')
      const imageModel = intent.chainSteps?.find(step => step.purpose === 'image-generation')?.modelId

      // Build specialized search prompt for image generation workflows
      let searchPrompt = prompt
      let searchSystemPrompt = 'You are a research assistant. Provide detailed, accurate information from web search results.'

      if (isImageGenerationChain && imageModel) {
        // Get model name for search query
        const modelName = imageModel === 'seedream-4' ? 'Seed Dream 4' : imageModel

        searchSystemPrompt = `You are an expert research assistant specializing in AI image generation best practices.

RESEARCH OBJECTIVE:
Find OFFICIAL prompting guides, documentation, and best practices for ${modelName} from:
1. Official company documentation and blogs (e.g., Seed.run for Seed Dream)
2. Model creator's Twitter/X, LinkedIn, and social media accounts
3. GitHub repositories and technical documentation
4. Official tutorials and prompt engineering guides

WHAT TO PRIORITIZE:
- Official documentation from the model creators
- Verified best practices and prompt structures
- Style guidelines and parameter recommendations
- Real examples from official sources
- Technical specifications and prompt format requirements

WHAT TO AVOID:
- Generic image generation advice
- Third-party speculation
- Outdated information
- Non-official sources without attribution

Provide comprehensive, educational information about visual details, styling, and prompting techniques SPECIFIC to ${modelName}.`

        // Enhance the search query to target official sources
        searchPrompt = `Find official ${modelName} prompting guides and best practices. Search: site:seed.run OR site:twitter.com OR site:linkedin.com OR site:github.com "${modelName}" prompt guide OR "${modelName}" documentation OR "${modelName}" best practices. Also include: ${prompt}`
      } else {
        searchSystemPrompt = 'You are a research assistant. Provide detailed, accurate information from web search results. Focus on visual and descriptive details that would be useful for creating image prompts.'
      }

      const searchResponse = await perplexityClient.chat({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: searchSystemPrompt
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        searchRecency: 'month',
        includeImages: true
      }) as any

      const content = searchResponse.choices?.[0]?.message?.content || ''
      const citations = searchResponse.citations || []

      return {
        content,
        type: 'text',
        metadata: {
          citations,
          searchResults: searchResponse
        }
      }
    }

    const modelData = getModelById(modelId)

    if (!modelData) {
      throw new Error(`Model not found: ${modelId}`)
    }

    // Route to appropriate provider
    if (modelData.provider === 'Groq') {
      const messages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt }
      ]

      const response = await groqClient.chat({
        model: modelId,
        messages,
        temperature: 0.7,
        maxTokens: 4096,
        stream: false
      }) as any

      return {
        content: response.choices?.[0]?.message?.content || '',
        type: 'text'
      }
    } else if (modelData.provider === 'ByteDance') {
      // Image generation step
      const Replicate = (await import('replicate')).default
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const output = await replicate.run(
        "bytedance/seedream-4",
        {
          input: {
            prompt: prompt,  // Use the enhanced prompt from previous step
            aspect_ratio: '4:3'
          }
        }
      ) as any

      const replicateUrl = output && output[0] ? String(output[0]) : null

      if (!replicateUrl) {
        throw new Error('Failed to generate image')
      }

      // Download and save image to local storage
      const { downloadAndSaveImage } = await import('@/lib/image-storage')
      const userId = request.userId || request.context.userId || 'anonymous'
      const localImageUrl = await downloadAndSaveImage(replicateUrl, userId)

      return {
        content: localImageUrl,
        type: 'image',
        metadata: {
          aspectRatio: '4:3',
          prompt: prompt  // Store the prompt used for generation
        }
      }
    } else if (modelData.provider === 'Google') {
      // Google Gemini for text generation in chains
      let fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

      // For prompt-enhancement, add strict formatting instructions
      const currentStepPurpose = intent.chainSteps?.find(step => step.modelId === modelId)?.purpose
      if (currentStepPurpose === 'prompt-enhancement') {
        fullPrompt = `${fullPrompt}

CRITICAL INSTRUCTIONS:
- Output ONLY the final optimized prompt
- Do NOT provide multiple examples or variations
- Do NOT add explanations, commentary, or labels
- Return EXACTLY one prompt that directly describes the image to generate
- The prompt should start immediately without any preamble like "Here's the optimized prompt:" or "Optimized Prompt:"
- Just return the raw prompt text that will be fed directly to the image generation model`
      }

      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: fullPrompt,
      })

      let content = response.text || ''

      // Additional cleanup for prompt-enhancement: remove any common prefixes
      if (currentStepPurpose === 'prompt-enhancement') {
        content = content
          .replace(/^(Optimized Prompt:|Here's the optimized prompt:|Final prompt:)\s*/i, '')
          .trim()
      }

      return {
        content,
        type: 'text'
      }
    }

    throw new Error(`Provider not supported for chaining: ${modelData.provider}`)
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
      } else if (modelData.provider === 'ByteDance') {
        return await this.executeReplicate(modelId, request, systemPrompt, conversationHistory, startTime, intent, isFallback)
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
    }) as any

    const content = response.choices?.[0]?.message?.content || ''

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
   * Execute on Replicate models (ByteDance - image generation)
   */
  private async executeReplicate(
    modelId: string,
    request: OrchestratorRequest,
    systemPrompt: string,
    conversationHistory: any[],
    startTime: number,
    intent?: QueryIntent,
    isFallback = false
  ): Promise<OrchestratorResponse> {
    const Replicate = (await import('replicate')).default
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Run Seed Dream 4 model
    const output = await replicate.run(
      "bytedance/seedream-4",
      {
        input: {
          prompt: request.message,
          aspect_ratio: '4:3'
        }
      }
    ) as any

    // Output is an array of URLs (strings)
    const replicateUrl = output && output[0] ? String(output[0]) : null

    if (!replicateUrl) {
      throw new Error('Failed to generate image')
    }

    // Download and save image to local storage
    const { downloadAndSaveImage } = await import('@/lib/image-storage')
    const userId = request.userId || request.context.userId || 'anonymous'
    const localImageUrl = await downloadAndSaveImage(replicateUrl, userId)

    return {
      content: localImageUrl,  // Return local path instead of Replicate CDN
      model: modelId,
      intent: intent!,
      metadata: {
        executionTime: Date.now() - startTime,
        modelUsed: modelId,
        fallbackUsed: isFallback,
        type: 'image',
        aspectRatio: '4:3'
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
