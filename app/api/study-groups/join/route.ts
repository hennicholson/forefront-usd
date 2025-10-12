import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { groupMembers } from '@/lib/db/schema'

const connectionString = process.env.DATABASE_URL!
const sqlClient = neon(connectionString)
const db = drizzle(sqlClient)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, userId } = body

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add user as member
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId,
        userId,
        role: 'member',
      })
      .returning()

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error joining study group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
