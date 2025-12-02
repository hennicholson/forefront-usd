'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChatSessionsSidebar } from '@/components/chat/ChatSessionsSidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Home, Maximize2, Minimize2, Sun, Moon, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react'

interface Session {
  id: number
  userId: string
  title: string
  createdAt: Date | string
  updatedAt: Date | string
  lastMessageAt: Date | string
  messageCount: number
  isPinned: boolean
  tags: string[]
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isFlowMode, setIsFlowMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      try {
        await document.documentElement.requestFullscreen()
        setIsFlowMode(true)
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
        // Fallback to Flow Mode without true fullscreen
        setIsFlowMode(true)
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
      setIsFlowMode(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFlowMode) {
        setIsFlowMode(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isFlowMode])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Load sessions on mount
  useEffect(() => {
    if (user?.id) {
      loadSessions()
    }
  }, [user?.id])

  const loadSessions = async () => {
    if (!user?.id) return

    try {
      setIsLoadingSessions(true)
      const response = await fetch(`/api/chat-sessions?userId=${user.id}`)

      if (!response.ok) throw new Error('Failed to load sessions')

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleCreateSession = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Chat',
        }),
      })

      if (!response.ok) throw new Error('Failed to create session')

      const data = await response.json()
      const newSession = data.session

      // Add to sessions list and select it
      setSessions((prev) => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete session')

      // Remove from sessions list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      // Clear current session if deleted
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const handleRenameSession = async (sessionId: number, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) throw new Error('Failed to rename session')

      const data = await response.json()

      // Update session in list
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? data.session : s))
      )
    } catch (error) {
      console.error('Error renaming session:', error)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      {/* Custom Header - Hide in Flow Mode */}
      {!isFlowMode && (
        <div className={`fixed top-0 left-0 right-0 h-16 ${isDarkMode ? 'bg-[#1a1a1a]/50 border-[#2a2a2a]' : 'bg-white/50 border-zinc-200'} backdrop-blur-sm border-b flex items-center justify-between px-4 z-40`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              title="Back to Dashboard"
            >
              <Home size={20} />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              <h1 className="font-bold text-lg lowercase tracking-tight" style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}>
                forefront llm playground
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`text-sm lowercase tracking-wide ${isDarkMode ? 'text-[#666]' : 'text-zinc-600'}`} style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif", letterSpacing: '1.5px' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              title="Flow Mode - Enhanced focus, less distraction"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Flow Mode Exit Button */}
      {isFlowMode && (
        <button
          onClick={async () => {
            if (document.fullscreenElement) {
              await document.exitFullscreen()
            }
            setIsFlowMode(false)
          }}
          className={`fixed top-4 right-4 z-50 p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#1a1a1a]/80 hover:bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-white/80 hover:bg-zinc-100 border-zinc-300'} backdrop-blur-sm border`}
          title="Exit Flow Mode"
        >
          <Minimize2 size={18} />
        </button>
      )}

      {/* Chat Layout */}
      <div className="fixed inset-0 flex overflow-hidden" style={{ top: isFlowMode ? '0' : '64px', height: isFlowMode ? '100vh' : 'calc(100vh - 64px)' }}>
        {/* Sidebar - Hide in Flow Mode */}
        {!isFlowMode && (
          <div
            className="relative transition-all duration-300 ease-in-out overflow-hidden"
            style={{ width: isSidebarCollapsed ? '0px' : '320px' }}
          >
            <div className="absolute inset-0 w-[320px]">
              <ChatSessionsSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={setCurrentSessionId}
                onCreateSession={handleCreateSession}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                isLoading={isLoadingSessions}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            </div>
          </div>
        )}

        {/* Floating Expand Button - Show when collapsed */}
        {!isFlowMode && isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-l-0 border-[#2a2a2a]'
                : 'bg-white hover:bg-zinc-100 border border-l-0 border-zinc-300'
            } shadow-lg`}
            title="Show sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* Main Chat Area */}
        <ChatInterface
          sessionId={currentSessionId}
          userId={user.id}
          onSessionUpdate={loadSessions}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  )
}
