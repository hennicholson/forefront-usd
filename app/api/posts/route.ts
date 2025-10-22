import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, reactions, comments, notifications } from '@/lib/db/schema'
import { eq, desc, sql, like, inArray } from 'drizzle-orm'

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

    // Optimization: Batch fetch all likes and comments counts in 2 queries instead of N+1
    const postIds = allPosts.map(p => p.id)

    // Initialize empty maps
    let likesMap = new Map()
    let commentsMap = new Map()

    // Only fetch counts if we have posts
    if (postIds.length > 0) {
      // Get all likes counts in one query
      const likesData = await db
        .select({
          postId: reactions.postId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(reactions)
        .where(inArray(reactions.postId, postIds))
        .groupBy(reactions.postId)

      // Get all comments counts in one query
      const commentsData = await db
        .select({
          postId: comments.postId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId)

      // Create lookup maps for O(1) access
      likesMap = new Map(likesData.map(l => [l.postId, l.count]))
      commentsMap = new Map(commentsData.map(c => [c.postId, c.count]))
    }

    // Combine posts with their counts
    const postsWithCounts = allPosts.map(post => ({
      ...post,
      id: String(post.id), // Ensure ID is a string
      userId: String(post.userId), // Ensure userId is a string
      likes: likesMap.get(post.id) || 0,
      commentsCount: commentsMap.get(post.id) || 0,
      timestamp: formatTimestamp(post.createdAt)
    }))

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
