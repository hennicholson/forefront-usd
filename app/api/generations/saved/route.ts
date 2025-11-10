import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generationHistory } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * GET /api/generations/saved
 * Fetch saved generations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const saved = searchParams.get('saved')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build query conditions
    const conditions = [eq(generationHistory.userId, userId)]

    if (saved === 'true') {
      conditions.push(eq(generationHistory.saved, true))
    }

    if (type && type !== 'all') {
      conditions.push(eq(generationHistory.type, type))
    }

    // Fetch generations
    const generations = await db
      .select()
      .from(generationHistory)
      .where(and(...conditions))
      .orderBy(desc(generationHistory.createdAt))
      .limit(50)

    return NextResponse.json({
      success: true,
      generations: generations.map(gen => ({
        ...gen,
        tags: gen.tags || [],
        metadata: gen.metadata || {}
      }))
    })
  } catch (error: any) {
    console.error('[GenerationsSaved] Error fetching generations:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch saved generations',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
