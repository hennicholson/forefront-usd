'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, FileText, Video, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Generation {
  id: number
  userId: string
  moduleId: string | null
  slideId: string | null
  type: 'text' | 'image' | 'video'
  model: string
  prompt: string
  response: string | null
  metadata: any
  createdAt: string
}

interface GenerationHistoryProps {
  userId: string
  isDarkMode: boolean
  onClose: () => void
}

export function GenerationHistory({ userId, isDarkMode, onClose }: GenerationHistoryProps) {
  const [history, setHistory] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'video'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchHistory()
  }, [userId, filter])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ userId })
      if (filter !== 'all') {
        params.append('type', filter)
      }

      const response = await fetch(`/api/generation-history?${params}`)
      const data = await response.json()

      if (response.ok) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Video
      default: return FileText
    }
  }

  const getModelColor = (model: string) => {
    if (model.includes('gemini')) return 'from-blue-500 to-cyan-500'
    if (model.includes('seedream')) return 'from-cyan-500 to-blue-500'
    if (model.includes('dall-e')) return 'from-purple-500 to-pink-500'
    if (model.includes('gpt')) return 'from-green-500 to-emerald-500'
    if (model.includes('claude')) return 'from-orange-500 to-red-500'
    return 'from-gray-500 to-gray-600'
  }

  return (
    <div className={cn(
      "h-full flex flex-col backdrop-blur-xl border-l",
      isDarkMode ? "bg-zinc-900/80 border-zinc-800 text-white" : "bg-white/50 border-gray-200 text-gray-900"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Generation History</h3>
            <p className="text-xs opacity-60">{history.length} generations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"
          )}
        >
          <X size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex gap-2">
          {['all', 'text', 'image', 'video'].map((type) => (
            <Badge
              key={type}
              variant={filter === type ? "default" : "secondary"}
              className={cn(
                "cursor-pointer capitalize",
                filter === type
                  ? "bg-white text-black hover:bg-zinc-200"
                  : isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={() => setFilter(type as any)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 opacity-60">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-sm">Loading history...</span>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
              <Clock size={32} className="text-zinc-500" />
            </div>
            <p className="text-sm opacity-60">No generations yet</p>
          </div>
        ) : (
          history.map((item) => {
            const Icon = getModelIcon(item.type)
            const isExpanded = expandedItems.has(item.id)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-xl border overflow-hidden",
                  isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"
                )}
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={cn(
                    "w-full p-3 flex items-start gap-3 text-left transition-colors",
                    isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                    getModelColor(item.model)
                  )}>
                    <Icon size={16} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium capitalize">{item.model.replace('-', ' ')}</span>
                      <Badge variant="secondary" className={cn(
                        "text-[10px] h-4 px-1.5",
                        isDarkMode ? "bg-zinc-700" : "bg-gray-100"
                      )}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2 opacity-80">{item.prompt}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={16} className="opacity-60 shrink-0 mt-1" />
                  ) : (
                    <ChevronDown size={16} className="opacity-60 shrink-0 mt-1" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "border-t overflow-hidden",
                        isDarkMode ? "border-zinc-700" : "border-gray-200"
                      )}
                    >
                      <div className="p-3 space-y-3">
                        {/* Prompt */}
                        <div>
                          <p className="text-xs opacity-60 mb-1">Prompt:</p>
                          <p className="text-sm opacity-90">{item.prompt}</p>
                        </div>

                        {/* Response */}
                        {item.response && (
                          <div>
                            <p className="text-xs opacity-60 mb-1">Response:</p>
                            {item.type === 'image' ? (
                              <img
                                src={item.response}
                                alt="Generated image"
                                className="rounded-lg max-w-full h-auto"
                              />
                            ) : (
                              <p className="text-sm opacity-90 whitespace-pre-wrap line-clamp-6">{item.response}</p>
                            )}
                          </div>
                        )}

                        {/* Metadata */}
                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                          <div>
                            <p className="text-xs opacity-60 mb-1">Details:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.metadata).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className={cn(
                                  "text-[10px]",
                                  isDarkMode ? "bg-zinc-700" : "bg-gray-100"
                                )}>
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
