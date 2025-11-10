import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsletters } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET - Fetch all newsletters or a specific one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const current = searchParams.get('current') === 'true'

    if (id) {
      // Get specific newsletter by ID
      const newsletter = await db
        .select()
        .from(newsletters)
        .where(eq(newsletters.id, parseInt(id)))
        .limit(1)

      if (!newsletter.length) {
        return NextResponse.json(
          { error: 'Newsletter not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(newsletter[0])
    }

    if (current) {
      // Get current newsletter
      const currentNewsletter = await db
        .select()
        .from(newsletters)
        .where(eq(newsletters.isCurrent, true))
        .limit(1)

      if (!currentNewsletter.length) {
        return NextResponse.json(
          { error: 'No current newsletter found' },
          { status: 404 }
        )
      }

      return NextResponse.json(currentNewsletter[0])
    }

    // Get all newsletters, ordered by week desc
    const allNewsletters = await db
      .select()
      .from(newsletters)
      .orderBy(desc(newsletters.week))

    return NextResponse.json(allNewsletters)

  } catch (error: any) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletters', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { week, date, title, content, isCurrent } = body

    if (!week || !date || !title || !content) {
      return NextResponse.json(
        { error: 'week, date, title, and content are required' },
        { status: 400 }
      )
    }

    // If this newsletter is being set as current, unset all other current newsletters
    if (isCurrent) {
      await db
        .update(newsletters)
        .set({ isCurrent: false })
    }

    const [created] = await db
      .insert(newsletters)
      .values({
        week,
        date,
        title,
        content,
        isCurrent: isCurrent || false
      })
      .returning()

    return NextResponse.json(created, { status: 201 })

  } catch (error: any) {
    console.error('Error creating newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to create newsletter', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update a newsletter
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, week, date, title, content, isCurrent } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // If this newsletter is being set as current, unset all other current newsletters
    if (isCurrent) {
      await db
        .update(newsletters)
        .set({ isCurrent: false })
    }

    const updates: any = { updatedAt: new Date() }
    if (week !== undefined) updates.week = week
    if (date !== undefined) updates.date = date
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (isCurrent !== undefined) updates.isCurrent = isCurrent

    const [updated] = await db
      .update(newsletters)
      .set(updates)
      .where(eq(newsletters.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)

  } catch (error: any) {
    console.error('Error updating newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to update newsletter', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    await db
      .delete(newsletters)
      .where(eq(newsletters.id, parseInt(id)))

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to delete newsletter', details: error.message },
      { status: 500 }
    )
  }
}
