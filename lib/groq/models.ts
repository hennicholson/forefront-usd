import { LucideIcon, Zap, Brain, Code, Languages, Shield, Mic, Volume2, Wrench, Sparkles, BookOpen } from 'lucide-react'

export interface GroqModel {
  id: string
  name: string
  description: string
  category: 'text' | 'multimodal' | 'audio' | 'system'
  icon: LucideIcon
  color: string
  contextWindow: number
  speed: string
  rpm: number
  rpd: number
  tpm: number
  tpd?: number
  capabilities: string[]
}

export const groqModels: GroqModel[] = [
  // Text Models
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
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
    capabilities: ['Fast responses', 'General chat', 'Coding', 'Translation', '131K context']
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
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
    capabilities: ['Advanced reasoning', 'Multilingual', 'Math & code', 'Instruction following', 'Cost-effective']
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    description: 'Dual-mode genius supporting both deep thinking and fast responses. Supports 119 languages with massive 128K context. Trained on 36 trillion tokens.',
    category: 'text',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    contextWindow: 128000,
    speed: 'Variable',
    rpm: 60,
    rpd: 1000,
    tpm: 6000,
    tpd: 500000,
    capabilities: ['Thinking mode', 'Fast mode', '119 languages', 'STEM & coding', 'Agentic tasks']
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
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
    capabilities: ['Browser search', 'Code execution', 'Reasoning', 'Open-source', '131K context']
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
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
    capabilities: ['Super fast', 'Web search', 'Coding', 'Cost-effective', '131K context']
  },
  {
    id: 'openai/gpt-oss-safeguard-20b',
    name: 'GPT OSS Safeguard 20B',
    description: 'Enhanced safety model with built-in content moderation and guardrails. Same performance as GPT OSS 20B with additional safety features.',
    category: 'text',
    icon: Shield,
    color: 'from-teal-500 to-cyan-500',
    contextWindow: 131072,
    speed: '1000 tokens/sec',
    rpm: 30,
    rpd: 1000,
    tpm: 8000,
    tpd: 200000,
    capabilities: ['Content safety', 'Moderation', 'Fast responses', 'Web search', '131K context']
  },

  // Multimodal Models
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick',
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
    capabilities: ['Image & text', 'Audio & video', 'Advanced reasoning', '1M context', 'Industry-leading']
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
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
    capabilities: ['10M context', 'Image & text', 'Codebase analysis', 'Long documents', 'Efficient']
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-22m',
    name: 'Llama Prompt Guard 22M',
    description: 'Specialized security model for detecting prompt injection and jailbreak attempts. Protects your AI applications from malicious inputs.',
    category: 'multimodal',
    icon: Shield,
    color: 'from-red-500 to-pink-500',
    contextWindow: 15000,
    speed: '14,400 tokens/sec',
    rpm: 30,
    rpd: 14400,
    tpm: 15000,
    tpd: 500000,
    capabilities: ['Prompt injection detection', 'Jailbreak prevention', 'Security', 'Ultra-fast', 'Lightweight']
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-86m',
    name: 'Llama Prompt Guard 86M',
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
    capabilities: ['Advanced security', 'Threat detection', 'Enterprise-ready', 'Ultra-fast', 'Robust']
  },
  {
    id: 'meta-llama/llama-guard-4-12b',
    name: 'Llama Guard 4 12B',
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
    capabilities: ['Content moderation', 'Safety filtering', 'Real-time', '131K context', 'Enterprise-grade']
  },
  {
    id: 'allam-2-7b',
    name: 'ALLAM 2 7B',
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
    capabilities: ['Lightweight', 'Fast inference', 'General tasks', 'Efficient', 'Low resource']
  },

  // Audio Models
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    description: 'Lightning-fast audio transcription supporting 99+ languages. Achieves 216x real-time speed on Groq. Perfect for multilingual transcription at scale.',
    category: 'audio',
    icon: Mic,
    color: 'from-pink-500 to-rose-500',
    contextWindow: 0,
    speed: '216x real-time',
    rpm: 20,
    rpd: 2000,
    tpm: 0,
    capabilities: ['99+ languages', '216x speed', 'High accuracy', 'Timestamps', 'Translation']
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large v3 Turbo',
    description: '8x faster than Whisper Large with minimal accuracy loss. Optimized with 4 decoder layers for ultra-fast transcription. Uses only 6GB VRAM.',
    category: 'audio',
    icon: Zap,
    color: 'from-fuchsia-500 to-pink-500',
    contextWindow: 0,
    speed: '8x faster',
    rpm: 20,
    rpd: 2000,
    tpm: 0,
    capabilities: ['Ultra-fast', 'Multilingual', 'Efficient', '6GB VRAM', 'Timestamps']
  },
  {
    id: 'playai-tts',
    name: 'PlayAI TTS',
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
    capabilities: ['Natural voices', 'TTS', 'Real-time', 'Multiple voices', 'Accessibility']
  },
  {
    id: 'playai-tts-arabic',
    name: 'PlayAI TTS Arabic',
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
    capabilities: ['Arabic TTS', 'Natural pronunciation', 'Real-time', 'Authentic accent', 'Accessibility']
  },

  // System Models
  {
    id: 'groq/compound',
    name: 'Groq Compound',
    description: 'Advanced AI system with built-in web search, code execution, and Wolfram Alpha integration. Intelligently selects and uses tools to solve complex problems.',
    category: 'system',
    icon: Wrench,
    color: 'from-indigo-500 to-purple-500',
    contextWindow: 70000,
    speed: '~450 tokens/sec',
    rpm: 30,
    rpd: 250,
    tpm: 70000,
    capabilities: ['Web search', 'Code execution', 'Wolfram Alpha', 'Tool use', 'Reasoning']
  },
  {
    id: 'groq/compound-mini',
    name: 'Groq Compound Mini',
    description: 'Lighter version of Compound with tool-using capabilities. Faster and more efficient while maintaining intelligent tool selection for everyday tasks.',
    category: 'system',
    icon: Wrench,
    color: 'from-blue-500 to-cyan-500',
    contextWindow: 70000,
    speed: 'Fast',
    rpm: 30,
    rpd: 250,
    tpm: 70000,
    capabilities: ['Web search', 'Code execution', 'Tool use', 'Efficient', 'Fast']
  },
  {
    id: 'moonshotai/kimi-k2-instruct',
    name: 'Kimi K2 Instruct',
    description: 'Specialized for long-context tasks with enhanced instruction following. Excels at detailed instructions and complex multi-step workflows.',
    category: 'text',
    icon: BookOpen,
    color: 'from-slate-500 to-gray-500',
    contextWindow: 10000,
    speed: 'Moderate',
    rpm: 60,
    rpd: 1000,
    tpm: 10000,
    tpd: 300000,
    capabilities: ['Instruction following', 'Long context', 'Multi-step', 'Detailed', 'Workflows']
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 Instruct 0905',
    description: 'Latest version of Kimi K2 with improved instruction following and reasoning. Enhanced for complex tasks requiring precise execution.',
    category: 'text',
    icon: Brain,
    color: 'from-gray-600 to-slate-600',
    contextWindow: 10000,
    speed: 'Moderate',
    rpm: 60,
    rpd: 1000,
    tpm: 10000,
    tpd: 300000,
    capabilities: ['Enhanced reasoning', 'Precise execution', 'Long context', 'Complex tasks', 'Latest version']
  },
]

export const getModelById = (id: string) => {
  return groqModels.find(model => model.id === id)
}

export const getModelsByCategory = (category: GroqModel['category']) => {
  return groqModels.filter(model => model.category === category)
}

export const categories = [
  { id: 'text', name: 'Text Models', description: 'General purpose text generation and chat' },
  { id: 'multimodal', name: 'Multimodal', description: 'Handle text, images, audio, and video' },
  { id: 'audio', name: 'Audio', description: 'Speech recognition and text-to-speech' },
  { id: 'system', name: 'Systems', description: 'Tool-using AI with integrated capabilities' },
] as const
