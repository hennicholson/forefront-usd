// React hook for real-time SSE subscriptions
// Provides instant message/post updates with automatic reconnection

import { useEffect, useRef, useState, useCallback } from 'react'

export type RealtimeEvent =
  | { type: 'connected'; timestamp: number }
  | { type: 'ping'; timestamp: number }
  | { type: 'message'; data: any }
  | { type: 'post'; data: any }
  | { type: 'notification'; data: any }
  | { type: 'reaction'; data: any }
  | { type: 'comment'; data: any }

interface UseRealtimeOptions {
  userId: string
  channels?: string[]
  onMessage?: (event: RealtimeEvent) => void
  onError?: (error: Error) => void
  autoReconnect?: boolean
}

export function useRealtime({
  userId,
  channels = [],
  onMessage,
  onError,
  autoReconnect = true,
}: UseRealtimeOptions) {
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const channelsParam = channels.length > 0 ? `&channels=${channels.join(',')}` : ''
    const url = `/api/realtime?userId=${userId}${channelsParam}`

    console.log('🔌 [REALTIME] Connecting to:', url)

    try {
      const es = new EventSource(url)

      es.onopen = () => {
        console.log('✅ [REALTIME] Connected')
        setConnected(true)
        setReconnecting(false)
        reconnectAttempts.current = 0
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent

          if (data.type === 'ping') {
            // console.log('💓 [REALTIME] Keep-alive ping')
            return
          }

          console.log('📨 [REALTIME] Event received:', data.type)
          onMessage?.(data)
        } catch (err) {
          console.error('❌ [REALTIME] Failed to parse message:', err)
        }
      }

      es.onerror = (err) => {
        console.error('❌ [REALTIME] Connection error:', err)
        setConnected(false)

        es.close()
        eventSourceRef.current = null

        if (autoReconnect) {
          setReconnecting(true)

          // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current++

          console.log(`🔄 [REALTIME] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }

        onError?.(new Error('SSE connection error'))
      }

      eventSourceRef.current = es
    } catch (err) {
      console.error('❌ [REALTIME] Failed to create EventSource:', err)
      onError?.(err as Error)
    }
  }, [userId, channels, onMessage, onError, autoReconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (eventSourceRef.current) {
      console.log('🔌 [REALTIME] Disconnecting')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setConnected(false)
    setReconnecting(false)
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [userId, connect, disconnect])

  return {
    connected,
    reconnecting,
    disconnect,
    reconnect: connect,
  }
}
