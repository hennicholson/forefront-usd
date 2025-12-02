import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatSessions, chatMessages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * PUT /api/chat-sessions/[id]
 * Update a chat session (title, pinned status, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, isPinned } = body

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (isPinned !== undefined) updateData.isPinned = isPinned

    const [updatedSession] = await db
      .update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.id, sessionId))
      .returning()

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session: updatedSession })
  } catch (error: any) {
    console.error('Error updating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chat-sessions/[id]
 * Delete a chat session and all its messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    // Delete all messages first (due to foreign key constraint)
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId))

    // Delete the session
    const [deletedSession] = await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .returning()

    if (!deletedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deletedSession })
  } catch (error: any) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session', details: error.message },
      { status: 500 }
    )
  }
}
