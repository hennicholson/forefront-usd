import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { submissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Get all submissions (admin) or user's submissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      // Get user's submissions
      const userSubmissions = await db
        .select()
        .from(submissions)
        .where(eq(submissions.userId, userId))
        .orderBy(submissions.submittedAt)

      return NextResponse.json(userSubmissions)
    }

    // Get all submissions (for admin)
    const allSubmissions = await db
      .select()
      .from(submissions)
      .orderBy(submissions.submittedAt)

    return NextResponse.json(allSubmissions)
  } catch (error: any) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    )
  }
}

// Create new submission
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, description, content, skillLevel, estimatedDuration } = body

    if (!userId || !title || !description || !content || !skillLevel || !estimatedDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const [newSubmission] = await db
        .insert(submissions)
        .values({
          userId,
          title,
          description,
          content,
          skillLevel,
          estimatedDuration,
          status: 'pending'
        })
        .returning()

      return NextResponse.json(newSubmission)
    } catch (dbError: any) {
      // Check if it's a foreign key constraint error
      if (dbError.message && dbError.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'User account not found. Please try logging out and logging back in.' },
          { status: 400 }
        )
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission', details: error.message },
      { status: 500 }
    )
  }
}

// Update submission status (admin only)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [updated] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission', details: error.message },
      { status: 500 }
    )
  }
}

// Delete submission
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // If userId is provided, verify ownership before deleting
    if (userId) {
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id))

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      if (submission.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this submission' },
          { status: 403 }
        )
      }
    }

    await db
      .delete(submissions)
      .where(eq(submissions.id, id))

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission', details: error.message },
      { status: 500 }
    )
  }
}
