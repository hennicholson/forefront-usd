import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { realtime } from '@/lib/prisma'

const connectionString = process.env.DATABASE_URL!
const sqlClient = neon(connectionString)
const db = drizzle(sqlClient)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)

    return NextResponse.json(userNotifications, {
      headers: {
        'Cache-Control': 'private, s-maxage=3, stale-while-revalidate=10',
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, content, metadata = {} } = body

    if (!userId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        content,
        metadata,
        read: false,
      })
      .returning()

    // Emit real-time event to user for instant notification delivery
    realtime.emit(`user:${userId}`, {
      type: 'notification',
      data: newNotification
    })

    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
