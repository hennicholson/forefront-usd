import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { sql, eq, isNull } from 'drizzle-orm'

// Channel definitions (matching frontend)
const CHANNELS = [
  { id: 'general', topic: null },
  { id: 'ai-video', topic: 'AI Video' },
  { id: 'vibe-coding', topic: 'Vibe Coding' },
  { id: 'marketing', topic: 'Marketing' },
  { id: 'automation', topic: 'Automation' },
  { id: 'help', topic: 'Help' }
]

// GET channel metrics (counts) in a single query
export async function GET(request: Request) {
  try {
    // Get counts grouped by topic
    const topicCounts = await db
      .select({
        topic: posts.topic,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(posts)
      .groupBy(posts.topic)

    // Build response object mapping channel IDs to counts
    const metrics: Record<string, number> = {}

    for (const channel of CHANNELS) {
      if (channel.topic === null) {
        // For 'general' channel, count posts with null topic
        const generalCount = topicCounts.find(tc => tc.topic === null)
        metrics[channel.id] = generalCount?.count || 0
      } else {
        // For other channels, find matching topic
        const topicCount = topicCounts.find(tc => tc.topic === channel.topic)
        metrics[channel.id] = topicCount?.count || 0
      }
    }

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching channel metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channel metrics' },
      { status: 500 }
    )
  }
}
