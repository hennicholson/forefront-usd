'use client'
import { useEffect, useRef } from 'react'

interface RealtimeEvent {
  type: 'notification' | 'message' | 'post' | 'reaction' | 'comment' | 'connected' | 'ping'
  data?: any
  timestamp?: number
}

interface UseRealtimeNotificationsProps {
  userId: string | undefined
  enabled?: boolean
  onNotification?: (notification: any) => void
}

export function useRealtimeNotifications({
  userId,
  enabled = true,
  onNotification
}: UseRealtimeNotificationsProps) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    // Don't connect if disabled, no userId, or not in browser
    if (!enabled || !userId || typeof window === 'undefined') {
      return
    }

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      try {
        // Create SSE connection
        const eventSource = new EventSource(`/api/realtime?userId=${userId}`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('✅ [SSE] Connected to real-time notifications')
          reconnectAttemptsRef.current = 0
        }

        eventSource.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data)

            // Handle notification events
            if (data.type === 'notification' && data.data && onNotification) {
              console.log('🔔 [SSE] Received notification:', data.data)
              onNotification(data.data)
            } else if (data.type === 'connected') {
              console.log('📡 [SSE] Connection established')
            }
            // Ignore ping events (keep-alive)
          } catch (error) {
            console.error('Error parsing SSE event:', error)
          }
        }

        eventSource.onerror = () => {
          console.warn('❌ [SSE] Connection error, reconnecting...')
          eventSource.close()

          // Exponential backoff for reconnection
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++

          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled && userId) {
              connect()
            }
          }, delay)
        }
      } catch (error) {
        console.error('Error creating SSE connection:', error)
      }
    }

    connect()

    // Cleanup on unmount or when dependencies change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [userId, enabled, onNotification])

  return {
    connected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN
  }
}
