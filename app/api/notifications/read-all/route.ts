import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const connectionString = process.env.DATABASE_URL!
const sqlClient = neon(connectionString)
const db = drizzle(sqlClient)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
