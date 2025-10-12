import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { connections, posts, reactions } from '@/lib/db/schema'
import { eq, and, or, sql } from 'drizzle-orm'

// GET user network stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get connections count
    const [connectionsResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(connections)
      .where(
        and(
          or(
            eq(connections.followerId, userId),
            eq(connections.followingId, userId)
          ),
          eq(connections.status, 'accepted')
        )
      )

    // Get posts count
    const [postsResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(posts)
      .where(eq(posts.userId, userId))

    // Get total interactions (reactions given + reactions received)
    const [reactionsGiven] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reactions)
      .where(eq(reactions.userId, userId))

    const [reactionsReceived] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reactions)
      .leftJoin(posts, eq(reactions.postId, posts.id))
      .where(eq(posts.userId, userId))

    const stats = {
      connections: connectionsResult?.count || 0,
      posts: postsResult?.count || 0,
      interactions: (reactionsGiven?.count || 0) + (reactionsReceived?.count || 0)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
