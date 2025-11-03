'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Send, Search, Users, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: number
  senderId: string
  receiverId: string | null
  roomId: string | null
  content: string
  type: string
  createdAt: Date
  senderName?: string
  senderProfileImage?: string | null
  read?: boolean
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

interface Channel {
  id: string
  name: string
  icon: string
  topic: string
  description: string
  messageCount?: number
}

const CHANNELS: Channel[] = [
  { id: 'general', name: 'General', icon: '💬', topic: '', description: 'General discussions' },
  { id: 'ai-video', name: 'AI Video', icon: '🎥', topic: 'AI Video', description: 'AI video creation and editing' },
  { id: 'vibe-coding', name: 'Vibe Coding', icon: '💻', topic: 'Vibe Coding', description: 'Coding while vibing' },
  { id: 'marketing', name: 'Marketing', icon: '📈', topic: 'Marketing', description: 'Marketing strategies and growth' },
  { id: 'automation', name: 'Automation', icon: '⚡', topic: 'Automation', description: 'Workflow automation' },
  { id: 'help', name: 'Help', icon: '❓', topic: 'Help', description: 'Get help from the community' }
]

export default function NetworkV2Page() {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'channels' | 'dm'>('channels')
  const [activeChannel, setActiveChannel] = useState('general')
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Fetch channels/conversations and messages
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    if (activeTab === 'channels') {
      fetchChannelMessages(activeChannel)
    } else {
      fetchConversations()
      if (activeConversation) {
        fetchDirectMessages(activeConversation)
      }
    }
  }, [isAuthenticated, user, activeTab, activeChannel, activeConversation])

  const fetchChannelMessages = async (channel: string) => {
    try {
      setLoading(true)
      const topic = CHANNELS.find(c => c.id === channel)?.topic || ''
      const res = await fetch(`/api/messages?roomId=${channel}&topic=${topic}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  const fetchDirectMessages = async (userId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/messages?receiverId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching DMs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user?.id || sending) return

    setSending(true)
    try {
      const messageData = activeTab === 'channels'
        ? { roomId: activeChannel, content: inputValue, topic: CHANNELS.find(c => c.id === activeChannel)?.topic || '' }
        : { receiverId: activeConversation, content: inputValue }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (res.ok) {
        setInputValue('')
        if (activeTab === 'channels') {
          fetchChannelMessages(activeChannel)
        } else if (activeConversation) {
          fetchDirectMessages(activeConversation)
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  const filteredConversations = conversations.filter(c =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign in to access Network</h1>
          <p className="text-gray-400">Connect with other learners and share your journey</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">

          {/* Sidebar */}
          <div className="col-span-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 flex flex-col">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'channels'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Channels
              </button>
              <button
                onClick={() => setActiveTab('dm')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'dm'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <MessageSquare className="inline-block w-4 h-4 mr-2" />
                Messages
              </button>
            </div>

            {/* Search */}
            {activeTab === 'dm' && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>
            )}

            {/* Channels List */}
            {activeTab === 'channels' && (
              <div className="flex-1 overflow-y-auto space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Channels
                </div>
                {CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      activeChannel === channel.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{channel.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{channel.name}</div>
                        <div className="text-xs text-gray-500 truncate">{channel.description}</div>
                      </div>
                      {channel.messageCount && channel.messageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {channel.messageCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* DM List */}
            {activeTab === 'dm' && (
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
                      onClick={() => setActiveConversation(conv.userId)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        activeConversation === conv.userId
                          ? 'bg-zinc-800 text-white'
                          : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
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
                            <span className="font-medium text-sm truncate">{conv.userName}</span>
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
          </div>

          {/* Main Chat Area */}
          <div className="col-span-9 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-zinc-800 px-6 py-4">
              {activeTab === 'channels' ? (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CHANNELS.find(c => c.id === activeChannel)?.icon}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {CHANNELS.find(c => c.id === activeChannel)?.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {CHANNELS.find(c => c.id === activeChannel)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeConversation ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversations.find(c => c.userId === activeConversation)?.userProfileImage || undefined} />
                    <AvatarFallback>
                      {conversations.find(c => c.userId === activeConversation)?.userName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === user?.id
                  return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={message.senderProfileImage || undefined} />
                          <AvatarFallback>{message.senderName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {!isOwn && (
                          <span className="text-xs text-gray-400 mb-1">{message.senderName}</span>
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
                          {isOwn && message.read && (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          )}
                          {isOwn && !message.read && (
                            <Check className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={`Message ${activeTab === 'channels' ? `#${activeChannel}` : conversations.find(c => c.userId === activeConversation)?.userName || '...'}`}
                  className="flex-1 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500"
                  disabled={sending || (activeTab === 'dm' && !activeConversation)}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sending || (activeTab === 'dm' && !activeConversation)}
                  className="px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
