import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, reactions, comments, notifications } from '@/lib/db/schema'
import { eq, desc, sql, like } from 'drizzle-orm'

// GET all posts (with user info and counts)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        type: posts.type,
        topic: posts.topic,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        userName: users.name,
        userBio: users.bio,
        userProfileImage: users.profileImage,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)

    // Filter by topic if provided
    const allPosts = topic
      ? await query.where(eq(posts.topic, topic))
      : await query

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
