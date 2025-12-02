/**
 * Groq Model Registry - January 2025
 * Comprehensive model specifications based on official Groq documentation
 * Source: console.groq.com/docs/models
 */

export interface GroqModelSpec {
  id: string
  name: string
  provider: 'Groq'
  contextWindow: number  // Max input tokens
  maxOutputTokens: number
  capabilities: {
    toolCalling?: boolean
    jsonMode?: boolean
    vision?: boolean
    reasoning?: boolean
    streaming?: boolean
  }
  specialization: 'general' | 'tool-use' | 'reasoning' | 'vision' | 'speed'
  bestFor: string[]
  temperature: {
    recommended: number
    min: number
    max: number
  }
  deprecated?: boolean
  replacedBy?: string
  notes?: string
}

/**
 * All available Groq models (Jan 2025)
 */
export const GROQ_MODELS: Record<string, GroqModelSpec> = {
  // === PRIMARY ORCHESTRATOR (128K context, tool calling) ===
  'llama-3.3-70b-versatile': {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Groq',
    contextWindow: 128_000,  // 128K tokens
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: true,
      jsonMode: true,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'tool-use',
    bestFor: [
      'Primary orchestrator',
      'Tool calling workflows',
      'Long context conversations',
      'Multi-step reasoning',
      'Complex instruction following'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: 'Production-ready replacement for llama3-groq-70b-tool-use. 128K context enables comprehensive conversation history.'
  },

  // === SPEED-OPTIMIZED (8K context, 6x faster) ===
  'llama-3.3-70b-specdec': {
    id: 'llama-3.3-70b-specdec',
    name: 'Llama 3.3 70B Speculative Decoding',
    provider: 'Groq',
    contextWindow: 8_192,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: false,
      jsonMode: true,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'speed',
    bestFor: [
      'Real-time responses',
      'Low-latency applications',
      'Simple queries',
      'Short context tasks'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: '6x speed boost using speculative decoding. Use for speed-critical tasks with limited context.'
  },

  // === REASONING POWERHOUSE (128K context, chain-of-thought) ===
  'deepseek-r1-distill-llama-70b': {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: true,
      jsonMode: true,
      vision: false,
      reasoning: true,  // Chain-of-thought reasoning
      streaming: true
    },
    specialization: 'reasoning',
    bestFor: [
      'Mathematical reasoning',
      'Complex problem solving',
      'Multi-step logical deduction',
      'Code generation',
      'Scientific analysis'
    ],
    temperature: {
      recommended: 0.6,  // 0.5-0.7 recommended for best reasoning
      min: 0,
      max: 1
    },
    notes: 'Best for reasoning: 94.5% on MATH-500, 86.7% on AIME 2024. Put all instructions in user messages (not system prompt).'
  },

  // === SMALLER REASONING MODEL (128K context, faster) ===
  'deepseek-r1-distill-qwen-32b': {
    id: 'deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek R1 Distill Qwen 32B',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: true,
      jsonMode: true,
      vision: false,
      reasoning: true,
      streaming: true
    },
    specialization: 'reasoning',
    bestFor: [
      'Reasoning with faster inference',
      'Complex problem solving (smaller)',
      'Code generation',
      'Logical analysis'
    ],
    temperature: {
      recommended: 0.6,
      min: 0,
      max: 1
    },
    notes: '32B parameter reasoning model. Faster than 70B variant while maintaining strong reasoning.'
  },

  // === VISION MODELS (128K context, multimodal) ===
  'llama-3.2-90b-vision-preview': {
    id: 'llama-3.2-90b-vision-preview',
    name: 'Llama 3.2 90B Vision',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: false,
      jsonMode: true,
      vision: true,
      reasoning: false,
      streaming: true
    },
    specialization: 'vision',
    bestFor: [
      'Image analysis',
      'Visual question answering',
      'OCR tasks',
      'Diagram understanding',
      'Screenshot analysis'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: 'Multimodal model for vision + text tasks. 128K context for image + conversation history.'
  },

  'llama-3.2-11b-vision-preview': {
    id: 'llama-3.2-11b-vision-preview',
    name: 'Llama 3.2 11B Vision',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: false,
      jsonMode: true,
      vision: true,
      reasoning: false,
      streaming: true
    },
    specialization: 'vision',
    bestFor: [
      'Faster image analysis',
      'Visual QA',
      'OCR'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: 'Smaller vision model. Faster inference than 90B variant.'
  },

  // === SMALL MODELS (128K context, fast & efficient) ===
  'llama-3.2-3b-preview': {
    id: 'llama-3.2-3b-preview',
    name: 'Llama 3.2 3B',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: false,
      jsonMode: true,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'speed',
    bestFor: [
      'Simple text generation',
      'Fast responses',
      'Basic tasks',
      'Low-resource environments'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: 'Smallest model. Use for simple tasks requiring speed.'
  },

  'llama-3.2-1b-preview': {
    id: 'llama-3.2-1b-preview',
    name: 'Llama 3.2 1B',
    provider: 'Groq',
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: false,
      jsonMode: true,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'speed',
    bestFor: [
      'Ultra-fast responses',
      'Trivial tasks',
      'Testing'
    ],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    notes: 'Smallest model. Very fast but limited capabilities.'
  },

  // === DEPRECATED MODELS ===
  'llama3-groq-70b-tool-use': {
    id: 'llama3-groq-70b-tool-use',
    name: 'Llama 3 Groq 70B Tool Use (DEPRECATED)',
    provider: 'Groq',
    contextWindow: 8_192,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: true,
      jsonMode: false,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'tool-use',
    bestFor: [],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    deprecated: true,
    replacedBy: 'llama-3.3-70b-versatile',
    notes: 'DEPRECATED Jan 6, 2025. Use llama-3.3-70b-versatile instead (128K context vs 8K).'
  },

  'llama3-groq-8b-tool-use': {
    id: 'llama3-groq-8b-tool-use',
    name: 'Llama 3 Groq 8B Tool Use (DEPRECATED)',
    provider: 'Groq',
    contextWindow: 8_192,
    maxOutputTokens: 8_192,
    capabilities: {
      toolCalling: true,
      jsonMode: false,
      vision: false,
      reasoning: false,
      streaming: true
    },
    specialization: 'tool-use',
    bestFor: [],
    temperature: {
      recommended: 0.7,
      min: 0,
      max: 2
    },
    deprecated: true,
    replacedBy: 'llama-3.3-70b-versatile',
    notes: 'DEPRECATED Jan 6, 2025. Use llama-3.3-70b-versatile instead.'
  }
}

/**
 * Get model by ID with deprecation warnings
 */
export function getGroqModel(modelId: string): GroqModelSpec | null {
  const model = GROQ_MODELS[modelId]

  if (!model) {
    console.error(`[Groq Registry] Model not found: ${modelId}`)
    return null
  }

  if (model.deprecated) {
    console.warn(`[Groq Registry] ⚠️  Model ${modelId} is DEPRECATED${model.replacedBy ? ` - Use ${model.replacedBy} instead` : ''}`)
    if (model.replacedBy) {
      console.warn(`[Groq Registry] Auto-switching to: ${model.replacedBy}`)
      return GROQ_MODELS[model.replacedBy] || model
    }
  }

  return model
}

/**
 * Get best model for a specific task
 */
export function getBestGroqModelFor(task: 'orchestration' | 'reasoning' | 'vision' | 'speed'): GroqModelSpec {
  switch (task) {
    case 'orchestration':
      return GROQ_MODELS['llama-3.3-70b-versatile']

    case 'reasoning':
      return GROQ_MODELS['deepseek-r1-distill-llama-70b']

    case 'vision':
      return GROQ_MODELS['llama-3.2-90b-vision-preview']

    case 'speed':
      return GROQ_MODELS['llama-3.3-70b-specdec']

    default:
      return GROQ_MODELS['llama-3.3-70b-versatile']
  }
}

/**
 * Get all non-deprecated models
 */
export function getActiveGroqModels(): GroqModelSpec[] {
  return Object.values(GROQ_MODELS).filter(m => !m.deprecated)
}

/**
 * Calculate token budget for a model
 */
export function calculateTokenBudget(
  modelId: string,
  messageLength: number,
  reserveForOutput: number = 2048
): {
  maxContextTokens: number
  recommendedContextTokens: number
  needsCompression: boolean
} {
  const model = getGroqModel(modelId)

  if (!model) {
    return {
      maxContextTokens: 0,
      recommendedContextTokens: 0,
      needsCompression: true
    }
  }

  const maxContextTokens = model.contextWindow - reserveForOutput
  const recommendedContextTokens = Math.floor(maxContextTokens * 0.8)  // Use 80% of available
  const needsCompression = messageLength > recommendedContextTokens

  return {
    maxContextTokens,
    recommendedContextTokens,
    needsCompression
  }
}
