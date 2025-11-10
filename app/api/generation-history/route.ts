import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generationHistory } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { downloadAndSaveImage, downloadAndSaveVideo } from '@/lib/image-storage'

// GET - Fetch user's generation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')
    const type = searchParams.get('type') // 'text', 'image', 'video'
    const saved = searchParams.get('saved') === 'true' // Filter by saved items
    const model = searchParams.get('model') // Filter by specific model
    const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : null
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Build where conditions
    const conditions = [eq(generationHistory.userId, userId)]

    if (moduleId) {
      conditions.push(eq(generationHistory.moduleId, moduleId))
    }

    if (type) {
      conditions.push(eq(generationHistory.type, type))
    }

    if (saved) {
      conditions.push(eq(generationHistory.saved, true))
    }

    if (model) {
      conditions.push(eq(generationHistory.model, model))
    }

    let history = await db
      .select()
      .from(generationHistory)
      .where(and(...conditions))
      .orderBy(desc(generationHistory.createdAt))
      .limit(limit)

    // Filter by rating in-memory if needed
    if (minRating !== null) {
      history = history.filter(item =>
        item.rating !== null && item.rating >= minRating
      )
    }

    return NextResponse.json({
      history,
      count: history.length
    })

  } catch (error: any) {
    console.error('Error fetching generation history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generation history', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Save a new generation to history
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      moduleId,
      slideId,
      type,
      model,
      prompt,
      response,
      metadata
    } = await request.json()

    if (!userId || !type || !model || !prompt) {
      return NextResponse.json(
        { error: 'userId, type, model, and prompt are required' },
        { status: 400 }
      )
    }

    // Download and save images/videos locally to prevent URL expiration
    let savedResponse = response || null

    if (response && typeof response === 'string') {
      try {
        if (type === 'image') {
          console.log('Downloading and saving image for user:', userId)
          savedResponse = await downloadAndSaveImage(response, userId)
          console.log('Image saved to:', savedResponse)
        } else if (type === 'video') {
          console.log('Downloading and saving video for user:', userId)
          savedResponse = await downloadAndSaveVideo(response, userId)
          console.log('Video saved to:', savedResponse)
        }
      } catch (downloadError) {
        console.error('Error downloading media, using original URL:', downloadError)
        // Fall back to original response URL if download fails
        savedResponse = response
      }
    }

    const [created] = await db
      .insert(generationHistory)
      .values({
        userId,
        moduleId: moduleId || null,
        slideId: slideId || null,
        type,
        model,
        prompt,
        response: savedResponse,
        metadata: metadata || {}
      })
      .returning()

    return NextResponse.json({
      success: true,
      generation: created
    })

  } catch (error: any) {
    console.error('Error saving generation history:', error)
    return NextResponse.json(
      { error: 'Failed to save generation history', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update generation (rating, saved status, notes, tags)
export async function PATCH(request: NextRequest) {
  try {
    const {
      generationId,
      userId,
      rating,
      saved,
      notes,
      tags
    } = await request.json()

    if (!generationId || !userId) {
      return NextResponse.json(
        { error: 'generationId and userId are required' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updates: any = { updatedAt: new Date() }

    if (rating !== undefined) updates.rating = rating
    if (saved !== undefined) updates.saved = saved
    if (notes !== undefined) updates.notes = notes
    if (tags !== undefined) updates.tags = tags

    const [updated] = await db
      .update(generationHistory)
      .set(updates)
      .where(
        and(
          eq(generationHistory.id, generationId),
          eq(generationHistory.userId, userId)
        )
      )
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Generation not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      generation: updated
    })

  } catch (error: any) {
    console.error('Error updating generation:', error)
    return NextResponse.json(
      { error: 'Failed to update generation', details: error.message },
      { status: 500 }
    )
  }
}
