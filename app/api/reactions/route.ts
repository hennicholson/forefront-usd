import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reactions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST toggle reaction (like/unlike)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, postId, commentId, type = 'like' } = body

    if (!userId || (!postId && !commentId)) {
      return NextResponse.json(
        { error: 'userId and either postId or commentId are required' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    const existingReaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          postId ? eq(reactions.postId, postId) : eq(reactions.commentId, commentId)
        )
      )
      .limit(1)

    if (existingReaction.length > 0) {
      // Remove reaction (unlike)
      await db
        .delete(reactions)
        .where(eq(reactions.id, existingReaction[0].id))

      return NextResponse.json({ action: 'removed', reacted: false })
    } else {
      // Add reaction (like)
      const [newReaction] = await db
        .insert(reactions)
        .values({
          userId,
          postId: postId || null,
          commentId: commentId || null,
          type,
        })
        .returning()

      return NextResponse.json({ action: 'added', reacted: true, reaction: newReaction }, { status: 201 })
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}

// GET check if user has reacted to a post/comment
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const postId = searchParams.get('postId')
    const commentId = searchParams.get('commentId')

    if (!userId || (!postId && !commentId)) {
      return NextResponse.json(
        { error: 'userId and either postId or commentId are required' },
        { status: 400 }
      )
    }

    const reaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          postId ? eq(reactions.postId, parseInt(postId)) : eq(reactions.commentId, parseInt(commentId!))
        )
      )
      .limit(1)

    return NextResponse.json({ reacted: reaction.length > 0 })
  } catch (error) {
    console.error('Error checking reaction:', error)
    return NextResponse.json(
      { error: 'Failed to check reaction' },
      { status: 500 }
    )
  }
}
