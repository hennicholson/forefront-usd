import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const [user] = await db.select().from(users).where(eq(users.id, userId))

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const body = await request.json()

    const {
      name,
      email,
      bio,
      headline,
      location,
      phone,
      website,
      profileImage,
      bannerImage,
      summary,
      experience,
      education,
      skills,
      certifications,
      projects,
      awards,
      interests,
      socialLinks,
      meetingLink,
      availability,
      profileVisibility,
      geminiApiKey,
      profileComplete
    } = body

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (bio !== undefined) updateData.bio = bio
    if (headline !== undefined) updateData.headline = headline
    if (location !== undefined) updateData.location = location
    if (phone !== undefined) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage
    if (summary !== undefined) updateData.summary = summary
    if (experience !== undefined) updateData.experience = experience
    if (education !== undefined) updateData.education = education
    if (skills !== undefined) updateData.skills = skills
    if (certifications !== undefined) updateData.certifications = certifications
    if (projects !== undefined) updateData.projects = projects
    if (awards !== undefined) updateData.awards = awards
    if (interests !== undefined) updateData.interests = interests
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink
    if (availability !== undefined) updateData.availability = availability
    if (profileVisibility !== undefined) updateData.profileVisibility = profileVisibility
    if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey
    if (profileComplete !== undefined) updateData.profileComplete = profileComplete

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}
