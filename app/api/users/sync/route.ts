import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Sync localStorage user to database
export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const { id, email, name, bio, interests, isAdmin } = userData

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'id, email, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, id))

    if (existing.length > 0) {
      // User already exists, just return it
      return NextResponse.json(existing[0])
    }

    // Create new user in database
    const [newUser] = await db
      .insert(users)
      .values({
        id,
        email,
        name,
        bio: bio || null,
        interests: interests || [],
        isAdmin: isAdmin || false
      })
      .returning()

    console.log('Synced user to database:', newUser)
    return NextResponse.json(newUser)
  } catch (error: any) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user', details: error.message },
      { status: 500 }
    )
  }
}
