import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'Missing userId or moduleId' }, { status: 400 })
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.moduleId, moduleId)))

    return NextResponse.json(userNotes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, moduleId, slideId, content } = body

    if (!userId || !moduleId || slideId === undefined || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if note already exists
    const existingNote = await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.moduleId, moduleId),
          eq(notes.slideId, slideId)
        )
      )
      .limit(1)

    if (existingNote.length > 0) {
      // Update existing note
      const [updatedNote] = await db
        .update(notes)
        .set({
          content,
          updatedAt: new Date()
        })
        .where(eq(notes.id, existingNote[0].id))
        .returning()

      return NextResponse.json(updatedNote)
    } else {
      // Create new note
      const [newNote] = await db
        .insert(notes)
        .values({
          userId,
          moduleId,
          slideId,
          content
        })
        .returning()

      return NextResponse.json(newNote)
    }
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
  }
}
