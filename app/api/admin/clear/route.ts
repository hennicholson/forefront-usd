import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, reactions, comments } from '@/lib/db/schema'
import { eq, and, or, isNull, inArray } from 'drizzle-orm'

// DELETE - Clear messages in a channel (admin only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const topic = searchParams.get('topic')

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId is required' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const [admin] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, adminId))

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Delete posts in the topic/channel
    // For default channel (no topic), need to match both null and empty string
    const deleteCondition = topic
      ? eq(posts.topic, topic)
      : or(isNull(posts.topic), eq(posts.topic, ''))

    console.log('[CLEAR] Topic received:', topic)
    console.log('[CLEAR] Delete condition type:', topic ? 'specific topic' : 'default (null or empty)')

    // First, get all post IDs that will be deleted
    const postsToDelete = await db
      .select({ id: posts.id })
      .from(posts)
      .where(deleteCondition!)

    const postIds = postsToDelete.map(p => p.id)
    console.log('[CLEAR] Found posts to delete:', postIds.length, 'IDs:', postIds)

    if (postIds.length > 0) {
      // Delete child records first to avoid foreign key violations
      // Delete reactions
      await db.delete(reactions).where(inArray(reactions.postId, postIds))

      // Delete comments
      await db.delete(comments).where(inArray(comments.postId, postIds))

      // Now safe to delete posts
      await db.delete(posts).where(deleteCondition!)
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${postIds.length} messages in ${topic || 'default'} channel`,
    })
  } catch (error) {
    console.error('Error clearing channel:', error)
    return NextResponse.json(
      { error: 'Failed to clear channel' },
      { status: 500 }
    )
  }
}
