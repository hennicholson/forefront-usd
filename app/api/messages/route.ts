import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, users } from '@/lib/db/schema'
import { eq, and, or, desc, sql } from 'drizzle-orm'

// GET messages or conversations
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

    // If otherUserId is provided, return messages between two users
    if (otherUserId) {
      const directMessages = await db
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
        .orderBy(desc(messages.createdAt))
        .limit(limit)

      // Return in ascending order (oldest first)
      return NextResponse.json(directMessages.reverse())
    }

    // Otherwise, return conversations list with latest message and unread count
    // Get all unique conversation partners
    const sentMessages = await db
      .select({
        otherUserId: messages.receiverId,
      })
      .from(messages)
      .where(eq(messages.senderId, userId))
      .groupBy(messages.receiverId)

    const receivedMessages = await db
      .select({
        otherUserId: messages.senderId,
      })
      .from(messages)
      .where(eq(messages.receiverId, userId))
      .groupBy(messages.senderId)

    // Combine and deduplicate conversation partners
    const conversationUserIds = new Set<string>()
    sentMessages.forEach(m => m.otherUserId && conversationUserIds.add(m.otherUserId))
    receivedMessages.forEach(m => m.otherUserId && conversationUserIds.add(m.otherUserId))

    // Build conversations array
    const conversations = await Promise.all(
      Array.from(conversationUserIds).map(async (otherUserId) => {
        // Get latest message
        const [latestMessage] = await db
          .select({
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
          })
          .from(messages)
          .where(
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
          .orderBy(desc(messages.createdAt))
          .limit(1)

        // Get user info
        const [userInfo] = await db
          .select({
            name: users.name,
            profileImage: users.profileImage,
            headline: users.headline,
          })
          .from(users)
          .where(eq(users.id, otherUserId))

        // Count unread messages (messages sent to current user)
        const [unreadResult] = await db
          .select({
            count: sql<number>`cast(count(*) as int)`,
          })
          .from(messages)
          .where(
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId)
            )
          )

        return {
          userId: otherUserId,
          userName: userInfo?.name || 'Unknown',
          userProfileImage: userInfo?.profileImage,
          userHeadline: userInfo?.headline,
          lastMessage: latestMessage?.content || '',
          lastMessageTime: latestMessage?.createdAt || new Date(),
          unreadCount: unreadResult?.count || 0,
          status: 'offline' as const, // TODO: Implement real-time status
        }
      })
    )

    // Sort by last message time
    conversations.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST create new message
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

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
