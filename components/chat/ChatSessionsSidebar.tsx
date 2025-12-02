'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Trash2, Edit2, Check, X, MoreVertical, Search, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface ChatSessionsSidebarProps {
  sessions: Session[]
  currentSessionId: number | null
  onSelectSession: (id: number) => void
  onCreateSession: () => void
  onDeleteSession: (id: number) => void
  onRenameSession: (id: number, newTitle: string) => void
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ChatSessionsSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isLoading,
  isCollapsed = false,
  onToggleCollapse,
}: ChatSessionsSidebarProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleStartEdit = (session: Session) => {
    setEditingId(session.id)
    setEditTitle(session.title)
    setMenuOpenId(null)
  }

  const handleSaveEdit = (sessionId: number) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleDelete = (sessionId: number) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      onDeleteSession(sessionId)
      setMenuOpenId(null)
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full h-full bg-black relative flex flex-col text-white flex-shrink-0">
      {/* Fading borders - subtle vignette effect */}
      {/* Right edge - main separator fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(39, 39, 42, 0.5) 10%, rgba(39, 39, 42, 0.5) 90%, transparent 100%)'
        }}
      />
      {/* Top edge - subtle fade */}
      <div
        className="absolute left-0 right-0 top-0 h-8 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 100%)'
        }}
      />
      {/* Bottom edge - subtle fade */}
      <div
        className="absolute left-0 right-0 bottom-0 h-8 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, transparent 100%)'
        }}
      />

      {/* Header */}
      <div className="p-3 space-y-2 border-b border-zinc-900 relative z-10">
        <motion.button
          onClick={onCreateSession}
          whileHover={{ scale: 1.02, backgroundColor: 'rgb(228, 228, 231)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full px-3 py-2 bg-white text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2"
          style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
        >
          <Plus size={16} />
          new chat
        </motion.button>

        {/* Search */}
        {sessions.length > 0 && (
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors duration-200 peer-focus:text-zinc-400" size={14} />
            <motion.input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              whileFocus={{ borderColor: 'rgb(63, 63, 70)' }}
              transition={{ duration: 0.2 }}
              className="peer w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs focus:outline-none text-white placeholder:text-zinc-600 transition-all duration-200"
              style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
            />
          </motion.div>
        )}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-zinc-500 text-sm">
            Loading sessions...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {searchQuery ? (
              <>
                <Search size={40} className="text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500">no chats found</p>
                <p className="text-xs text-zinc-600 mt-1">try a different search</p>
              </>
            ) : (
              <>
                <MessageSquare size={40} className="text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500">no chat sessions yet</p>
                <p className="text-xs text-zinc-600 mt-1">create one to get started</p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                {editingId === session.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="p-3 bg-zinc-800/70 rounded-xl border border-zinc-700/50 backdrop-blur-sm"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(session.id)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="w-full px-2 py-1 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 text-white"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        onClick={() => handleSaveEdit(session.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={14} />
                        Save
                      </motion.button>
                      <motion.button
                        onClick={handleCancelEdit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="flex-1 px-2 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={14} />
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                      currentSessionId === session.id
                        ? "bg-zinc-900"
                        : "hover:bg-zinc-900/50"
                    )}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex-shrink-0">
                      <MessageSquare size={16} className="text-zinc-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-normal truncate text-white" style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}>
                        {session.title}
                      </h4>
                    </div>

                    {/* Menu Button */}
                    <div className="flex-shrink-0">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenId(menuOpenId === session.id ? null : session.id)
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={cn(
                          "p-1 rounded-md transition-all",
                          menuOpenId === session.id
                            ? "bg-zinc-800 opacity-100"
                            : "hover:bg-zinc-800 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <MoreVertical size={14} />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {menuOpenId === session.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute right-2 top-full mt-1 bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl z-10 py-1 min-w-[160px] overflow-hidden"
                          >
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartEdit(session)
                              }}
                              whileHover={{ x: 2, backgroundColor: 'rgba(63, 63, 70, 0.5)' }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 text-white"
                            >
                              <Edit2 size={14} />
                              Rename
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(session.id)
                              }}
                              whileHover={{ x: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={14} />
                              Delete
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer with Collapse Button */}
      <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/50 relative z-10">
        {onToggleCollapse && (
          <motion.button
            onClick={onToggleCollapse}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-all duration-200 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <PanelLeftClose size={16} />
            <span>collapse sidebar</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
