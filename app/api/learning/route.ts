import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { learning, users, modules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// Get user's learning modules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const debug = searchParams.get('debug')

    if (userId) {
      // Get specific user's learning modules
      const userLearning = await db
        .select()
        .from(learning)
        .where(eq(learning.userId, userId))

      return NextResponse.json(userLearning)
    }

    // Debug mode - return raw learning data
    if (debug === 'true') {
      const rawLearning = await db.select().from(learning)
      return NextResponse.json({ rawLearning, count: rawLearning.length })
    }

    // Get all users with their learning modules (for mind map)
    const allLearning = await db
      .select({
        id: learning.id,
        userId: learning.userId,
        userName: users.name,
        userBio: users.bio,
        userInterests: users.interests,
        userProfileImage: users.profileImage,
        moduleId: learning.moduleId,
        moduleTitle: modules.title,
        moduleSlug: modules.slug,
        skillLevel: modules.skillLevel,
        status: learning.status,
        startedAt: learning.startedAt
      })
      .from(learning)
      .innerJoin(users, eq(learning.userId, users.id))
      .innerJoin(modules, eq(learning.moduleId, modules.moduleId))
      .where(eq(learning.status, 'learning'))

    return NextResponse.json(allLearning)
  } catch (error: any) {
    console.error('Error fetching learning data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning data', details: error.message },
      { status: 500 }
    )
  }
}

// Add module to learning
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('POST /api/learning - Body:', body)

    const { userId, moduleId, status = 'learning' } = body

    if (!userId || !moduleId) {
      console.error('Missing userId or moduleId:', { userId, moduleId })
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await db
      .select()
      .from(learning)
      .where(and(eq(learning.userId, userId), eq(learning.moduleId, moduleId)))

    console.log('Existing learning records:', existing)

    if (existing.length > 0) {
      // Update status
      const [updated] = await db
        .update(learning)
        .set({ status, updatedAt: new Date() })
        .where(eq(learning.id, existing[0].id))
        .returning()

      console.log('Updated learning:', updated)
      return NextResponse.json(updated)
    }

    // Create new
    const [newLearning] = await db
      .insert(learning)
      .values({ userId, moduleId, status })
      .returning()

    console.log('Created new learning:', newLearning)
    return NextResponse.json(newLearning)
  } catch (error: any) {
    console.error('Error adding learning:', error)
    return NextResponse.json(
      { error: 'Failed to add learning', details: error.message },
      { status: 500 }
    )
  }
}

// Remove from learning
export async function DELETE(request: Request) {
  try {
    const { userId, moduleId } = await request.json()

    await db
      .delete(learning)
      .where(and(eq(learning.userId, userId), eq(learning.moduleId, moduleId)))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing learning:', error)
    return NextResponse.json(
      { error: 'Failed to remove learning', details: error.message },
      { status: 500 }
    )
  }
}
