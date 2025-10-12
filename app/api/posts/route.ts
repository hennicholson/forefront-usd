import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, reactions, comments } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

// GET all posts (with user info and counts)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const allPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        type: posts.type,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        userName: users.name,
        userBio: users.bio,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)

    // Get reaction counts for each post
    const postsWithCounts = await Promise.all(
      allPosts.map(async (post) => {
        const [likesResult] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(reactions)
          .where(eq(reactions.postId, post.id))

        const [commentsResult] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(comments)
          .where(eq(comments.postId, post.id))

        return {
          ...post,
          likes: likesResult?.count || 0,
          commentsCount: commentsResult?.count || 0,
          timestamp: formatTimestamp(post.createdAt)
        }
      })
    )

    return NextResponse.json(postsWithCounts)
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
    const { userId, content, type = 'text', metadata = {} } = body

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
        metadata,
      })
      .returning()

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date | null): string {
  if (!date) return 'just now'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
