import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatSessions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * GET /api/chat-sessions
 * List all chat sessions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Fetch all sessions for user, ordered by most recent
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastMessageAt))

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat-sessions
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Create session with default title
    const sessionTitle = title || 'New Chat'

    const [newSession] = await db
      .insert(chatSessions)
      .values({
        userId,
        title: sessionTitle,
        messageCount: 0,
        isPinned: false,
      })
      .returning()

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    )
  }
}
