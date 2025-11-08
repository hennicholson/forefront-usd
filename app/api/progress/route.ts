import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { progress } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET - Load user's progress for a module
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      )
    }

    const userProgress = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.moduleId, moduleId)
        )
      )
      .limit(1)

    if (userProgress.length === 0) {
      // No progress found, return empty state
      return NextResponse.json({
        completedSlides: [],
        lastViewed: 0,
        completed: false
      })
    }

    return NextResponse.json(userProgress[0])

  } catch (error: any) {
    console.error('Error loading progress:', error)
    return NextResponse.json(
      { error: 'Failed to load progress', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Save/update user's progress
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      moduleId,
      completedSlides,
      lastViewed,
      completed
    } = await request.json()

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      )
    }

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.moduleId, moduleId)
        )
      )
      .limit(1)

    if (existingProgress.length > 0) {
      // Update existing progress
      const [updated] = await db
        .update(progress)
        .set({
          completedSlides: completedSlides || existingProgress[0].completedSlides,
          lastViewed: lastViewed !== undefined ? lastViewed : existingProgress[0].lastViewed,
          completed: completed !== undefined ? completed : existingProgress[0].completed,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(progress.userId, userId),
            eq(progress.moduleId, moduleId)
          )
        )
        .returning()

      return NextResponse.json({
        success: true,
        progress: updated
      })
    } else {
      // Create new progress record
      const [created] = await db
        .insert(progress)
        .values({
          userId,
          moduleId,
          completedSlides: completedSlides || [],
          lastViewed: lastViewed || 0,
          completed: completed || false
        })
        .returning()

      return NextResponse.json({
        success: true,
        progress: created
      })
    }

  } catch (error: any) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { error: 'Failed to save progress', details: error.message },
      { status: 500 }
    )
  }
}
