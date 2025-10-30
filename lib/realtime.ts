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
