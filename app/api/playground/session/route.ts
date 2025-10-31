import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { playgroundSessions } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moduleId, slideIndex } = body

    if (!moduleId) {
      return NextResponse.json({ error: 'Missing module ID' }, { status: 400 })
    }

    const userId = 'demo-user' // TODO: Get from auth

    const [session] = await db.insert(playgroundSessions).values({
      userId,
      moduleId,
      slideIndex: slideIndex ?? 0
    }).returning()

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
