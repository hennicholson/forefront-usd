/**
 * Tool Executor for Forefront Intelligence
 * Executes tools selected by LLM (Llama-3-Groq-70B-Tool-Use)
 * Handles all tool implementations and returns results
 */

import { groqClient } from '@/lib/groq/client'
import { perplexityClient } from '@/lib/perplexity/client'
import Replicate from 'replicate'

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string  // JSON string
  }
}

export interface ToolExecutionResult {
  tool_call_id: string
  role: 'tool'
  name: string
  content: string
  metadata?: {
    type?: 'text' | 'image' | 'code'
    imageUrl?: string
    citations?: any[]
    videos?: any[]
    images?: any[]
    executionTime?: number
    [key: string]: any
  }
}

/**
 * Execute a single tool call from the LLM
 */
export async function executeToolCall(
  toolCall: ToolCall,
  userId?: string
): Promise<ToolExecutionResult> {
  const startTime = Date.now()
  const functionName = toolCall.function.name

  try {
    const args = JSON.parse(toolCall.function.arguments)
    console.log(`[Tool Executor] Executing: ${functionName}`, args)

    let result: ToolExecutionResult

    switch (functionName) {
      case 'generate_image':
        result = await executeGenerateImage(args, userId, toolCall.id)
        break

      case 'enhance_prompt':
        result = await executeEnhancePrompt(args, toolCall.id)
        break

      case 'search_web':
        result = await executeSearchWeb(args, toolCall.id)
        break

      case 'execute_code':
        result = await executeCode(args, toolCall.id)
        break

      case 'analyze_data':
        result = await executeAnalyzeData(args, toolCall.id)
        break

      case 'explain_concept':
        result = await executeExplainConcept(args, toolCall.id)
        break

      default:
        throw new Error(`Unknown tool: ${functionName}`)
    }

    // Add execution time to metadata
    result.metadata = {
      ...result.metadata,
      executionTime: Date.now() - startTime
    }

    console.log(`[Tool Executor] ${functionName} completed in ${Date.now() - startTime}ms`)
    return result

  } catch (error: any) {
    console.error(`[Tool Executor] Error executing ${functionName}:`, error)
    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      name: functionName,
      content: `Error executing ${functionName}: ${error.message}`,
      metadata: {
        error: true,
        errorMessage: error.message,
        executionTime: Date.now() - startTime
      }
    }
  }
}

/**
 * Execute multiple tool calls in parallel
 */
export async function executeToolCalls(
  toolCalls: ToolCall[],
  userId?: string
): Promise<ToolExecutionResult[]> {
  console.log(`[Tool Executor] Executing ${toolCalls.length} tool calls in parallel`)

  const results = await Promise.all(
    toolCalls.map(toolCall => executeToolCall(toolCall, userId))
  )

  return results
}

/**
 * Tool: Generate Image using Seed Dream 4
 */
async function executeGenerateImage(
  args: { prompt: string; aspectRatio?: string },
  userId: string | undefined,
  toolCallId: string
): Promise<ToolExecutionResult> {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  })

  const output = await replicate.run(
    "bytedance/seedream-4",
    {
      input: {
        prompt: args.prompt,
        aspect_ratio: args.aspectRatio || '4:3'
      }
    }
  ) as any

  const replicateUrl = output && output[0] ? String(output[0]) : null

  if (!replicateUrl) {
    throw new Error('Failed to generate image')
  }

  // Download and save image to local storage
  const { downloadAndSaveImage } = await import('@/lib/image-storage')
  const userIdForStorage = userId || 'anonymous'
  const localImageUrl = await downloadAndSaveImage(replicateUrl, userIdForStorage)

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'generate_image',
    content: `Successfully generated image: ${localImageUrl}`,
    metadata: {
      type: 'image',
      imageUrl: localImageUrl,
      prompt: args.prompt,
      aspectRatio: args.aspectRatio || '4:3'
    }
  }
}

/**
 * Tool: Enhance image generation prompt
 */
async function executeEnhancePrompt(
  args: { originalPrompt: string; style?: string },
  toolCallId: string
): Promise<ToolExecutionResult> {
  const systemPrompt = `You are an expert at enhancing image generation prompts. Transform the user's input into a detailed, vivid prompt optimized for AI image generation.

REQUIREMENTS:
1. Make it detailed and descriptive (include style, lighting, mood, composition)
2. Use clear, visual language that image models understand
3. Include artistic style references when appropriate${args.style ? ` focusing on ${args.style} style` : ''}
4. Keep it concise but comprehensive (2-4 sentences max)
5. Return ONLY the enhanced prompt text, no explanations or meta-commentary

Example transformations:
- "a cat" → "A majestic orange tabby cat sitting on a velvet cushion, soft studio lighting, detailed fur texture, warm color palette, professional pet photography style"
- "sunset beach" → "A serene tropical beach at golden hour, vibrant orange and pink sunset reflecting on calm turquoise waters, silhouetted palm trees, cinematic composition, photorealistic, 8K quality"`

  const response = await groqClient.chat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Enhance this prompt: ${args.originalPrompt}` }
    ],
    temperature: 0.7,
    maxTokens: 500,
    stream: false
  }) as any

  const enhancedPrompt = response.choices?.[0]?.message?.content || args.originalPrompt

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'enhance_prompt',
    content: enhancedPrompt,
    metadata: {
      type: 'text',
      originalPrompt: args.originalPrompt,
      style: args.style
    }
  }
}

/**
 * Tool: Search the web using Perplexity Sonar
 */
async function executeSearchWeb(
  args: { query: string; searchRecency?: string; includeVideos?: boolean; includeImages?: boolean },
  toolCallId: string
): Promise<ToolExecutionResult> {
  const response = await perplexityClient.chat({
    model: 'sonar-pro',
    messages: [{ role: 'user', content: args.query }],
    includeVideos: args.includeVideos ?? true,
    includeImages: args.includeImages ?? true,
    searchRecency: (args.searchRecency || 'week') as 'day' | 'week' | 'month' | 'year'
  })

  const content = response.choices[0]?.message?.content || 'No results found'

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'search_web',
    content,
    metadata: {
      type: 'text',
      citations: response.citations || [],
      searchResults: response.search_results || [],
      videos: response.videos || [],
      images: response.images || [],
      query: args.query
    }
  }
}

/**
 * Tool: Execute Python code (placeholder - would need code execution sandbox)
 */
async function executeCode(
  args: { code: string; language?: string },
  toolCallId: string
): Promise<ToolExecutionResult> {
  // TODO: Integrate with code execution sandbox (e.g., E2B, Modal, RunPod)
  // For now, return a message indicating this would execute the code

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'execute_code',
    content: `Code execution sandbox not yet implemented. Would execute:\n\`\`\`${args.language || 'python'}\n${args.code}\n\`\`\`\n\nTo enable code execution, integrate with E2B, Modal, or similar sandbox service.`,
    metadata: {
      type: 'code',
      code: args.code,
      language: args.language || 'python',
      implemented: false
    }
  }
}

/**
 * Tool: Analyze data using LLM
 */
async function executeAnalyzeData(
  args: { data: string; analysisType: string; question?: string },
  toolCallId: string
): Promise<ToolExecutionResult> {
  const systemPrompt = `You are a data analyst. Analyze the provided data and provide insights based on the analysis type requested.

Analysis Type: ${args.analysisType}
${args.question ? `Question: ${args.question}` : ''}

Provide clear, actionable insights.`

  const response = await groqClient.chat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Data:\n${args.data}` }
    ],
    temperature: 0.3,
    maxTokens: 2000,
    stream: false
  }) as any

  const analysis = response.choices?.[0]?.message?.content || 'Failed to analyze data'

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'analyze_data',
    content: analysis,
    metadata: {
      type: 'text',
      analysisType: args.analysisType,
      dataSize: args.data.length
    }
  }
}

/**
 * Tool: Explain AI/ML concept
 */
async function executeExplainConcept(
  args: { concept: string; depth?: string; includeExamples?: boolean },
  toolCallId: string
): Promise<ToolExecutionResult> {
  const systemPrompt = `You are an AI/ML educator. Explain concepts clearly at the appropriate depth level.

Depth: ${args.depth || 'intermediate'}
Include examples: ${args.includeExamples ? 'Yes' : 'No'}

Provide clear explanations with analogies, examples, and practical applications.`

  const response = await groqClient.chat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain: ${args.concept}` }
    ],
    temperature: 0.7,
    maxTokens: 2000,
    stream: false
  }) as any

  const explanation = response.choices?.[0]?.message?.content || 'Failed to explain concept'

  return {
    tool_call_id: toolCallId,
    role: 'tool',
    name: 'explain_concept',
    content: explanation,
    metadata: {
      type: 'text',
      concept: args.concept,
      depth: args.depth
    }
  }
}
