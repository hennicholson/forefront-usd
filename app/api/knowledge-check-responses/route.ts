import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { knowledgeCheckResponses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      moduleId,
      slideId,
      blockId,
      question,
      selectedIndex,
      correctIndex,
      isCorrect,
      timestamp
    } = await request.json()

    // Validate required fields
    if (!userId || !moduleId || !slideId || !blockId || !question ||
        selectedIndex === undefined || correctIndex === undefined ||
        isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check how many attempts the user has made for this specific question
    const previousAttempts = await db
      .select()
      .from(knowledgeCheckResponses)
      .where(
        and(
          eq(knowledgeCheckResponses.userId, userId),
          eq(knowledgeCheckResponses.moduleId, moduleId),
          eq(knowledgeCheckResponses.slideId, slideId),
          eq(knowledgeCheckResponses.blockId, blockId)
        )
      )

    const attemptNumber = previousAttempts.length + 1

    // Save the response
    const [response] = await db
      .insert(knowledgeCheckResponses)
      .values({
        userId,
        moduleId,
        slideId,
        blockId,
        question,
        selectedIndex,
        correctIndex,
        isCorrect,
        attemptNumber,
        createdAt: timestamp ? new Date(timestamp) : new Date()
      })
      .returning()

    return NextResponse.json({
      success: true,
      response,
      attemptNumber
    })

  } catch (error: any) {
    console.error('Error saving knowledge check response:', error)
    return NextResponse.json(
      { error: 'Failed to save response', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user's knowledge check responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = db
      .select()
      .from(knowledgeCheckResponses)
      .where(eq(knowledgeCheckResponses.userId, userId))

    // Filter by moduleId if provided
    if (moduleId) {
      query = query.where(
        and(
          eq(knowledgeCheckResponses.userId, userId),
          eq(knowledgeCheckResponses.moduleId, moduleId)
        )
      ) as any
    }

    const responses = await query

    // Calculate statistics
    const stats = {
      total: responses.length,
      correct: responses.filter(r => r.isCorrect).length,
      incorrect: responses.filter(r => !r.isCorrect).length,
      accuracy: responses.length > 0
        ? Math.round((responses.filter(r => r.isCorrect).length / responses.length) * 100)
        : 0,
      averageAttempts: responses.length > 0
        ? responses.reduce((sum, r) => sum + r.attemptNumber, 0) / responses.length
        : 0
    }

    return NextResponse.json({
      responses,
      stats
    })

  } catch (error: any) {
    console.error('Error fetching knowledge check responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses', details: error.message },
      { status: 500 }
    )
  }
}
