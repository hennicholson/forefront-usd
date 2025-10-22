import { db } from './index'
import { posts, messages, comments, reactions } from './schema'
import { sql, lt } from 'drizzle-orm'

/**
 * Data Archiving & Cleanup Functions
 *
 * These functions help reduce database costs by removing old data
 * WARNING: Use with caution - deleted data cannot be recovered!
 */

export interface ArchiveResult {
  success: boolean
  deletedCount: number
  estimatedStorageFreedMB: number
  error?: string
}

/**
 * Archive (delete) old posts
 * @param olderThanDays - Delete posts older than this many days (default: 365)
 * @param dryRun - If true, only count what would be deleted without actually deleting
 */
export async function archiveOldPosts(
  olderThanDays: number = 365,
  dryRun: boolean = true
): Promise<ArchiveResult> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // First, count what will be deleted
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(lt(posts.createdAt, cutoffDate))

    const count = Number(countResult.count)

    if (dryRun) {
      return {
        success: true,
        deletedCount: count,
        estimatedStorageFreedMB: Math.round((count * 2) / 1024 * 100) / 100
      }
    }

    // Actually delete if not dry run
    if (count > 0) {
      await db.delete(posts).where(lt(posts.createdAt, cutoffDate))
    }

    return {
      success: true,
      deletedCount: count,
      estimatedStorageFreedMB: Math.round((count * 2) / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Error archiving posts:', error)
    return {
      success: false,
      deletedCount: 0,
      estimatedStorageFreedMB: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Archive (delete) old messages
 * @param olderThanDays - Delete messages older than this many days (default: 365)
 * @param dryRun - If true, only count what would be deleted
 */
export async function archiveOldMessages(
  olderThanDays: number = 365,
  dryRun: boolean = true
): Promise<ArchiveResult> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(lt(messages.createdAt, cutoffDate))

    const count = Number(countResult.count)

    if (dryRun) {
      return {
        success: true,
        deletedCount: count,
        estimatedStorageFreedMB: Math.round((count * 1) / 1024 * 100) / 100
      }
    }

    if (count > 0) {
      await db.delete(messages).where(lt(messages.createdAt, cutoffDate))
    }

    return {
      success: true,
      deletedCount: count,
      estimatedStorageFreedMB: Math.round((count * 1) / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Error archiving messages:', error)
    return {
      success: false,
      deletedCount: 0,
      estimatedStorageFreedMB: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Archive (delete) old comments
 * @param olderThanDays - Delete comments older than this many days (default: 365)
 * @param dryRun - If true, only count what would be deleted
 */
export async function archiveOldComments(
  olderThanDays: number = 365,
  dryRun: boolean = true
): Promise<ArchiveResult> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(lt(comments.createdAt, cutoffDate))

    const count = Number(countResult.count)

    if (dryRun) {
      return {
        success: true,
        deletedCount: count,
        estimatedStorageFreedMB: Math.round((count * 0.5) / 1024 * 100) / 100
      }
    }

    if (count > 0) {
      await db.delete(comments).where(lt(comments.createdAt, cutoffDate))
    }

    return {
      success: true,
      deletedCount: count,
      estimatedStorageFreedMB: Math.round((count * 0.5) / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Error archiving comments:', error)
    return {
      success: false,
      deletedCount: 0,
      estimatedStorageFreedMB: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Clean up orphaned reactions (reactions to deleted posts/comments)
 */
export async function cleanupOrphanedReactions(dryRun: boolean = true): Promise<ArchiveResult> {
  try {
    // Count reactions to non-existent posts
    const [orphanedPostReactions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(sql`
        ${reactions.postId} IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM ${posts} WHERE ${posts.id} = ${reactions.postId}
        )
      `)

    // Count reactions to non-existent comments
    const [orphanedCommentReactions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(sql`
        ${reactions.commentId} IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM ${comments} WHERE ${comments.id} = ${reactions.commentId}
        )
      `)

    const totalCount = Number(orphanedPostReactions.count) + Number(orphanedCommentReactions.count)

    if (dryRun) {
      return {
        success: true,
        deletedCount: totalCount,
        estimatedStorageFreedMB: Math.round((totalCount * 0.1) / 1024 * 100) / 100
      }
    }

    // Delete orphaned reactions
    if (totalCount > 0) {
      await db.delete(reactions).where(sql`
        (${reactions.postId} IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM ${posts} WHERE ${posts.id} = ${reactions.postId}
        ))
        OR
        (${reactions.commentId} IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM ${comments} WHERE ${comments.id} = ${reactions.commentId}
        ))
      `)
    }

    return {
      success: true,
      deletedCount: totalCount,
      estimatedStorageFreedMB: Math.round((totalCount * 0.1) / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Error cleaning orphaned reactions:', error)
    return {
      success: false,
      deletedCount: 0,
      estimatedStorageFreedMB: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run a comprehensive archive operation
 * @param config - Configuration for what to archive
 */
export interface ArchiveConfig {
  archivePosts?: boolean
  archiveMessages?: boolean
  archiveComments?: boolean
  cleanupOrphaned?: boolean
  olderThanDays?: number
  dryRun?: boolean
}

export async function runArchiveOperation(config: ArchiveConfig = {}) {
  const {
    archivePosts = true,
    archiveMessages = true,
    archiveComments = true,
    cleanupOrphaned = true,
    olderThanDays = 365,
    dryRun = true
  } = config

  console.log('\n===========================================')
  console.log(`ARCHIVE OPERATION ${dryRun ? '(DRY RUN)' : '(LIVE)'}`)
  console.log('===========================================\n')

  const results = {
    posts: null as ArchiveResult | null,
    messages: null as ArchiveResult | null,
    comments: null as ArchiveResult | null,
    orphaned: null as ArchiveResult | null,
    totalDeleted: 0,
    totalStorageFreed: 0
  }

  if (archivePosts) {
    console.log(`📝 Archiving posts older than ${olderThanDays} days...`)
    results.posts = await archiveOldPosts(olderThanDays, dryRun)
    console.log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${results.posts.deletedCount} posts`)
    console.log(`  Storage ${dryRun ? 'would be' : ''} freed: ${results.posts.estimatedStorageFreedMB} MB\n`)
  }

  if (archiveMessages) {
    console.log(`💬 Archiving messages older than ${olderThanDays} days...`)
    results.messages = await archiveOldMessages(olderThanDays, dryRun)
    console.log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${results.messages.deletedCount} messages`)
    console.log(`  Storage ${dryRun ? 'would be' : ''} freed: ${results.messages.estimatedStorageFreedMB} MB\n`)
  }

  if (archiveComments) {
    console.log(`💭 Archiving comments older than ${olderThanDays} days...`)
    results.comments = await archiveOldComments(olderThanDays, dryRun)
    console.log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${results.comments.deletedCount} comments`)
    console.log(`  Storage ${dryRun ? 'would be' : ''} freed: ${results.comments.estimatedStorageFreedMB} MB\n`)
  }

  if (cleanupOrphaned) {
    console.log('🧹 Cleaning up orphaned reactions...')
    results.orphaned = await cleanupOrphanedReactions(dryRun)
    console.log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${results.orphaned.deletedCount} reactions`)
    console.log(`  Storage ${dryRun ? 'would be' : ''} freed: ${results.orphaned.estimatedStorageFreedMB} MB\n`)
  }

  // Calculate totals
  results.totalDeleted =
    (results.posts?.deletedCount || 0) +
    (results.messages?.deletedCount || 0) +
    (results.comments?.deletedCount || 0) +
    (results.orphaned?.deletedCount || 0)

  results.totalStorageFreed =
    (results.posts?.estimatedStorageFreedMB || 0) +
    (results.messages?.estimatedStorageFreedMB || 0) +
    (results.comments?.estimatedStorageFreedMB || 0) +
    (results.orphaned?.estimatedStorageFreedMB || 0)

  console.log('===========================================')
  console.log(`TOTAL: ${results.totalDeleted} records`)
  console.log(`STORAGE FREED: ${results.totalStorageFreed.toFixed(2)} MB`)
  console.log(`MONTHLY COST SAVINGS: $${(results.totalStorageFreed / 1024 * 0.35).toFixed(2)}`)
  console.log('===========================================\n')

  return results
}
