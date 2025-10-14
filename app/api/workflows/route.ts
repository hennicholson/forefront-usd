import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { workflows } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET all workflows or single workflow by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('id')

    if (workflowId) {
      // Get single workflow
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, parseInt(workflowId)))
        .limit(1)

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }

      // Increment view count
      await db
        .update(workflows)
        .set({ viewsCount: workflow.viewsCount + 1 })
        .where(eq(workflows.id, parseInt(workflowId)))

      return NextResponse.json(workflow)
    } else {
      // Get all workflows (public only, unless admin request)
      const allWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.isPublic, true))
        .orderBy(desc(workflows.createdAt))

      return NextResponse.json(allWorkflows)
    }
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

// POST create new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, category, isPublic, nodes, connections } = body

    if (!userId || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, category' },
        { status: 400 }
      )
    }

    const [newWorkflow] = await db
      .insert(workflows)
      .values({
        userId,
        title,
        description: description || '',
        category,
        isPublic: isPublic ?? true,
        nodes: nodes || [],
        connections: connections || [],
        likesCount: 0,
        viewsCount: 0,
        forksCount: 0
      })
      .returning()

    return NextResponse.json(newWorkflow, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}

// PUT update workflow
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, category, isPublic, nodes, connections } = body

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (nodes !== undefined) updateData.nodes = nodes
    if (connections !== undefined) updateData.connections = connections

    const [updatedWorkflow] = await db
      .update(workflows)
      .set(updateData)
      .where(eq(workflows.id, parseInt(id)))
      .returning()

    if (!updatedWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(updatedWorkflow)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}

// DELETE workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('id')

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    await db
      .delete(workflows)
      .where(eq(workflows.id, parseInt(workflowId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
  }
}
