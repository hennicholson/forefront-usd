import Perplexity from '@perplexity-ai/perplexity_ai'
import type {
  PerplexityRequestOptions,
  PerplexityChatResponse,
  PerplexityMessage
} from './types'

/**
 * Perplexity API Client
 * Provides up-to-date web knowledge for AI learning assistant
 */
export class PerplexityClient {
  private client: Perplexity

  constructor(apiKey?: string) {
    this.client = new Perplexity({
      apiKey: apiKey || process.env.PERPLEXITY_API_KEY
    })
  }

  /**
   * Chat with Perplexity Sonar models
   * Returns real-time web-grounded responses with citations, videos, and images
   */
  async chat(options: {
    messages: PerplexityMessage[]
    model?: 'sonar' | 'sonar-pro'
    includeVideos?: boolean
    includeImages?: boolean
    searchRecency?: 'day' | 'week' | 'month' | 'year'
    searchDomains?: string[]
    temperature?: number
  }): Promise<PerplexityChatResponse> {
    const {
      messages,
      model = 'sonar-pro',
      includeVideos = true,
      includeImages = true,
      searchRecency,
      searchDomains,
      temperature = 0.7
    } = options

    try {
      const requestBody: any = {
        model,
        messages,
        temperature,
        return_citations: true,
        return_images: includeImages,
        return_related_questions: false
      }

      // Add media response overrides for videos
      if (includeVideos) {
        requestBody.media_response = {
          overrides: {
            return_videos: true
          }
        }
      }

      // Add search filters
      if (searchRecency) {
        requestBody.search_recency_filter = searchRecency
      }

      if (searchDomains && searchDomains.length > 0) {
        requestBody.search_domain_filter = searchDomains
      }

      const completion = await this.client.chat.completions.create(requestBody)

      return completion as any as PerplexityChatResponse
    } catch (error) {
      console.error('Perplexity API error:', error)
      throw new Error('Failed to get response from Perplexity')
    }
  }

  /**
   * Search for latest AI developments from trusted sources
   * Optimized for AI learning with Reddit, X.com, and AI forums
   */
  async searchAIKnowledge(query: string, options?: {
    includeVideos?: boolean
    includeImages?: boolean
    recency?: 'day' | 'week' | 'month'
  }): Promise<PerplexityChatResponse> {
    const aiDomains = [
      'reddit.com/r/MachineLearning',
      'reddit.com/r/artificial',
      'reddit.com/r/LocalLLaMA',
      'twitter.com',
      'x.com',
      'news.ycombinator.com',
      'arxiv.org'
    ]

    return this.chat({
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning assistant. Provide accurate, up-to-date information about AI developments, techniques, and best practices. Include relevant examples and cite your sources.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      model: 'sonar-pro',
      includeVideos: options?.includeVideos ?? true,
      includeImages: options?.includeImages ?? true,
      searchRecency: options?.recency ?? 'week',
      searchDomains: aiDomains
    })
  }

  /**
   * Get educational content with video tutorials
   */
  async getEducationalContent(query: string): Promise<PerplexityChatResponse> {
    return this.chat({
      messages: [
        {
          role: 'system',
          content: 'You are an educational AI assistant. Provide clear, comprehensive explanations with visual aids and video tutorials when available.'
        },
        {
          role: 'user',
          content: `Find educational content and video tutorials about: ${query}`
        }
      ],
      model: 'sonar-pro',
      includeVideos: true,
      includeImages: true,
      searchRecency: 'month'
    })
  }
}

// Export singleton instance
export const perplexityClient = new PerplexityClient()
