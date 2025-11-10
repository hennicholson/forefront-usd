import { groqClient } from '@/lib/groq/client'

export interface QueryIntent {
  type: 'factual' | 'reasoning' | 'coding' | 'multimodal' | 'simple' | 'tool-use'
  needsWebSearch: boolean
  needsReasoning: boolean
  needsMultimodal: boolean
  needsToolUse: boolean
  complexity: 'low' | 'medium' | 'high'
  confidence: number
  suggestedModel: string
  fallbackModel?: string
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
  "type": "factual|reasoning|coding|multimodal|simple|tool-use",
  "needsWebSearch": boolean,
  "needsReasoning": boolean,
  "needsMultimodal": boolean,
  "needsToolUse": boolean,
  "complexity": "low|medium|high",
  "confidence": 0.0-1.0
}

Classification rules:
- factual: Questions about current events, facts, news → needs web search
- reasoning: Math, logic puzzles, complex analysis → needs reasoning
- coding: Programming questions, debugging, code review → coding expertise
- multimodal: Questions about images, videos, audio → multimodal models
- simple: Basic questions, greetings, clarifications → fast simple models
- tool-use: Needs calculations, web search, or code execution → tool-calling models

Complexity:
- low: Simple factual questions, greetings
- medium: Explanations, summaries, basic coding
- high: Complex reasoning, multi-step problems, advanced concepts`
        },
        {
          role: 'user',
          content: classificationPrompt
        }
      ],
      temperature: 0.1,
      maxTokens: 200,
      stream: false
    }) as any

    const content = response.choices?.[0]?.message?.content || '{}'
    const classification = parseClassificationResponse(content)

    // Map to optimal model
    const modelSelection = selectOptimalModel(classification, context)

    return {
      ...classification,
      ...modelSelection,
      type: classification.type || 'simple' // Ensure type is never undefined
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
      complexity: 'medium',
      confidence: 0.3
    }
  }
}

function selectOptimalModel(
  classification: Partial<QueryIntent>,
  context?: RouterContext
): { suggestedModel: string; fallbackModel: string } {
  const { type, needsWebSearch, needsReasoning, needsMultimodal, needsToolUse, complexity } = classification

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

  // Priority 4: Multimodal needs
  if (needsMultimodal || type === 'multimodal') {
    return {
      suggestedModel: 'gemini-2.0-flash', // 1M context, multimodal
      fallbackModel: 'meta-llama/llama-4-maverick-17b-128e-instruct'
    }
  }

  // Priority 5: Coding
  if (type === 'coding') {
    return {
      suggestedModel: 'llama-3.3-70b-versatile', // Tool calling, coding
      fallbackModel: 'openai/gpt-oss-120b'
    }
  }

  // Priority 6: Simple queries (fast)
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
 * Quick heuristic-based routing (no LLM call) for simple cases
 */
export function quickRoute(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  // Obvious web search queries
  const webSearchKeywords = ['latest', 'current', 'news', 'today', 'recent', 'what happened', 'who is', 'when did']
  if (webSearchKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'sonar-pro'
  }

  // Obvious coding queries
  const codingKeywords = ['code', 'function', 'bug', 'error', 'debug', 'implement', 'algorithm']
  if (codingKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'llama-3.3-70b-versatile'
  }

  // Obvious simple queries
  if (message.length < 20 || lowerMessage.match(/^(hi|hello|thanks|ok|yes|no)$/)) {
    return 'llama-3.1-8b-instant'
  }

  return null // Use full classification
}
