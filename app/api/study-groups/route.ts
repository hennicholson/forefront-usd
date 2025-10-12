import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { studyGroups, groupMembers, users } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'

const connectionString = process.env.DATABASE_URL!
const sqlClient = neon(connectionString)
const db = drizzle(sqlClient)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get all study groups
    const allGroups = await db
      .select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        topic: studyGroups.topic,
        createdBy: studyGroups.createdBy,
        createdAt: studyGroups.createdAt,
      })
      .from(studyGroups)
      .orderBy(desc(studyGroups.createdAt))

    // Get member counts and check membership for each group
    const groupsWithDetails = await Promise.all(
      allGroups.map(async (group) => {
        // Get member count
        const [countResult] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id))

        // Check if user is a member
        const membership = await db
          .select()
          .from(groupMembers)
          .where(
            sql`${groupMembers.groupId} = ${group.id} AND ${groupMembers.userId} = ${userId}`
          )
          .limit(1)

        return {
          ...group,
          memberCount: countResult?.count || 0,
          isMember: membership.length > 0,
          isCreator: group.createdBy === userId,
        }
      })
    )

    return NextResponse.json(groupsWithDetails)
  } catch (error) {
    console.error('Error fetching study groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, topic, createdBy } = body

    if (!name || !topic || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the study group
    const [newGroup] = await db
      .insert(studyGroups)
      .values({
        name,
        description: description || null,
        topic,
        createdBy,
      })
      .returning()

    // Add creator as first member with admin role
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: createdBy,
      role: 'admin',
    })

    return NextResponse.json(newGroup, { status: 201 })
  } catch (error) {
    console.error('Error creating study group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
