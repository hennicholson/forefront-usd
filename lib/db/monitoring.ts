import { db } from './index'
import { users, posts, messages, workflows, comments, reactions } from './schema'
import { sql } from 'drizzle-orm'

/**
 * Database Monitoring & Cost Optimization Utilities
 *
 * Use these functions to track database growth and optimize costs
 */

export interface DatabaseStats {
  totalUsers: number
  totalPosts: number
  totalMessages: number
  totalWorkflows: number
  totalComments: number
  totalReactions: number
  estimatedStorageMB: number
  estimatedStorageGB: number
  actualStorageMB?: number
  actualStorageGB?: number
  oldestData: Date | null
  newestData: Date | null
  storageByTable: Record<string, number>
}

/**
 * Get comprehensive database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    // Count records in each table
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users)
    const [postCount] = await db.select({ count: sql<number>`count(*)` }).from(posts)
    const [messageCount] = await db.select({ count: sql<number>`count(*)` }).from(messages)
    const [workflowCount] = await db.select({ count: sql<number>`count(*)` }).from(workflows)
    const [commentCount] = await db.select({ count: sql<number>`count(*)` }).from(comments)
    const [reactionCount] = await db.select({ count: sql<number>`count(*)` }).from(reactions)

    // Get oldest and newest posts (as a proxy for data range)
    const [oldestPost] = await db
      .select({ createdAt: posts.createdAt })
      .from(posts)
      .orderBy(posts.createdAt)
      .limit(1)

    const [newestPost] = await db
      .select({ createdAt: posts.createdAt })
      .from(posts)
      .orderBy(sql`${posts.createdAt} DESC`)
      .limit(1)

    // Estimate storage (rough calculation)
    // Average sizes: user=5KB, post=2KB, message=1KB, workflow=10KB, comment=500B, reaction=100B
    const estimatedStorageMB = (
      (userCount.count * 5) +
      (postCount.count * 2) +
      (messageCount.count * 1) +
      (workflowCount.count * 10) +
      (commentCount.count * 0.5) +
      (reactionCount.count * 0.1)
    ) / 1024 // Convert KB to MB

    const storageMB = Math.round(estimatedStorageMB * 100) / 100

    // Get actual database size
    let actualStorageMB: number | undefined
    let actualStorageGB: number | undefined
    try {
      const result = await db.select({
        size: sql<number>`pg_database_size(current_database())`
      }).from(users).limit(1)

      if (result && result[0] && 'size' in result[0]) {
        const sizeInBytes = Number(result[0].size)
        actualStorageMB = Math.round((sizeInBytes / 1024 / 1024) * 100) / 100
        actualStorageGB = Math.round((actualStorageMB / 1024) * 10000) / 10000
      }
    } catch (error) {
      console.warn('Could not fetch actual database size:', error)
    }

    return {
      totalUsers: Number(userCount.count),
      totalPosts: Number(postCount.count),
      totalMessages: Number(messageCount.count),
      totalWorkflows: Number(workflowCount.count),
      totalComments: Number(commentCount.count),
      totalReactions: Number(reactionCount.count),
      estimatedStorageMB: storageMB,
      estimatedStorageGB: Math.round((storageMB / 1024) * 10000) / 10000,
      actualStorageMB,
      actualStorageGB,
      oldestData: oldestPost?.createdAt || null,
      newestData: newestPost?.createdAt || null,
      storageByTable: {
        users: Math.round((Number(userCount.count) * 5) / 1024 * 100) / 100,
        posts: Math.round((Number(postCount.count) * 2) / 1024 * 100) / 100,
        messages: Math.round((Number(messageCount.count) * 1) / 1024 * 100) / 100,
        workflows: Math.round((Number(workflowCount.count) * 10) / 1024 * 100) / 100,
        comments: Math.round((Number(commentCount.count) * 0.5) / 1024 * 100) / 100,
        reactions: Math.round((Number(reactionCount.count) * 0.1) / 1024 * 100) / 100,
      }
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    throw error
  }
}

/**
 * Estimate monthly Neon costs based on current usage
 *
 * Neon Scale pricing:
 * - Storage: $0.35/GB-month
 * - Compute: $0.14/CU per hour
 */
export interface CostEstimate {
  storageCostPerMonth: number
  estimatedComputeCostPerMonth: {
    low: number    // 4 hrs/day active
    medium: number // 12 hrs/day active
    high: number   // 20 hrs/day active
  }
  totalEstimate: {
    low: number
    medium: number
    high: number
  }
}

export async function estimateMonthlyCost(): Promise<CostEstimate> {
  const stats = await getDatabaseStats()

  // Storage cost: $0.35 per GB per month
  const storageGB = stats.estimatedStorageMB / 1024
  const storageCostPerMonth = storageGB * 0.35

  // Compute cost estimates (assuming 0.5 CU average for small app)
  const computeUnitCost = 0.14 // per hour
  const averageCU = 0.5

  const estimatedComputeCostPerMonth = {
    low: 4 * 30 * computeUnitCost * averageCU,      // 4 hrs/day
    medium: 12 * 30 * computeUnitCost * averageCU,  // 12 hrs/day
    high: 20 * 30 * computeUnitCost * averageCU,    // 20 hrs/day
  }

  return {
    storageCostPerMonth: Math.round(storageCostPerMonth * 100) / 100,
    estimatedComputeCostPerMonth: {
      low: Math.round(estimatedComputeCostPerMonth.low * 100) / 100,
      medium: Math.round(estimatedComputeCostPerMonth.medium * 100) / 100,
      high: Math.round(estimatedComputeCostPerMonth.high * 100) / 100,
    },
    totalEstimate: {
      low: Math.round((storageCostPerMonth + estimatedComputeCostPerMonth.low) * 100) / 100,
      medium: Math.round((storageCostPerMonth + estimatedComputeCostPerMonth.medium) * 100) / 100,
      high: Math.round((storageCostPerMonth + estimatedComputeCostPerMonth.high) * 100) / 100,
    }
  }
}

/**
 * Get data that can be archived (older than specified days)
 */
export async function getArchivableData(olderThanDays: number = 365) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  try {
    const [oldPostsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(sql`${posts.createdAt} < ${cutoffDate}`)

    const [oldMessagesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(sql`${messages.createdAt} < ${cutoffDate}`)

    const [oldCommentsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(sql`${comments.createdAt} < ${cutoffDate}`)

    return {
      posts: Number(oldPostsCount.count),
      messages: Number(oldMessagesCount.count),
      comments: Number(oldCommentsCount.count),
      totalRecords: Number(oldPostsCount.count) + Number(oldMessagesCount.count) + Number(oldCommentsCount.count),
      estimatedStorageSavingsMB: Math.round(
        (Number(oldPostsCount.count) * 2 +
         Number(oldMessagesCount.count) * 1 +
         Number(oldCommentsCount.count) * 0.5) / 1024 * 100
      ) / 100,
      cutoffDate
    }
  } catch (error) {
    console.error('Error getting archivable data:', error)
    throw error
  }
}

/**
 * Get inactive users (no activity in X days)
 */
export async function getInactiveUsers(inactiveDays: number = 180) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)

  try {
    // Users who haven't created posts or messages since cutoff
    const inactiveUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(sql`
        NOT EXISTS (
          SELECT 1 FROM ${posts} WHERE ${posts.userId} = ${users.id} AND ${posts.createdAt} > ${cutoffDate}
        )
        AND NOT EXISTS (
          SELECT 1 FROM ${messages} WHERE ${messages.senderId} = ${users.id} AND ${messages.createdAt} > ${cutoffDate}
        )
        AND ${users.createdAt} < ${cutoffDate}
      `)

    return {
      count: inactiveUsers.length,
      users: inactiveUsers,
      estimatedStorageSavingsMB: Math.round(inactiveUsers.length * 5 / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Error getting inactive users:', error)
    throw error
  }
}

/**
 * Print a formatted report to console
 */
export async function printDatabaseReport() {
  console.log('\n===========================================')
  console.log('DATABASE MONITORING REPORT')
  console.log('===========================================\n')

  const stats = await getDatabaseStats()
  const costs = await estimateMonthlyCost()
  const archivable = await getArchivableData(365)
  const inactive = await getInactiveUsers(180)

  console.log('📊 CURRENT USAGE:')
  console.log(`  Users: ${stats.totalUsers}`)
  console.log(`  Posts: ${stats.totalPosts}`)
  console.log(`  Messages: ${stats.totalMessages}`)
  console.log(`  Workflows: ${stats.totalWorkflows}`)
  console.log(`  Comments: ${stats.totalComments}`)
  console.log(`  Reactions: ${stats.totalReactions}`)
  console.log(`  Estimated Storage: ${stats.estimatedStorageMB} MB (${(stats.estimatedStorageMB / 1024).toFixed(2)} GB)`)

  console.log('\n💰 ESTIMATED MONTHLY COSTS:')
  console.log(`  Storage: $${costs.storageCostPerMonth}`)
  console.log(`  Compute (Low usage): $${costs.estimatedComputeCostPerMonth.low}`)
  console.log(`  Compute (Medium usage): $${costs.estimatedComputeCostPerMonth.medium}`)
  console.log(`  Compute (High usage): $${costs.estimatedComputeCostPerMonth.high}`)
  console.log(`  Total Estimate (Low): $${costs.totalEstimate.low}`)
  console.log(`  Total Estimate (Medium): $${costs.totalEstimate.medium}`)
  console.log(`  Total Estimate (High): $${costs.totalEstimate.high}`)

  console.log('\n🗂️ ARCHIVABLE DATA (older than 1 year):')
  console.log(`  Posts: ${archivable.posts}`)
  console.log(`  Messages: ${archivable.messages}`)
  console.log(`  Comments: ${archivable.comments}`)
  console.log(`  Potential Savings: ${archivable.estimatedStorageSavingsMB} MB`)

  console.log('\n😴 INACTIVE USERS (no activity in 6 months):')
  console.log(`  Count: ${inactive.count}`)
  console.log(`  Potential Savings: ${inactive.estimatedStorageSavingsMB} MB`)

  console.log('\n===========================================\n')

  return { stats, costs, archivable, inactive }
}
