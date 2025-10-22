import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, users, notifications } from '@/lib/db/schema'
import { eq, desc, and, or } from 'drizzle-orm'

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
    const allMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderProfileImage: users.profileImage,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt))

    // Group by conversation partner and get most recent message
    const conversationsMap = new Map()

    allMessages.forEach((msg) => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId
      if (!partnerId) return

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0, // TODO: implement unread tracking
        })
      }
    })

    // Get user details for each conversation partner
    const conversations = await Promise.all(
      Array.from(conversationsMap.entries()).map(async ([partnerId, data]) => {
        const [partner] = await db
          .select({
            id: users.id,
            name: users.name,
            profileImage: users.profileImage,
            headline: users.headline,
          })
          .from(users)
          .where(eq(users.id, partnerId))

        return {
          ...data,
          userName: partner?.name,
          userProfileImage: partner?.profileImage,
          userHeadline: partner?.headline,
        }
      })
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
