// Prisma Client with Accelerate for ultra-fast queries + real-time
// Uses Prisma Accelerate for connection pooling and caching

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(withAccelerate())
}

// Create Prisma Client with Accelerate extension
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Real-time event types
export type RealtimeEvent =
  | { type: 'message'; data: any }
  | { type: 'post'; data: any }
  | { type: 'notification'; data: any }
  | { type: 'reaction'; data: any }
  | { type: 'comment'; data: any }

// Event emitter for real-time updates (server-side)
class RealtimeEmitter {
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map()

  on(channel: string, callback: (event: RealtimeEvent) => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }
    this.listeners.get(channel)!.add(callback)
  }

  off(channel: string, callback: (event: RealtimeEvent) => void) {
    this.listeners.get(channel)?.delete(callback)
  }

  emit(channel: string, event: RealtimeEvent) {
    this.listeners.get(channel)?.forEach(callback => callback(event))
  }

  // Subscribe to all real-time events for a user
  subscribeToUser(userId: string, callback: (event: RealtimeEvent) => void) {
    this.on(`user:${userId}`, callback)
  }

  unsubscribeFromUser(userId: string, callback: (event: RealtimeEvent) => void) {
    this.off(`user:${userId}`, callback)
  }

  // Subscribe to a channel/topic
  subscribeToChannel(topic: string, callback: (event: RealtimeEvent) => void) {
    this.on(`channel:${topic}`, callback)
  }

  unsubscribeFromChannel(topic: string, callback: (event: RealtimeEvent) => void) {
    this.off(`channel:${topic}`, callback)
  }
}

export const realtime = new RealtimeEmitter()

// Helper to emit events after database mutations
export async function createMessageWithEvent(data: any) {
  const message = await prisma.message.create({ data })

  // Emit to sender and receiver
  realtime.emit(`user:${data.senderId}`, { type: 'message', data: message })
  if (data.receiverId) {
    realtime.emit(`user:${data.receiverId}`, { type: 'message', data: message })
  }

  return message
}

export async function createPostWithEvent(data: any) {
  const post = await prisma.post.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        }
      }
    }
  })

  // Emit to the channel
  const channel = data.topic || 'general'
  realtime.emit(`channel:${channel}`, { type: 'post', data: post })

  return post
}

export async function createNotificationWithEvent(data: any) {
  const notification = await prisma.notification.create({ data })

  // Emit to the user
  realtime.emit(`user:${data.userId}`, { type: 'notification', data: notification })

  return notification
}

export async function createReactionWithEvent(data: any) {
  const reaction = await prisma.reaction.create({ data })

  // Get the post/comment to find relevant users
  if (data.postId) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { userId: true, topic: true }
    })
    if (post) {
      realtime.emit(`user:${post.userId}`, { type: 'reaction', data: { ...reaction, postId: data.postId } })
      const channel = post.topic || 'general'
      realtime.emit(`channel:${channel}`, { type: 'reaction', data: reaction })
    }
  }

  return reaction
}

export async function createCommentWithEvent(data: any) {
  const comment = await prisma.comment.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        }
      }
    }
  })

  // Get the post to notify the author
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { userId: true, topic: true }
  })

  if (post) {
    realtime.emit(`user:${post.userId}`, { type: 'comment', data: comment })
    const channel = post.topic || 'general'
    realtime.emit(`channel:${channel}`, { type: 'comment', data: comment })
  }

  return comment
}

export default prisma
