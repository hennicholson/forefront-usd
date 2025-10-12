import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users, learning, connections, modules } from '@/lib/db/schema'
import { eq, and, sql, notInArray } from 'drizzle-orm'

const connectionString = process.env.DATABASE_URL!
const sqlClient = neon(connectionString)
const db = drizzle(sqlClient)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get all users who are learning
    const allLearners = await db
      .select({
        userId: users.id,
        userName: users.name,
        bio: users.bio,
        interests: users.interests,
        moduleId: learning.moduleId,
        moduleTitle: modules.title,
      })
      .from(users)
      .innerJoin(learning, eq(users.id, learning.userId))
      .leftJoin(modules, eq(learning.moduleId, modules.moduleId))
      .where(sql`${users.id} != ${userId}`)

    // Get existing connections for this user
    const existingConnections = await db
      .select({
        followingId: connections.followingId,
      })
      .from(connections)
      .where(eq(connections.followerId, userId))

    const connectedUserIds = new Set(existingConnections.map(c => c.followingId))

    // Group learners by userId and aggregate their modules
    const learnerMap = new Map()

    for (const learner of allLearners) {
      if (!learnerMap.has(learner.userId)) {
        learnerMap.set(learner.userId, {
          userId: learner.userId,
          userName: learner.userName,
          bio: learner.bio,
          interests: learner.interests || [],
          moduleTitle: learner.moduleTitle,
          isConnected: connectedUserIds.has(learner.userId),
        })
      }
    }

    const learners = Array.from(learnerMap.values())

    return NextResponse.json(learners)
  } catch (error) {
    console.error('Error fetching learners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
