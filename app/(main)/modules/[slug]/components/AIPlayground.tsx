'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, X, Code, Image as ImageIcon, Video, Zap, FileText, Palette, Film, Bookmark, BookmarkCheck, Check, AlertCircle, Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useConversation } from '@elevenlabs/react'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'image' | 'video'
  metadata?: any
  saved?: boolean
  generationId?: number
  userPrompt?: string
}

interface AIPlaygroundProps {
  moduleTitle: string
  moduleId?: string
  moduleSlug?: string
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

export function AIPlayground({ moduleTitle, moduleId, moduleSlug, slideId, userId, currentSlide, isDarkMode, onClose }: AIPlaygroundProps) {
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [newFolderName, setNewFolderName] = useState('')
  const [savingMessageIndex, setSavingMessageIndex] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdCounter = useRef(0)

  // Voice mode state
  const [agentId, setAgentId] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  // Use ElevenLabs conversation hook
  const conversation = useConversation({
    micMuted: isMuted,
    onConnect: () => {
      showToast('success', 'Voice mentor connected!')
    },
    onDisconnect: () => {
      showToast('success', 'Voice mentor disconnected')
    },
    onError: (error) => {
      console.error('Voice error:', error)
      showToast('error', 'Voice connection error')
    },
    onMessage: (message) => {
      console.log('Message from agent:', message)
    },
  })

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

  // Load user's folders
  useEffect(() => {
    if (userId) {
      loadFolders()
    }
  }, [userId])


  const showToast = (type: 'success' | 'error', message: string) => {
    const id = toastIdCounter.current++
    const newToast = { id, type, message }
    setToasts(prev => [...prev, newToast])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const loadFolders = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/folders?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      }
    } catch (err) {
      console.error('Error loading folders:', err)
    }
  }

  const handleDoubleClick = (messageIndex: number) => {
    const message = messages[messageIndex]
    if (message.role === 'assistant') {
      openFolderModal(messageIndex)
    }
  }

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
          metadata: data.metadata,
          userPrompt: input,
          saved: false
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

  const handleSaveToFolder = async (folder: string) => {
    console.log('handleSaveToFolder called with folder:', folder)
    console.log('savingMessageIndex:', savingMessageIndex)

    if (savingMessageIndex === null) {
      console.log('No message index set')
      return
    }

    const message = messages[savingMessageIndex]
    console.log('Message to save:', message)

    if (!userId || !message || message.role !== 'assistant') {
      console.log('Invalid conditions - userId:', userId, 'message:', message)
      return
    }

    try {
      console.log('Saving to generation history...')
      // First, save to generation history
      const saveRes = await fetch('/api/generation-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          moduleId: moduleId || null,
          slideId: slideId || null,
          type: message.type || 'text',
          model: selectedModel,
          prompt: message.userPrompt || 'Unknown prompt',
          response: message.content,
          metadata: { ...message.metadata, folder }
        })
      })

      console.log('Save response status:', saveRes.status)

      if (saveRes.ok) {
        const { generation } = await saveRes.json()
        console.log('Generation created:', generation)

        // Then mark as saved
        console.log('Marking as saved...')
        const updateRes = await fetch('/api/generation-history', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationId: generation.id,
            userId,
            saved: true,
            tags: [folder]
          })
        })

        console.log('Update response status:', updateRes.status)

        if (updateRes.ok) {
          // Update local state
          setMessages(prev => prev.map((msg, idx) =>
            idx === savingMessageIndex
              ? { ...msg, saved: true, generationId: generation.id }
              : msg
          ))
          setShowFolderModal(false)
          setSavingMessageIndex(null)
          showToast('success', `Saved to "${folder}" folder!`)
        } else {
          const errorData = await updateRes.json()
          console.error('Update failed:', errorData)
          showToast('error', 'Failed to mark as saved')
        }
      } else {
        const errorData = await saveRes.json()
        console.error('Save failed:', errorData)
        showToast('error', 'Failed to save generation')
      }
    } catch (error) {
      console.error('Error saving generation:', error)
      showToast('error', 'Failed to save generation')
    }
  }

  const handleCreateFolder = async () => {
    // Get value directly from input ref to avoid state timing issues
    const folderNameValue = folderInputRef.current?.value?.trim() || newFolderName.trim()

    console.log('handleCreateFolder called')
    console.log('folderNameValue from ref:', folderInputRef.current?.value)
    console.log('newFolderName from state:', newFolderName)
    console.log('userId:', userId)

    if (!folderNameValue || !userId) {
      console.log('Missing folder name or userId')
      showToast('error', 'Please enter a folder name')
      return
    }

    try {
      console.log('Creating folder:', folderNameValue)
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          folderName: folderNameValue
        })
      })

      console.log('Folder creation response status:', res.status)
      const data = await res.json()
      console.log('Folder creation response data:', data)

      if (res.ok) {
        console.log('Folder created successfully, reloading folders...')
        await loadFolders()
        console.log('Saving to newly created folder...')
        // Automatically save to the newly created folder
        await handleSaveToFolder(folderNameValue)
        setNewFolderName('')
        if (folderInputRef.current) {
          folderInputRef.current.value = ''
        }
      } else {
        console.error('Failed to create folder:', data)
        alert('Failed to create folder: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Error creating folder: ' + error)
    }
  }

  const openFolderModal = (messageIndex: number) => {
    console.log('Opening folder modal for message:', messageIndex)
    setSavingMessageIndex(messageIndex)
    setNewFolderName('') // Reset folder name
    setShowFolderModal(true)
  }

  // Voice mode functions
  const startVoiceSession = async () => {
    try {
      // First, sync the module to create KB and agent if needed
      if (moduleSlug) {
        showToast('success', 'Syncing module content...')
        const syncRes = await fetch('/api/elevenlabs/sync-module', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: moduleSlug })
        })

        if (!syncRes.ok) {
          throw new Error('Failed to sync module')
        }

        const { agent } = await syncRes.json()
        setAgentId(agent.id)

        // Get WebSocket connection
        const sessionRes = await fetch(`/api/elevenlabs/voice-agent?agentId=${agent.id}`)
        if (!sessionRes.ok) {
          throw new Error('Failed to create voice session')
        }

        const { signedUrl } = await sessionRes.json()
        setSignedUrl(signedUrl)

        // Start the conversation using the hook
        await conversation.startSession({ signedUrl })
      }
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      showToast('error', error.message || 'Failed to start voice session')
    }
  }

  const stopVoiceSession = async () => {
    await conversation.endSession()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession()
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border-l border-zinc-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-zinc-500">Learning: {currentSlide.title}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => setMode('text')}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === 'text'
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Text Chat
          </button>
          <button
            onClick={() => setMode('voice')}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              mode === 'voice'
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Mic size={14} />
            Voice Mode
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {mode === 'voice' ? (
          /* Voice Mode UI */
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Voice Status Indicator */}
              <div className="relative">
                <motion.div
                  animate={conversation.status === 'connected' ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: conversation.status === 'connected' ? Infinity : 0
                  }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-2xl",
                    conversation.status === 'connected' ? "bg-green-500" : "bg-zinc-700"
                  )}
                />
                <div className={cn(
                  "relative p-8 rounded-full border-2 transition-all",
                  conversation.status === 'connected'
                    ? "bg-green-500/20 border-green-500"
                    : "bg-zinc-800/50 border-zinc-700"
                )}>
                  <Mic size={48} className={conversation.status === 'connected' ? "text-green-400" : "text-zinc-500"} />
                </div>
              </div>

              {/* Status Text */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">
                  {conversation.status === 'connected' ? "Voice Mentor Active" : "Voice Mentor"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  {conversation.status === 'connected'
                    ? "I'm listening! Ask me anything about the module."
                    : "Click connect to start talking with your AI mentor"}
                </p>
              </div>

              {/* Connect/Disconnect Button */}
              <button
                onClick={conversation.status === 'connected' ? stopVoiceSession : startVoiceSession}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
                  conversation.status === 'connected'
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-zinc-200 text-black"
                )}
              >
                {conversation.status === 'connected' ? (
                  <>
                    <PhoneOff size={20} />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Phone size={20} />
                    Connect Voice Mentor
                  </>
                )}
              </button>

              {/* Mute Toggle (only when connected) */}
              {conversation.status === 'connected' && (
                <button
                  onClick={toggleMute}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    isMuted
                      ? "bg-zinc-800 text-zinc-400"
                      : "bg-zinc-800/50 text-white hover:bg-zinc-800"
                  )}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>

            {/* Transcript Display - Coming Soon */}
            {/* conversation.messages is not available in the current SDK version */}
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                <Sparkles size={32} className="text-zinc-500" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-medium">How can I help?</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  I'm here to help you learn. Ask me anything about the current slide or try a quick action below!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
              {quickPrompts.map((prompt, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="h-7 cursor-pointer gap-1.5 text-xs rounded-md transition-all hover:scale-105 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700"
                  onClick={() => handleQuickPrompt(prompt.label)}
                >
                  <span className="text-zinc-500">{prompt.icon}</span>
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
                  onDoubleClick={() => handleDoubleClick(index)}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 border relative cursor-pointer",
                    message.role === 'user'
                      ? "bg-white text-black border-zinc-700"
                      : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                  )}
                  title={message.role === 'assistant' ? "Double-click to save" : undefined}
                >
                  {message.type === 'image' || message.type === 'video' ? (
                    <div className="space-y-2">
                      {message.type === 'image' ? (
                        <img
                          src={message.content}
                          alt="Generated image"
                          className="rounded-lg max-w-full h-auto"
                        />
                      ) : (
                        <video
                          src={message.content}
                          controls
                          className="rounded-lg max-w-full h-auto"
                        />
                      )}
                      {message.metadata?.aspectRatio && (
                        <p className="text-xs opacity-60">
                          Aspect ratio: {message.metadata.aspectRatio}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                  <p className="text-xs mt-2 opacity-60 flex items-center gap-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.saved && (
                      <span className="text-green-400 flex items-center gap-1">
                        <BookmarkCheck size={12} /> Saved
                      </span>
                    )}
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
                <div className="rounded-2xl px-4 py-3 border bg-zinc-800/50 border-zinc-700">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-zinc-500" />
                    <span className="text-sm text-zinc-500">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area (only in text mode) */}
        {mode === 'text' && (
          <div className="mt-auto border-t border-zinc-800">
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="relative rounded-xl ring-1 ring-zinc-700 overflow-hidden bg-zinc-800/50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={3}
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm placeholder:text-zinc-600 text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute bottom-3 right-3 p-2 rounded-lg transition-all",
                  input.trim() && !isLoading
                    ? "bg-white hover:bg-zinc-200 text-black"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg px-3 py-2 border bg-zinc-800/30 border-zinc-700">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-8 w-[160px] text-xs border-none shadow-none bg-transparent">
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
                <SelectContent className="z-[100] bg-zinc-900 border-zinc-700">
                  {modelOptions.map(model => {
                    const Icon = model.icon
                    return (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        className="text-xs cursor-pointer"
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
                            <span className="text-[10px] text-zinc-500">{model.category}</span>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500">Press</span>
                <kbd className="px-1.5 py-0.5 rounded text-xs font-mono border bg-zinc-800 border-zinc-700">
                  ↵
                </kbd>
                <span className="text-xs text-zinc-500">to send</span>
              </div>
            </div>
            </form>
          </div>
        )}
      </div>

      {/* Folder Selection Modal */}
      {showFolderModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => {
            setShowFolderModal(false)
            setSavingMessageIndex(null)
          }}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save to Folder</h3>
              <button
                onClick={() => {
                  setShowFolderModal(false)
                  setSavingMessageIndex(null)
                }}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Existing Folders */}
            {folders.length > 0 && (
              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">Select a folder:</label>
                <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                  {folders.map((folder) => (
                    <button
                      key={folder}
                      onClick={() => handleSaveToFolder(folder)}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors flex items-center gap-2"
                    >
                      <Bookmark size={16} />
                      {folder}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Folder */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Or create a new folder:</label>
              <div className="flex gap-2">
                <input
                  ref={folderInputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value)
                    setNewFolderName(e.target.value)
                  }}
                  placeholder="Folder name..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateFolder()
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[1001] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px]",
                toast.type === 'success'
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              {toast.type === 'success' ? (
                <Check size={20} className="shrink-0" />
              ) : (
                <AlertCircle size={20} className="shrink-0" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
