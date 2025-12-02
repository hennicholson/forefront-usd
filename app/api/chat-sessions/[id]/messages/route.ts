import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatMessages, chatSessions } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

/**
 * GET /api/chat-sessions/[id]/messages
 * Get all messages for a specific chat session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    // Fetch all messages for this session, ordered chronologically
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat-sessions/[id]/messages
 * Create a new message in a chat session
 */
export async function POST(
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
    const { role, content, metadata, userId } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      )
    }

    // Get userId from the session if not provided
    let messageUserId = userId
    if (!messageUserId) {
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, sessionId))
        .limit(1)

      if (!session) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        )
      }
      messageUserId = session.userId
    }

    // Insert the new message
    const [message] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        userId: messageUserId,
        role,
        content,
        metadata,
        createdAt: new Date(),
      })
      .returning()

    // Update session's lastMessageAt and increment messageCount
    await db
      .update(chatSessions)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId))

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Error creating chat message:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    )
  }
}
