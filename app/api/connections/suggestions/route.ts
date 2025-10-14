import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, learning, connections } from '@/lib/db/schema'
import { eq, ne, and, sql, notInArray } from 'drizzle-orm'

// GET connection suggestions for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get user's learning topics
    const userTopics = await db
      .select({ moduleId: learning.moduleId })
      .from(learning)
      .where(eq(learning.userId, userId))

    const userModuleIds = userTopics.map(t => t.moduleId)

    // Get existing connections
    const existingConnections = await db
      .select({
        connectedUserId: sql<string>`CASE
          WHEN ${connections.followerId} = ${userId} THEN ${connections.followingId}
          ELSE ${connections.followerId}
        END`
      })
      .from(connections)
      .where(
        sql`${connections.followerId} = ${userId} OR ${connections.followingId} = ${userId}`
      )

    const connectedUserIds = existingConnections.map(c => c.connectedUserId).filter(Boolean)

    // Add current user to exclusion list
    const excludeUserIds = [...connectedUserIds, userId]

    // Find users learning similar topics
    if (userModuleIds.length === 0) {
      // If user has no topics, return random users
      const suggestions = await db
        .select({
          userId: users.id,
          userName: users.name,
          userProfileImage: users.profileImage,
          bio: users.bio,
        })
        .from(users)
        .where(
          excludeUserIds.length > 0
            ? notInArray(users.id, excludeUserIds)
            : ne(users.id, userId)
        )
        .limit(limit)

      return NextResponse.json(
        suggestions.map(s => ({
          ...s,
          sharedTopics: [],
          mutualConnections: 0
        }))
      )
    }

    // Get users with shared learning topics
    const suggestions = await db
      .select({
        userId: users.id,
        userName: users.name,
        userProfileImage: users.profileImage,
        bio: users.bio,
        moduleId: learning.moduleId,
      })
      .from(users)
      .innerJoin(learning, eq(users.id, learning.userId))
      .where(
        and(
          excludeUserIds.length > 0
            ? notInArray(users.id, excludeUserIds)
            : ne(users.id, userId),
          sql`${learning.moduleId} IN ${userModuleIds}`
        )
      )

    // Group by user and collect shared topics
    const userMap = new Map()
    suggestions.forEach(s => {
      if (!userMap.has(s.userId)) {
        userMap.set(s.userId, {
          userId: s.userId,
          userName: s.userName,
          userProfileImage: s.userProfileImage,
          bio: s.bio || 'Learning on Four Phone USD',
          sharedTopics: [],
          mutualConnections: 0
        })
      }
      userMap.get(s.userId).sharedTopics.push(s.moduleId)
    })

    // Convert to array and limit results
    const result = Array.from(userMap.values())
      .slice(0, limit)
      .map(user => ({
        ...user,
        sharedTopics: user.sharedTopics.slice(0, 3) // Limit to 3 topics for display
      }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching connection suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
