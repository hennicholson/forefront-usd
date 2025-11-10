import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generationHistory } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { WorkflowBuilderAI } from '@/lib/workflows/workflow-builder-ai'
import { WorkflowNode, WorkflowConnection, WorkflowCategory } from '@/lib/workflows/workflow-types'

/**
 * POST /api/workflows/from-saved
 * Build a workflow from a saved generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generationId, userId } = body

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Fetch the saved generation
    const [generation] = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.id, generationId))
      .limit(1)

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    console.log('[WorkflowFromSaved] Building workflow from generation:', generation.id)

    // Build initial workflow structure
    const nodes: WorkflowNode[] = []
    const connections: WorkflowConnection[] = []

    // Horizontal layout configuration
    const startX = 100
    const startY = 300
    const horizontalSpacing = 350
    const verticalOffset = 80

    // Node 1: The original prompt
    const promptNode: WorkflowNode = {
      id: 'node-0',
      type: 'prompt',
      title: 'Original Prompt',
      description: 'The prompt that created this generation',
      position: { x: startX, y: startY },
      data: {
        promptText: generation.prompt,
        savedGenerationId: generation.id
      }
    }
    nodes.push(promptNode)

    // Node 2: The tool/model used
    const toolNode: WorkflowNode = {
      id: 'node-1',
      type: 'tool',
      title: getModelDisplayName(generation.model),
      description: `Generated ${generation.type}`,
      position: { x: startX + horizontalSpacing, y: startY + verticalOffset },
      data: {
        toolName: getModelDisplayName(generation.model),
        toolUrl: getModelUrl(generation.model),
        toolIcon: getModelIcon(generation.model),
        modelId: generation.model,
        savedGenerationId: generation.id
      }
    }
    nodes.push(toolNode)

    // Connection between prompt and tool
    connections.push({
      id: 'conn-0-1',
      from: 'node-0',
      to: 'node-1',
      type: 'default'
    })

    // Node 3: Result/Output node
    const resultNode: WorkflowNode = {
      id: 'node-2',
      type: generation.type === 'text' ? 'note' : 'screenshot',
      title: generation.type === 'text' ? 'Generated Text' : 'Generated Media',
      description: 'The result from the AI model',
      position: { x: startX + horizontalSpacing * 2, y: startY },
      data: {
        ...(generation.type === 'text'
          ? { noteText: generation.response || 'View output in generation history' }
          : { imageUrl: generation.response, imageCaption: 'AI-generated media' }
        )
      }
    }
    nodes.push(resultNode)

    connections.push({
      id: 'conn-1-2',
      from: 'node-1',
      to: 'node-2',
      type: 'default'
    })

    // Use AI to suggest next steps based on the context
    const builder = new WorkflowBuilderAI()
    const suggestedNodes = await builder.suggestNextSteps(
      nodes,
      `This workflow starts with: "${generation.prompt}" using ${generation.model}. Suggest logical next steps to expand this into a complete workflow.`
    )

    // Add suggested nodes (positioned horizontally with alternating vertical offset)
    suggestedNodes.forEach((suggested, index) => {
      const nodeId = `node-${nodes.length + index}`
      const yOffset = (index + nodes.length) % 2 === 0 ? 0 : verticalOffset
      const suggestedNode: WorkflowNode = {
        ...suggested,
        id: nodeId,
        position: {
          x: startX + (nodes.length + index) * horizontalSpacing,
          y: startY + yOffset
        }
      }
      nodes.push(suggestedNode)

      // Connect last result node to first suggested node
      if (index === 0) {
        connections.push({
          id: `conn-2-${nodeId}`,
          from: 'node-2',
          to: nodeId,
          type: 'default'
        })
      } else {
        // Connect suggested nodes to each other
        connections.push({
          id: `conn-${nodes.length + index - 2}-${nodeId}`,
          from: `node-${nodes.length + index - 1}`,
          to: nodeId,
          type: 'default'
        })
      }
    })

    // Determine category based on generation type and tags
    const category = determineCategory(generation)

    const workflow = {
      title: generateWorkflowTitle(generation),
      description: `Workflow built from saved ${generation.type} generation`,
      category,
      nodes,
      connections,
      metadata: {
        tags: generation.tags || [],
        difficulty: 'intermediate' as const,
        estimatedTime: '15 minutes',
        tools: nodes.filter(n => n.type === 'tool').map(n => n.data.toolName || 'Unknown'),
        sourceGenerationId: generation.id
      }
    }

    console.log('[WorkflowFromSaved] Generated workflow:', workflow.title)
    console.log('[WorkflowFromSaved] Nodes:', workflow.nodes.length, 'Connections:', workflow.connections.length)

    return NextResponse.json({
      success: true,
      workflow
    })
  } catch (error: any) {
    console.error('[WorkflowFromSaved] Error building workflow:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to build workflow from saved generation',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Helper functions
 */

function getModelDisplayName(model: string): string {
  const modelMap: Record<string, string> = {
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-opus': 'Claude 3 Opus',
    'claude-3-sonnet': 'Claude 3 Sonnet',
    'dall-e-3': 'DALL-E 3',
    'midjourney': 'Midjourney',
    'seedream-4': 'SeeDream 4',
    'runway-gen3': 'Runway Gen-3'
  }

  for (const [key, value] of Object.entries(modelMap)) {
    if (model.includes(key)) return value
  }

  return model
}

function getModelUrl(model: string): string {
  if (model.includes('gemini')) return 'https://gemini.google.com'
  if (model.includes('gpt') || model.includes('chatgpt')) return 'https://chat.openai.com'
  if (model.includes('claude')) return 'https://claude.ai'
  if (model.includes('dall-e')) return 'https://labs.openai.com'
  if (model.includes('midjourney')) return 'https://www.midjourney.com'
  if (model.includes('seedream')) return 'https://seedream.ai'
  if (model.includes('runway')) return 'https://runwayml.com'
  return 'https://google.com/search?q=' + encodeURIComponent(model)
}

function getModelIcon(model: string): string {
  if (model.includes('gemini')) return '✨'
  if (model.includes('gpt') || model.includes('chatgpt')) return '💬'
  if (model.includes('claude')) return '🤖'
  if (model.includes('dall-e') || model.includes('midjourney')) return '🎨'
  if (model.includes('seedream') || model.includes('runway')) return '🎬'
  return '🔮'
}

function determineCategory(generation: any): WorkflowCategory {
  // Check type first
  if (generation.type === 'video') return 'video'
  if (generation.type === 'image') return 'design'

  // Check tags
  const tags = (generation.tags || []).map((t: string) => t.toLowerCase())
  if (tags.some((t: string) => ['video', 'animation', 'film'].includes(t))) return 'video'
  if (tags.some((t: string) => ['code', 'programming', 'development'].includes(t))) return 'coding'
  if (tags.some((t: string) => ['marketing', 'social', 'ads'].includes(t))) return 'marketing'
  if (tags.some((t: string) => ['design', 'ui', 'ux'].includes(t))) return 'design'

  // Check model
  const model = generation.model.toLowerCase()
  if (model.includes('runway') || model.includes('seedream')) return 'video'
  if (model.includes('dall-e') || model.includes('midjourney')) return 'design'

  // Default
  return 'content'
}

function generateWorkflowTitle(generation: any): string {
  const modelName = getModelDisplayName(generation.model)
  const type = generation.type.charAt(0).toUpperCase() + generation.type.slice(1)

  // Try to extract key subject from prompt (first 3-5 words)
  const promptWords = generation.prompt.split(' ').slice(0, 5)
  const subject = promptWords.join(' ')

  if (subject.length > 50) {
    return `${type} with ${modelName}`
  }

  return `${subject} with ${modelName}`
}
