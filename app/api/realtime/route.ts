// Real-time SSE endpoint for instant message/post delivery
// Uses Server-Sent Events for Netlify compatibility (no WebSocket needed)

import { NextRequest } from 'next/server'
import { realtime } from '@/lib/realtime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const channels = searchParams.get('channels')?.split(',') || []

  if (!userId) {
    return new Response('Missing userId', { status: 400 })
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      const sendEvent = (event: any) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      sendEvent({ type: 'connected', timestamp: Date.now() })

      // Subscribe to user events
      const userHandler = (event: any) => {
        sendEvent(event)
      }
      realtime.subscribeToUser(userId, userHandler)

      // Subscribe to channels
      const channelHandlers: Array<{ channel: string; handler: any }> = []
      channels.forEach(channel => {
        const handler = (event: any) => {
          sendEvent(event)
        }
        realtime.subscribeToChannel(channel, handler)
        channelHandlers.push({ channel, handler })
      })

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        sendEvent({ type: 'ping', timestamp: Date.now() })
      }, 30000)

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        realtime.unsubscribeFromUser(userId, userHandler)
        channelHandlers.forEach(({ channel, handler }) => {
          realtime.unsubscribeFromChannel(channel, handler)
        })
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
