'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, Copy, Bookmark, ChevronDown, Mic, MicOff, Phone, PhoneOff, Code2, MessageSquare, GripVertical, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { MarkdownMessage } from '@/components/ui/markdown-message'
import { ModelSelectorModal } from '@/components/ui/model-selector-modal'
import { getModelById } from '@/lib/models/all-models'
import { ChainStepCard } from './ChainStepCard'
import { OrchestrationFlowDiagram } from './OrchestrationFlowDiagram'
import { CodeEditor } from './CodeEditor'
import { AILoader } from '@/components/ui/ai-loader'
import { VideoChat } from './VideoChat'
import { useConversation } from '@elevenlabs/react'

interface Message {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: any
  createdAt: Date | string
}

interface ChatInterfaceProps {
  sessionId: number | null
  userId: string
  onSessionUpdate?: () => void
  isDarkMode?: boolean
  sessionTitle?: string
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

export function ChatInterface({ sessionId, userId, onSessionUpdate, isDarkMode = true, sessionTitle }: ChatInterfaceProps) {
  const [mode, setMode] = useState<'text' | 'voice' | 'code' | 'video'>('text')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('forefront-intelligence')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [savingMessageId, setSavingMessageId] = useState<number | null>(null)
  const [streamingSteps, setStreamingSteps] = useState<any[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null)
  const toastIdCounter = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Voice mode state
  const [agentId, setAgentId] = useState<string | null>(null)
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false)
  const conversation = useConversation()

  // Code editor state
  const [editorCode, setEditorCode] = useState({
    html: '',
    css: '',
    javascript: ''
  })
  const [chatPanelWidth, setChatPanelWidth] = useState(50) // percentage - changed to 50/50 default
  const [isResizing, setIsResizing] = useState(false)

  // Video mode state
  const [videoTranscript, setVideoTranscript] = useState<any[]>([])
  const [videoContext, setVideoContext] = useState('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  // Load code from database when session/mode changes
  useEffect(() => {
    if (sessionId && mode === 'code' && messages.length > 0) {
      // Find the most recent assistant message with code metadata
      const lastCodeMessage = messages
        .filter(m => m.role === 'assistant' && m.metadata?.code)
        .pop()

      if (lastCodeMessage?.metadata?.code) {
        // Load code from database metadata
        setEditorCode(lastCodeMessage.metadata.code)
      } else {
        // Fallback: extract code from last assistant message content
        const lastAssistantMessage = messages
          .filter(m => m.role === 'assistant')
          .pop()

        if (lastAssistantMessage?.content) {
          const content = lastAssistantMessage.content
          const htmlMatch = content.match(/```html\n([\s\S]*?)```/)
          const cssMatch = content.match(/```css\n([\s\S]*?)```/)
          const jsMatch = content.match(/```javascript\n([\s\S]*?)```/)

          const extracted = {
            html: htmlMatch ? htmlMatch[1].trim() : '',
            css: cssMatch ? cssMatch[1].trim() : '',
            javascript: jsMatch ? jsMatch[1].trim() : ''
          }

          if (extracted.html || extracted.css || extracted.javascript) {
            setEditorCode(extracted)
          }
        }
      }
    }
  }, [sessionId, mode, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when session changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/chat-sessions/${sessionId}/messages`)
        if (!response.ok) throw new Error('Failed to load messages')

        const data = await response.json()
        setMessages(data.messages || [])
        setError(null)
      } catch (err: any) {
        console.error('Error loading messages:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [sessionId])

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = toastIdCounter.current++
    const newToast = { id, type, message }
    setToasts(prev => [...prev, newToast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const handleSaveMessage = async (messageId: number | undefined) => {
    if (!messageId) {
      showToast('error', 'Message not saved to database yet')
      return
    }

    try {
      setSavingMessageId(messageId)

      const response = await fetch(`/api/chat-messages/${messageId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save message')
      }

      showToast('success', 'Saved to AI portfolio!')
    } catch (err: any) {
      console.error('Error saving message:', err)
      showToast('error', err.message || 'Failed to save message')
    } finally {
      setSavingMessageId(null)
    }
  }

  // Voice mode functions
  const startVoiceSession = async (additionalContext?: string) => {
    try {
      setIsVoiceConnecting(true)
      showToast('success', 'Connecting to voice assistant...')

      // Prepare conversation history with video context if available
      const conversationHistory = messages.slice(-5) // Last 5 messages for context

      // Add video context as system message if available
      if (additionalContext) {
        conversationHistory.unshift({
          role: 'system',
          content: `Video context: ${additionalContext}`,
          createdAt: new Date().toISOString()
        })
      }

      const response = await fetch('/api/elevenlabs/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create voice agent')
      }

      const { agent, signedUrl } = await response.json()
      setAgentId(agent.id)

      await conversation.startSession({ signedUrl })
      showToast('success', 'Voice assistant connected!')
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      showToast('error', error.message || 'Failed to start voice session')
      setMode('text') // Fall back to text mode
    } finally {
      setIsVoiceConnecting(false)
    }
  }

  const stopVoiceSession = async () => {
    try {
      await conversation.endSession()
      setAgentId(null)
      showToast('success', 'Voice session ended')
    } catch (error: any) {
      console.error('Error stopping voice session:', error)
      showToast('error', 'Failed to stop voice session')
    }
  }

  // Start voice session when switching to voice mode
  useEffect(() => {
    if (mode === 'voice' && !conversation.status && sessionId) {
      startVoiceSession()
    } else if (mode === 'text' && conversation.status === 'connected') {
      stopVoiceSession()
    }
  }, [mode, sessionId])

  // Auto-switch to Gemini 3 Pro when code mode is selected
  useEffect(() => {
    if (mode === 'code') {
      setSelectedModel('gemini-3-pro')
    }
  }, [mode])

  // Handle resizing for code editor mode
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      e.preventDefault()

      const container = document.getElementById('code-editor-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Constrain between 25% and 75%
      const constrainedWidth = Math.max(25, Math.min(75, newWidth))
      setChatPanelWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + K: Focus input
      if (modifier && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // Cmd/Ctrl + \: Toggle split ratio (only in code mode)
      if (modifier && e.key === '\\' && mode === 'code') {
        e.preventDefault()
        setChatPanelWidth(prev => prev === 50 ? 30 : 50)
      }

      // Escape: Clear input focus
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  // Code extraction helper function
  const extractCodeFromMarkdown = (content: string) => {
    const htmlMatch = content.match(/```html\n([\s\S]*?)```/)
    const cssMatch = content.match(/```css\n([\s\S]*?)```/)
    const jsMatch = content.match(/```javascript\n([\s\S]*?)```/)

    return {
      html: htmlMatch ? htmlMatch[1].trim() : editorCode.html,
      css: cssMatch ? cssMatch[1].trim() : editorCode.css,
      javascript: jsMatch ? jsMatch[1].trim() : editorCode.javascript,
    }
  }

  // Handle code editor submit
  const handleCodeSubmit = async () => {
    if (!input.trim() || isLoading || !sessionId) return

    const messageContent = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Save user message to database
      const userMessageResponse = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content: messageContent,
        }),
      })

      if (!userMessageResponse.ok) throw new Error('Failed to save user message')

      const { message: savedUserMessage } = await userMessageResponse.json()
      setMessages((prev) => [...prev, savedUserMessage])

      // Update session's lastMessageAt
      if (onSessionUpdate) onSessionUpdate()

      // Generate code
      const response = await fetch('/api/chat/code-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          currentCode: editorCode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let assistantMessage = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage += parsed.content

                // Update messages in real-time
                setMessages((prev) => {
                  const lastMsg = prev[prev.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: assistantMessage },
                    ]
                  }
                  return [
                    ...prev,
                    {
                      role: 'assistant',
                      content: assistantMessage,
                      createdAt: new Date().toISOString(),
                    },
                  ]
                })

                // Extract and update code periodically
                const extracted = extractCodeFromMarkdown(assistantMessage)
                if (extracted.html || extracted.css || extracted.javascript) {
                  setEditorCode(extracted)
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Final extraction
      const finalCode = extractCodeFromMarkdown(assistantMessage)
      setEditorCode(finalCode)

      // Save assistant message to database with code metadata
      if (assistantMessage) {
        const assistantMessageResponse = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: assistantMessage,
            metadata: {
              code: finalCode, // Store the extracted code
              mode: 'code', // Mark this as a code editor message
            },
          }),
        })

        if (assistantMessageResponse.ok) {
          const { message: savedAssistantMessage } = await assistantMessageResponse.json()

          // Update the last message with the saved version (includes ID)
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.id) {
              return [...prev.slice(0, -1), savedAssistantMessage]
            }
            return prev
          })

          // Update session's lastMessageAt
          if (onSessionUpdate) onSessionUpdate()
        }
      }

    } catch (error: any) {
      console.error('Error generating code:', error)
      setError(error.message)
      showToast('error', 'Failed to generate code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId || !input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)
    setStreamingSteps([])
    setCurrentStepIndex(null)

    try {
      // Use SSE endpoint for real-time progress
      const eventSource = new EventSource(
        `/api/forefront/chat-stream?${new URLSearchParams({
          sessionId: sessionId.toString(),
          message: messageContent,
          userId,
          model: selectedModel,
        })}`
      )

      // Actually we need to use POST, let me use fetch instead
      const response = await fetch('/api/forefront/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageContent,
          userId,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'step-start') {
              console.log('[SSE] Step started:', data)
              setCurrentStepIndex(data.step - 1)
              setStreamingSteps(prev => {
                const newSteps = [...prev]
                newSteps[data.step - 1] = {
                  step: data.step,
                  purpose: data.purpose,
                  model: data.model,
                  status: 'running',
                  totalSteps: data.totalSteps
                }
                return newSteps
              })
            } else if (data.type === 'step-complete') {
              console.log('[SSE] Step completed:', data)
              setStreamingSteps(prev => {
                const newSteps = [...prev]
                newSteps[data.step - 1] = {
                  ...newSteps[data.step - 1],
                  status: 'complete',
                  content: data.content,
                  executionTime: data.executionTime,
                  metadata: data.metadata
                }
                return newSteps
              })
            } else if (data.type === 'coordinator-update') {
              console.log('[SSE] Coordinator update:', data.notes)
            } else if (data.type === 'chain-complete' || data.type === 'complete') {
              console.log('[SSE] Chain complete')
              setCurrentStepIndex(null)

              // Reload messages from database to get proper IDs
              const messagesResponse = await fetch(`/api/chat-sessions/${sessionId}/messages`)
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json()
                setMessages(messagesData.messages || [])
              }

              onSessionUpdate?.()
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          } catch (parseError) {
            console.error('[SSE] Parse error:', parseError)
          }
        }
      }

      setStreamingSteps([])
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message)
      setMessages((prev) => prev.slice(0, -1))
      showToast('error', 'Failed to send message')
      setStreamingSteps([])
      setCurrentStepIndex(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4 max-w-md text-center"
        >
          <div className="p-6 bg-zinc-800/30 rounded-3xl border border-zinc-700/30 backdrop-blur-sm">
            <Sparkles size={48} className="text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
              }}
            >
              Welcome to Forefront Chat
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
              }}
            >
              Create a new chat session or select an existing one to start chatting with Forefront Intelligence
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} relative transition-colors duration-300`}>
      {/* Simplified Header */}
      <div className={`border-b ${isDarkMode ? 'border-[#2a2a2a] bg-black' : 'border-zinc-200 bg-white'} px-4 py-2.5`}>
        <div className="flex items-center justify-between">
          {/* Mode Switcher */}
          <div className={`flex gap-1 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-zinc-100'} p-1 rounded-lg`}>
            <button
              onClick={() => setMode('text')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                mode === 'text'
                  ? (isDarkMode ? "bg-white text-black shadow-sm" : "bg-black text-white shadow-sm")
                  : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '0.5px'
              }}
            >
              <MessageSquare size={14} />
              <span className="lowercase">chat</span>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                mode === 'voice'
                  ? (isDarkMode ? "bg-white text-black shadow-sm" : "bg-black text-white shadow-sm")
                  : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '0.5px'
              }}
            >
              <Mic size={14} />
              <span className="lowercase">voice</span>
            </button>
            <button
              onClick={() => setMode('code')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                mode === 'code'
                  ? (isDarkMode ? "bg-white text-black shadow-sm" : "bg-black text-white shadow-sm")
                  : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '0.5px'
              }}
            >
              <Code2 size={14} />
              <span className="lowercase">code</span>
            </button>
            <button
              onClick={() => setMode('video')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                mode === 'video'
                  ? (isDarkMode ? "bg-white text-black shadow-sm" : "bg-black text-white shadow-sm")
                  : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-700")
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '0.5px'
              }}
            >
              <Video size={14} />
              <span className="lowercase">video</span>
            </button>
          </div>

          {/* Session Title */}
          {sessionTitle && (
            <div
              className={cn(
                "text-xs lowercase tracking-wide",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '1px'
              }}
            >
              {sessionTitle}
            </div>
          )}
        </div>
      </div>

      {/* Voice Mode UI */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6 max-w-md text-center"
          >
            {/* Voice Status Indicator */}
            <div className="relative">
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 glow-border",
                conversation.status === 'connected'
                  ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50"
                  : isVoiceConnecting
                    ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] animate-pulse"
                    : "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"
              )}>
                {conversation.status === 'connected' ? (
                  <Mic size={48} className="text-white" />
                ) : isVoiceConnecting ? (
                  <Loader2 size={48} className="text-white animate-spin" />
                ) : (
                  <MicOff size={48} className="text-white" />
                )}
              </div>
              {conversation.status === 'connected' && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-purple-500/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              <h3 className={`text-2xl font-semibold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '-1px',
                }}
              >
                {conversation.status === 'connected'
                  ? 'voice assistant active'
                  : isVoiceConnecting
                    ? 'connecting...'
                    : 'voice mode'}
              </h3>
              <p className={`text-sm lowercase tracking-wide ${isDarkMode ? 'text-[#666]' : 'text-zinc-600'}`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '1px',
                }}
              >
                {conversation.status === 'connected'
                  ? 'start speaking to chat with your ai assistant'
                  : isVoiceConnecting
                    ? 'setting up voice connection...'
                    : 'click the button below to start'}
              </p>
            </div>

            {/* Voice Controls */}
            <div className="flex gap-3">
              {conversation.status === 'connected' ? (
                <>
                  <button
                    onClick={stopVoiceSession}
                    className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-300 flex items-center gap-2 lowercase tracking-wide"
                    style={{
                      fontFamily: "'Core Sans A 65 Bold', sans-serif",
                      letterSpacing: '1px',
                    }}
                  >
                    <PhoneOff size={20} />
                    end call
                  </button>
                </>
              ) : !isVoiceConnecting && (
                <button
                  onClick={() => startVoiceSession()}
                  className="px-6 py-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all duration-300 flex items-center gap-2 glow-border lowercase tracking-wide"
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '1px',
                  }}
                >
                  <Phone size={20} />
                  start voice call
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Mode UI */}
      {mode === 'video' && (
        <VideoChat
          isDarkMode={isDarkMode}
          sessionId={sessionId}
          userId={userId}
          onTranscriptLoaded={(transcript, videoId) => {
            setVideoTranscript(transcript)
          }}
          onTimeUpdate={(time, context) => {
            setCurrentVideoTime(time)
            setVideoContext(context)
          }}
        />
      )}

      {/* Code Editor Mode */}
      {mode === 'code' && (
        <div id="code-editor-container" className="flex-1 flex overflow-hidden relative">
          {/* Chat Panel - Resizable */}
          <div
            className="flex flex-col border-r"
            style={{
              width: `${chatPanelWidth}%`,
              borderColor: isDarkMode ? '#2a2a2a' : '#e5e5e5'
            }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto pb-4">
              {messages.length === 0 && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center space-y-4 max-w-md text-center"
                  >
                    <div className={`p-6 ${isDarkMode ? 'bg-[#1a1a1a]/30 border-[#2a2a2a]/30' : 'bg-zinc-100/50 border-zinc-300/50'} rounded-3xl border backdrop-blur-sm glow-border`}>
                      <Code2 size={48} className="text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-semibold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          letterSpacing: '-1px',
                        }}
                      >
                        let's build something
                      </h3>
                      <p className={`text-sm lowercase tracking-wide ${isDarkMode ? 'text-[#666]' : 'text-zinc-600'}`}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          letterSpacing: '1px',
                        }}
                      >
                        describe what you want to build and i'll create it for you
                      </p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-6 px-6 pt-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={cn(
                        "flex",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        <div
                          className={`text-[10px] ${isDarkMode ? 'text-[#666]' : 'text-zinc-500'}`}
                          style={{
                            fontFamily: "'Core Sans A 65 Bold', sans-serif",
                            fontWeight: 600,
                            textTransform: 'lowercase',
                            letterSpacing: '2.5px',
                          }}
                        >
                          {message.role === 'user' ? 'you' : 'assistant'}
                        </div>
                        <div
                          className={cn(
                            "rounded-xl px-4 py-3 border relative group transition-all duration-300",
                            message.role === 'user'
                              ? isDarkMode
                                ? "bg-[#0a0a0a] border-[#2a2a2a] hover:border-[#404040]"
                                : "bg-zinc-50 border-zinc-300 hover:border-zinc-400"
                              : isDarkMode
                              ? "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40"
                              : "bg-purple-50 border-purple-200 hover:border-purple-300"
                          )}
                        >
                          <MarkdownMessage content={message.content} isDarkMode={isDarkMode} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* AI Loader when generating code */}
                  {isLoading && (
                    <div className="flex justify-start px-6">
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        <div
                          className={`text-[10px] ${isDarkMode ? 'text-[#666]' : 'text-zinc-500'}`}
                          style={{
                            fontFamily: "'Core Sans A 65 Bold', sans-serif",
                            fontWeight: 600,
                            textTransform: 'lowercase',
                            letterSpacing: '2.5px',
                          }}
                        >
                          assistant
                        </div>
                        <div
                          className={cn(
                            "rounded-xl px-4 py-3 border transition-all duration-300",
                            isDarkMode
                              ? "bg-purple-500/5 border-purple-500/20"
                              : "bg-purple-50 border-purple-200"
                          )}
                        >
                          <AILoader />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Enhanced Input Area */}
            <div className={`border-t ${isDarkMode ? 'border-[#2a2a2a] bg-black' : 'border-zinc-200 bg-white'} p-4`}>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCodeSubmit()
                    }
                  }}
                  placeholder="e.g., 'create a todo list app with dark mode' or 'add a signup form with validation'"
                  className={cn(
                    "w-full rounded-xl px-4 py-3 pr-24 resize-none focus:outline-none transition-all duration-300",
                    isDarkMode
                      ? "bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#555] focus:border-purple-500/50"
                      : "bg-zinc-50 border-zinc-300 text-black placeholder:text-zinc-400 focus:border-purple-500",
                    "border-2"
                  )}
                  rows={3}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                  disabled={isLoading}
                />

                {/* Character Count and Send Button Container */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {input.trim() && (
                    <span
                      className={cn(
                        "text-[10px] lowercase tracking-wide transition-opacity duration-200",
                        isDarkMode ? "text-zinc-600" : "text-zinc-400"
                      )}
                      style={{
                        fontFamily: "'Core Sans A 65 Bold', sans-serif",
                        letterSpacing: '1px'
                      }}
                    >
                      {input.length}
                    </span>
                  )}
                  <button
                    onClick={handleCodeSubmit}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-300",
                      !input.trim() || isLoading
                        ? (isDarkMode ? "text-[#404040] cursor-not-allowed bg-[#1a1a1a]" : "text-zinc-300 cursor-not-allowed bg-zinc-100")
                        : isDarkMode
                        ? "text-white bg-purple-500 hover:bg-purple-600 shadow-sm"
                        : "text-white bg-purple-500 hover:bg-purple-600 shadow-sm"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>

                {/* Quick Action Hint */}
                <div
                  className={cn(
                    "absolute left-4 bottom-3 text-[10px] lowercase tracking-wide opacity-50",
                    isDarkMode ? "text-zinc-600" : "text-zinc-400"
                  )}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '1px'
                  }}
                >
                  shift + enter for new line
                </div>
              </div>
            </div>
          </div>

          {/* Improved Resize Handle with Presets */}
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 group",
              isDarkMode ? "bg-[#0a0a0a]" : "bg-zinc-100"
            )}
            style={{
              width: '20px',
              flexShrink: 0,
            }}
          >
            {/* Preset Buttons */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setChatPanelWidth(30)}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all duration-200",
                  isDarkMode ? "bg-[#2a2a2a] hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
                )}
                title="30/70 split"
              />
              <button
                onClick={() => setChatPanelWidth(50)}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all duration-200",
                  isDarkMode ? "bg-[#2a2a2a] hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
                )}
                title="50/50 split"
              />
              <button
                onClick={() => setChatPanelWidth(70)}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all duration-200",
                  isDarkMode ? "bg-[#2a2a2a] hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
                )}
                title="70/30 split"
              />
            </div>

            {/* Main Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={() => setChatPanelWidth(50)}
              className={cn(
                "flex items-center justify-center cursor-col-resize transition-all duration-200",
                "w-4 h-20 rounded-md",
                isDarkMode
                  ? "bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a]"
                  : "bg-white hover:bg-zinc-200 border border-zinc-300",
                isResizing && "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/30"
              )}
              title="Double-click to reset to 50/50"
            >
              <GripVertical
                size={14}
                className={cn(
                  "transition-colors duration-200",
                  isResizing
                    ? "text-white"
                    : isDarkMode
                    ? "text-zinc-600"
                    : "text-zinc-400"
                )}
              />
            </div>

            {/* Invisible wider hit area */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize z-10"
            />
          </div>

          {/* Code Editor Panel - Dynamic width */}
          <div style={{ width: `${100 - chatPanelWidth}%` }}>
            <CodeEditor code={editorCode} isDarkMode={isDarkMode} />
          </div>
        </div>
      )}

      {/* Messages Container */}
      {mode === 'text' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.5 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="flex flex-col items-center space-y-4 max-w-md text-center"
            >
              <div className={`p-6 ${isDarkMode ? 'bg-[#1a1a1a]/30 border-[#2a2a2a]/30' : 'bg-zinc-100/50 border-zinc-300/50'} rounded-3xl border backdrop-blur-sm glow-border`}>
                <Sparkles size={48} className="text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-semibold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '-1px',
                  }}
                >
                  how can i help?
                </h3>
                <p className={`text-sm lowercase tracking-wide ${isDarkMode ? 'text-[#666]' : 'text-zinc-600'}`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '1px',
                  }}
                >
                  ask me anything or start a conversation
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id || `temp-${idx}-${message.createdAt}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col gap-2",
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={`text-[10px] ${isDarkMode ? 'text-[#666]' : 'text-zinc-500'}`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    fontWeight: 600,
                    textTransform: 'lowercase',
                    letterSpacing: '2.5px',
                  }}
                >
                  {message.role === 'user' ? 'you' : 'assistant'}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 border relative group transition-all duration-300",
                    message.role === 'user'
                      ? "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#404040]"
                      : "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 glow-border"
                  )}
                >
                  {/* Hover actions for AI messages */}
                  {message.role === 'assistant' && (
                    <div className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 flex gap-1.5 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                          showToast('success', 'Copied to clipboard!')
                        }}
                        className="p-2 rounded-lg bg-[#1a1a1a]/80 hover:bg-[#2a2a2a]/80 border border-[#2a2a2a]/50 transition-colors backdrop-blur-sm"
                        title="Copy message"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleSaveMessage(message.id)}
                        disabled={savingMessageId === message.id}
                        className="p-2 rounded-lg bg-[#1a1a1a]/80 hover:bg-[#2a2a2a]/80 border border-[#2a2a2a]/50 transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save to AI portfolio"
                      >
                        {savingMessageId === message.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Bookmark size={14} />
                        )}
                      </button>
                    </div>
                  )}

                  {message.role === 'assistant' ? (
                    message.metadata?.type === 'image' ? (
                      <div className="space-y-2">
                        <img
                          src={message.content}
                          alt="Generated image"
                          className="rounded-xl max-w-full h-auto border border-zinc-700/50"
                        />
                      </div>
                    ) : message.metadata?.isChained && message.metadata?.steps ? (
                      // Handle chained response with new interactive components
                      <div className="space-y-4">
                        {/* Orchestration Flow Diagram */}
                        <OrchestrationFlowDiagram
                          steps={message.metadata.steps.map((s: any) => ({
                            step: s.step,
                            model: s.model,
                            purpose: s.purpose,
                            executionTime: s.metadata?.executionTime || 0
                          }))}
                          onStepClick={(stepIndex) => {
                            // Scroll to the step card
                            const stepElement = document.getElementById(`step-${stepIndex + 1}`)
                            if (stepElement) {
                              stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                          }}
                        />

                        {/* Interactive Step Cards */}
                        <div className="space-y-4">
                          {message.metadata.steps.map((step: any, idx: number) => {
                            // Split content by separator and get this step's section
                            const sections = message.content.split('\n\n---\n\n')
                            const stepSection = sections[idx] || ''

                            // Debug logging
                            if (step.type === 'image') {
                              console.log(`[Image Step ${idx}] Purpose:`, step.purpose)
                              console.log(`[Image Step ${idx}] Section:`, stepSection.substring(0, 200))
                            }

                            // For image steps, extract just the image URL
                            let stepContent = stepSection
                            if (step.type === 'image') {
                              const lines = stepSection.split('\n').filter(l => l.trim())
                              // Find the line that contains an image path (starts with http or /)
                              const imageLine = lines.find(l => {
                                const trimmed = l.trim()
                                // Remove leading asterisk/bullet if present
                                const cleaned = trimmed.replace(/^\*\s*/, '').replace(/^Image file path:\s*/i, '').trim()
                                return cleaned.startsWith('http') || cleaned.startsWith('/generations/')
                              })
                              if (imageLine) {
                                // Clean up the extracted line
                                stepContent = imageLine.trim()
                                  .replace(/^\*\s*/, '') // Remove leading asterisk
                                  .replace(/^Image file path:\s*/i, '') // Remove "Image file path:" label
                                  .trim()
                              } else {
                                stepContent = lines[lines.length - 1]
                              }
                            } else {
                              // For text steps, remove the step header lines
                              const lines = stepSection.split('\n')
                              // Skip first 2-3 lines which are headers
                              const contentStart = lines.findIndex(l => l.trim() && !l.includes('STEP') && !l.includes('*'))
                              stepContent = lines.slice(Math.max(0, contentStart)).join('\n')
                            }

                            return (
                              <ChainStepCard
                                key={idx}
                                step={{
                                  step: step.step,
                                  model: step.model,
                                  content: stepContent.trim(),
                                  type: step.type,
                                  purpose: step.purpose,
                                  executionTime: step.metadata?.executionTime || 0,
                                  metadata: step.metadata || {}
                                }}
                                stepIndex={idx}
                                totalSteps={message.metadata.steps.length}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <MarkdownMessage content={message.content} isDarkMode={true} />
                    )
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed"
                      style={{
                        fontFamily: "'Core Sans A 65 Bold', sans-serif",
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      {message.content}
                    </p>
                  )}

                  {/* Model metadata for assistant messages */}
                  {message.role === 'assistant' && message.metadata && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-700/30">
                      {/* For chained responses, show all models */}
                      {message.metadata.isChained && message.metadata.modelsUsed ? (
                        <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40 backdrop-blur-sm">
                          {message.metadata.modelsUsed}
                        </Badge>
                      ) : message.metadata.modelUsed ? (
                        <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40 backdrop-blur-sm">
                          {message.metadata.modelUsed}
                        </Badge>
                      ) : null}

                      {message.metadata.executionTime && (
                        <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40 backdrop-blur-sm">
                          {message.metadata.executionTime}ms
                        </Badge>
                      )}

                      {message.metadata.totalExecutionTime && (
                        <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40 backdrop-blur-sm">
                          {message.metadata.totalExecutionTime}ms
                        </Badge>
                      )}

                      {/* Show chain step count */}
                      {message.metadata.isChained && message.metadata.steps && (
                        <Badge className="text-xs bg-blue-800/60 border-blue-700/40 backdrop-blur-sm">
                          {message.metadata.steps.length} steps
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="text-xs mt-2 opacity-50">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-2 items-start w-full"
              >
                <div
                  className="text-white text-[10px]"
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}
                >
                  [ASSISTANT]
                </div>

                {streamingSteps.length > 0 ? (
                  // Show real-time chain progress
                  <div className="w-full space-y-3">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl px-4 py-3">
                      <p className="text-xs text-zinc-300 mb-2"
                        style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                      >
                        🔄 Multi-Step Chain Execution
                      </p>
                      <div className="space-y-2">
                        {streamingSteps.map((step, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "flex items-center gap-2 text-xs p-2 rounded-lg",
                              step.status === 'running'
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : step.status === 'complete'
                                ? "bg-green-500/20 border border-green-500/30"
                                : "bg-zinc-800/50 border border-zinc-700/30"
                            )}
                          >
                            {step.status === 'running' && (
                              <Loader2 size={12} className="animate-spin text-blue-400" />
                            )}
                            {step.status === 'complete' && (
                              <span className="text-green-400">✓</span>
                            )}
                            <span className="text-white font-medium">
                              Step {step.step}/{step.totalSteps || streamingSteps.length}:
                            </span>
                            <span className="text-zinc-400">
                              {step.purpose === 'web-search' && '🔍 Research'}
                              {step.purpose === 'prompt-enhancement' && '✨ Optimization'}
                              {step.purpose === 'image-generation' && '🎨 Image Gen'}
                              {step.purpose === 'text-generation' && '📝 Text Gen'}
                              {step.purpose === 'code-generation' && '💻 Code Gen'}
                            </span>
                            <span className="text-zinc-500 text-[10px] ml-auto">
                              {step.model}
                            </span>
                            {step.executionTime && (
                              <span className="text-zinc-500 text-[10px]">
                                {(step.executionTime / 1000).toFixed(1)}s
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Fallback for non-chain requests
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-4 py-3 text-white"
                    style={{
                      fontFamily: "'Core Sans A 65 Bold', sans-serif",
                      fontSize: '14px',
                      textTransform: 'lowercase',
                      letterSpacing: '2px',
                    }}
                  >
                    thinking...
                  </div>
                )}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      )}

      {/* Input Area */}
      {mode === 'text' && (
          <div className={`flex-shrink-0 border-t ${isDarkMode ? 'border-zinc-800/50 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50/50'} backdrop-blur-xl`}>
            <div className="max-w-4xl mx-auto w-full px-4 py-3">
            <form onSubmit={handleSendMessage} className="space-y-2">
            <div className={`relative rounded-xl ring-1 ${isDarkMode ? 'ring-zinc-700 bg-zinc-800/50 focus-within:ring-zinc-600' : 'ring-zinc-300 bg-zinc-100/50 focus-within:ring-zinc-400'} overflow-hidden backdrop-blur-sm transition-all`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className={`w-full px-3 py-2.5 pr-12 bg-transparent resize-none focus:outline-none text-sm ${isDarkMode ? 'placeholder:text-zinc-600 text-white' : 'placeholder:text-zinc-400 text-black'} max-h-32 overflow-y-auto`}
                style={{
                  minHeight: '40px',
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute bottom-2 right-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase",
                  input.trim() && !isLoading
                    ? (isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")
                    : (isDarkMode ? "bg-zinc-800/50 text-gray-500 cursor-not-allowed opacity-50" : "bg-zinc-200/50 text-gray-400 cursor-not-allowed opacity-50")
                )}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '1px'
                }}
              >
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  '[SEND]'
                )}
              </button>
            </div>

            <div className={`flex items-center justify-between rounded-lg px-3 py-1 border ${isDarkMode ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-zinc-100/30 border-zinc-300/30'} backdrop-blur-sm`}>
              <button
                type="button"
                onClick={() => setShowModelSelector(true)}
                className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md ${isDarkMode ? 'hover:bg-zinc-700/30' : 'hover:bg-zinc-200/30'} transition-colors`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                }}
              >
                {(() => {
                  const selected = getModelById(selectedModel)
                  if (!selected) {
                    return <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Select model</span>
                  }
                  const Icon = selected.icon
                  return (
                    <>
                      <div className={cn(
                        "w-4 h-4 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0",
                        selected.color
                      )}>
                        <Icon size={10} className="text-white" />
                      </div>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{selected.name}</span>
                      <ChevronDown size={12} className={isDarkMode ? "text-zinc-500" : "text-zinc-600"} />
                    </>
                  )
                })()}
              </button>

              <div className={`flex items-center gap-1 text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                }}
              >
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-100/50 border-zinc-300/50'}`}>
                  ↵
                </kbd>
                <span>send</span>
              </div>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Model Selector Modal */}
      <ModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModelId={selectedModel}
        onSelectModel={(modelId) => {
          setSelectedModel(modelId)
          setShowModelSelector(false)
        }}
        isDarkMode={isDarkMode}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[1001] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] backdrop-blur-xl",
                toast.type === 'success'
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}
            >
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

