import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mutedUsers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST - Mute a user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminId, targetUserId, topic, reason, duration } = body

    if (!adminId || !targetUserId) {
      return NextResponse.json(
        { error: 'adminId and targetUserId are required' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const [admin] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, adminId))

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Calculate expiration if duration provided (in minutes)
    const expiresAt = duration
      ? new Date(Date.now() + duration * 60 * 1000)
      : null

    // Create mute record
    const [mute] = await db
      .insert(mutedUsers)
      .values({
        userId: targetUserId,
        mutedBy: adminId,
        topic: topic || null,
        reason: reason || null,
        expiresAt,
      })
      .returning()

    return NextResponse.json(mute, { status: 201 })
  } catch (error) {
    console.error('Error muting user:', error)
    return NextResponse.json(
      { error: 'Failed to mute user' },
      { status: 500 }
    )
  }
}

// DELETE - Unmute a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const targetUserId = searchParams.get('targetUserId')
    const topic = searchParams.get('topic')

    if (!adminId || !targetUserId) {
      return NextResponse.json(
        { error: 'adminId and targetUserId are required' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const [admin] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, adminId))

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Delete mute record(s)
    const conditions = topic
      ? and(eq(mutedUsers.userId, targetUserId), eq(mutedUsers.topic, topic))
      : eq(mutedUsers.userId, targetUserId)

    await db.delete(mutedUsers).where(conditions!)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unmuting user:', error)
    return NextResponse.json(
      { error: 'Failed to unmute user' },
      { status: 500 }
    )
  }
}

// GET - Check if user is muted
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const topic = searchParams.get('topic')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check for active mute (not expired)
    const now = new Date()
    const conditions = topic
      ? and(
          eq(mutedUsers.userId, userId),
          eq(mutedUsers.topic, topic)
        )
      : eq(mutedUsers.userId, userId)

    const mutes = await db
      .select()
      .from(mutedUsers)
      .where(conditions!)

    // Filter out expired mutes
    const activeMutes = mutes.filter(
      m => !m.expiresAt || new Date(m.expiresAt) > now
    )

    return NextResponse.json({
      isMuted: activeMutes.length > 0,
      mutes: activeMutes,
    })
  } catch (error) {
    console.error('Error checking mute status:', error)
    return NextResponse.json(
      { error: 'Failed to check mute status' },
      { status: 500 }
    )
  }
}
