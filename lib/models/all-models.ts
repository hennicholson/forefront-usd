import { LucideIcon, Zap, Brain, Code, Languages, Shield, Mic, Volume2, Wrench, Sparkles, BookOpen, Search, Image as ImageIcon, Palette, Globe } from 'lucide-react'

export type ModelProvider = 'Groq' | 'Google' | 'Perplexity' | 'ByteDance' | 'OpenAI' | 'Anthropic'

export interface AIModel {
  id: string
  name: string
  provider: ModelProvider
  description: string
  category: 'text' | 'multimodal' | 'audio' | 'image' | 'video' | 'search' | 'system'
  icon: LucideIcon
  color: string
  contextWindow: number
  speed: string
  capabilities: string[]
  features: {
    toolCalling?: boolean
    webSearch?: boolean
    streaming?: boolean
    vision?: boolean
    audioInput?: boolean
    audioOutput?: boolean
    imageGeneration?: boolean
    videoGeneration?: boolean
    multimodal?: boolean
  }
  // Rate limits (only for Groq models)
  rpm?: number
  rpd?: number
  tpm?: number
  tpd?: number
}

export const allModels: AIModel[] = [
  // ===== GOOGLE MODELS =====
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Google\'s flagship multimodal powerhouse with native tool use, agentic capabilities, and 1M context window. Next-gen features with lightning-fast inference.',
    category: 'multimodal',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    contextWindow: 1000000,
    speed: 'Ultra-fast',
    capabilities: ['1M context', 'Native tool use', 'Multimodal I/O', 'Agentic workflows', 'Vision & audio'],
    features: {
      toolCalling: true,
      streaming: true,
      vision: true,
      audioInput: true,
      multimodal: true
    }
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    provider: 'Google',
    description: 'Cutting-edge experimental variant with latest features and improvements. Access to bleeding-edge capabilities before general release.',
    category: 'multimodal',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    contextWindow: 1000000,
    speed: 'Experimental',
    capabilities: ['Latest features', 'Experimental', '1M context', 'Advanced reasoning', 'Multimodal'],
    features: {
      toolCalling: true,
      streaming: true,
      vision: true,
      audioInput: true,
      multimodal: true
    }
  },

  // ===== PERPLEXITY MODELS =====
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    provider: 'Perplexity',
    description: 'Premium real-time web search model with access to Reddit, X.com, and AI forums. Get the latest information with comprehensive citations and sources.',
    category: 'search',
    icon: Search,
    color: 'from-violet-500 to-purple-500',
    contextWindow: 127072,
    speed: 'Real-time',
    capabilities: ['Real-time web search', 'Reddit & X.com', 'Citations', 'Videos & images', 'Up-to-date info'],
    features: {
      webSearch: true,
      streaming: false,
      vision: false
    }
  },
  {
    id: 'sonar',
    name: 'Sonar',
    provider: 'Perplexity',
    description: 'Fast web search for up-to-date information. Perfect for quick research and finding current events with cited sources.',
    category: 'search',
    icon: Zap,
    color: 'from-purple-500 to-fuchsia-500',
    contextWindow: 127072,
    speed: 'Fast',
    capabilities: ['Web search', 'Quick research', 'Citations', 'Current events', 'Source links'],
    features: {
      webSearch: true,
      streaming: false,
      vision: false
    }
  },

  // ===== BYTEDANCE MODELS =====
  {
    id: 'seedream-4',
    name: 'Seed Dream 4',
    provider: 'ByteDance',
    description: 'State-of-the-art 4K image generation with 1.8s 2K output. Industry-leading multimodal editing, reasoning capabilities, and style conversion. Beats Gemini 2.5 Flash and GPT-4o.',
    category: 'image',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    contextWindow: 0,
    speed: '1.8s for 2K',
    capabilities: ['4K generation', '1.8s 2K output', 'Image editing', 'Style conversion', 'Multimodal reasoning'],
    features: {
      imageGeneration: true,
      vision: true,
      multimodal: true,
      streaming: false
    }
  },

  // ===== GROQ - TEXT MODELS =====
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Groq',
    description: 'Powerful multilingual model excelling at complex reasoning, coding, and instruction-following. Comparable to GPT-4 at 25x lower cost with 128K context.',
    category: 'text',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    contextWindow: 131072,
    speed: '280 tokens/sec',
    rpm: 30,
    rpd: 1000,
    tpm: 12000,
    tpd: 100000,
    capabilities: ['Advanced reasoning', 'Multilingual', 'Math & code', 'Tool calling', 'Cost-effective'],
    features: {
      toolCalling: true,
      streaming: true
    }
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'Groq',
    description: 'Lightning-fast general assistant perfect for quick conversations, coding help, and real-time chatbots. Blazing 560 tokens/second speed.',
    category: 'text',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    contextWindow: 131072,
    speed: '560 tokens/sec',
    rpm: 30,
    rpd: 14400,
    tpm: 6000,
    tpd: 500000,
    capabilities: ['Ultra-fast', 'General chat', 'Coding', 'Translation', '131K context'],
    features: {
      streaming: true
    }
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    provider: 'Groq',
    description: 'Dual-mode genius supporting both deep thinking and fast responses. Supports 119 languages with massive 128K context. Trained on 36 trillion tokens.',
    category: 'text',
    icon: Brain,
    color: 'from-cyan-500 to-blue-500',
    contextWindow: 128000,
    speed: 'Variable',
    rpm: 60,
    rpd: 1000,
    tpm: 6000,
    tpd: 500000,
    capabilities: ['Thinking mode', 'Fast mode', '119 languages', 'STEM & coding', 'Tool calling'],
    features: {
      toolCalling: true,
      streaming: true
    }
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'Groq',
    description: 'Open-source powerhouse with built-in browser search, code execution, and advanced reasoning. Perfect for research and complex problem-solving.',
    category: 'text',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    contextWindow: 131072,
    speed: '500 tokens/sec',
    rpm: 30,
    rpd: 1000,
    tpm: 8000,
    tpd: 200000,
    capabilities: ['Browser search', 'Code execution', 'Reasoning', 'Open-source', '131K context'],
    features: {
      webSearch: true,
      streaming: true
    }
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'Groq',
    description: 'Fast open model with search and coding capabilities. Excellent balance of speed (1000 tokens/sec) and functionality for everyday tasks.',
    category: 'text',
    icon: Zap,
    color: 'from-blue-500 to-indigo-500',
    contextWindow: 131072,
    speed: '1000 tokens/sec',
    rpm: 30,
    rpd: 1000,
    tpm: 8000,
    tpd: 200000,
    capabilities: ['Super fast', 'Web search', 'Coding', 'Cost-effective', '131K context'],
    features: {
      webSearch: true,
      streaming: true
    }
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 Instruct 0905',
    provider: 'Groq',
    description: 'Latest version with improved instruction following and reasoning. Enhanced for complex tasks requiring precise execution and tool use.',
    category: 'text',
    icon: BookOpen,
    color: 'from-gray-600 to-slate-600',
    contextWindow: 10000,
    speed: 'Moderate',
    rpm: 60,
    rpd: 1000,
    tpm: 10000,
    tpd: 300000,
    capabilities: ['Enhanced reasoning', 'Precise execution', 'Tool calling', 'Complex tasks', 'Latest version'],
    features: {
      toolCalling: true,
      streaming: true
    }
  },
  {
    id: 'allam-2-7b',
    name: 'ALLAM 2 7B',
    provider: 'Groq',
    description: 'Efficient 7B parameter model optimized for quick inference and general-purpose tasks. Great for resource-constrained deployments.',
    category: 'text',
    icon: Zap,
    color: 'from-lime-500 to-green-500',
    contextWindow: 6000,
    speed: 'Fast',
    rpm: 30,
    rpd: 7000,
    tpm: 6000,
    tpd: 500000,
    capabilities: ['Lightweight', 'Fast inference', 'General tasks', 'Efficient', 'Low resource'],
    features: {
      streaming: true
    }
  },

  // ===== GROQ - MULTIMODAL MODELS =====
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick',
    provider: 'Groq',
    description: 'Cutting-edge multimodal AI with 128 experts (400B total params). Superior at coding, reasoning, and handling images/documents. Beats GPT-4o and Gemini 2.0 Flash.',
    category: 'multimodal',
    icon: Brain,
    color: 'from-violet-600 to-purple-600',
    contextWindow: 1000000,
    speed: 'Variable',
    rpm: 30,
    rpd: 1000,
    tpm: 6000,
    tpd: 500000,
    capabilities: ['Image & text', 'Audio & video', 'Advanced reasoning', '1M context', 'Industry-leading'],
    features: {
      toolCalling: true,
      vision: true,
      audioInput: true,
      multimodal: true,
      streaming: true
    }
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
    provider: 'Groq',
    description: 'Optimized for massive 10M context window. Perfect for analyzing entire codebases, long documents, and multi-document summarization. Fits on single GPU.',
    category: 'multimodal',
    icon: BookOpen,
    color: 'from-indigo-600 to-blue-600',
    contextWindow: 10000000,
    speed: 'Fast',
    rpm: 30,
    rpd: 1000,
    tpm: 30000,
    tpd: 500000,
    capabilities: ['10M context', 'Image & text', 'Codebase analysis', 'Long documents', 'Multimodal'],
    features: {
      vision: true,
      multimodal: true,
      streaming: true
    }
  },
  {
    id: 'meta-llama/llama-guard-4-12b',
    name: 'Llama Guard 4 12B',
    provider: 'Groq',
    description: 'Comprehensive content moderation model ensuring safe AI interactions. Blazing 1200 tokens/sec for real-time safety checks across 131K context.',
    category: 'multimodal',
    icon: Shield,
    color: 'from-amber-500 to-orange-500',
    contextWindow: 131072,
    speed: '1200 tokens/sec',
    rpm: 30,
    rpd: 14400,
    tpm: 15000,
    tpd: 500000,
    capabilities: ['Content moderation', 'Safety filtering', 'Real-time', '131K context', 'Enterprise-grade'],
    features: {
      streaming: true
    }
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-86m',
    name: 'Llama Prompt Guard 86M',
    provider: 'Groq',
    description: 'Enhanced security model with more parameters for advanced threat detection. Ideal for enterprise applications requiring robust safety.',
    category: 'multimodal',
    icon: Shield,
    color: 'from-orange-500 to-red-500',
    contextWindow: 15000,
    speed: '14,400 tokens/sec',
    rpm: 30,
    rpd: 14400,
    tpm: 15000,
    tpd: 500000,
    capabilities: ['Advanced security', 'Threat detection', 'Enterprise-ready', 'Ultra-fast', 'Prompt injection prevention'],
    features: {
      streaming: true
    }
  },

  // ===== GROQ - AUDIO MODELS =====
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    provider: 'Groq',
    description: 'Lightning-fast audio transcription supporting 99+ languages. Achieves 216x real-time speed. Perfect for multilingual transcription at scale.',
    category: 'audio',
    icon: Mic,
    color: 'from-pink-500 to-rose-500',
    contextWindow: 0,
    speed: '216x real-time',
    rpm: 20,
    rpd: 2000,
    tpm: 0,
    capabilities: ['99+ languages', '216x speed', 'High accuracy', 'Timestamps', 'Translation'],
    features: {
      audioInput: true
    }
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper v3 Turbo',
    provider: 'Groq',
    description: '8x faster than Whisper Large with minimal accuracy loss. Optimized with 4 decoder layers for ultra-fast transcription. Uses only 6GB VRAM.',
    category: 'audio',
    icon: Zap,
    color: 'from-fuchsia-500 to-pink-500',
    contextWindow: 0,
    speed: '8x faster',
    rpm: 20,
    rpd: 2000,
    tpm: 0,
    capabilities: ['Ultra-fast', 'Multilingual', 'Efficient', '6GB VRAM', 'Timestamps'],
    features: {
      audioInput: true
    }
  },
  {
    id: 'playai-tts',
    name: 'PlayAI TTS',
    provider: 'Groq',
    description: 'High-quality text-to-speech synthesis with natural-sounding voices. Perfect for voice assistants, audiobooks, and accessibility features.',
    category: 'audio',
    icon: Volume2,
    color: 'from-purple-500 to-pink-500',
    contextWindow: 1200,
    speed: 'Real-time',
    rpm: 10,
    rpd: 100,
    tpm: 1200,
    tpd: 3600,
    capabilities: ['Natural voices', 'TTS', 'Real-time', 'Multiple voices', 'Accessibility'],
    features: {
      audioOutput: true
    }
  },
  {
    id: 'playai-tts-arabic',
    name: 'PlayAI TTS Arabic',
    provider: 'Groq',
    description: 'Specialized text-to-speech model optimized for Arabic language with authentic pronunciation and natural flow.',
    category: 'audio',
    icon: Languages,
    color: 'from-emerald-500 to-teal-500',
    contextWindow: 1200,
    speed: 'Real-time',
    rpm: 10,
    rpd: 100,
    tpm: 1200,
    tpd: 3600,
    capabilities: ['Arabic TTS', 'Natural pronunciation', 'Real-time', 'Authentic accent', 'Accessibility'],
    features: {
      audioOutput: true
    }
  },

  // ===== GROQ - SYSTEM MODELS =====
  {
    id: 'groq/compound',
    name: 'Groq Compound',
    provider: 'Groq',
    description: 'Advanced AI system with built-in web search, code execution, and Wolfram Alpha integration. Intelligently selects and uses tools to solve complex problems.',
    category: 'system',
    icon: Wrench,
    color: 'from-indigo-500 to-purple-500',
    contextWindow: 70000,
    speed: '~450 tokens/sec',
    rpm: 30,
    rpd: 250,
    tpm: 70000,
    capabilities: ['Web search', 'Code execution', 'Wolfram Alpha', 'Tool use', 'Reasoning'],
    features: {
      toolCalling: true,
      webSearch: true,
      streaming: true
    }
  },
  {
    id: 'groq/compound-mini',
    name: 'Groq Compound Mini',
    provider: 'Groq',
    description: 'Lighter version of Compound with tool-using capabilities. Faster and more efficient while maintaining intelligent tool selection for everyday tasks.',
    category: 'system',
    icon: Wrench,
    color: 'from-blue-500 to-cyan-500',
    contextWindow: 70000,
    speed: 'Fast',
    rpm: 30,
    rpd: 250,
    tpm: 70000,
    capabilities: ['Web search', 'Code execution', 'Tool use', 'Efficient', 'Fast'],
    features: {
      toolCalling: true,
      webSearch: true,
      streaming: true
    }
  },
]

export const getModelById = (id: string) => {
  return allModels.find(model => model.id === id)
}

export const getModelsByCategory = (category: AIModel['category']) => {
  return allModels.filter(model => model.category === category)
}

export const getModelsByProvider = (provider: ModelProvider) => {
  return allModels.filter(model => model.provider === provider)
}

export const getToolCallingModels = () => {
  return allModels.filter(model => model.features.toolCalling === true)
}

export const getWebSearchModels = () => {
  return allModels.filter(model => model.features.webSearch === true)
}

export const providers = [
  { id: 'Groq', name: 'Groq', description: 'Lightning-fast inference', icon: Zap, color: 'from-orange-500 to-red-500' },
  { id: 'Google', name: 'Google', description: 'Advanced multimodal AI', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
  { id: 'Perplexity', name: 'Perplexity', description: 'Real-time web knowledge', icon: Search, color: 'from-purple-500 to-pink-500' },
  { id: 'ByteDance', name: 'ByteDance', description: 'State-of-the-art generation', icon: Palette, color: 'from-pink-500 to-rose-500' },
] as const

export const categories = [
  { id: 'text', name: 'Text Models', description: 'General purpose text generation and chat' },
  { id: 'multimodal', name: 'Multimodal', description: 'Handle text, images, audio, and video' },
  { id: 'search', name: 'Web Search', description: 'Real-time web knowledge and research' },
  { id: 'image', name: 'Image Generation', description: 'Create and edit images' },
  { id: 'audio', name: 'Audio', description: 'Speech recognition and text-to-speech' },
  { id: 'system', name: 'Systems', description: 'Tool-using AI with integrated capabilities' },
] as const
