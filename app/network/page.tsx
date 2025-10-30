'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Send, Search, Users, MessageSquare, Check, CheckCheck, Hash, Video, Code, TrendingUp, Zap, HelpCircle, Heart, MessageCircle, ThumbsUp, Bell, ArrowLeft, Menu, X, ArrowUp, Plus, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { UserProfileModal } from '@/components/profile/UserProfileModal'
import { MarbleBackground } from '@/components/ui/MarbleBackground'
import { NotificationBanner } from '@/components/notifications/NotificationBanner'
import { useNotifications } from '@/hooks/useNotifications'
import { useAblyChatSDK } from '@/hooks/useAblyChatSDK'

interface Post {
  id: string
  userId: string
  userName: string
  userProfileImage?: string | null
  content: string
  createdAt: Date
  topic?: string
  likes: number
  commentsCount: number
  ablySerial?: string // Ably message serial for reactions
  replyTo?: {
    id: string
    userName: string
    content: string
  }
}

interface User {
  id: string
  name: string
  profileImage?: string | null
  headline?: string | null
  isAdmin?: boolean
}

interface Conversation {
  userId: string
  userName: string
  userProfileImage?: string | null
  userHeadline?: string | null
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status?: 'online' | 'offline' | 'dnd'
}

interface DirectMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: string
  createdAt: Date
  senderName?: string
  senderProfileImage?: string | null
  read?: boolean
}

interface Channel {
  id: string
  name: string
  icon: string
  topic: string
  description: string
}

interface Notification {
  id: number
  type: string
  content: string
  metadata: any
  read: boolean
  createdAt: Date
}

const CHANNEL_ICONS: Record<string, any> = {
  general: Hash,
  'ai-video': Video,
  'vibe-coding': Code,
  marketing: TrendingUp,
  automation: Zap,
  help: HelpCircle
}

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', icon: 'general', topic: '', description: 'General discussions' },
  { id: 'ai-video', name: 'ai video', icon: 'ai-video', topic: 'AI Video', description: 'AI video creation' },
  { id: 'vibe-coding', name: 'vibe coding', icon: 'vibe-coding', topic: 'Vibe Coding', description: 'Coding discussions' },
  { id: 'marketing', name: 'marketing', icon: 'marketing', topic: 'Marketing', description: 'Marketing strategies' },
  { id: 'automation', name: 'automation', icon: 'automation', topic: 'Automation', description: 'Workflow automation' },
  { id: 'help', name: 'help', icon: 'help', topic: 'Help', description: 'Get help' }
]

export default function NetworkPage() {
  const { isAuthenticated, user, signup } = useAuth()
  const { sendNotification } = useNotifications()
  const [viewMode, setViewMode] = useState<'channels' | 'dm' | 'notifications'>('channels')
  const [activeChannel, setActiveChannel] = useState('general')
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  // Per-channel state to prevent cross-channel message bleeding
  const [channelPosts, setChannelPosts] = useState<Record<string, Post[]>>({})
  const posts = channelPosts[activeChannel] || []
  const setPosts = (updater: Post[] | ((prev: Post[]) => Post[])) => {
    setChannelPosts(prev => ({
      ...prev,
      [activeChannel]: typeof updater === 'function' ? updater(prev[activeChannel] || []) : updater
    }))
  }

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({})
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Request deduplication and abort control
  const loadingPostsRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const skipNextPollRef = useRef(false) // Skip next poll after sending message
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [pendingPostIds, setPendingPostIds] = useState<Set<string>>(new Set())
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [messageReactions, setMessageReactions] = useState<Record<string, any>>({})
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 })
  const [replyingTo, setReplyingTo] = useState<Post | null>(null)

  // Generate a unique session ID for this tab (persists across component re-renders)
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Ably Chat SDK for ultra-fast real-time messaging with optimized room management
  const ablyHookResult = useAblyChatSDK({
    userId: user?.id || 'anonymous',
    channelName: `channel:${activeChannel}`,
    enabled: !!user?.id && isAuthenticated, // Only enable when authenticated
    onMessage: (message) => {
      if (!user?.id) return // Ignore messages if not authenticated

      console.log('📨 [ABLY-CHAT] Received message:', message)

      // Skip messages from THIS specific tab/session (not just same user)
      // This allows same user in multiple tabs to see messages
      const messageSessionId = (message as any).sessionId
      if (messageSessionId && messageSessionId === sessionIdRef.current) {
        console.log('⏭️ [ABLY-CHAT] Skipping own message from this tab (already in UI via optimistic update)')
        return
      }

      console.log('✅ [ABLY-CHAT] Message is from different tab/user, adding to UI')

      // Add new message from other users
      // Lookup user profile from local state if not in message (optimization)
      const senderUser = allUsers.find(u => u.id === message.userId)

      const newPost: Post = {
        id: message.id || `ably-${Date.now()}`,
        userId: message.userId,
        userName: message.userName,
        // Use local user data if available, fallback to message data
        userProfileImage: senderUser?.profileImage || message.userProfileImage,
        content: message.content,
        createdAt: new Date(message.timestamp),
        topic: message.topic,
        likes: 0,
        commentsCount: 0,
        ablySerial: message.ablySerial,
        replyTo: (message as any).replyTo // Parse reply metadata from Ably
      }

      setPosts(prev => {
        // Prevent duplicates
        if (prev.some(p => p.id === newPost.id)) {
          console.log('⏭️ [ABLY-CHAT] Skipping duplicate:', newPost.id)
          return prev
        }
        console.log('✅ [ABLY-CHAT] Adding new post from other user')
        return [...prev, newPost]
      })

      // Send browser push notification for new messages (only if user is not actively viewing)
      const channelInfo = CHANNELS.find(c => c.id === activeChannel)
      sendNotification({
        title: `New message in #${channelInfo?.name || activeChannel}`,
        body: `${message.userName}: ${message.content}`,
        tag: `channel-${activeChannel}`,
        onClick: () => {
          // Navigate to the channel when notification is clicked
          setViewMode('channels')
          setActiveChannel(activeChannel)
        }
      })

      // Auto-scroll for new messages from others
      if (isNearBottom) {
        setTimeout(() => scrollToBottom('smooth'), 100)
      }
    },
    onPresence: (presenceEvent) => {
      console.log('👋 [ABLY-CHAT] Presence event:', presenceEvent)
    },
    onTyping: (typingUsers) => {
      console.log('⌨️ [ABLY-CHAT] Typing users:', typingUsers)
    },
    onMessageReaction: (event) => {
      console.log('💖 [ABLY-CHAT] Message reaction event:', event)
      // Update message reactions in state
      setMessageReactions(prev => ({
        ...prev,
        [event.messageSerial]: event.summary
      }))
    }
  })

  const {
    connected: ablyConnected,
    channelReady,
    sendMessage: sendAblyMessage,
    presence,
    typing,
    sendTyping,
    getHistory,
    sendMessageReaction,
    deleteMessageReaction
  } = ablyHookResult

  // Load users once on mount, not on every state change
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    loadUsers()
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    console.log(`🔄 [VIEW-CHANGE] viewMode: ${viewMode}, activeChannel: ${activeChannel}, activeConversation: ${activeConversation}`)
    console.log(`📊 [STATE] Current posts in channelPosts[${activeChannel}]:`, channelPosts[activeChannel]?.length || 0)

    if (viewMode === 'channels') {
      console.log(`📢 [CHANNEL-SWITCH] Switching to channel: ${activeChannel}`)

      // ALWAYS reload from database to ensure fresh data
      // Even if we have cached posts, they may be stale
      console.log(`🔄 [CACHE-INVALIDATE] Reloading channel ${activeChannel} from database`)
      setLoading(true)

      loadPosts()
      loadChannelCounts()

      // REAL-TIME via Ably WebSocket only (no polling fallback)
      // Ably handles reconnection automatically
      console.log('✅ [ABLY] Using WebSocket for real-time updates (no polling)')

      // Listen for visibility changes to refresh when tab becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadPosts(true) // Refresh immediately when tab becomes visible
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    } else if (viewMode === 'dm') {
      loadConversations()
      if (activeConversation) {
        loadDirectMessages(activeConversation)
      }
    } else if (viewMode === 'notifications') {
      loadNotifications()
    }
  }, [isAuthenticated, user?.id, viewMode, activeChannel, activeConversation])

  // Poll notifications with smart backoff
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    loadNotifications()

    const interval = setInterval(() => {
      // Pause polling when tab is hidden
      if (!document.hidden) {
        loadNotifications()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id])

  // Poll DMs for ULTRA-FAST real-time updates (500ms)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || viewMode !== 'dm' || !activeConversation) return

    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}&otherUserId=${activeConversation}&limit=50`)
        if (res.ok) {
          const messages = await res.json()
          setDirectMessages(prev => {
            // Keep temp messages, merge with real messages
            const tempMessages = prev.filter(m => String(m.id).startsWith('temp-'))
            const realMessages = messages.filter((m: DirectMessage) => !String(m.id).startsWith('temp-'))

            // Remove temp messages that match real messages (within 5 seconds)
            const dedupedTemp = tempMessages.filter(temp => {
              const exists = realMessages.find((real: DirectMessage) =>
                real.senderId === temp.senderId &&
                real.content === temp.content &&
                Math.abs(new Date(real.createdAt).getTime() - new Date(temp.createdAt).getTime()) < 5000
              )
              return !exists
            })

            return [...realMessages, ...dedupedTemp]
          })
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }

    // Poll every 500ms for instant DM delivery
    const interval = setInterval(pollMessages, 500)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, viewMode, activeConversation])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users/all')
      if (res.ok) setAllUsers(await res.json())
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadConversations = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/messages?userId=${user.id}`)
      if (res.ok) setConversations(await res.json())
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadDirectMessages = async (otherUserId: string) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/messages?userId=${user.id}&otherUserId=${otherUserId}&limit=50`)
      if (res.ok) {
        setDirectMessages(await res.json())
        // Clear loading first, then scroll after DOM updates
        setTimeout(() => {
          setLoading(false)
          // Wait for loading skeleton to clear, then scroll with multiple RAF
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(() => scrollToBottom('auto'), 200)
              })
            })
          })
        }, 100)
      }
    } catch (error) {
      console.error('Error loading direct messages:', error)
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        const currentUnreadCount = data.filter((n: Notification) => !n.read).length

        // Check if there are NEW unread notifications
        if (currentUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
          // Find the new unread notifications
          const newNotifications = data
            .filter((n: Notification) => !n.read)
            .slice(0, currentUnreadCount - previousUnreadCount)

          // Send browser notification for each new one
          newNotifications.forEach((notification: Notification) => {
            let notificationTitle = 'New Notification'
            let notificationBody = notification.content
            let tag = `notification-${notification.id}`

            // Customize based on notification type
            if (notification.type === 'message') {
              notificationTitle = 'New Direct Message'
              tag = 'dm-notification'
            } else if (notification.type === 'mention') {
              notificationTitle = 'You were mentioned'
              tag = 'mention-notification'
            } else if (notification.type === 'reaction') {
              notificationTitle = 'Someone reacted to your post'
              tag = 'reaction-notification'
            } else if (notification.type === 'comment') {
              notificationTitle = 'New comment on your post'
              tag = 'comment-notification'
            }

            sendNotification({
              title: notificationTitle,
              body: notificationBody,
              tag,
              onClick: () => {
                // Navigate to the notification when clicked
                setViewMode('notifications')
                if (notification.metadata?.channelId) {
                  setViewMode('channels')
                  setActiveChannel(notification.metadata.channelId)
                } else if (notification.metadata?.userId) {
                  setViewMode('dm')
                  setActiveConversation(notification.metadata.userId)
                }
              }
            })
          })
        }

        setNotifications(data)
        setUnreadCount(currentUnreadCount)
        setPreviousUnreadCount(currentUnreadCount)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const loadChannelCounts = async () => {
    try {
      // Use new batch endpoint - single call instead of 6 sequential calls
      const res = await fetch('/api/channels/metrics')
      if (res.ok) {
        const counts = await res.json()
        setChannelCounts(counts)
      }
    } catch (error) {
      console.error('Error loading channel counts:', error)
    }
  }

  const loadPosts = async (silent = false) => {
    const startTime = Date.now()
    // CRITICAL FIX: Capture channel at function start to prevent stale closure bug
    const targetChannel = activeChannel
    console.log(`🚀 [LOAD-POSTS] Starting loadPosts for channel: ${targetChannel}, silent: ${silent}`)

    // Prevent concurrent requests (fixes race condition)
    if (loadingPostsRef.current) {
      console.log('⏭️  [POSTS] Skipping concurrent request')
      return
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      console.log('🚫 [POSTS] Aborting previous request')
      abortControllerRef.current.abort()
    }

    loadingPostsRef.current = true
    if (!silent) setLoading(true)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const channel = CHANNELS.find(c => c.id === targetChannel)
      const url = channel?.topic
        ? `/api/posts-fast?limit=50&topic=${encodeURIComponent(channel.topic)}`
        : '/api/posts-fast?limit=50'

      console.log(`📡 [API-CALL] Fetching: ${url}`)
      console.log(`📋 [CHANNEL-INFO] Channel: ${channel?.name}, Topic: ${channel?.topic || 'NULL (general)'}`)

      const res = await fetch(url, {
        signal: abortController.signal,
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error(`❌ [API-ERROR] Status: ${res.status}, URL: ${url}`)
        throw new Error('Failed to fetch posts')
      }

      const data = await res.json()
      const postsArray = Array.isArray(data) ? data : []

      // CRITICAL: API returns newest first (DESC), but UI needs oldest first
      // Reverse the array so oldest messages appear at top, newest at bottom
      const postsInChronologicalOrder = [...postsArray].reverse()

      console.log(`✅ [API-SUCCESS] Received ${postsArray.length} posts in ${Date.now() - startTime}ms`)
      console.log(`📦 [RAW-DATA] First post topic:`, postsInChronologicalOrder[0]?.topic, 'User:', postsInChronologicalOrder[0]?.userName)

      // CRITICAL FIX: Verify we're still on the same channel before updating state
      if (targetChannel !== activeChannel) {
        console.log(`⏭️ [POSTS] Channel changed during fetch (${targetChannel} → ${activeChannel}), discarding results`)
        if (!silent) setLoading(false)
        return
      }

      // Track temp IDs that need to be removed
      const idsToRemove = new Set<string>()

      // Smart merge with deduplication (prevents flicker and duplicates)
      // Use setChannelPosts directly with captured targetChannel to avoid stale closure
      setChannelPosts(prevChannelPosts => {
        const prev = prevChannelPosts[targetChannel] || []
        console.log(`🔀 [MERGE] Previous posts in state for ${targetChannel}:`, prev.length)

        // Separate temp (optimistic) and real server posts
        const pendingPosts = prev.filter(p => String(p.id).startsWith('temp-') || String(p.id).startsWith('opt-'))
        const serverPosts = postsInChronologicalOrder.filter(p => !String(p.id).startsWith('temp-') && !String(p.id).startsWith('opt-'))

        console.log(`⏳ [MERGE] Temp posts: ${pendingPosts.length}, Server posts: ${serverPosts.length}`)

        // Create deduplication map: match temp posts to real posts by content + userId + time proximity
        const dedupedPending = pendingPosts.filter(tempPost => {
          // Check if this temp post now exists as a real post
          const matchingRealPost = serverPosts.find(realPost =>
            realPost.userId === tempPost.userId &&
            realPost.content === tempPost.content &&
            Math.abs(new Date(realPost.createdAt).getTime() - new Date(tempPost.createdAt).getTime()) < 5000 // Within 5 seconds
          )

          // If we found a match, mark temp ID for removal
          if (matchingRealPost) {
            idsToRemove.add(tempPost.id)
          }

          // Keep temp post only if no matching real post found
          return !matchingRealPost
        })

        const finalPosts = [...serverPosts, ...dedupedPending]
        console.log(`✨ [MERGE-RESULT] Final posts for ${targetChannel}: ${finalPosts.length} (${serverPosts.length} server + ${dedupedPending.length} temp)`)

        // Return updated channel posts with correct channel key
        return {
          ...prevChannelPosts,
          [targetChannel]: finalPosts
        }
      })

      // Clean up pendingPostIds after state update
      if (idsToRemove.size > 0) {
        setPendingPostIds(prev => {
          const newSet = new Set(prev)
          idsToRemove.forEach(id => newSet.delete(id))
          return newSet
        })
      }

      // Clear loading first, then scroll after DOM updates
      if (!silent) {
        setTimeout(() => {
          setLoading(false)
          // Wait for loading skeleton to clear, then scroll
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(() => scrollToBottom('auto'), 200)
              })
            })
          })
        }, 100)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[POSTS] Request aborted')
      } else {
        console.error('Error loading posts:', err)
      }
      if (!silent) setLoading(false)
    } finally {
      loadingPostsRef.current = false
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user?.id || sending) return

    const content = inputValue.trim()

    // ADMIN SLASH COMMANDS - Check if message is a command
    if (content.startsWith('/') && user.isAdmin) {
      const parts = content.split(' ')
      const command = parts[0].toLowerCase()

      setSending(true)
      try {
        if (command === '/mute') {
          // /mute @username [duration] [reason]
          const username = parts[1]?.replace('@', '')
          const duration = parts[2] && !isNaN(Number(parts[2])) ? Number(parts[2]) : null
          const reason = parts.slice(duration ? 3 : 2).join(' ') || 'No reason provided'

          if (!username) {
            alert('Usage: /mute @username [duration_in_minutes] [reason]')
            setSending(false)
            return
          }

          const targetUser = allUsers.find(u => u.name.toLowerCase() === username.toLowerCase())
          if (!targetUser) {
            alert(`User @${username} not found`)
            setSending(false)
            return
          }

          const res = await fetch('/api/admin/mute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminId: user.id,
              targetUserId: targetUser.id,
              topic: viewMode === 'channels' ? CHANNELS.find(c => c.id === activeChannel)?.topic : null,
              reason,
              duration
            })
          })

          if (res.ok) {
            const durationText = duration ? ` for ${duration} minutes` : ' permanently'
            alert(`✅ Muted @${targetUser.name}${durationText}`)
            setInputValue('')
            setMutedUserIds(prev => new Set([...prev, targetUser.id]))
          } else {
            alert('Failed to mute user')
          }

        } else if (command === '/unmute') {
          // /unmute @username
          const username = parts[1]?.replace('@', '')

          if (!username) {
            alert('Usage: /unmute @username')
            setSending(false)
            return
          }

          const targetUser = allUsers.find(u => u.name.toLowerCase() === username.toLowerCase())
          if (!targetUser) {
            alert(`User @${username} not found`)
            setSending(false)
            return
          }

          const topic = viewMode === 'channels' ? CHANNELS.find(c => c.id === activeChannel)?.topic : null
          const res = await fetch(`/api/admin/mute?adminId=${user.id}&targetUserId=${targetUser.id}${topic ? `&topic=${topic}` : ''}`, {
            method: 'DELETE'
          })

          if (res.ok) {
            alert(`✅ Unmuted @${targetUser.name}`)
            setInputValue('')
            setMutedUserIds(prev => {
              const newSet = new Set(prev)
              newSet.delete(targetUser.id)
              return newSet
            })
          } else {
            alert('Failed to unmute user')
          }

        } else if (command === '/clear') {
          // /clear - Clear all messages in current channel
          if (viewMode !== 'channels') {
            alert('/clear only works in channels')
            setSending(false)
            return
          }

          if (!confirm('Are you sure you want to clear all messages in this channel? This cannot be undone.')) {
            setSending(false)
            return
          }

          const topic = CHANNELS.find(c => c.id === activeChannel)?.topic
          const res = await fetch(`/api/admin/clear?adminId=${user.id}${topic ? `&topic=${topic}` : ''}`, {
            method: 'DELETE'
          })

          if (res.ok) {
            setPosts([])
            alert('✅ Channel cleared')
            setInputValue('')
          } else {
            alert('Failed to clear channel')
          }

        } else {
          alert(`Unknown command: ${command}. Available: /mute, /unmute, /clear`)
        }
      } catch (error) {
        console.error('Command error:', error)
        alert('Command failed')
      }
      setSending(false)
      return
    }

    // Check if user is muted (channels only)
    if (viewMode === 'channels') {
      const topic = CHANNELS.find(c => c.id === activeChannel)?.topic
      try {
        const muteCheck = await fetch(`/api/admin/mute?userId=${user.id}${topic ? `&topic=${topic}` : ''}`)
        if (muteCheck.ok) {
          const { isMuted, mutes } = await muteCheck.json()
          if (isMuted && mutes.length > 0) {
            const mute = mutes[0]
            const expiresText = mute.expiresAt
              ? ` until ${new Date(mute.expiresAt).toLocaleString()}`
              : ' permanently'
            alert(`🔇 You are muted${expiresText}. Reason: ${mute.reason || 'No reason provided'}`)
            return
          }
        }
      } catch (error) {
        console.error('Error checking mute status:', error)
      }
    }

    // Check message size - Ably has a 65KB limit
    const messageSize = new Blob([inputValue]).size
    const MAX_MESSAGE_SIZE = 65536 // 64KB
    if (messageSize > MAX_MESSAGE_SIZE) {
      alert(`Message too large! Maximum size is ${Math.floor(MAX_MESSAGE_SIZE / 1024)}KB, your message is ${Math.floor(messageSize / 1024)}KB`)
      return
    }

    // Stop typing indicator when message is sent
    if (viewMode === 'channels') {
      sendTyping?.(false)
    }

    if (viewMode === 'dm' && !activeConversation) {
      const mentionMatch = inputValue.trim().match(/^@(\w+)\s*(.*)/)
      if (mentionMatch) {
        const mentionedUser = allUsers.find(u =>
          u.name.toLowerCase() === mentionMatch[1].toLowerCase()
        )
        if (mentionedUser && mentionMatch[2]) {
          setSending(true)
          try {
            const res = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderId: user.id,
                receiverId: mentionedUser.id,
                content: mentionMatch[2].trim()
              })
            })
            if (res.ok) {
              const newMessage = await res.json()
              setInputValue('')
              setActiveConversation(mentionedUser.id)

              // Set messages directly instead of loading
              setDirectMessages([{
                ...newMessage,
                senderName: user.name,
                senderProfileImage: user.profileImage
              }])

              // Add to conversations list instead of reloading
              setConversations(prev => [{
                userId: mentionedUser.id,
                userName: mentionedUser.name,
                userProfileImage: mentionedUser.profileImage,
                userHeadline: mentionedUser.headline,
                lastMessage: mentionMatch[2].trim(),
                lastMessageTime: new Date(),
                unreadCount: 0,
                status: 'offline' as const
              }, ...prev.filter(c => c.userId !== mentionedUser.id)])
            }
          } catch (err) {
            console.error('Error sending DM:', err)
          } finally {
            setSending(false)
          }
          return
        }
      }
      return
    }

    // content already declared at top of function
    setInputValue('')
    setSending(true)

    // Extract mentions from content
    const mentionMatches = content.match(/@(\w+)/g) || []
    const mentionedUserNames = mentionMatches.map(m => m.slice(1))
    const mentionedUsers = allUsers.filter(u => mentionedUserNames.includes(u.name))

    try {
      if (viewMode === 'channels') {
        // Generate ID upfront for both optimistic UI and Ably
        const timestamp = Date.now()
        const optimisticId = `opt-${timestamp}`

        const optimisticPost: Post = {
          id: optimisticId,
          userId: user.id,
          userName: user.name,
          userProfileImage: user.profileImage,
          content,
          createdAt: new Date(),
          topic: CHANNELS.find(c => c.id === activeChannel)?.topic || '',
          likes: 0,
          commentsCount: 0
        }

        // Add optimistic post to UI immediately (sender only)
        setPosts(prev => [...prev, optimisticPost])
        setPendingPostIds(prev => new Set([...prev, optimisticId]))
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

        // NOTE: We DON'T broadcast optimistic message via Ably
        // Only broadcast AFTER database confirms to prevent duplicates for other users

        // PERSISTENT: Save to database first
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            content,
            topic: CHANNELS.find(c => c.id === activeChannel)?.topic || null
          })
        })

        if (res.ok) {
          const realPost = await res.json()

          // Replace optimistic post with real database post
          const fullRealPost = {
            ...realPost,
            userName: user.name,
            userProfileImage: user.profileImage
          }

          setPosts(prev => prev.map(p => p.id === optimisticId ? fullRealPost : p))
          setPendingPostIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(optimisticId)
            return newSet
          })

          // INSTANT: Now broadcast to ALL users via Ably with the real database ID
          // Keep payload minimal - remove userProfileImage and large fields
          console.log('🔍 [ABLY-STATUS] Channel ready?', channelReady, 'Connected?', ablyConnected)
          if (channelReady) {
            console.log('📡 [ABLY-SEND] Broadcasting message to all users...')
            const sendResult = await sendAblyMessage(content, {
              id: realPost.id,
              userId: user.id, // Send userId instead of full profile
              userName: user.name,
              sessionId: sessionIdRef.current, // Include session ID to filter out echoes
              // userProfileImage removed - receivers will lookup from allUsers state or database
              topic: CHANNELS.find(c => c.id === activeChannel)?.topic || '',
              ...(replyingTo && {
                replyTo: {
                  id: replyingTo.id,
                  userName: replyingTo.userName,
                  // content removed - only essential fields to keep payload small
                }
              })
            })
            console.log('✅ [ABLY-SEND] Message broadcast result:', sendResult, 'ID:', realPost.id)
            setReplyingTo(null) // Clear reply after sending
          } else {
            console.warn('⚠️ [ABLY-SEND] Channel not ready! Message NOT broadcast via Ably')
            console.warn('⚠️ [ABLY-SEND] Connection state:', { channelReady, ablyConnected })
          }

          // Skip the next poll - we just updated with the real post
          skipNextPollRef.current = true
          console.log('✅ [SEND] Message saved to database')

          // Create notifications for mentioned users
          for (const mentionedUser of mentionedUsers) {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: mentionedUser.id,
                type: 'mention',
                content: `${user.name} mentioned you in #${activeChannel}`,
                metadata: {
                  channelId: activeChannel,
                  messageContent: content,
                  senderId: user.id,
                  senderName: user.name
                }
              })
            })
          }
        } else {
          setPosts(posts)
          setPendingPostIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(optimisticId)
            return newSet
          })
          setInputValue(content)
        }
      } else if (activeConversation) {
        // Optimistic update for DMs
        const optimisticMessage: DirectMessage = {
          id: `temp-${Date.now()}`,
          senderId: user.id,
          receiverId: activeConversation,
          content,
          type: 'text',
          createdAt: new Date(),
          senderName: user.name,
          senderProfileImage: user.profileImage,
          read: false
        }
        setDirectMessages([...directMessages, optimisticMessage])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: activeConversation,
            content
          })
        })

        if (res.ok) {
          // Get the real message from server
          const realMessage = await res.json()

          // Update messages in place instead of full reload
          setDirectMessages(prev => [
            ...prev.filter(m => !String(m.id).startsWith('temp-')),
            realMessage
          ])

          // Update conversations list locally instead of refetching
          setConversations(prev => {
            const existingConvIdx = prev.findIndex(c => c.userId === activeConversation)
            if (existingConvIdx >= 0) {
              // Update existing conversation
              const updated = [...prev]
              updated[existingConvIdx] = {
                ...updated[existingConvIdx],
                lastMessage: content,
                lastMessageTime: new Date()
              }
              // Move to top
              return [updated[existingConvIdx], ...updated.filter((_, i) => i !== existingConvIdx)]
            } else {
              // New conversation - add to top
              const otherUser = allUsers.find(u => u.id === activeConversation)
              if (otherUser) {
                return [{
                  userId: activeConversation,
                  userName: otherUser.name,
                  userProfileImage: otherUser.profileImage,
                  userHeadline: otherUser.headline,
                  lastMessage: content,
                  lastMessageTime: new Date(),
                  unreadCount: 0,
                  status: 'offline' as const
                }, ...prev]
              }
              return prev
            }
          })
        } else {
          // Revert on error
          setDirectMessages(directMessages)
          setInputValue(content)
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setInputValue(content)
      if (viewMode === 'channels') {
        setPosts(posts)
      } else {
        setDirectMessages(directMessages)
      }
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (date: Date) => {
    try {
      const messageDate = new Date(date)
      const now = new Date()
      const diffMs = now.getTime() - messageDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      // If over 1 day old, show date and time
      if (diffDays >= 1) {
        const options: Intl.DateTimeFormatOptions = {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }

        // If over 1 year old, include year
        if (diffDays >= 365) {
          options.year = 'numeric'
        }

        return messageDate.toLocaleString('en-US', options)
      }

      // Less than 1 day old, use relative time
      return formatDistanceToNow(messageDate, { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const username = part.slice(1)
        const isCurrentUser = username.toLowerCase() === user?.name.toLowerCase()
        return (
          <span
            key={i}
            className={`font-semibold ${
              isCurrentUser
                ? 'bg-blue-500/20 text-blue-400 px-1 rounded'
                : 'text-blue-400 hover:underline cursor-pointer'
            }`}
          >
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const handleLike = async (postId: string) => {
    if (!user?.id) return

    // Optimistic update
    const isLiked = likedPosts.has(postId)
    const newLikedPosts = new Set(likedPosts)
    if (isLiked) {
      newLikedPosts.delete(postId)
    } else {
      newLikedPosts.add(postId)
    }
    setLikedPosts(newLikedPosts)

    // Update post likes count optimistically
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, likes: p.likes + (isLiked ? -1 : 1) }
        : p
    ))

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, postId, type: 'like' })
      })
      if (!res.ok) {
        // Revert on error
        setLikedPosts(likedPosts)
        loadPosts(true)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert on error
      setLikedPosts(likedPosts)
      loadPosts(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Send typing indicator when user types (only for channels)
    if (viewMode === 'channels' && value.length > 0) {
      sendTyping?.(true)
    }

    // Detect @ mentions
    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1].toLowerCase())
      setMentionCursorPosition(cursorPos)
      setShowMentionDropdown(true)
    } else {
      setShowMentionDropdown(false)
      setMentionQuery('')
    }
  }

  const insertMention = (userName: string, userId: string) => {
    // If in DM mode with no active conversation, start a conversation with the mentioned user
    if (viewMode === 'dm' && !activeConversation) {
      setActiveConversation(userId)
      setInputValue('')
      setShowMentionDropdown(false)
      setMentionQuery('')
      loadDirectMessages(userId)

      // On mobile, show chat and hide sidebar
      if (isMobile) {
        setShowMobileSidebar(false)
        setShowMobileChat(true)
      }
      return
    }

    // Otherwise, just insert the mention into the text
    const textBeforeMention = inputValue.slice(0, mentionCursorPosition).replace(/@\w*$/, '')
    const textAfterCursor = inputValue.slice(mentionCursorPosition)
    const newValue = `${textBeforeMention}@${userName} ${textAfterCursor}`
    setInputValue(newValue)
    setShowMentionDropdown(false)
    setMentionQuery('')
    inputRef.current?.focus()
  }

  const filteredMentionUsers = allUsers
    .filter(u => u.id !== user?.id && u.name.toLowerCase().includes(mentionQuery))
    .slice(0, 5)

  const filteredConversations = conversations.filter(c =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll detection and auto-scroll logic
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return true
    const threshold = 150 // pixels from bottom
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    return isNear
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current

    // Method 1: Scroll container to bottom
    if (container) {
      const scrollHeight = container.scrollHeight
      const scrollTop = container.scrollTop
      console.log(`[SCROLL] Attempting scroll - height: ${scrollHeight}, current: ${scrollTop}, behavior: ${behavior}`)

      container.scrollTo({
        top: scrollHeight,
        behavior
      })
    }

    // Method 2: Scroll end marker into view (more reliable for instant scroll)
    if (messagesEndRef.current && behavior === 'auto') {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
  }

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const nearBottom = checkIfNearBottom()
      setIsNearBottom(nearBottom)
      setShowScrollButton(!nearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom AND not loading)
  useEffect(() => {
    if (isNearBottom && !loading) {
      scrollToBottom('smooth')
    }
  }, [posts.length, directMessages.length, loading])

  // Force scroll to bottom when loading completes with messages
  useEffect(() => {
    if (!loading && (posts.length > 0 || directMessages.length > 0)) {
      // Wait for DOM to fully render the messages
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom('auto')
        })
      })
    }
  }, [loading, posts.length > 0 ? posts[0]?.id : null, directMessages.length > 0 ? directMessages[0]?.id : null])

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-white opacity-50" />
            <h1 className="text-2xl font-bold text-white mb-3">Join the Network</h1>
            <p className="text-gray-400 mb-6">Connect with other learners and share your journey</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSignupClick={() => {
            setShowLoginModal(false)
            setTimeout(() => setShowOnboarding(true), 100)
          }}
        />

        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={async (userData) => {
            try {
              const success = await signup(userData.email, userData.password, userData.name)
              if (success) {
                const userRes = await fetch(`/api/users?email=${encodeURIComponent(userData.email)}`)
                if (userRes.ok) {
                  const { user } = await userRes.json()
                  await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      bio: userData.bio,
                      headline: userData.headline,
                      interests: userData.interests,
                      onboardingComplete: true
                    })
                  })
                }
                setShowOnboarding(false)
              }
            } catch (err) {
              console.error('Error completing onboarding:', err)
            }
          }}
        />
      </>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-black relative">
      <MarbleBackground />
      <NotificationBanner />
      <div className="max-w-[1800px] mx-auto md:px-4 px-2 relative z-10 h-full md:pt-20 pt-14 pb-4 md:pb-4 flex flex-col">
        <div className="md:grid md:grid-cols-12 gap-4 flex-1 flex flex-col overflow-hidden">

          {/* Sidebar - Hidden on mobile unless in sidebar view */}
          <div className={`${
            isMobile ? (showMobileSidebar || !showMobileChat ? 'flex' : 'hidden') : 'block'
          } md:col-span-3 bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 md:rounded-2xl rounded-xl md:p-4 p-3 flex-col overflow-hidden ${
            isMobile ? 'h-[calc(100vh-140px)]' : ''
          }`}>
            {/* Tab Switcher - Desktop Only */}
            <div className="hidden md:grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => setViewMode('channels')}
                className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all ${
                  viewMode === 'channels'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <Users className="inline-block w-4 h-4 mr-1" />
                Channels
              </button>
              <button
                onClick={() => setViewMode('dm')}
                className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all ${
                  viewMode === 'dm'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <MessageSquare className="inline-block w-4 h-4 mr-1" />
                Messages
              </button>
              <button
                onClick={() => setViewMode('notifications')}
                className={`relative px-3 py-2.5 rounded-lg font-medium text-xs transition-all ${
                  viewMode === 'notifications'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <Bell className="inline-block w-4 h-4 mr-1" />
                Alerts
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search (DM mode only) */}
            {viewMode === 'dm' && (
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <button
                  onClick={() => {
                    setActiveConversation(null)
                    setInputValue('@')
                    setShowMentionDropdown(true)
                    if (isMobile) {
                      setShowMobileChat(true)
                      setShowMobileSidebar(false)
                    }
                    setTimeout(() => inputRef.current?.focus(), 100)
                  }}
                  className="shrink-0 rounded-full p-2.5 bg-white text-black hover:bg-gray-100 transition-all shadow-md"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                  title="Start new chat"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Channels List */}
            {viewMode === 'channels' && (
              <div className="flex-1 overflow-y-auto space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Channels
                </div>
                {CHANNELS.map((channel) => {
                  const IconComponent = CHANNEL_ICONS[channel.id]
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannel(channel.id)
                        if (isMobile) {
                          setShowMobileChat(true)
                          setShowMobileSidebar(false)
                        }
                      }}
                      className={`group w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        activeChannel === channel.id
                          ? 'bg-zinc-800 text-white'
                          : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 flex-shrink-0 transition-all ${
                          activeChannel === channel.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{channel.name}</div>
                          <div className="text-xs text-gray-500 truncate">{channel.description}</div>
                        </div>
                        {channelCounts[channel.id] > 0 && (
                          <Badge variant="secondary" className="text-xs bg-zinc-700 text-white">
                            {channelCounts[channel.id]}
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* DM List */}
            {viewMode === 'dm' && (
              <div className="flex-1 overflow-y-auto space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Direct Messages
                </div>
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No conversations yet
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => {
                        setActiveConversation(conv.userId)
                        if (isMobile) {
                          setShowMobileChat(true)
                          setShowMobileSidebar(false)
                        }
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        activeConversation === conv.userId
                          ? 'bg-zinc-800 text-white'
                          : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="relative cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUserId(conv.userId)
                            setShowUserModal(true)
                          }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={conv.userProfileImage || undefined} />
                            <AvatarFallback>{conv.userName[0]}</AvatarFallback>
                          </Avatar>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                            conv.status === 'online' ? 'bg-green-500' : conv.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="font-medium text-sm truncate cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUserId(conv.userId)
                                setShowUserModal(true)
                              }}
                            >
                              {conv.userName}
                            </span>
                            <span className="text-xs text-gray-500">{formatTimestamp(conv.lastMessageTime)}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Notifications List */}
            {viewMode === 'notifications' && (
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={async () => {
                          await markAsRead(notification.id)

                          // Handle channel mentions
                          if (notification.metadata?.channelId) {
                            setActiveChannel(notification.metadata.channelId)
                            setViewMode('channels')

                            // On mobile, show chat and hide sidebar
                            if (isMobile) {
                              setShowMobileSidebar(false)
                              setShowMobileChat(true)
                            }

                            // Scroll to specific message if messageId is provided
                            if (notification.metadata?.messageId) {
                              // Wait for messages to load and position
                              setTimeout(() => {
                                const messageElement = document.querySelector(`[data-message-id="${notification.metadata.messageId}"]`)
                                if (messageElement) {
                                  messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  // Highlight with state for smooth CSS transition
                                  setHighlightedMessageId(notification.metadata.messageId)
                                  setTimeout(() => {
                                    setHighlightedMessageId(null)
                                  }, 2500)
                                }
                              }, 800)
                            }
                          }

                          // Handle DM mentions
                          if (notification.metadata?.userId) {
                            setActiveConversation(notification.metadata.userId)
                            setViewMode('dm')

                            // On mobile, show chat and hide sidebar
                            if (isMobile) {
                              setShowMobileSidebar(false)
                              setShowMobileChat(true)
                            }

                            // Scroll to specific message if messageId is provided
                            if (notification.metadata?.messageId) {
                              // Wait for messages to load and position
                              setTimeout(() => {
                                const messageElement = document.querySelector(`[data-message-id="${notification.metadata.messageId}"]`)
                                if (messageElement) {
                                  messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  // Highlight with state for smooth CSS transition
                                  setHighlightedMessageId(notification.metadata.messageId)
                                  setTimeout(() => {
                                    setHighlightedMessageId(null)
                                  }, 2500)
                                }
                              }, 800)
                            }
                          }
                        }}
                        className={`px-3 py-3 rounded-lg cursor-pointer transition-all ${
                          notification.read
                            ? 'bg-transparent hover:bg-zinc-800/50'
                            : 'bg-blue-500/10 hover:bg-blue-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${
                              notification.read ? 'text-gray-400' : 'text-white'
                            }`}>
                              {notification.content}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 block">
                              {formatTimestamp(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className={`${
            isMobile ? (showMobileChat ? 'flex' : 'hidden') : 'flex'
          } md:col-span-9 bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 md:rounded-2xl rounded-xl flex-col overflow-hidden ${
            isMobile ? 'h-[calc(100vh-96px)] mt-0' : ''
          }`}>
            {/* Chat Header */}
            <div className="border-b border-zinc-800 md:px-6 px-4 md:py-4 py-3 flex items-center gap-3">
              {/* Mobile back button */}
              {isMobile && (viewMode === 'channels' || activeConversation) && (
                <button
                  onClick={() => {
                    setShowMobileChat(false)
                    setShowMobileSidebar(true)
                  }}
                  className="md:hidden p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <div className="flex-1">
              {/* Ably Connection Status Indicator (for debugging) */}
              {viewMode === 'channels' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${channelReady ? 'bg-green-500' : ablyConnected ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-500">
                    {channelReady ? 'Real-time active' : ablyConnected ? 'Connecting...' : 'Offline'}
                  </span>
                </div>
              )}
              {viewMode === 'channels' ? (
                <div className="flex items-center gap-3">
                  {(() => {
                    const channel = CHANNELS.find(c => c.id === activeChannel)
                    const IconComponent = channel ? CHANNEL_ICONS[channel.id] : Hash
                    return <IconComponent className="w-6 h-6 text-gray-400" />
                  })()}
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {CHANNELS.find(c => c.id === activeChannel)?.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {CHANNELS.find(c => c.id === activeChannel)?.description}
                    </p>
                  </div>
                </div>
              ) : activeConversation ? (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                  setSelectedUserId(activeConversation)
                  setShowUserModal(true)
                }}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversations.find(c => c.userId === activeConversation)?.userProfileImage || undefined} />
                    <AvatarFallback>
                      {conversations.find(c => c.userId === activeConversation)?.userName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-white hover:underline">
                      {conversations.find(c => c.userId === activeConversation)?.userName}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {conversations.find(c => c.userId === activeConversation)?.userHeadline || 'Online'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Select a conversation</div>
              )}
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto md:px-6 px-4 md:py-6 py-4 space-y-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                minHeight: 0 // Critical for flex child scrolling
              }}
            >
                {loading ? (
                  <div className="space-y-4">
                    {/* Friendly startup message */}
                    <div className="text-center py-2 px-4">
                      <p className="text-[10px] text-gray-500 leading-tight">
                        Thank you for your patience. We're a startup working hard to provide a free platform for everyone.
                      </p>
                    </div>

                    {viewMode === 'channels' ? (
                      // Channel skeleton loaders
                      [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3 items-start md:p-4 p-3 animate-pulse">
                          {/* Avatar skeleton */}
                          <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            {/* Name and timestamp skeleton */}
                            <div className="flex items-center gap-2">
                              <div className="h-4 bg-zinc-800/50 rounded w-24" />
                              <div className="h-3 bg-zinc-800/50 rounded w-16" />
                            </div>
                            {/* Message content skeleton */}
                            <div className="space-y-1.5">
                              <div className="h-3 bg-zinc-800/50 rounded w-full" />
                              <div className="h-3 bg-zinc-800/50 rounded w-5/6" />
                            </div>
                            {/* Action buttons skeleton */}
                            <div className="flex gap-2 mt-3">
                              <div className="h-8 bg-zinc-800/50 rounded-lg w-16" />
                              <div className="h-8 bg-zinc-800/50 rounded-lg w-16" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // DM skeleton loaders
                      [1, 2, 3, 4, 5].map((i) => {
                        const isOwn = i % 2 === 0
                        return (
                          <div key={i} className={`flex gap-3 animate-pulse ${isOwn ? 'flex-row-reverse' : ''}`}>
                            {!isOwn && (
                              <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex-shrink-0" />
                            )}
                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              {!isOwn && (
                                <div className="h-3 bg-zinc-800/50 rounded w-20 mb-1" />
                              )}
                              <div
                                className={`px-4 py-2.5 rounded-2xl ${
                                  isOwn
                                    ? 'bg-zinc-800/50 rounded-br-sm'
                                    : 'bg-zinc-800/50 rounded-bl-sm'
                                }`}
                              >
                                <div className="h-3 bg-zinc-700/50 rounded w-32 md:w-48" />
                              </div>
                              <div className="h-2 bg-zinc-800/50 rounded w-16 mt-1" />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                ) : (
                  <>
                {viewMode === 'channels' && posts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : viewMode === 'dm' && directMessages.length === 0 && activeConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Start a conversation</p>
                    </div>
                  </div>
                ) : viewMode === 'channels' ? (
                  (() => {
                    console.log(`🎨 [RENDER] Rendering ${posts.length} posts for channel: ${activeChannel}`)
                    console.log(`📝 [RENDER-DATA] First 3 posts:`, posts.slice(0, 3).map(p => ({ id: p.id, user: p.userName, content: p.content.substring(0, 30) })))
                    return posts.map((post) => {
                      const isLiked = likedPosts.has(post.id)
                      const isPending = pendingPostIds.has(post.id)
                      return (
                      <div
                        key={post.id}
                        data-message-id={post.id}
                        className={`group flex gap-3 items-start md:p-4 p-3 rounded-xl hover:bg-zinc-800/30 transition-all duration-300 cursor-pointer ${
                          highlightedMessageId === post.id ? 'bg-blue-500/20 ring-2 ring-blue-500/50' : ''
                        } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        style={{ animationFillMode: 'backwards' }}
                      >
                        <Avatar
                          className="w-10 h-10 flex-shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUserId(post.userId)
                            setShowUserModal(true)
                          }}
                        >
                          <AvatarImage src={post.userProfileImage || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {post.userName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-semibold text-white text-sm hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUserId(post.userId)
                                setShowUserModal(true)
                              }}
                            >
                              {post.userName}
                            </span>
                            {mutedUserIds.has(post.userId) && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded border border-red-500/30">
                                MUTED
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</span>
                            {/* Show status indicator only for user's own messages */}
                            {post.userId === user?.id && (
                              String(post.id).startsWith('temp-') ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-xs text-gray-400">Sending...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-500" />
                                  <span className="text-xs text-green-500">Sent</span>
                                </div>
                              )
                            )}
                          </div>

                          {/* Reply Preview */}
                          {post.replyTo && (
                            <div className="mb-2 pl-3 border-l-2 border-zinc-600 text-xs text-gray-400 italic">
                              Replying to <span className="text-gray-300 font-medium">{post.replyTo.userName}</span>: {post.replyTo.content.substring(0, 80)}{post.replyTo.content.length > 80 ? '...' : ''}
                            </div>
                          )}

                          <p className="text-gray-200 text-sm mb-3 break-words leading-relaxed">{renderMessageContent(post.content)}</p>
                          <div className="flex gap-2 flex-wrap relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(post.id)
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowReactionPicker(post.id)
                                setReactionPickerPosition({ x: e.clientX, y: e.clientY })
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                isLiked
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800 hover:text-red-400'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                              <span className="text-xs font-medium">{post.likes || 0}</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 text-gray-400 hover:bg-zinc-800 hover:text-blue-400 transition-all">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">{post.commentsCount || 0}</span>
                            </button>

                          </div>
                        </div>
                      </div>
                    )
                    })
                  })()
                ) : (
                  directMessages.map((message) => {
                    const isOwn = message.senderId === user?.id
                    return (
                      <div
                        key={message.id}
                        data-message-id={message.id}
                        className={`flex gap-3 p-2 rounded-xl transition-all duration-300 ${isOwn ? 'flex-row-reverse' : ''} ${
                          highlightedMessageId === message.id ? 'bg-blue-500/20 ring-2 ring-blue-500/50' : ''
                        }`}
                      >
                        {!isOwn && (
                          <Avatar
                            className="w-8 h-8 flex-shrink-0 cursor-pointer"
                            onClick={() => {
                              setSelectedUserId(message.senderId)
                              setShowUserModal(true)
                            }}
                          >
                            <AvatarImage src={message.senderProfileImage || undefined} />
                            <AvatarFallback>{message.senderName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {!isOwn && (
                            <span
                              className="text-xs text-gray-400 mb-1 cursor-pointer hover:underline"
                              onClick={() => {
                                setSelectedUserId(message.senderId)
                                setShowUserModal(true)
                              }}
                            >
                              {message.senderName}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-white text-black rounded-br-sm'
                                : 'bg-zinc-800 text-white rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(message.createdAt)}
                            </span>
                            {isOwn && message.read && <CheckCheck className="w-3 h-3 text-blue-500" />}
                            {isOwn && !message.read && <Check className="w-3 h-3 text-gray-500" />}
                          </div>

                          {/* Quick Reaction Emojis for DMs */}
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {['👍', '❤️', '😂'].map((emoji) => {
                              const reactionSummary = messageReactions[message.id]
                              const uniqueReactions = reactionSummary?.unique || {}
                              const reactionData = uniqueReactions[emoji]
                              const count = reactionData?.count || 0
                              const hasReacted = reactionData?.clientIds?.includes(user?.id || '') || false

                              return (
                                <button
                                  key={emoji}
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (!message.id) return

                                    if (hasReacted && deleteMessageReaction) {
                                      await deleteMessageReaction(message.id, emoji)
                                    } else if (sendMessageReaction) {
                                      await sendMessageReaction(message.id, emoji)
                                    }
                                  }}
                                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg transition-all text-xs ${
                                    hasReacted
                                      ? 'bg-blue-500/20 ring-1 ring-blue-500/50'
                                      : 'bg-zinc-800/50 hover:bg-zinc-800'
                                  }`}
                                >
                                  <span className="text-sm">{emoji}</span>
                                  {count > 0 && <span className="text-xs text-gray-400 ml-0.5">{count}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
                  </>
                )}
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-24 right-6 z-20 bg-white text-black rounded-full p-3 shadow-2xl hover:bg-gray-100 transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}

            {/* Input Area */}
            <div className="md:px-6 px-4 md:py-6 py-4 md:pb-6 pb-4">
              <div className="max-w-4xl mx-auto relative">
                {/* Mention Autocomplete Dropdown */}
                {showMentionDropdown && filteredMentionUsers.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50">
                    {filteredMentionUsers.map((mentionUser) => (
                      <button
                        key={mentionUser.id}
                        onClick={() => insertMention(mentionUser.name, mentionUser.id)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-700 transition-all text-left"
                        style={{ minHeight: '44px' }}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={mentionUser.profileImage || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                            {mentionUser.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">{mentionUser.name}</div>
                          {mentionUser.headline && (
                            <div className="text-xs text-gray-400 truncate">{mentionUser.headline}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {typing && typing.length > 0 && viewMode === 'channels' && (() => {
                  // Map user IDs to user names from allUsers array
                  const typingUserNames = typing
                    .map(userId => {
                      const user = allUsers.find(u => u.id === userId)
                      return user?.name || userId
                    })
                    .filter(name => name !== user?.id) // Don't show current user typing to themselves

                  if (typingUserNames.length === 0) return null

                  return (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      {typingUserNames.length === 1 && `${typingUserNames[0]} is typing...`}
                      {typingUserNames.length === 2 && `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`}
                      {typingUserNames.length > 2 && `${typingUserNames.length} people are typing...`}
                    </div>
                  )
                })()}

                <div className="flex items-end gap-3 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 focus-within:border-zinc-600 focus-within:bg-zinc-900/70 transition-all shadow-lg">
                  <textarea
                    ref={inputRef as any}
                    value={inputValue}
                    onChange={handleInputChange as any}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !showMentionDropdown) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={
                      viewMode === 'dm' && activeConversation
                        ? `Message ${conversations.find(c => c.userId === activeConversation)?.userName}...`
                        : viewMode === 'dm'
                        ? '@mention someone to start...'
                        : `Message #${activeChannel}...`
                    }
                    className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none text-base leading-6 py-1 px-1 max-h-40 scrollbar-hide"
                    style={{
                      minHeight: '40px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    rows={1}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || sending}
                    className="shrink-0 rounded-full p-3 bg-white text-black hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-gray-500 transition-all duration-200 shadow-md"
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 z-30">
          <div className="grid grid-cols-3 h-20">
            <button
              onClick={() => {
                setViewMode('channels')
                setShowMobileSidebar(true)
                setShowMobileChat(false)
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                viewMode === 'channels' ? 'text-white' : 'text-gray-400'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Channels</span>
            </button>
            <button
              onClick={() => {
                setViewMode('dm')
                setShowMobileSidebar(true)
                setShowMobileChat(false)
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                viewMode === 'dm' ? 'text-white' : 'text-gray-400'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs font-medium">Messages</span>
            </button>
            <button
              onClick={() => {
                setViewMode('notifications')
                setShowMobileSidebar(true)
                setShowMobileChat(false)
              }}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                viewMode === 'notifications' ? 'text-white' : 'text-gray-400'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Bell className="w-6 h-6" />
              <span className="text-xs font-medium">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUserId(null)
          }}
        />
      )}

      {/* Reaction Picker Popup */}
      {showReactionPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowReactionPicker(null)}
          />
          {/* Picker */}
          <div
            className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-2 flex gap-1"
            style={{
              left: `${reactionPickerPosition.x}px`,
              top: `${reactionPickerPosition.y}px`,
              transform: 'translate(-50%, -100%) translateY(-8px)'
            }}
          >
            {['👍', '❤️', '😂', '🎉', '🔥', '😍', '🤔', '👏', '🙌', '🚀'].map((emoji) => {
              const post = posts.find(p => p.id === showReactionPicker)
              if (!post?.ablySerial) return null

              return (
                <button
                  key={emoji}
                  onClick={async () => {
                    if (sendMessageReaction && post.ablySerial) {
                      await sendMessageReaction(post.ablySerial, emoji)
                      setShowReactionPicker(null)
                    }
                  }}
                  className="text-2xl hover:scale-125 transition-transform p-2 rounded hover:bg-zinc-800"
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
