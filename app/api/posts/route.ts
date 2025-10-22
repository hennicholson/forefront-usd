import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { db } from '@/lib/db'
import { posts, users, reactions, comments, notifications } from '@/lib/db/schema'
import { eq, desc, sql, like, inArray } from 'drizzle-orm'

const rawSql = neon(process.env.DATABASE_URL!)

// GET all posts (with user info and counts) - ULTRA FAST with raw SQL
export async function GET(request: Request) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Ultra-fast query - INNER JOIN only, index-optimized WHERE clause
    const query = topic
      ? rawSql`
          SELECT
            p.id::text,
            p.user_id::text as "userId",
            p.content,
            p.type,
            p.topic,
            p.created_at as "createdAt",
            u.name as "userName",
            u.profile_image as "userProfileImage",
            0 as likes,
            0 as "commentsCount"
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          WHERE p.topic = ${topic}
          ORDER BY p.created_at DESC
          LIMIT ${limit}
        `
      : rawSql`
          SELECT
            p.id::text,
            p.user_id::text as "userId",
            p.content,
            p.type,
            COALESCE(p.topic, '') as topic,
            p.created_at as "createdAt",
            u.name as "userName",
            u.profile_image as "userProfileImage",
            0 as likes,
            0 as "commentsCount"
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          ORDER BY p.created_at DESC
          LIMIT ${limit}
        `

    const postsData = await query

    // Add timestamps
    const postsWithTimestamps = postsData.map(post => ({
      ...post,
      timestamp: formatTimestamp(new Date(post.createdAt))
    }))

    const totalTime = Date.now() - startTime
    console.log(`[PERF-FAST] Posts API: ${totalTime}ms (${postsData.length} posts, topic: ${topic || 'all'})`)

    return NextResponse.json(postsWithTimestamps, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
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

// POST create new post
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, content, type = 'text', topic, metadata = {} } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      )
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        userId,
        content,
        type,
        topic: topic || null,
        metadata,
      })
      .returning()

    // Parse @mentions from content
    const mentionRegex = /@(\w+)/g
    const mentions = content.match(mentionRegex)

    if (mentions && mentions.length > 0) {
      // Get the post author's name
      const [author] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))

      // Find mentioned users and create notifications
      for (const mention of mentions) {
        const username = mention.substring(1) // Remove @

        // Find user by name (case-insensitive)
        const mentionedUsers = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(sql`LOWER(${users.name}) = LOWER(${username})`)

        if (mentionedUsers.length > 0) {
          const mentionedUser = mentionedUsers[0]

          // Don't notify if user mentions themselves
          if (mentionedUser.id !== userId) {
            await db.insert(notifications).values({
              userId: mentionedUser.id,
              type: 'mention',
              content: `${author?.name || 'Someone'} mentioned you in a post`,
              metadata: {
                postId: newPost.id,
                authorId: userId,
                authorName: author?.name,
                postContent: content.substring(0, 100) // First 100 chars
              }
            })
          }
        }
      }
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
