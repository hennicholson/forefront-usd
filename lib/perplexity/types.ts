// Perplexity API Types

export interface PerplexityMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface PerplexityVideo {
  url: string
  duration: number | null
  thumbnail_width: number
  thumbnail_height: number
  thumbnail_url: string
}

export interface PerplexityImage {
  url: string
  width: number | null
  height: number | null
}

export interface PerplexitySearchResult {
  title: string
  url: string
  date?: string
  last_updated?: string
  snippet: string
}

export interface PerplexityChatResponse {
  id: string
  model: string
  created: number
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  citations?: string[]
  search_results?: PerplexitySearchResult[]
  videos?: PerplexityVideo[]
  images?: PerplexityImage[]
  object: string
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
    delta: {
      role: string
      content: string
    }
  }>
}

export interface PerplexityRequestOptions {
  model: 'sonar' | 'sonar-pro'
  messages: PerplexityMessage[]
  search_recency_filter?: 'day' | 'week' | 'month' | 'year'
  search_domain_filter?: string[]
  return_videos?: boolean
  return_images?: boolean
  return_citations?: boolean
  temperature?: number
  max_tokens?: number
}
