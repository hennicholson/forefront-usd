import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { db } from '@/lib/db'
import { messages, users, notifications } from '@/lib/db/schema'
import { eq, desc, and, or } from 'drizzle-orm'

const rawSql = neon(process.env.DATABASE_URL!)

// GET direct messages - conversations list or specific conversation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // If otherUserId is provided, get conversation with that user
    if (otherUserId) {
      const conversation = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          content: messages.content,
          type: messages.type,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderProfileImage: users.profileImage,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(
          and(
            or(
              and(
                eq(messages.senderId, userId),
                eq(messages.receiverId, otherUserId)
              ),
              and(
                eq(messages.senderId, otherUserId),
                eq(messages.receiverId, userId)
              )
            )
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit)

      return NextResponse.json(conversation.reverse())
    }

    // Otherwise, get list of conversations (recent messages with each user)
    // OPTIMIZED: Using ROW_NUMBER to avoid DISTINCT ON ordering issues
    const conversations = await rawSql`
      WITH ranked_messages AS (
        SELECT
          CASE
            WHEN sender_id = ${userId} THEN receiver_id
            ELSE sender_id
          END as partner_id,
          content as last_message,
          created_at as last_message_time,
          ROW_NUMBER() OVER (
            PARTITION BY CASE
              WHEN sender_id = ${userId} THEN receiver_id
              ELSE sender_id
            END
            ORDER BY created_at DESC
          ) as rn
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
      )
      SELECT
        rm.partner_id::text as "userId",
        u.name as "userName",
        u.profile_image as "userProfileImage",
        u.headline as "userHeadline",
        rm.last_message as "lastMessage",
        rm.last_message_time as "lastMessageTime",
        0 as "unreadCount"
      FROM ranked_messages rm
      LEFT JOIN users u ON rm.partner_id = u.id
      WHERE rm.rn = 1
      ORDER BY rm.last_message_time DESC
    `

    return NextResponse.json(conversations, {
      headers: {
        'Cache-Control': 'private, s-maxage=5, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST send a direct message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content, type = 'text' } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      )
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId,
        receiverId,
        content,
        type,
      })
      .returning()

    // Get sender info for notification
    const [sender] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, senderId))

    // Create notification for receiver
    await db.insert(notifications).values({
      userId: receiverId,
      type: 'new_message',
      content: `${sender?.name || 'Someone'} sent you a message`,
      metadata: {
        messageId: newMessage.id,
        senderId: senderId,
        senderName: sender?.name,
        preview: content.substring(0, 50),
      },
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
