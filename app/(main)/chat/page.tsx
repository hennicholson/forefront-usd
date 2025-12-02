'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChatSessionsSidebar } from '@/components/chat/ChatSessionsSidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Home, Maximize2, Minimize2, Sun, Moon, Sparkles, PanelLeftClose, PanelLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        <div className={`fixed top-0 left-0 right-0 h-14 sm:h-16 ${isDarkMode ? 'bg-[#1a1a1a]/50 border-[#2a2a2a]' : 'bg-white/50 border-zinc-200'} backdrop-blur-sm border-b flex items-center justify-between px-3 sm:px-4 z-40`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2.5 sm:p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Back to Dashboard"
            >
              <Home size={20} />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg lowercase tracking-tight" style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}>
                [forefront]
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`hidden sm:block text-sm lowercase tracking-wide ${isDarkMode ? 'text-[#666]' : 'text-zinc-600'}`} style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif", letterSpacing: '1.5px' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 sm:p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`hidden sm:flex p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-zinc-100'}`}
              style={{ minWidth: '44px', minHeight: '44px', alignItems: 'center', justifyContent: 'center' }}
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
      <div className={`fixed inset-0 flex overflow-hidden ${isFlowMode ? '' : 'pt-14 sm:pt-16'}`}>
        {/* Desktop Sidebar - Hide in Flow Mode and on Mobile */}
        {!isFlowMode && !isMobile && (
          <div
            className="relative overflow-hidden transition-all ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: isSidebarCollapsed ? '0px' : '280px',
              transitionDuration: '400ms',
              opacity: isSidebarCollapsed ? 0 : 1
            }}
          >
            <div className="absolute inset-0 w-[280px]">
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

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && showMobileSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowMobileSidebar(false)}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0, 0, 0, 0.8)' }}
              />
              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-full max-w-[320px]"
                style={{ top: '64px' }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full ${
                    isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                  } transition-colors`}
                >
                  <X size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
                </button>
                <ChatSessionsSidebar
                  sessions={sessions}
                  currentSessionId={currentSessionId}
                  onSelectSession={(id) => {
                    setCurrentSessionId(id)
                    setShowMobileSidebar(false)
                  }}
                  onCreateSession={async () => {
                    await handleCreateSession()
                    setShowMobileSidebar(false)
                  }}
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                  isLoading={isLoadingSessions}
                  isCollapsed={false}
                  onToggleCollapse={() => setShowMobileSidebar(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Expand Button - Show when collapsed (desktop) or always on mobile */}
        {!isFlowMode && (isSidebarCollapsed || isMobile) && !showMobileSidebar && (
          <button
            onClick={() => isMobile ? setShowMobileSidebar(true) : setIsSidebarCollapsed(false)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-r-lg transition-all duration-300 ${
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
          userName={user.name}
          onSessionUpdate={loadSessions}
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed || isMobile}
          onCollapseSidebar={() => isMobile ? setShowMobileSidebar(true) : setIsSidebarCollapsed(true)}
        />
      </div>
    </div>
  )
}
