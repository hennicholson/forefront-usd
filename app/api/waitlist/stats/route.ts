import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { desc, count } from 'drizzle-orm'

export async function GET() {
  try {
    // Get total signups
    const totalResult = await db.select({ count: count() }).from(waitlist)
    const totalSignups = totalResult[0]?.count || 0

    // Get today's signups
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayResult = await db
      .select({ count: count() })
      .from(waitlist)
      .where(sql`${waitlist.createdAt} >= ${today}`)
    const todaySignups = todayResult[0]?.count || 0

    // Get yesterday's signups for growth calculation
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayResult = await db
      .select({ count: count() })
      .from(waitlist)
      .where(
        sql`${waitlist.createdAt} >= ${yesterday} AND ${waitlist.createdAt} < ${today}`
      )
    const yesterdaySignups = yesterdayResult[0]?.count || 0

    // Calculate growth rate
    let growthRate = 0
    if (yesterdaySignups > 0) {
      growthRate = ((todaySignups - yesterdaySignups) / yesterdaySignups) * 100
    } else if (todaySignups > 0) {
      growthRate = 100
    }

    // Get average AI proficiency
    const avgResult = await db
      .select({ avg: sql<number>`AVG(${waitlist.aiProficiency})` })
      .from(waitlist)
    const avgProficiency = Math.round(avgResult[0]?.avg || 0)

    // Get university distribution
    const universityStats = await db
      .select({
        university: waitlist.university,
        count: count(),
      })
      .from(waitlist)
      .groupBy(waitlist.university)
      .orderBy(desc(count()))

    // Get year distribution
    const yearStats = await db
      .select({
        year: waitlist.year,
        count: count(),
      })
      .from(waitlist)
      .groupBy(waitlist.year)
      .orderBy(desc(count()))

    // Get proficiency distribution (in ranges)
    const proficiencyRanges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ]

    const proficiencyStats = await Promise.all(
      proficiencyRanges.map(async (range) => {
        const result = await db
          .select({ count: count() })
          .from(waitlist)
          .where(
            sql`${waitlist.aiProficiency} >= ${range.min} AND ${waitlist.aiProficiency} <= ${range.max}`
          )
        return {
          label: range.label,
          count: result[0]?.count || 0,
        }
      })
    )

    // Get daily signups for the last 7 days
    const dailySignups = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const result = await db
        .select({ count: count() })
        .from(waitlist)
        .where(
          sql`${waitlist.createdAt} >= ${date} AND ${waitlist.createdAt} < ${nextDate}`
        )

      dailySignups.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: result[0]?.count || 0,
      })
    }

    // Get all users for the table
    const users = await db
      .select({
        id: waitlist.id,
        firstName: waitlist.firstName,
        lastName: waitlist.lastName,
        email: waitlist.email,
        phone: waitlist.phone,
        university: waitlist.university,
        year: waitlist.year,
        aiProficiency: waitlist.aiProficiency,
        avatarUrl: waitlist.avatarUrl,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt))

    return NextResponse.json({
      totalSignups,
      todaySignups,
      growthRate,
      avgProficiency,
      universityStats: universityStats.map(stat => ({
        name: stat.university || 'Not specified',
        value: stat.count,
      })),
      yearStats: yearStats.map(stat => ({
        name: stat.year || 'Not specified',
        value: stat.count,
      })),
      proficiencyStats: proficiencyStats.map(stat => ({
        name: stat.label,
        value: stat.count,
      })),
      dailySignups: dailySignups.map(stat => ({
        name: stat.date,
        value: stat.count,
      })),
      users: users.map(user => ({
        ...user,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching waitlist stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}