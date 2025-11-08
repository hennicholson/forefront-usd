'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, X, Code, Image as ImageIcon, Video, Zap, FileText, Palette, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'image'
  metadata?: any
}

interface AIPlaygroundProps {
  moduleTitle: string
  moduleId?: string
  slideId?: string
  userId?: string
  currentSlide: {
    title: string
    content: string
    type?: string
  }
  isDarkMode: boolean
  onClose?: () => void
}

export function AIPlayground({ moduleTitle, moduleId, slideId, userId, currentSlide, isDarkMode, onClose }: AIPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const modelOptions = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0', category: 'Text', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { id: 'gpt-4', name: 'GPT-4', category: 'Text', icon: FileText, color: 'from-green-500 to-emerald-500' },
    { id: 'claude-3', name: 'Claude 3', category: 'Text', icon: Zap, color: 'from-orange-500 to-red-500' },
    { id: 'seedream-4', name: 'Seed Dream', category: 'Image', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
    { id: 'dall-e-3', name: 'DALL-E 3', category: 'Image', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { id: 'midjourney', name: 'Midjourney', category: 'Image', icon: ImageIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'runway-ml', name: 'Runway ML', category: 'Video', icon: Film, color: 'from-pink-500 to-rose-500' },
  ]

  const quickPrompts = [
    { icon: <Code size={14} />, label: 'Explain code', color: 'text-blue-500' },
    { icon: <ImageIcon size={14} />, label: 'Create image', color: 'text-purple-500' },
    { icon: <Zap size={14} />, label: 'Quick summary', color: 'text-yellow-500' },
    { icon: <Video size={14} />, label: 'Video tutorial', color: 'text-green-500' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          userId: userId,
          context: {
            userId: userId,
            moduleId: moduleId,
            slideId: slideId,
            moduleTitle,
            currentSlide: {
              title: currentSlide.title,
              content: currentSlide.content,
              type: currentSlide.type
            },
            conversationHistory: messages.slice(-5)
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          type: data.type || 'text',
          metadata: data.metadata
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleQuickPrompt = (label: string) => {
    setInput(`${label} for: ${currentSlide.title}`)
    inputRef.current?.focus()
  }

  return (
    <div className={cn(
      "h-full flex flex-col backdrop-blur-xl border-l",
      isDarkMode ? "bg-black/50 border-white/10 text-white" : "bg-white/50 border-gray-200 text-gray-900"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs opacity-60">Learning: {currentSlide.title}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"
            )}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10">
                <Sparkles size={32} className="text-blue-500" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-medium">How can I help?</h3>
                <p className="text-sm opacity-60 max-w-xs">
                  I'm here to help you learn. Ask me anything about the current slide or try a quick action below!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
              {quickPrompts.map((prompt, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(
                    "h-7 cursor-pointer gap-1.5 text-xs rounded-md transition-all hover:scale-105",
                    isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
                  )}
                  onClick={() => handleQuickPrompt(prompt.label)}
                >
                  <span className={prompt.color}>{prompt.icon}</span>
                  {prompt.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 border",
                    message.role === 'user'
                      ? "bg-blue-600 text-white border-blue-500"
                      : isDarkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-gray-100 border-gray-200"
                  )}
                >
                  {message.type === 'image' ? (
                    <div className="space-y-2">
                      <img
                        src={message.content}
                        alt="Generated image"
                        className="rounded-lg max-w-full h-auto"
                      />
                      {message.metadata?.aspectRatio && (
                        <p className="text-xs opacity-60">
                          Aspect ratio: {message.metadata.aspectRatio}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                  <p className={cn(
                    "text-xs mt-2 opacity-60",
                    message.role === 'user' && "text-blue-100"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={cn(
                  "rounded-2xl px-4 py-3 border",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                )}>
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin opacity-60" />
                    <span className="text-sm opacity-60">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "mt-auto border-t",
          isDarkMode ? "border-white/10" : "border-gray-200"
        )}>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className={cn(
              "relative rounded-xl ring-1 overflow-hidden",
              isDarkMode ? "ring-white/10" : "ring-gray-200"
            )}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm",
                  isDarkMode
                    ? "placeholder-white/40"
                    : "placeholder-gray-400"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute bottom-3 right-3 p-2 rounded-lg transition-all",
                  input.trim() && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : isDarkMode
                      ? "bg-white/5 text-white/40"
                      : "bg-gray-100 text-gray-400",
                  "disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            <div className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 border",
              isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
            )}>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className={cn(
                  "h-8 w-[160px] text-xs border-none shadow-none",
                  isDarkMode ? "bg-transparent text-white" : "bg-white"
                )}>
                  <SelectValue>
                    {(() => {
                      const selected = modelOptions.find(m => m.id === selectedModel)
                      if (!selected) return "Select model"
                      const Icon = selected.icon
                      return (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0",
                            selected.color
                          )}>
                            <Icon size={12} className="text-white" />
                          </div>
                          <span className="truncate">{selected.name}</span>
                        </div>
                      )
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={cn(
                  "z-[100]",
                  isDarkMode ? "bg-black/95 border-white/10" : "bg-white"
                )}>
                  {modelOptions.map(model => {
                    const Icon = model.icon
                    return (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        className={cn(
                          "text-xs cursor-pointer",
                          isDarkMode ? "text-white focus:bg-white/10 focus:text-white" : ""
                        )}
                      >
                        <div className="flex items-center gap-2.5 py-1">
                          <div className={cn(
                            "w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0",
                            model.color
                          )}>
                            <Icon size={14} className="text-white" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{model.name}</span>
                            <span className={cn(
                              "text-[10px]",
                              isDarkMode ? "text-white/60" : "text-gray-500"
                            )}>{model.category}</span>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <span className="text-xs opacity-60">Press</span>
                <kbd className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-mono border",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                )}>
                  ↵
                </kbd>
                <span className="text-xs opacity-60">to send</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
