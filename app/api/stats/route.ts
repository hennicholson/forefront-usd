import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { connections, posts, reactions, users, modules, progress } from '@/lib/db/schema'
import { eq, and, or, sql } from 'drizzle-orm'

// GET stats - supports both user-specific stats and platform-wide stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If userId provided, return user-specific stats
    if (userId) {
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
    }

    // Otherwise, return platform-wide stats for landing page
    // Get total users
    const [{ count: userCount }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(users)

    // Get total modules
    const [{ count: moduleCount }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(modules)

    // Get total completed lessons
    const [{ count: completedCount }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(progress)
      .where(sql`${progress.completed} = true`)

    // For countries, we'll use a placeholder since we don't have country data
    const countriesReached = 45

    return NextResponse.json({
      totalUsers: Number(userCount) || 0,
      totalModules: Number(moduleCount) || 0,
      completedLessons: Number(completedCount) || 0,
      countriesReached
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
