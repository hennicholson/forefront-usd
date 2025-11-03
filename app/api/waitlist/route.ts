import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, aiProficiency, avatarUrl } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || aiProficiency === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate AI proficiency is between 0-100
    if (aiProficiency < 0 || aiProficiency > 100) {
      return NextResponse.json(
        { error: 'AI proficiency must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Insert into database
    const [newEntry] = await db.insert(waitlist).values({
      firstName,
      lastName,
      email,
      phone,
      aiProficiency,
      avatarUrl: avatarUrl || null,
    }).returning()

    return NextResponse.json({
      success: true,
      data: newEntry
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error adding to waitlist:', error)

    // Handle duplicate email error
    if (error?.code === '23505' || error?.message?.includes('unique')) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const entries = await db.select({
      id: waitlist.id,
      firstName: waitlist.firstName,
      lastName: waitlist.lastName,
      avatarUrl: waitlist.avatarUrl,
      aiProficiency: waitlist.aiProficiency,
    }).from(waitlist).orderBy(waitlist.createdAt)

    return NextResponse.json({ entries }, { status: 200 })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
