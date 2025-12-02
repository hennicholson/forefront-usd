import { groqClient } from '@/lib/groq/client'

export interface ChainStep {
  step: number
  modelId: string
  purpose: 'prompt-enhancement' | 'image-generation' | 'web-search' | 'reasoning' | 'text-generation' | 'code-generation' | 'final-composition'
  inputFrom?: number  // Which step's output to use as input (undefined = user input)
}

export interface QueryIntent {
  type: 'factual' | 'reasoning' | 'coding' | 'multimodal' | 'simple' | 'tool-use' | 'image-generation' | 'image-prompt-help' | 'chained'
  needsWebSearch: boolean
  needsReasoning: boolean
  needsMultimodal: boolean
  needsToolUse: boolean
  needsImageGeneration: boolean
  needsImagePromptHelp: boolean
  needsCodeGeneration: boolean
  needsTextGeneration: boolean
  needsChaining: boolean
  complexity: 'low' | 'medium' | 'high'
  confidence: number
  suggestedModel: string
  fallbackModel?: string
  chainSteps?: ChainStep[]
}

export interface RouterContext {
  moduleTitle?: string
  currentSlide?: {
    title: string
    content: string
    type?: string
  }
  highlightedText?: string
  conversationHistory?: Array<{ role: string; content: string }>
  managedContext?: any  // ManagedContext from context-manager
}

/**
 * Analyzes query intent and selects the optimal model
 * Uses fast Llama 3.1 8B for classification (<200ms)
 */
export async function classifyQuery(
  message: string,
  context?: RouterContext
): Promise<QueryIntent> {
  try {
    const classificationPrompt = buildClassificationPrompt(message, context)

    // Use fast Llama 3.1 8B for instant classification
    const response = await groqClient.chat({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a query classifier. Analyze the user's question and return ONLY a JSON object with this exact structure:
{
  "type": "factual|reasoning|coding|multimodal|simple|tool-use|image-generation|image-prompt-help|chained",
  "needsWebSearch": boolean,
  "needsReasoning": boolean,
  "needsMultimodal": boolean,
  "needsToolUse": boolean,
  "needsImageGeneration": boolean,
  "needsImagePromptHelp": boolean,
  "needsCodeGeneration": boolean,
  "needsTextGeneration": boolean,
  "needsChaining": boolean,
  "complexity": "low|medium|high",
  "confidence": 0.0-1.0
}

Classification rules:
- factual: Questions about current events, facts, news → needs web search
- reasoning: Math, logic puzzles, complex analysis → needs reasoning
- coding: Programming questions, debugging, code review → needs code generation
- multimodal: Questions about images, videos, audio → multimodal models
- simple: Basic questions, greetings, clarifications → fast simple models
- tool-use: Needs calculations, web search, or code execution → tool-calling models
- image-generation: User wants to ACTUALLY GENERATE/CREATE an image → needs image generation model
- image-prompt-help: User wants help WRITING prompts for image generation → needs creative text model
- chained: Multi-step workflow requiring multiple models in sequence → needs model chaining

IMPORTANT - Code Generation Detection:
- User mentions "write code", "create function", "implement", "build a script", "code for"
- Programming tasks: "write a Python function", "create React component", "implement algorithm"
- Set needsCodeGeneration=true for ANY coding/programming request
- Examples: "write a function to", "create a script that", "implement a class for"

IMPORTANT - Text Generation Detection:
- User wants "write", "explain", "summarize", "document", "describe", "compose"
- Long-form content: articles, essays, documentation, explanations
- Set needsTextGeneration=true for writing/documentation requests
- Examples: "write an article about", "explain how", "summarize this topic", "create documentation for"

IMPORTANT - Web Search Detection (MUST set needsWebSearch=true for these):
- User mentions "research", "search", "sonar", "web search", "look up", "find information"
- Questions about current events, latest info, news, or real-world facts
- User wants research-backed responses or real-time information
- Examples: "do research and", "search using sonar", "web search for", "look up information about"
- CRITICAL: If user mentions "sonar pro" or "web search" → ALWAYS set needsWebSearch=true

IMPORTANT - Chaining Detection:
- "enhance and generate", "improve and create", "rewrite and generate" → chained (type: "chained", needsChaining: true)
- "enhance/improve/rewrite this prompt and then generate/create" → chained
- "do research and", "search and then", "look up and create" → chained (type: "chained", needsChaining: true, needsWebSearch: true)
- Keywords: "and then", "then make", "enhance it and", "improve it and", "research and", "using [tool] and"
- Multi-step requests like "search using sonar pro, create prompt, generate image" → chained
- When chaining detected: set needsChaining=true AND type="chained"
- If chaining + mentions research/search/sonar → ALSO set needsWebSearch=true

IMPORTANT - Image Detection:
- "generate image", "create image", "make picture", "draw", "visualize" → image-generation (needsImageGeneration: true)
- "write prompt for", "help me write", "create prompt", "prompt for generating" → image-prompt-help
- If user wants to generate AND mentions research/optimization → chained (needsChaining: true, needsImageGeneration: true)
- If unclear, prefer image-generation over image-prompt-help

Complexity:
- low: Simple factual questions, greetings
- medium: Explanations, summaries, basic coding, image prompts
- high: Complex reasoning, multi-step problems, advanced concepts, chained workflows`
        },
        {
          role: 'user',
          content: classificationPrompt
        }
      ],
      temperature: 0.0,  // ZERO for deterministic classification (2025 best practice)
      maxTokens: 200,
      stream: false
    }) as any

    const content = response.choices?.[0]?.message?.content || '{}'
    const classification = parseClassificationResponse(content)

    // === ENHANCED MULTI-STEP DETECTION ===
    // Detect if request requires multiple steps (research + generation, code + explanation, etc.)
    const multiStepIndicators = [
      /\b(study|research|analyze|look at|examine)\b.*\b(then|and|before)\b.*\b(create|generate|make|write)/i,
      /\b(first|start by|begin with)\b.*\b(then|next|after|finally)/i,
      /\b(optimize|improve|enhance)\b.*\b(prompt|generation|code|text)/i,
      /\bmultiple\s+(steps|stages|phases)/i,
      /\b(and then|after that|following this)/i,
      /\b(research|search).*(and|then).*(generate|create|write|code)/i,
      /\b(write|code).*(and|then).*(explain|document|test)/i
    ]
    const hasMultipleSteps = multiStepIndicators.some(pattern => pattern.test(message))

    // Enable chaining for multi-step requests
    if (hasMultipleSteps && !classification.needsChaining) {
      console.log('[Router] Multi-step request detected - enabling dynamic planning')
      classification.needsChaining = true
      if (classification.type !== 'chained') {
        classification.type = 'chained'
      }
    }

    // Map to optimal model
    const modelSelection = selectOptimalModel(classification, context)

    return {
      ...classification,
      ...modelSelection,
      type: classification.type || 'simple',
      needsWebSearch: classification.needsWebSearch || false,
      needsReasoning: classification.needsReasoning || false,
      needsMultimodal: classification.needsMultimodal || false,
      needsToolUse: classification.needsToolUse || false,
      needsImageGeneration: classification.needsImageGeneration || false,
      needsImagePromptHelp: classification.needsImagePromptHelp || false,
      needsCodeGeneration: classification.needsCodeGeneration || false,
      needsTextGeneration: classification.needsTextGeneration || false,
      needsChaining: classification.needsChaining || false,
      complexity: classification.complexity || 'medium',
      confidence: classification.confidence || 0.5
    }
  } catch (error) {
    console.error('Router classification error:', error)
    // Fallback to general-purpose model
    return {
      type: 'simple',
      needsWebSearch: false,
      needsReasoning: false,
      needsMultimodal: false,
      needsToolUse: false,
      needsImageGeneration: false,
      needsImagePromptHelp: false,
      needsCodeGeneration: false,
      needsTextGeneration: false,
      needsChaining: false,
      complexity: 'medium',
      confidence: 0.5,
      suggestedModel: 'llama-3.3-70b-versatile',
      fallbackModel: 'gemini-2.0-flash'
    }
  }
}

function buildClassificationPrompt(message: string, context?: RouterContext): string {
  let prompt = `Query: "${message}"`

  if (context?.highlightedText) {
    prompt += `\nHighlighted text: "${context.highlightedText}"`
  }

  if (context?.moduleTitle) {
    prompt += `\nLearning context: Module "${context.moduleTitle}"`
    if (context.currentSlide?.title) {
      prompt += ` - Slide "${context.currentSlide.title}"`
    }
  }

  if (context?.conversationHistory && context.conversationHistory.length > 0) {
    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1]
    prompt += `\nPrevious context: "${lastMessage.content.substring(0, 100)}..."`
  }

  return prompt
}

function parseClassificationResponse(content: string): Partial<QueryIntent> {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const json = JSON.parse(jsonMatch[0])
    return {
      type: json.type || 'simple',
      needsWebSearch: json.needsWebSearch || false,
      needsReasoning: json.needsReasoning || false,
      needsMultimodal: json.needsMultimodal || false,
      needsToolUse: json.needsToolUse || false,
      needsImageGeneration: json.needsImageGeneration || false,
      needsImagePromptHelp: json.needsImagePromptHelp || false,
      needsCodeGeneration: json.needsCodeGeneration || false,
      needsTextGeneration: json.needsTextGeneration || false,
      needsChaining: json.needsChaining || false,
      complexity: json.complexity || 'medium',
      confidence: json.confidence || 0.5
    }
  } catch (error) {
    console.error('Failed to parse classification response:', error)
    return {
      type: 'simple',
      needsWebSearch: false,
      needsReasoning: false,
      needsMultimodal: false,
      needsToolUse: false,
      needsImageGeneration: false,
      needsImagePromptHelp: false,
      needsCodeGeneration: false,
      needsTextGeneration: false,
      needsChaining: false,
      complexity: 'medium',
      confidence: 0.3
    }
  }
}

function selectOptimalModel(
  classification: Partial<QueryIntent>,
  context?: RouterContext
): { suggestedModel: string; fallbackModel: string; chainSteps?: ChainStep[] } {
  const { type, needsWebSearch, needsReasoning, needsMultimodal, needsToolUse, needsImageGeneration, needsCodeGeneration, needsChaining, complexity } = classification

  // Priority 0: Multi-step chaining - PLANNER WILL BUILD WORKFLOW
  // Router only detects that chaining is needed, not what the chain should be
  if (needsChaining || type === 'chained') {
    console.log('[Router] Chaining detected - will delegate to planner for workflow generation')
    return {
      suggestedModel: 'chained', // Special marker - planner will take over
      fallbackModel: 'llama-3.3-70b-versatile'
      // NO chainSteps - planner generates the workflow
    }
  }

  // Priority 1: Web search needs
  if (needsWebSearch || type === 'factual') {
    return {
      suggestedModel: 'sonar-pro', // Real-time web search
      fallbackModel: 'sonar'
    }
  }

  // Priority 2: Tool use (calculations, code execution)
  if (needsToolUse || type === 'tool-use') {
    return {
      suggestedModel: 'groq/compound', // Web + code + Wolfram
      fallbackModel: 'llama-3.3-70b-versatile'
    }
  }

  // Priority 3: Advanced reasoning
  if (needsReasoning && complexity === 'high') {
    return {
      suggestedModel: 'qwen/qwen3-32b', // Thinking mode
      fallbackModel: 'llama-3.3-70b-versatile'
    }
  }

  // Priority 4: Code generation
  if (needsCodeGeneration || type === 'coding') {
    return {
      suggestedModel: 'llama-3.3-70b-versatile', // Best for coding
      fallbackModel: 'openai/gpt-oss-120b'
    }
  }

  // Priority 5: Image generation (actual image creation)
  if (needsImageGeneration || type === 'image-generation') {
    return {
      suggestedModel: 'seedream-4', // State-of-the-art image generation
      fallbackModel: 'llama-3.3-70b-versatile' // Fallback to prompt writing
    }
  }

  // Priority 6: Multimodal needs
  if (needsMultimodal || type === 'multimodal') {
    return {
      suggestedModel: 'gemini-2.0-flash', // 1M context, multimodal
      fallbackModel: 'meta-llama/llama-4-maverick-17b-128e-instruct'
    }
  }

  // Priority 7: Simple queries (fast)
  if (complexity === 'low' || type === 'simple') {
    return {
      suggestedModel: 'llama-3.1-8b-instant', // 560 tokens/sec
      fallbackModel: 'llama-3.3-70b-versatile'
    }
  }

  // Default: General-purpose powerhouse
  return {
    suggestedModel: 'llama-3.3-70b-versatile',
    fallbackModel: 'gemini-2.0-flash'
  }
}

/**
 * ROUTER EVOLUTION NOTE (2025):
 *
 * The router now focuses ONLY on intent detection and basic need classification.
 * It no longer builds hardcoded execution chains.
 *
 * When `needsChaining=true`:
 * 1. Router returns suggestedModel='chained' with NO chainSteps
 * 2. Orchestrator invokes the Planner (lib/forefront/planner.ts)
 * 3. Planner uses Llama 3.3 to generate dynamic ExecutionPlan
 * 4. Orchestrator executes the planned steps
 * 5. Final Composer synthesizes results into educational narrative
 *
 * This enables:
 * - Image generation workflows (research → enhance → generate)
 * - Code generation workflows (research → code → explain)
 * - Text generation workflows (research → write → refine)
 * - Reasoning workflows (analyze → compute → conclude)
 * - Mixed workflows (any combination of the above)
 *
 * The system is now a true "LLM conductor" instead of hardcoded chains.
 */

/**
 * Quick heuristic-based routing (no LLM call) for simple cases
 */
export function quickRoute(message: string): string | null {
  // DISABLED - Always use AI classification for better intelligence
  // We want AI to analyze EVERY request to detect multi-step needs
  return null // Force full AI classification

  // Old keyword-based routing kept for reference but disabled
  /*
  const lowerMessage = message.toLowerCase()

  // ... old keyword logic ...

  return null
  */
}
