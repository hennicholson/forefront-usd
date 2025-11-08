import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { knowledgeCheckResponses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET - Fetch user's knowledge check responses for a module
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

    const responses = await db
      .select()
      .from(knowledgeCheckResponses)
      .where(
        and(
          eq(knowledgeCheckResponses.userId, userId),
          eq(knowledgeCheckResponses.moduleId, moduleId)
        )
      )

    return NextResponse.json({
      responses,
      count: responses.length
    })

  } catch (error: any) {
    console.error('Error fetching knowledge check responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge check responses', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Save a new knowledge check response
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
      timeToAnswer
    } = await request.json()

    if (!userId || !moduleId || !slideId || !blockId || !question || selectedIndex === undefined || correctIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has already answered this question
    const existingResponses = await db
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

    const attemptNumber = existingResponses.length + 1

    const [created] = await db
      .insert(knowledgeCheckResponses)
      .values({
        userId,
        moduleId,
        slideId,
        blockId,
        question,
        selectedIndex,
        correctIndex,
        isCorrect: isCorrect ?? selectedIndex === correctIndex,
        attemptNumber,
        timeToAnswer: timeToAnswer || null
      })
      .returning()

    return NextResponse.json({
      success: true,
      response: created
    })

  } catch (error: any) {
    console.error('Error saving knowledge check response:', error)
    return NextResponse.json(
      { error: 'Failed to save knowledge check response', details: error.message },
      { status: 500 }
    )
  }
}
