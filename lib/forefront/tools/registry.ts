/**
 * Tool Registry for Forefront Intelligence
 * Defines all available tools that LLM can call
 * Used with Llama-3-Groq-70B-Tool-Use (#1 on Berkeley Function Calling Leaderboard)
 */

export interface ToolParameter {
  type: string
  description: string
  enum?: string[]
  required?: boolean
}

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, ToolParameter>
      required: string[]
    }
  }
}

/**
 * All available tools for Forefront Intelligence
 * Format follows OpenAI/Groq function calling schema
 */
export const FOREFRONT_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an image using Seed Dream 4 (state-of-the-art image generation model). Use this when the user wants to CREATE or GENERATE an actual image. If the user references a prompt from earlier in the conversation (e.g., "using that prompt", "with that", "generate image with it"), extract the actual prompt content from the conversation history.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The detailed image generation prompt. Should be descriptive and vivid. If user said "that prompt" or "using that", this should be the ACTUAL PROMPT from the conversation history, NOT the literal user message.'
          },
          aspectRatio: {
            type: 'string',
            description: 'Aspect ratio for the generated image',
            enum: ['1:1', '4:3', '16:9', '9:16', '3:2', '2:3']
          }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'enhance_prompt',
      description: 'Enhance an image generation prompt to make it more detailed, vivid, and optimized for AI image generation. Transforms simple prompts into detailed descriptions with style, lighting, mood, and composition details.',
      parameters: {
        type: 'object',
        properties: {
          originalPrompt: {
            type: 'string',
            description: 'The original prompt to enhance'
          },
          style: {
            type: 'string',
            description: 'Optional style preference (e.g., "photorealistic", "artistic", "cinematic")',
            enum: ['photorealistic', 'artistic', 'cinematic', 'anime', 'oil-painting', 'watercolor', '3d-render']
          }
        },
        required: ['originalPrompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for current, real-time information using Perplexity Sonar. Use this when the user asks about recent events, current news, latest developments, or needs up-to-date information. Returns results with citations, videos, and images.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query. Should be clear and specific. If user references previous context, incorporate that context into the query.'
          },
          searchRecency: {
            type: 'string',
            description: 'How recent the search results should be',
            enum: ['hour', 'day', 'week', 'month', 'year']
          },
          includeVideos: {
            type: 'boolean',
            description: 'Whether to include video results'
          },
          includeImages: {
            type: 'boolean',
            description: 'Whether to include image results'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'execute_code',
      description: 'Execute Python code and return the results. Use this for calculations, data analysis, running algorithms, or demonstrating code examples. Has access to popular libraries like numpy, pandas, matplotlib.',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The Python code to execute. If user said "run that code" or "execute it", extract the actual code from conversation history.'
          },
          language: {
            type: 'string',
            description: 'Programming language (currently only Python supported)',
            enum: ['python']
          }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_data',
      description: 'Analyze structured data (JSON, CSV) and provide insights, statistics, visualizations. Use when user provides data and wants analysis.',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            description: 'The data to analyze (JSON or CSV format)'
          },
          analysisType: {
            type: 'string',
            description: 'Type of analysis to perform',
            enum: ['descriptive', 'statistical', 'visualization', 'trend-analysis']
          },
          question: {
            type: 'string',
            description: 'Optional specific question about the data'
          }
        },
        required: ['data', 'analysisType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'explain_concept',
      description: 'Provide detailed explanation of an AI/ML concept with examples, analogies, and visual descriptions. Use when user asks "explain", "what is", "how does X work".',
      parameters: {
        type: 'object',
        properties: {
          concept: {
            type: 'string',
            description: 'The concept to explain'
          },
          depth: {
            type: 'string',
            description: 'Depth of explanation',
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
          },
          includeExamples: {
            type: 'boolean',
            description: 'Whether to include code examples'
          }
        },
        required: ['concept']
      }
    }
  }
]

/**
 * Get tool definition by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return FOREFRONT_TOOLS.find(tool => tool.function.name === name)
}

/**
 * Get all tool names
 */
export function getAllToolNames(): string[] {
  return FOREFRONT_TOOLS.map(tool => tool.function.name)
}

/**
 * Format tools for display/logging
 */
export function formatToolsForLogging(): string {
  return FOREFRONT_TOOLS.map(tool =>
    `- ${tool.function.name}: ${tool.function.description.substring(0, 100)}...`
  ).join('\n')
}
