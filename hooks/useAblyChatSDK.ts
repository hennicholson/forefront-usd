// Optimized Real-Time Messaging Hook with Ably Chat SDK
// Built on top of @ably/chat for maximum performance
// Features: Rooms API, Built-in History, Optimized Presence, Typing Indicators, Reactions
// Ultra-fast channel switching with intelligent caching

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatClient, Room, Message as AblyChatMessage, OrderBy } from '@ably/chat'
import * as Ably from 'ably'

interface NetworkMessage {
  id?: string
  userId: string
  userName: string
  userProfileImage?: string
  content: string
  timestamp: number
  topic?: string
  isOptimistic?: boolean
  replacesOptimistic?: string
  ablySerial?: string // Ably message serial for reactions
}

interface UseAblyChatSDKOptions {
  userId: string
  channelName: string // e.g., "channel:general" or "dm:user1-user2"
  onMessage?: (message: NetworkMessage) => void
  onPresence?: (presence: { type: 'enter' | 'leave'; userId: string }) => void
  onTyping?: (typingUsers: string[]) => void
  onRoomReaction?: (reaction: { name: string; userId: string; timestamp: number }) => void
  onMessageReaction?: (event: { messageSerial: string; summary: any }) => void
  onConnectionStateChange?: (state: Ably.ConnectionState) => void
  enabled?: boolean // Allow disabling the hook
}

export function useAblyChatSDK({
  userId,
  channelName,
  onMessage,
  onPresence,
  onTyping,
  onRoomReaction,
  onMessageReaction,
  onConnectionStateChange,
  enabled = true,
}: UseAblyChatSDKOptions) {
  const [connected, setConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<Ably.ConnectionState>('initialized')
  const [channelReady, setChannelReady] = useState(false)
  const [presence, setPresence] = useState<string[]>([])
  const [typing, setTyping] = useState<string[]>([])

  const chatClientRef = useRef<ChatClient | null>(null)
  const realtimeClientRef = useRef<Ably.Realtime | null>(null)
  const currentRoomRef = useRef<Room | null>(null)
  const currentRoomNameRef = useRef<string>('')
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const seenMessageIds = useRef<Set<string>>(new Set())
  const isInitialMount = useRef(true)

  // Store callbacks in refs to prevent effect re-runs
  const onMessageRef = useRef(onMessage)
  const onPresenceRef = useRef(onPresence)
  const onTypingRef = useRef(onTyping)
  const onRoomReactionRef = useRef(onRoomReaction)
  const onMessageReactionRef = useRef(onMessageReaction)

  useEffect(() => {
    onMessageRef.current = onMessage
    onPresenceRef.current = onPresence
    onTypingRef.current = onTyping
    onRoomReactionRef.current = onRoomReaction
    onMessageReactionRef.current = onMessageReaction
  }, [onMessage, onPresence, onTyping, onRoomReaction, onMessageReaction])

  // Initialize ChatClient once
  useEffect(() => {
    if (!enabled || !userId || userId === 'anonymous') return

    const initChatClient = async () => {
      try {
        console.log('🚀 [ABLY-CHAT] Initializing Chat SDK for user:', userId)

        // Create base Realtime client with token auth
        const realtimeClient = new Ably.Realtime({
          authUrl: `/api/ably/auth?clientId=${userId}`,
          authMethod: 'GET',
          recover: (lastConnectionDetails, callback) => {
            console.log('🔄 [ABLY-CHAT] Attempting connection recovery')
            callback(true)
          },
          disconnectedRetryTimeout: 3000,
          suspendedRetryTimeout: 10000,
        })

        // Monitor connection state
        realtimeClient.connection.on((stateChange) => {
          const state = stateChange.current
          console.log(`🔌 [ABLY-CHAT] Connection: ${stateChange.previous} → ${state}`)
          setConnectionState(state)
          onConnectionStateChange?.(state)

          if (state === 'connected') {
            setConnected(true)
          } else if (state === 'disconnected' || state === 'suspended' || state === 'failed') {
            setConnected(false)
            setChannelReady(false)
          }
        })

        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 15000)
          realtimeClient.connection.once('connected', () => {
            clearTimeout(timeout)
            resolve(null)
          })
          realtimeClient.connection.once('failed', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        })

        console.log('✅ [ABLY-CHAT] Connected, initializing Chat SDK')

        // Store Realtime client for cleanup
        realtimeClientRef.current = realtimeClient

        // Create ChatClient from Realtime client
        const chatClient = new ChatClient(realtimeClient)
        chatClientRef.current = chatClient

        console.log('✅ [ABLY-CHAT] Chat SDK initialized')

      } catch (error) {
        console.error('❌ [ABLY-CHAT] Initialization failed:', error)
        setConnected(false)
        setConnectionState('failed')
      }
    }

    initChatClient()

    return () => {
      console.log('🔌 [ABLY-CHAT] Cleaning up Chat SDK')
      if (currentRoomRef.current && chatClientRef.current && currentRoomNameRef.current) {
        chatClientRef.current.rooms.release(currentRoomNameRef.current).catch(console.error)
        currentRoomRef.current = null
        currentRoomNameRef.current = ''
      }
      chatClientRef.current = null
      if (realtimeClientRef.current) {
        // Close the Realtime client
        realtimeClientRef.current.close()
        realtimeClientRef.current = null
      }
      seenMessageIds.current.clear()
    }
  }, [enabled, userId, onConnectionStateChange])

  // Handle room switching with Chat SDK
  useEffect(() => {
    if (!chatClientRef.current || !channelName || !enabled || !connected) {
      console.log('⏭️ [ABLY-CHAT] Skipping room switch - not ready', {
        hasClient: !!chatClientRef.current,
        channelName,
        enabled,
        connected,
      })
      return
    }

    const chatClient = chatClientRef.current
    let isCancelled = false
    let switchTimeout: NodeJS.Timeout

    const switchRoom = async () => {
      // Debounce room switches
      if (!isInitialMount.current) {
        await new Promise(resolve => {
          switchTimeout = setTimeout(resolve, 100)
        })
      }
      isInitialMount.current = false

      if (isCancelled) return

      // Release old room
      if (currentRoomRef.current && currentRoomNameRef.current && currentRoomNameRef.current !== channelName) {
        console.log('🔄 [ABLY-CHAT] Releasing room:', currentRoomNameRef.current)
        try {
          await chatClient.rooms.release(currentRoomNameRef.current)
        } catch (err) {
          console.warn('⚠️ [ABLY-CHAT] Error releasing room:', err)
        }

        // Clear seen messages for new room
        seenMessageIds.current.clear()
        console.log('🧹 [ABLY-CHAT] Cleared seen message IDs')
      }

      if (isCancelled) return

      try {
        // Get or create room using Chat SDK (reactions are enabled by default)
        console.log('🔄 [ABLY-CHAT] Getting room:', channelName)
        const room = await chatClient.rooms.get(channelName)
        currentRoomRef.current = room
        currentRoomNameRef.current = channelName

        // Attach to room (handles channel lifecycle automatically)
        await room.attach()
        console.log('✅ [ABLY-CHAT] Room attached:', channelName)
        setChannelReady(true)

        if (isCancelled) return

        // Subscribe to messages using Chat SDK's optimized API
        const { unsubscribe: unsubscribeMessages } = room.messages.subscribe((messageEvent) => {
          const message = messageEvent.message

          // Use actual message ID from metadata or serial for deduplication
          const metadata = message.metadata || {}
          const actualMessageId = String(metadata.id || message.serial)

          console.log('🔔 [ABLY-CHAT] Raw message event received:', {
            serial: message.serial,
            clientId: message.clientId,
            actualMessageId,
            text: message.text?.substring(0, 50),
            metadata: message.metadata
          })

          // Prevent duplicates using actual message ID
          if (actualMessageId && seenMessageIds.current.has(actualMessageId)) {
            console.log('⏭️ [ABLY-CHAT] Skipping duplicate:', actualMessageId)
            return
          }

          if (actualMessageId) {
            seenMessageIds.current.add(actualMessageId)
          }

          // Parse message metadata from Chat SDK format (already extracted above)
          const messageData: NetworkMessage = {
            id: actualMessageId,
            userId: String(metadata.userId || message.clientId || 'unknown'),
            userName: String(metadata.userName || 'Unknown'),
            userProfileImage: metadata.userProfileImage ? String(metadata.userProfileImage) : undefined,
            content: typeof message.text === 'string' ? message.text : '',
            timestamp: message.timestamp.getTime(),
            topic: metadata.topic ? String(metadata.topic) : undefined,
            ablySerial: message.serial, // Store Ably serial for reactions
          }

          console.log('📨 [ABLY-CHAT] Parsed message data:', messageData)
          console.log('📤 [ABLY-CHAT] Calling onMessage callback...')
          onMessageRef.current?.(messageData)
        })

        // Subscribe to presence using Chat SDK's optimized presence
        const { unsubscribe: unsubscribePresence } = room.presence.subscribe((presenceEvent) => {
          const member = presenceEvent.member

          if (presenceEvent.type === 'enter' || presenceEvent.type === 'present' || presenceEvent.type === 'update') {
            console.log('👋 [ABLY-CHAT] User entered:', member.clientId)
            setPresence(prev => {
              if (prev.includes(member.clientId)) return prev
              return [...prev, member.clientId]
            })
            if (presenceEvent.type === 'enter') {
              onPresenceRef.current?.({ type: 'enter', userId: member.clientId })
            }
          } else if (presenceEvent.type === 'leave') {
            console.log('👋 [ABLY-CHAT] User left:', member.clientId)
            setPresence(prev => prev.filter(id => id !== member.clientId))
            onPresenceRef.current?.({ type: 'leave', userId: member.clientId })
          }
        })

        // Enter presence
        await room.presence.enter()
        console.log('✅ [ABLY-CHAT] Entered presence')

        // Get current presence members
        const members = await room.presence.get()
        const memberIds = members.map(m => m.clientId)
        setPresence(memberIds)

        // Subscribe to typing indicators using Chat SDK's optimized typing
        const { unsubscribe: unsubscribeTyping } = room.typing.subscribe((typingEvent) => {
          setTyping(Array.from(typingEvent.currentlyTyping))
          onTypingRef.current?.(Array.from(typingEvent.currentlyTyping))
        })

        // Subscribe to room-level reactions (like 🎉 for celebrating)
        const { unsubscribe: unsubscribeReactions } = room.reactions.subscribe((reactionEvent: any) => {
          console.log('🎉 [ABLY-CHAT] Room reaction:', reactionEvent.reaction)
          onRoomReactionRef.current?.({
            name: reactionEvent.reaction.type,
            userId: reactionEvent.clientId,
            timestamp: reactionEvent.reaction.createdAt.getTime()
          })
        })

        // Subscribe to message-level reactions (like ❤️ on specific messages)
        const { unsubscribe: unsubscribeMessageReactions } = room.messages.reactions.subscribe((reactionEvent) => {
          console.log('💖 [ABLY-CHAT] Message reaction:', reactionEvent)
          onMessageReactionRef.current?.({
            messageSerial: reactionEvent.messageSerial,
            summary: reactionEvent.summary
          })
        })

        // Store cleanup functions
        return () => {
          unsubscribeMessages()
          unsubscribePresence()
          unsubscribeTyping()
          unsubscribeReactions()
          unsubscribeMessageReactions()
        }

      } catch (error) {
        console.error('❌ [ABLY-CHAT] Room switch failed:', error)
        setChannelReady(false)
      }
    }

    let cleanup: (() => void) | undefined

    switchRoom().then(fn => {
      cleanup = fn
    }).catch(err => {
      console.error('❌ [ABLY-CHAT] Switch room error:', err)
    })

    return () => {
      isCancelled = true
      clearTimeout(switchTimeout)
      setChannelReady(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      cleanup?.()
    }
  }, [channelName, enabled, connected])

  // Send message using Chat SDK
  const sendMessage = useCallback(async (content: string, metadata?: any) => {
    if (!currentRoomRef.current) {
      console.error('❌ [ABLY-CHAT] Room not initialized')
      return false
    }

    const room = currentRoomRef.current

    // Check if room is attached
    if (room.status !== 'attached') {
      console.warn('⚠️ [ABLY-CHAT] Room not attached, waiting...')
      try {
        await room.attach()
      } catch (err) {
        console.error('❌ [ABLY-CHAT] Room attach failed:', err)
        return false
      }
    }

    // Validate message size before sending (Ably limit is 65KB)
    const messagePayload = {
      text: content,
      metadata: {
        userId,
        timestamp: Date.now(),
        ...metadata,
      },
    }
    const payloadSize = new Blob([JSON.stringify(messagePayload)]).size
    const MAX_ABLY_SIZE = 60000 // 60KB safety margin (Ably limit is 65536)

    if (payloadSize > MAX_ABLY_SIZE) {
      console.error('❌ [ABLY-CHAT] Message too large:', {
        size: payloadSize,
        limit: MAX_ABLY_SIZE,
        content: content.substring(0, 50),
        metadata: Object.keys(metadata || {})
      })
      throw new Error(`Message too large (${Math.floor(payloadSize / 1024)}KB). Maximum is ${Math.floor(MAX_ABLY_SIZE / 1024)}KB`)
    }

    console.log('📦 [ABLY-CHAT] Message size:', payloadSize, 'bytes')
    console.log('📡 [ABLY-CHAT] Sending message payload:', {
      textLength: content.length,
      metadata: messagePayload.metadata,
      room: currentRoomNameRef.current
    })

    try {
      // Send message using Chat SDK's optimized send API
      await room.messages.send(messagePayload)
      console.log('✅ [ABLY-CHAT] Message sent successfully to room:', currentRoomNameRef.current)
      return true
    } catch (error: any) {
      // Handle rate limits
      if (error.code === 40005) {
        console.warn('⚠️ [ABLY-CHAT] Rate limit, retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
          await room.messages.send(messagePayload)
          console.log('✅ [ABLY-CHAT] Message sent (retry)')
          return true
        } catch (retryError) {
          console.error('❌ [ABLY-CHAT] Retry failed:', retryError)
          return false
        }
      }
      console.error('❌ [ABLY-CHAT] Send failed:', error)
      return false
    }
  }, [userId])

  // Send typing indicator using Chat SDK
  const sendTyping = useCallback(async (isTyping: boolean) => {
    if (!currentRoomRef.current) return

    try {
      const room = currentRoomRef.current
      if (isTyping) {
        // Call keystroke() to indicate user is typing
        await room.typing.keystroke()
        console.log('⌨️ [ABLY-CHAT] Typing started')
      } else {
        // Call stop() to indicate user stopped typing
        await room.typing.stop()
        console.log('⌨️ [ABLY-CHAT] Typing stopped')
      }
    } catch (error) {
      console.error('❌ [ABLY-CHAT] Typing indicator failed:', error)
    }
  }, [])

  // Get message history using Chat SDK (better than manual history API)
  const getHistory = useCallback(async (limit: number = 50): Promise<NetworkMessage[]> => {
    if (!currentRoomRef.current) {
      console.error('❌ [ABLY-CHAT] Room not initialized')
      return []
    }

    try {
      const room = currentRoomRef.current

      // Use messages.history() with proper parameters
      const result = await room.messages.history({
        limit,
        orderBy: OrderBy.NewestFirst,
      })

      console.log('📜 [ABLY-CHAT] Fetched history:', result.items.length, 'messages')

      // Convert Ably messages to NetworkMessage format
      return result.items.map((msg: any) => {
        const metadata = msg.metadata || {}
        return {
          id: String(metadata.id || msg.serial),
          userId: String(metadata.userId || msg.clientId || 'unknown'),
          userName: String(metadata.userName || 'Unknown'),
          userProfileImage: metadata.userProfileImage ? String(metadata.userProfileImage) : undefined,
          content: typeof msg.text === 'string' ? msg.text : '',
          timestamp: msg.timestamp.getTime(),
          topic: metadata.topic ? String(metadata.topic) : undefined,
        }
      })
    } catch (error) {
      console.error('❌ [ABLY-CHAT] Failed to get history:', error)
      return []
    }
  }, [])

  // Send room-level reaction (like "🎉" for celebrating in the whole room)
  const sendRoomReaction = useCallback(async (reactionName: string) => {
    if (!currentRoomRef.current) {
      console.error('❌ [ABLY-CHAT] Room not initialized')
      return false
    }

    try {
      await currentRoomRef.current.reactions.send({ name: reactionName })
      console.log('✅ [ABLY-CHAT] Room reaction sent:', reactionName)
      return true
    } catch (error) {
      console.error('❌ [ABLY-CHAT] Failed to send room reaction:', error)
      return false
    }
  }, [])

  // Send message reaction (like ❤️ on a specific message)
  const sendMessageReaction = useCallback(async (messageSerial: string, reactionName: string) => {
    if (!currentRoomRef.current) {
      console.error('❌ [ABLY-CHAT] Room not initialized')
      return false
    }

    try {
      await currentRoomRef.current.messages.reactions.send(messageSerial, { name: reactionName })
      console.log('✅ [ABLY-CHAT] Message reaction sent:', reactionName, 'to:', messageSerial)
      return true
    } catch (error) {
      console.error('❌ [ABLY-CHAT] Failed to send message reaction:', error)
      return false
    }
  }, [])

  // Delete message reaction
  const deleteMessageReaction = useCallback(async (messageSerial: string, reactionName: string) => {
    if (!currentRoomRef.current) {
      console.error('❌ [ABLY-CHAT] Room not initialized')
      return false
    }

    try {
      await currentRoomRef.current.messages.reactions.delete(messageSerial, { name: reactionName })
      console.log('✅ [ABLY-CHAT] Message reaction deleted:', reactionName, 'from:', messageSerial)
      return true
    } catch (error) {
      console.error('❌ [ABLY-CHAT] Failed to delete message reaction:', error)
      return false
    }
  }, [])

  return {
    connected,
    connectionState,
    channelReady,
    presence,
    typing,
    sendMessage,
    sendTyping,
    getHistory, // New feature: access to message history
    sendRoomReaction, // New feature: send room-level reactions
    sendMessageReaction, // New feature: send per-message reactions
    deleteMessageReaction, // New feature: delete per-message reactions
  }
}
