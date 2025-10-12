import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { connections, users, learning } from '@/lib/db/schema'
import { eq, and, or, sql, ne } from 'drizzle-orm'

// GET connections for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'accepted'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get connections where user is either follower or following
    const userConnections = await db
      .select({
        id: connections.id,
        followerId: connections.followerId,
        followingId: connections.followingId,
        status: connections.status,
        createdAt: connections.createdAt,
        userName: users.name,
        userBio: users.bio,
        userId: users.id,
      })
      .from(connections)
      .leftJoin(
        users,
        or(
          eq(connections.followingId, users.id),
          eq(connections.followerId, users.id)
        )
      )
      .where(
        and(
          or(
            eq(connections.followerId, userId),
            eq(connections.followingId, userId)
          ),
          eq(connections.status, status)
        )
      )

    // Filter out the current user and format response
    const formattedConnections = userConnections
      .filter(conn => conn.userId !== userId)
      .map(conn => ({
        ...conn,
        isFollowing: conn.followerId === userId,
        connectionUserId: conn.followerId === userId ? conn.followingId : conn.followerId
      }))

    return NextResponse.json(formattedConnections)
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

// POST create connection request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { followerId, followingId } = body

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      )
    }

    // Check if connection already exists
    const existing = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.followerId, followerId),
          eq(connections.followingId, followingId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      )
    }

    // Create connection (auto-accept for now)
    const [newConnection] = await db
      .insert(connections)
      .values({
        followerId,
        followingId,
        status: 'accepted', // Auto-accept for simplicity
      })
      .returning()

    return NextResponse.json(newConnection, { status: 201 })
  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    )
  }
}

// DELETE remove connection
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('followerId')
    const followingId = searchParams.get('followingId')

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      )
    }

    await db
      .delete(connections)
      .where(
        and(
          eq(connections.followerId, followerId),
          eq(connections.followingId, followingId)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    )
  }
}
