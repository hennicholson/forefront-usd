import { NextRequest, NextResponse } from 'next/server'
import { WorkflowBuilderAI } from '@/lib/workflows/workflow-builder-ai'

/**
 * POST /api/workflows/generate
 * Generate a workflow from natural language description using Forefront Intelligence
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, category, userId } = body

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { error: 'Description is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    console.log('[WorkflowGenerate] Building workflow from description:', description.substring(0, 100) + '...')

    // Use Forefront Intelligence to parse and build workflow
    const builder = new WorkflowBuilderAI()
    const workflow = await builder.buildWorkflow({
      description,
      category,
      userId
    })

    console.log('[WorkflowGenerate] Successfully generated workflow:', workflow.title)
    console.log('[WorkflowGenerate] Nodes:', workflow.nodes.length, 'Connections:', workflow.connections.length)

    return NextResponse.json({
      success: true,
      workflow
    })
  } catch (error: any) {
    console.error('[WorkflowGenerate] Error generating workflow:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate workflow',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workflows/suggest-next
 * Suggest next steps for an existing workflow
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { nodes, context } = body

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Nodes array is required' },
        { status: 400 }
      )
    }

    console.log('[WorkflowSuggest] Suggesting next steps for', nodes.length, 'nodes')

    const builder = new WorkflowBuilderAI()
    const suggestions = await builder.suggestNextSteps(nodes, context || '')

    console.log('[WorkflowSuggest] Generated', suggestions.length, 'suggestions')

    return NextResponse.json({
      success: true,
      suggestions
    })
  } catch (error: any) {
    console.error('[WorkflowSuggest] Error suggesting steps:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to suggest next steps',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
