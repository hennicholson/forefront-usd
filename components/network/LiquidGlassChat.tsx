'use client'
import { useState, useEffect, useRef } from 'react'
import { Avatar } from '@/components/common/Avatar'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  channel: string
}

interface Channel {
  id: string
  name: string
  unreadCount: number
  lastMessage?: string
  description?: string
}

const channels: Channel[] = [
  { id: 'general', name: 'General', unreadCount: 3, lastMessage: 'Welcome to the community!', description: 'General discussion about AI and learning' },
  { id: 'ai-learning', name: 'AI Learning', unreadCount: 7, lastMessage: 'Just finished the ChatGPT module!', description: 'Share your AI learning journey' },
  { id: 'projects', name: 'Projects', unreadCount: 2, lastMessage: 'Looking for collaborators on my AI tool', description: 'Showcase and collaborate on projects' },
  { id: 'help', name: 'Help', unreadCount: 0, lastMessage: 'How do I access the advanced modules?', description: 'Get help from the community' }
]

// Mock messages data
const mockMessages: Message[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: undefined,
    content: 'Hey everyone! Just joined the platform. Excited to learn AI with you all! 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    channel: 'general'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Marcus Rodriguez',
    userAvatar: undefined,
    content: 'Welcome Sarah! You\'re going to love it here. Which module are you starting with?',
    timestamp: new Date(Date.now() - 1000 * 60 * 28),
    channel: 'general'
  },
  {
    id: '3',
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: undefined,
    content: 'Thinking about starting with the ChatGPT Basics. Any recommendations?',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    channel: 'general'
  },
  {
    id: '4',
    userId: 'user3',
    userName: 'Alex Kim',
    userAvatar: undefined,
    content: 'ChatGPT Basics is perfect for beginners! The hands-on exercises really help.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    channel: 'general'
  },
  {
    id: '5',
    userId: 'user4',
    userName: 'Jordan Taylor',
    userAvatar: undefined,
    content: 'Just completed the Midjourney module! The results are incredible. Here\'s what I created...',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    channel: 'ai-learning'
  },
  {
    id: '6',
    userId: 'user5',
    userName: 'Emma Wilson',
    userAvatar: undefined,
    content: 'That\'s amazing Jordan! How long did it take you to get comfortable with the prompting?',
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
    channel: 'ai-learning'
  },
  {
    id: '7',
    userId: 'user6',
    userName: 'David Park',
    userAvatar: undefined,
    content: 'Working on an AI chatbot for customer service. Anyone interested in collaborating?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    channel: 'projects'
  },
  {
    id: '8',
    userId: 'user7',
    userName: 'Lisa Thompson',
    userAvatar: undefined,
    content: 'I\'d love to help! I have experience with LangChain and vector databases.',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    channel: 'projects'
  }
]

export function LiquidGlassChat() {
  const [activeChannel, setActiveChannel] = useState('general')
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [showNotification, setShowNotification] = useState(true)
  const [channelUnreads, setChannelUnreads] = useState<Record<string, number>>({
    'general': 3,
    'ai-learning': 7,
    'projects': 2,
    'help': 0
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeChannel])

  useEffect(() => {
    // Hide notification after 5 seconds
    const timer = setTimeout(() => {
      setShowNotification(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleChannelSwitch = (channelId: string) => {
    setActiveChannel(channelId)
    // Clear unread count for this channel
    setChannelUnreads(prev => ({ ...prev, [channelId]: 0 }))
    setShowNotification(false)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content: inputValue,
      timestamp: new Date(),
      channel: activeChannel
    }

    setMessages([...messages, newMessage])
    setInputValue('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const currentChannelMessages = messages.filter(m => m.channel === activeChannel)
  const currentChannel = channels.find(c => c.id === activeChannel)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '600px',
      background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ea 50%, #d2d2d7 100%)',
      borderRadius: '24px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* SVG Filter for Glass Distortion */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Notification Square */}
      {showNotification && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: `
            inset 0 0 0 1px rgba(255, 255, 255, 0.9),
            inset 2px 2px 0px -1px rgba(255, 255, 255, 0.8),
            inset -2px -2px 0px -1px rgba(255, 255, 255, 0.6),
            inset 0px 2px 4px -2px rgba(0, 0, 0, 0.2),
            0px 4px 24px rgba(0, 0, 0, 0.1)
          `,
          minWidth: '400px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            marginBottom: '8px',
            color: '#000'
          }}>
            Welcome to the Network! 👋
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '24px'
          }}>
            You have new messages in these channels:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSwitch(channel.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>
                    #{channel.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                    {channel.lastMessage}
                  </div>
                </div>
                {channel.unreadCount > 0 && (
                  <div style={{
                    background: '#000',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {channel.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowNotification(false)}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Chatting
          </button>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        borderRadius: '16px',
        boxShadow: `
          inset 0 0 0 1px rgba(255, 255, 255, 0.5),
          inset 1px 1px 0px -1px rgba(255, 255, 255, 0.9),
          inset -1px -1px 0px -1px rgba(255, 255, 255, 0.7),
          inset 0px 1px 2px -1px rgba(0, 0, 0, 0.15),
          0px 2px 8px rgba(0, 0, 0, 0.08)
        `,
        position: 'relative'
      }}>
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelSwitch(channel.id)}
            style={{
              position: 'relative',
              flex: 1,
              padding: '12px 20px',
              background: activeChannel === channel.id
                ? 'rgba(0, 0, 0, 0.9)'
                : 'transparent',
              color: activeChannel === channel.id ? '#fff' : '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {channel.name}
            {channelUnreads[channel.id] > 0 && activeChannel !== channel.id && (
              <span style={{
                background: activeChannel === channel.id ? '#fff' : '#000',
                color: activeChannel === channel.id ? '#000' : '#fff',
                borderRadius: '8px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 800
              }}>
                {channelUnreads[channel.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        borderRadius: '16px',
        padding: '20px',
        overflowY: 'auto',
        boxShadow: `
          inset 0 0 0 1px rgba(255, 255, 255, 0.6),
          inset 2px 2px 0px -1px rgba(255, 255, 255, 0.9),
          inset -2px -2px 0px -1px rgba(255, 255, 255, 0.7),
          inset 0px 2px 4px -2px rgba(0, 0, 0, 0.1),
          0px 4px 16px rgba(0, 0, 0, 0.05)
        `
      }}>
        {/* Channel Header */}
        <div style={{
          borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          paddingBottom: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#000',
            marginBottom: '4px'
          }}>
            #{currentChannel?.name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#666'
          }}>
            {currentChannel?.description}
          </p>
        </div>

        {/* Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentChannelMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <Avatar
                src={message.userAvatar}
                name={message.userName}
                size="sm"
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#000'
                  }}>
                    {message.userName}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#999'
                  }}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.5
                }}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderRadius: '16px',
        boxShadow: `
          inset 0 0 0 1px rgba(255, 255, 255, 0.7),
          inset 2px 2px 0px -1px rgba(255, 255, 255, 0.95),
          inset -2px -2px 0px -1px rgba(255, 255, 255, 0.8),
          inset 0px 2px 4px -2px rgba(0, 0, 0, 0.1),
          0px 4px 12px rgba(0, 0, 0, 0.06)
        `
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Message #${currentChannel?.name.toLowerCase()}`}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#000',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '8px 16px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  )
}