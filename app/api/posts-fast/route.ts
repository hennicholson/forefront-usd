import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Ultra-fast posts API using raw SQL
export async function GET(request: Request) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Single optimized query that gets posts with user info and counts in ONE go
    const query = topic
      ? sql`
          SELECT
            p.id::text,
            p.user_id::text as "userId",
            p.content,
            p.type,
            p.topic,
            p.metadata,
            p.created_at as "createdAt",
            u.name as "userName",
            u.bio as "userBio",
            u.profile_image as "userProfileImage",
            COALESCE(r.likes, 0)::int as likes,
            COALESCE(c.comments, 0)::int as "commentsCount"
          FROM posts p
          LEFT JOIN users u ON p.user_id = u.id
          LEFT JOIN (
            SELECT post_id, COUNT(*)::int as likes
            FROM reactions
            GROUP BY post_id
          ) r ON p.id = r.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*)::int as comments
            FROM comments
            GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE p.topic = ${topic}
          ORDER BY p.created_at DESC
          LIMIT ${limit}
        `
      : sql`
          SELECT
            p.id::text,
            p.user_id::text as "userId",
            p.content,
            p.type,
            p.topic,
            p.metadata,
            p.created_at as "createdAt",
            u.name as "userName",
            u.bio as "userBio",
            u.profile_image as "userProfileImage",
            COALESCE(r.likes, 0)::int as likes,
            COALESCE(c.comments, 0)::int as "commentsCount"
          FROM posts p
          LEFT JOIN users u ON p.user_id = u.id
          LEFT JOIN (
            SELECT post_id, COUNT(*)::int as likes
            FROM reactions
            GROUP BY post_id
          ) r ON p.id = r.post_id
          LEFT JOIN (
            SELECT post_id, COUNT(*)::int as comments
            FROM comments
            GROUP BY post_id
          ) c ON p.id = c.post_id
          ORDER BY p.created_at DESC
          LIMIT ${limit}
        `

    const posts = await query

    const totalTime = Date.now() - startTime
    console.log(`[PERF-FAST] Posts API: ${totalTime}ms (${posts.length} posts, topic: ${topic || 'all'})`)

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
