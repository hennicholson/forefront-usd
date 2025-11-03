'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { UserProfileModal } from '@/components/profile/UserProfileModal'
import { GeminiHelper } from '@/components/messages/GeminiHelper'
import { useRouter } from 'next/navigation'


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
  userBio?: string | null
  timestamp?: string
}

interface UserModule {
  moduleId: string
  moduleTitle: string
  moduleSlug: string
  status: string
}

interface User {
  id: string
  name: string
  profileImage?: string | null
  headline?: string | null
}

interface Conversation {
  userId: string
  userName: string
  userProfileImage?: string | null
  userHeadline?: string | null
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
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
}

export default function NetworkPage() {
  const { isAuthenticated, signup, user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeChannel, setActiveChannel] = useState('general')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sending, setSending] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // DM state
  const [viewMode, setViewMode] = useState<'channels' | 'dm'>('channels')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [showAiHelper, setShowAiHelper] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Fixed channels that everyone can access
  const channels = [
    { id: 'general', name: 'general', icon: '💬', topic: '' },
    { id: 'ai-video', name: 'ai video', icon: '🎥', topic: 'AI Video' },
    { id: 'vibe-coding', name: 'vibe coding', icon: '💻', topic: 'Vibe Coding' },
    { id: 'marketing', name: 'marketing', icon: '📈', topic: 'Marketing' },
    { id: 'automation', name: 'automation', icon: '⚡', topic: 'Automation' },
    { id: 'help', name: 'help', icon: '❓', topic: 'Help' }
  ]

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (viewMode === 'channels') {
        loadPosts()
        loadChannelCounts()
      } else if (viewMode === 'dm') {
        loadConversations()
        if (activeConversation) {
          loadDirectMessages(activeConversation)
        }
      }
      loadUsers()
    }
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isAuthenticated, activeChannel, user?.id, viewMode, activeConversation])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users/all')
      if (res.ok) {
        const users = await res.json()
        setAllUsers(users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadConversations = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/messages?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
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
        const data = await res.json()
        setDirectMessages(data)
      }
    } catch (error) {
      console.error('Error loading direct messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChannelCounts = async () => {
    try {
      const counts: Record<string, number> = {}

      // Load count for each channel
      for (const channel of channels) {
        const url = channel.topic
          ? `/api/posts?limit=1000&topic=${encodeURIComponent(channel.topic)}`
          : '/api/posts?limit=1000'

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          counts[channel.id] = Array.isArray(data) ? data.length : 0
        }
      }

      setChannelCounts(counts)
    } catch (error) {
      console.error('Error loading channel counts:', error)
    }
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      // Find the channel and use its topic
      const channel = channels.find(c => c.id === activeChannel)
      const topicParam = channel?.topic || ''

      const url = topicParam
        ? `/api/posts?limit=50&topic=${encodeURIComponent(topicParam)}`
        : '/api/posts?limit=50'

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        // API returns array directly, not wrapped
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart || 0
    setInputValue(value)
    setCursorPosition(cursor)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursor)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const search = mentionMatch[1].toLowerCase()
      const filtered = allUsers.filter(u =>
        u.name.toLowerCase().includes(search)
      ).slice(0, 5)
      setMentionSuggestions(filtered)
      setShowMentionSuggestions(filtered.length > 0)
    } else {
      setShowMentionSuggestions(false)
    }
  }

  const insertMention = (userName: string) => {
    const textBeforeCursor = inputValue.substring(0, cursorPosition)
    const textAfterCursor = inputValue.substring(cursorPosition)
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '@')
    const newText = beforeMention + userName + ' ' + textAfterCursor
    setInputValue(newText)
    setShowMentionSuggestions(false)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  const handleUserClick = (userId: string) => {
    console.log('handleUserClick called with userId:', userId)
    setSelectedUserId(userId)
    setShowUserModal(true)
    console.log('State updated - selectedUserId:', userId, 'showUserModal: true')
  }

  const startDMWithUser = async (userId: string) => {
    // Switch to DM mode and set active conversation
    setViewMode('dm')
    setActiveConversation(userId)

    // Load the conversation (will create empty state if no messages yet)
    await loadDirectMessages(userId)

    // Scroll to top and focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      // Add clickable mention
      const username = match[1]
      parts.push(
        <span
          key={match.index}
          onClick={async (e) => {
            e.stopPropagation()
            try {
              const res = await fetch(`/api/users/all`)
              if (res.ok) {
                const users = await res.json()
                const mentionedUser = users.find((u: any) =>
                  u.name.toLowerCase() === username.toLowerCase()
                )
                if (mentionedUser) {
                  // Start DM with the mentioned user
                  startDMWithUser(mentionedUser.id)
                }
              }
            } catch (error) {
              console.error('Error finding user:', error)
            }
          }}
          title="Click to send direct message"
          style={{
            color: '#5865F2',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(88, 101, 242, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(88, 101, 242, 0.2)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          @{username}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
  }

  const handleLike = async (postId: string) => {
    if (!user?.id) return

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          postId,
          type: 'like'
        })
      })

      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSendDM = async () => {
    if (!inputValue.trim() || !isAuthenticated || !user?.id) return

    // If no active conversation but input starts with @mention, try to start a DM
    if (!activeConversation) {
      const mentionMatch = inputValue.trim().match(/^@(\w+)\s*(.*)/)
      if (mentionMatch) {
        const username = mentionMatch[1]
        const messageContent = mentionMatch[2]

        // Find the user
        const mentionedUser = allUsers.find(u =>
          u.name.toLowerCase() === username.toLowerCase()
        )

        if (mentionedUser && messageContent) {
          // Start a DM with this user and send the message
          setSending(true)
          try {
            const res = await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderId: user.id,
                receiverId: mentionedUser.id,
                content: messageContent.trim()
              })
            })

            if (res.ok) {
              setInputValue('')
              setShowMentionSuggestions(false)
              // Switch to the conversation
              setActiveConversation(mentionedUser.id)
              await loadDirectMessages(mentionedUser.id)
              await loadConversations()
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
            }
          } catch (err) {
            console.error('Error sending DM:', err)
          } finally {
            setSending(false)
          }
          return
        } else if (mentionedUser) {
          // Just start the conversation without sending a message yet
          startDMWithUser(mentionedUser.id)
          setInputValue(messageContent)
          return
        }
      }
      return // Don't send if no active conversation and not a valid @mention
    }

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeConversation,
          content: inputValue.trim()
        })
      })

      if (res.ok) {
        setInputValue('')
        setShowMentionSuggestions(false)
        await loadDirectMessages(activeConversation)
        await loadConversations()
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err) {
      console.error('Error sending DM:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isAuthenticated || !user?.id) return

    // Route to DM handler if in DM mode
    if (viewMode === 'dm') {
      return handleSendDM()
    }

    setSending(true)
    try {
      // Find the channel and use its topic
      const channel = channels.find(c => c.id === activeChannel)
      const topic = channel?.topic || null

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: inputValue.trim(),
          topic: topic
        })
      })

      if (res.ok) {
        setInputValue('')
        setShowMentionSuggestions(false)
        await loadPosts()
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        const error = await res.text()
        console.error('Error posting message:', error)
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [posts])

  // If not authenticated, show blurred page with login prompt
  if (!isAuthenticated) {
    return (
      <main className="bg-black text-white min-h-screen" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Blurred background content */}
        <div style={{
          filter: 'blur(10px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div className="section" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'auto' }}>
            <div className="content">
              <div style={{ marginBottom: '40px' }}>
                <div className="title-large" style={{ marginBottom: '16px' }}>discover learners</div>
                <div className="subtitle" style={{ color: '#666' }}>
                  connect with students learning ai
                </div>
              </div>
            </div>
          </div>
          <div className="section white" style={{ paddingTop: '24px', paddingBottom: '60px', minHeight: '500px' }}>
            <div className="content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card" style={{ padding: '24px', minHeight: '200px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e0e0', marginBottom: '16px' }} />
                    <div style={{ width: '80%', height: '16px', background: '#e0e0e0', marginBottom: '8px', borderRadius: '4px' }} />
                    <div style={{ width: '60%', height: '12px', background: '#f0f0f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Login/Signup overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maxWidth: '500px',
            width: '100%',
            padding: '48px',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              textTransform: 'lowercase',
              letterSpacing: '-1px',
              marginBottom: '16px',
              color: '#000'
            }}>
              join the network
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              sign in or create an account to connect with other learners, explore the community, and join discussions
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  cursor: 'pointer'
                }}
              >
                sign in
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  cursor: 'pointer'
                }}
              >
                sign up
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <main style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(130, 80, 200, 0.15) 0%, transparent 50%), linear-gradient(135deg, #f7f7f8 0%, #e8e8ea 25%, #d5d5d8 50%, #e0e0e3 75%, #f0f0f2 100%)',
        display: 'flex',
        overflow: 'hidden',
        paddingTop: '80px'
      }}>
      {/* Discord-Style Sidebar */}
      <div style={{
        width: '280px',
        minWidth: '280px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px 16px',
        overflowY: 'auto'
      }}>
        {/* Direct Messages Section */}
        <div style={{
          fontSize: '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#666',
          marginBottom: '8px',
          paddingLeft: '12px'
        }}>
          direct messages
        </div>
        <button
          onClick={() => {
            setViewMode('dm')
            setActiveConversation(null)
          }}
          style={{
            position: 'relative',
            padding: '12px 16px',
            background: viewMode === 'dm' && !activeConversation
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px) saturate(150%)',
            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'lowercase',
            letterSpacing: '-0.3px',
            color: viewMode === 'dm' && !activeConversation ? '#000' : '#333',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
            boxShadow: viewMode === 'dm' && !activeConversation
              ? `inset 0 1px 0 0 rgba(255,255,255,0.9),
                 inset 0 -1px 0 0 rgba(0,0,0,0.05),
                 0 2px 8px rgba(0,0,0,0.08)`
              : `inset 0 1px 0 0 rgba(255,255,255,0.5),
                 0 1px 4px rgba(0,0,0,0.05)`
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          <span style={{ flex: 1 }}>all conversations</span>
          {conversations.length > 0 && (
            <div style={{
              background: viewMode === 'dm' && !activeConversation ? '#000' : 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              minWidth: '28px',
              textAlign: 'center'
            }}>
              {conversations.length > 99 ? '99+' : conversations.length}
            </div>
          )}
        </button>

        {/* Show individual conversations when in DM mode */}
        {viewMode === 'dm' && conversations.map(conv => (
          <div
            key={conv.userId}
            style={{
              position: 'relative',
              marginLeft: '20px'
            }}
          >
            <button
              onClick={() => {
                setActiveConversation(conv.userId)
                setViewMode('dm')
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: activeConversation === conv.userId
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px) saturate(150%)',
                WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: activeConversation === conv.userId ? '#000' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
                boxShadow: activeConversation === conv.userId
                  ? `inset 0 1px 0 0 rgba(255,255,255,0.9),
                     inset 0 -1px 0 0 rgba(0,0,0,0.05),
                     0 2px 8px rgba(0,0,0,0.08)`
                  : `inset 0 1px 0 0 rgba(255,255,255,0.5),
                     0 1px 4px rgba(0,0,0,0.05)`
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  console.log('Avatar clicked, userId:', conv.userId)
                  handleUserClick(conv.userId)
                }}
                style={{
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Click to view profile"
              >
                <Avatar
                  src={conv.userProfileImage}
                  name={conv.userName}
                  size="sm"
                />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'none' }}>
                  {conv.userName}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage}
                </div>
              </div>
            {conv.unreadCount > 0 && (
              <div style={{
                background: '#5865F2',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {conv.unreadCount}
              </div>
            )}
            </button>
          </div>
        ))}

        {/* Channels Section */}
        <div style={{
          fontSize: '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#666',
          marginBottom: '8px',
          marginTop: '20px',
          paddingLeft: '12px'
        }}>
          channels
        </div>
        {channels.map(channel => {
          const count = channelCounts[channel.id] || 0
          const isActive = activeChannel === channel.id && viewMode === 'channels'

          return (
            <button
              key={channel.id}
              onClick={() => {
                setActiveChannel(channel.id)
                setViewMode('channels')
                setActiveConversation(null)
              }}
              style={{
                position: 'relative',
                padding: '12px 16px',
                background: isActive
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px) saturate(150%)',
                WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'lowercase',
                letterSpacing: '-0.3px',
                color: isActive ? '#000' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
                boxShadow: isActive
                  ? `inset 0 1px 0 0 rgba(255,255,255,0.9),
                     inset 0 -1px 0 0 rgba(0,0,0,0.05),
                     0 2px 8px rgba(0,0,0,0.08)`
                  : `inset 0 1px 0 0 rgba(255,255,255,0.5),
                     0 1px 4px rgba(0,0,0,0.05)`
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                  e.currentTarget.style.transform = 'translateX(2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{channel.icon}</span>
              <span style={{ flex: 1 }}>{channel.name}</span>
              {count > 0 && (
                <div style={{
                  background: isActive ? '#000' : 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  minWidth: '28px',
                  textAlign: 'center'
                }}>
                  {count > 99 ? '99+' : count}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Channel/DM Header */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {viewMode === 'channels' ? (
              <>
                <span style={{ fontSize: '24px' }}>
                  {channels.find(c => c.id === activeChannel)?.icon}
                </span>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    textTransform: 'lowercase',
                    letterSpacing: '-0.5px',
                    margin: 0,
                    color: '#000'
                  }}>
                    {channels.find(c => c.id === activeChannel)?.name}
                  </h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: 0,
                    marginTop: '4px'
                  }}>
                    {channelCounts[activeChannel] || 0} messages
                  </p>
                </div>
              </>
            ) : activeConversation ? (
              <>
                {(() => {
                  // Try to find user in conversations first, then fall back to allUsers
                  const conversationUser = conversations.find(c => c.userId === activeConversation)
                  const user = conversationUser || allUsers.find(u => u.id === activeConversation)

                  // Type guard to check if it's a Conversation or User
                  const isConversation = (obj: any): obj is Conversation =>
                    obj && 'userName' in obj && 'userProfileImage' in obj;
                  const isUser = (obj: any): obj is User =>
                    obj && 'name' in obj && 'profileImage' in obj;

                  const displayName = isConversation(user) ? user.userName : isUser(user) ? user.name : 'User';
                  const displayImage = isConversation(user) ? user.userProfileImage : isUser(user) ? user.profileImage : undefined;

                  return (
                    <>
                      <Avatar
                        src={displayImage}
                        name={displayName}
                        size="md"
                      />
                      <div>
                        <h2 style={{
                          fontSize: '20px',
                          fontWeight: 900,
                          letterSpacing: '-0.5px',
                          margin: 0,
                          color: '#000'
                        }}>
                          {displayName}
                        </h2>
                        <p style={{
                          fontSize: '12px',
                          color: '#666',
                          margin: 0,
                          marginTop: '4px'
                        }}>
                          {isConversation(user) ? user.userHeadline : isUser(user) ? user.headline : 'Direct Message'}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </>
            ) : (
              <>
                <span style={{ fontSize: '24px' }}>💬</span>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    textTransform: 'lowercase',
                    letterSpacing: '-0.5px',
                    margin: 0,
                    color: '#000'
                  }}>
                    all conversations
                  </h2>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: 0,
                    marginTop: '4px'
                  }}>
                    {conversations.length} conversations
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              fontSize: '14px'
            }}>
              Loading messages...
            </div>
          )}

          {/* Show conversation list when in DM mode without active conversation */}
          {viewMode === 'dm' && !activeConversation && !loading && (
            <>
              {conversations.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                  }}>
                    💬
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#000'
                  }}>
                    No conversations yet
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#666',
                    lineHeight: '1.6',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(88, 101, 242, 0.1)',
                      color: '#5865F2',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      margin: '0 2px'
                    }}>
                      @mention
                    </span>
                    a user in any channel to start a direct message conversation with them
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#999',
                    marginTop: '16px',
                    fontStyle: 'italic'
                  }}>
                    or click on their username to message them
                  </div>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.userId}
                    onClick={() => setActiveConversation(conv.userId)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                      borderRadius: '16px',
                      boxShadow: `
                        inset 0 1px 0 0 rgba(255,255,255,0.8),
                        inset 0 -1px 0 0 rgba(0,0,0,0.05),
                        0 2px 12px rgba(0,0,0,0.04)
                      `,
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Avatar
                      src={conv.userProfileImage}
                      name={conv.userName}
                      size="md"
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>
                        {conv.userName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {conv.lastMessage}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {new Date(conv.lastMessageTime).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Show DM chat when conversation is active */}
          {viewMode === 'dm' && activeConversation && !loading && (
            <>
              {directMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 300,
                    marginBottom: '12px',
                    color: '#333'
                  }}>
                    Start a conversation
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999'
                  }}>
                    Send a message to {(() => {
                      const conversationUser = conversations.find(c => c.userId === activeConversation)
                      const user = conversationUser || allUsers.find(u => u.id === activeConversation)
                      const isConv = (obj: any): obj is Conversation => obj && 'userName' in obj;
                      const isUsr = (obj: any): obj is User => obj && 'name' in obj;
                      return isConv(user) ? user.userName : isUsr(user) ? user.name : 'this user';
                    })()}
                  </div>
                </div>
              ) : (
                directMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '16px',
                      background: msg.senderId === user?.id ? 'rgba(88, 101, 242, 0.15)' : 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                      borderRadius: '16px',
                      boxShadow: `
                        inset 0 1px 0 0 rgba(255,255,255,0.8),
                        inset 0 -1px 0 0 rgba(0,0,0,0.05),
                        0 2px 12px rgba(0,0,0,0.04)
                      `,
                      marginLeft: msg.senderId === user?.id ? 'auto' : '0',
                      marginRight: msg.senderId === user?.id ? '0' : 'auto',
                      maxWidth: '70%'
                    }}
                  >
                    <Avatar
                      src={msg.senderProfileImage || undefined}
                      name={msg.senderName || 'User'}
                      size="sm"
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserClick(msg.senderId)
                          }}
                          title="Click to view profile"
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#5865F2',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textDecoration: 'underline'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.7'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          {msg.senderName}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#999'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#333',
                        wordWrap: 'break-word'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Show channel posts */}
          {viewMode === 'channels' && !loading && posts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 300,
                marginBottom: '12px',
                color: '#333'
              }}>
                No messages yet
              </div>
              <div style={{
                fontSize: '14px',
                color: '#999'
              }}>
                Be the first to start a conversation in #{channels.find(c => c.id === activeChannel)?.name}
              </div>
            </div>
          )}

          {viewMode === 'channels' && posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px) saturate(150%)',
                WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                borderRadius: '16px',
                boxShadow: `
                  inset 0 1px 0 0 rgba(255,255,255,0.8),
                  inset 0 -1px 0 0 rgba(0,0,0,0.05),
                  0 2px 12px rgba(0,0,0,0.04)
                `,
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Avatar
                src={post.userProfileImage}
                name={post.userName}
                size="sm"
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span
                    onClick={(e) => {
                      // Shift+Click to view profile, regular click to start DM
                      if (e.shiftKey) {
                        handleUserClick(post.userId)
                      } else {
                        startDMWithUser(post.userId)
                      }
                    }}
                    title="Click to message, Shift+Click to view profile"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {post.userName}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#999'
                  }}>
                    {new Date(post.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.6,
                  marginBottom: '12px'
                }}>
                  {renderContentWithMentions(post.content)}
                </div>
                {/* Action Bar */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.3)'
                      e.currentTarget.style.color = '#5865F2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                      e.currentTarget.style.color = '#333'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>↑</span> {post.likes}
                  </button>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#666'
                  }}>
                    <span style={{ fontSize: '14px' }}>○</span> {post.commentsCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.6), 0 -2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '100%'
          }}>
            <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '24px',
            padding: '12px 20px',
            boxShadow: `
              inset 0 2px 0 0 rgba(255,255,255,0.9),
              inset 0 -2px 0 0 rgba(0,0,0,0.05),
              0 8px 32px rgba(0,0,0,0.08),
              0 2px 8px rgba(0,0,0,0.04)
            `,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                placeholder={
                  viewMode === 'dm' && activeConversation
                    ? `Message ${(() => {
                        const conversationUser = conversations.find(c => c.userId === activeConversation)
                        const user = conversationUser || allUsers.find(u => u.id === activeConversation)
                        const isConv = (obj: any): obj is Conversation => obj && 'userName' in obj;
                        const isUsr = (obj: any): obj is User => obj && 'name' in obj;
                        return isConv(user) ? user.userName : isUsr(user) ? user.name : 'user';
                      })()}...`
                    : viewMode === 'dm'
                    ? '@mention someone to start a conversation...'
                    : `Message ${channels.find(c => c.id === activeChannel)?.name} channel... (type @ to mention)`
                }
                disabled={sending}
                onBlur={() => {
                  // Delay hiding suggestions to allow click
                  setTimeout(() => setShowMentionSuggestions(false), 200)
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: '#000',
                  fontFamily: 'inherit',
                  padding: '4px 0',
                  opacity: sending ? 0.5 : 1
                }}
              />
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: '8px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '12px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255,255,255,0.9),
                    0 8px 32px rgba(0,0,0,0.15)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.8)'
                }}>
                  {mentionSuggestions.map((suggestedUser) => (
                    <div
                      key={suggestedUser.id}
                      onClick={() => insertMention(suggestedUser.name)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s ease',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Avatar
                        src={suggestedUser.profileImage}
                        name={suggestedUser.name}
                        size="sm"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '2px' }}>
                          {suggestedUser.name}
                        </div>
                        {suggestedUser.headline && (
                          <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {suggestedUser.headline}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* AI Helper Button - only show in DM mode if user has Gemini API key */}
            {viewMode === 'dm' && activeConversation && user?.geminiApiKey && (
              <button
                onClick={() => setShowAiHelper(true)}
                disabled={sending}
                title="AI Message Helper"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: sending ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  opacity: sending ? 0.5 : 1,
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!sending) {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <span style={{ fontSize: '16px' }}>✨</span>
              </button>
            )}
            <button
              onClick={handleSendMessage}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: inputValue.trim() && !sending ? '#000' : '#ccc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() && !sending ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                opacity: sending ? 0.5 : 1
              }}
              disabled={!inputValue.trim() || sending}
            >
              {sending ? (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignupClick={() => {
          setShowLoginModal(false)
          setTimeout(() => setShowOnboarding(true), 100)
        }}
      />

      {/* Onboarding Flow */}
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

      {/* User Profile Modal */}
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

      {/* Gemini AI Helper Modal */}
      {showAiHelper && user?.geminiApiKey && (
        <GeminiHelper
          onInsertText={(text) => {
            setInputValue(text)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          onClose={() => setShowAiHelper(false)}
          geminiApiKey={user.geminiApiKey}
        />
      )}
    </main>
    </>
  )
}
