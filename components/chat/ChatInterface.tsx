'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, Copy, Bookmark, ChevronDown, Mic, MicOff, Phone, PhoneOff, Code2, MessageSquare, GripVertical, Video, Paperclip, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { MarkdownMessage } from '@/components/ui/markdown-message'
import { ModelSelectorModal } from '@/components/ui/model-selector-modal'
import { getModelById } from '@/lib/models/all-models'
import { ChainStepCard } from './ChainStepCard'
import { OrchestrationFlowDiagram } from './OrchestrationFlowDiagram'
import { CodeEditor } from './CodeEditor'
import { AILoader } from '@/components/ui/ai-loader'
import { CodeGeneratingLoader } from '@/components/ui/code-generating-loader'
import { VideoChat } from './VideoChat'
import { useConversation } from '@elevenlabs/react'
import { ChatEmptyState } from './ChatEmptyState'

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
  userName?: string
  onSessionUpdate?: () => void
  isDarkMode?: boolean
  sessionTitle?: string
  isSidebarCollapsed?: boolean
  onCollapseSidebar?: () => void
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

export function ChatInterface({ sessionId, userId, userName, onSessionUpdate, isDarkMode = true, sessionTitle, isSidebarCollapsed, onCollapseSidebar }: ChatInterfaceProps) {
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
  const [mobileCodeView, setMobileCodeView] = useState<'chat' | 'preview'>('chat')
  const [isMobile, setIsMobile] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  // Video mode state
  const [videoTranscript, setVideoTranscript] = useState<any[]>([])
  const [videoContext, setVideoContext] = useState('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-switch to preview on mobile when code is generated
  useEffect(() => {
    if (isMobile && mode === 'code' && (editorCode.html || editorCode.css || editorCode.javascript)) {
      setMobileCodeView('preview')
    }
  }, [editorCode, isMobile, mode])

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

  // Auto-collapse sidebar when code mode is activated
  useEffect(() => {
    if (mode === 'code' && !isSidebarCollapsed && onCollapseSidebar) {
      onCollapseSidebar()
    }
  }, [mode, isSidebarCollapsed, onCollapseSidebar])

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

  // Helper to show only minimal loading message during code generation
  const getCodeDisplayMessage = (content: string, isStreaming: boolean = true) => {
    // If still streaming, show only the loading message
    if (isStreaming) {
      return 'Generating your code...'
    }
    // If streaming is done, this will be replaced by the final completion message
    return content
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
          isMobile: isMobile, // Pass mobile context for mobile-optimized code generation
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

                // Extract and update code SILENTLY in real-time (updates preview)
                const extracted = extractCodeFromMarkdown(assistantMessage)
                if (extracted.html || extracted.css || extracted.javascript) {
                  setEditorCode(extracted)
                }

                // Show ONLY "Generating your code..." during streaming (no other text)
                const displayContent = getCodeDisplayMessage(assistantMessage, true)

                // Update messages with minimal loading message
                setMessages((prev) => {
                  const lastMsg = prev[prev.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: displayContent },
                    ]
                  }
                  return [
                    ...prev,
                    {
                      role: 'assistant',
                      content: displayContent,
                      createdAt: new Date().toISOString(),
                    },
                  ]
                })
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

      // Create clean completion message (no code blocks, minimal text)
      const hasCode = finalCode.html || finalCode.css || finalCode.javascript
      const completionMessage = hasCode
        ? `✓ Code generated successfully! Check the preview panel to see your app.`
        : 'Generation complete.'

      // Save assistant message to database with clean content
      if (assistantMessage) {
        const assistantMessageResponse = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: completionMessage, // Save clean message without code blocks
            metadata: {
              code: finalCode, // Store the extracted code
              mode: 'code', // Mark this as a code editor message
              rawResponse: assistantMessage, // Store full response for reference
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
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      {/* Simplified Header with Mode Switcher */}
      <div className={`${isDarkMode ? 'bg-black' : 'bg-white'} px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-center`}>
        <div className={`relative inline-flex gap-0.5 ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} p-0.5 sm:p-1 rounded-full`}>
          {/* Sliding background indicator */}
          <motion.div
            layoutId="activeModeIndicator"
            className={`absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 rounded-full ${isDarkMode ? 'bg-white' : 'bg-black'}`}
            style={{
              left: mode === 'text' ? '2px' : mode === 'voice' ? 'calc(25% + 1px)' : mode === 'code' ? 'calc(50% + 0px)' : 'calc(75% - 1px)',
              width: 'calc(25% - 1px)',
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />
          {[
            { id: 'text' as const, icon: MessageSquare, label: 'chat' },
            { id: 'voice' as const, icon: Mic, label: 'voice' },
            { id: 'code' as const, icon: Code2, label: 'code' },
            { id: 'video' as const, icon: Video, label: 'video' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={cn(
                "relative z-10 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center",
                mode === item.id
                  ? (isDarkMode ? "text-black" : "text-white")
                  : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-600 hover:text-zinc-800")
              )}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                minHeight: '36px',
                minWidth: '36px'
              }}
            >
              <item.icon size={16} className="flex-shrink-0 sm:mr-1.5" />
              <span className="hidden xs:inline sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Mode UI */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
          {/* Subtle animated background grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center space-y-10 max-w-md text-center relative z-10"
          >
            {/* Voice Status Indicator */}
            <div className="relative">
              <motion.div
                className={cn(
                  "w-40 h-40 rounded-full flex items-center justify-center relative transition-all duration-500",
                  conversation.status === 'connected'
                    ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
                    : isDarkMode
                      ? "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-800"
                      : "bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 border border-zinc-300"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Glow effect when connected */}
                {conversation.status === 'connected' && (
                  <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl animate-pulse" />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  {conversation.status === 'connected' ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Mic size={64} className="text-white drop-shadow-lg" />
                    </motion.div>
                  ) : isVoiceConnecting ? (
                    <Loader2 size={64} className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} animate-spin`} />
                  ) : (
                    <MicOff size={64} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-400'} />
                  )}
                </div>
              </motion.div>

              {/* Animated rings when connected */}
              {conversation.status === 'connected' && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-400/40"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-400/30"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: 0.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </>
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-3">
              <motion.h3
                className={`text-3xl font-bold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '-1.5px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {conversation.status === 'connected'
                  ? 'voice assistant active'
                  : isVoiceConnecting
                    ? 'connecting...'
                    : 'voice mode'}
              </motion.h3>
              <motion.p
                className={`text-sm lowercase tracking-wide ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} max-w-xs mx-auto`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '0.5px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {conversation.status === 'connected'
                  ? 'speak naturally and i\'ll respond in real-time'
                  : isVoiceConnecting
                    ? 'establishing secure voice connection...'
                    : 'natural voice conversations with ai'}
              </motion.p>
            </div>

            {/* Voice Controls */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {conversation.status === 'connected' ? (
                <motion.button
                  onClick={stopVoiceSession}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2.5 lowercase tracking-wide ${
                    isDarkMode
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '0.5px',
                  }}
                >
                  <PhoneOff size={20} />
                  end call
                </motion.button>
              ) : !isVoiceConnecting && (
                <motion.button
                  onClick={() => startVoiceSession()}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2.5 lowercase tracking-wide ${
                    isDarkMode
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '0.5px',
                  }}
                >
                  <Phone size={20} />
                  start voice call
                </motion.button>
              )}
            </motion.div>
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
        <div id="code-editor-container" className="flex-1 flex flex-col overflow-hidden relative">

          {/* Desktop Layout - Side by side */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Chat Panel */}
            <div
              className="flex flex-col border-r"
              style={{
                width: `${chatPanelWidth}%`,
                borderColor: isDarkMode ? 'rgb(39 39 42)' : 'rgb(229 229 229)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
              {messages.length === 0 && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                  {/* Animated Sphere Background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center space-y-8 max-w-2xl w-full text-center relative z-10"
                  >
                    <div className="space-y-3">
                      <h3 className={`text-4xl font-bold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                        }}
                      >
                        let's build something
                      </h3>
                      <p className={`text-xl ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                        }}
                      >
                        What can I help you create?
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full max-w-lg">
                      {[
                        { label: 'Todo App', prompt: 'Create a modern todo list app with dark mode toggle and local storage' },
                        { label: 'Landing Page', prompt: 'Build a sleek landing page with hero section, features, and call-to-action' },
                        { label: 'Signup Form', prompt: 'Create a beautiful signup form with validation and password strength indicator' },
                        { label: 'Dashboard', prompt: 'Build a clean dashboard with stats cards, charts, and a sidebar navigation' },
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          onClick={() => {
                            setInput(action.prompt)
                            inputRef.current?.focus()
                          }}
                          className={cn(
                            "group relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-200",
                            "border",
                            isDarkMode
                              ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700"
                              : "bg-zinc-100/50 border-zinc-200 hover:bg-zinc-200/50 hover:border-zinc-300"
                          )}
                        >
                          <div className="relative">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                isDarkMode ? "text-white" : "text-black"
                              )}
                              style={{
                                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              }}
                            >
                              {action.label}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pt-4 sm:pt-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={cn(
                        "flex min-w-0 w-full",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex flex-col gap-2 min-w-0" style={{ width: '85%', maxWidth: '85%' }}>
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
                                ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                                : "bg-zinc-50 border-zinc-300 hover:border-zinc-400"
                              : isDarkMode
                              ? "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40"
                              : "bg-purple-50 border-purple-200 hover:border-purple-300"
                          )}
                          style={{ width: '100%', overflow: 'hidden' }}
                        >
                          <MarkdownMessage content={message.content} isDarkMode={isDarkMode} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Enhanced Input Area - Matching New Design */}
            <div className="relative flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4">
              <div className="max-w-4xl mx-auto w-full">
                <form onSubmit={(e) => { e.preventDefault(); handleCodeSubmit(); }}>
                  <div className={`relative rounded-2xl ${isDarkMode ? 'bg-zinc-900/80 border-zinc-800/50' : 'bg-zinc-100/80 border-zinc-200/50'} border backdrop-blur-sm overflow-hidden transition-all duration-200 focus-within:border-zinc-700`}>
                    <div className="flex items-center gap-3 p-3">
                      {/* Left Side Icons */}
                      <div className="flex items-center gap-1.5">
                        {/* Model Selector Icon - Gemini 3 Pro */}
                        <button
                          type="button"
                          className={cn(
                            "flex-shrink-0 p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                            isDarkMode
                              ? "hover:bg-zinc-800/50 text-zinc-500 hover:text-white"
                              : "hover:bg-zinc-200/50 text-zinc-600 hover:text-black"
                          )}
                          title="Using Gemini 3 Pro"
                        >
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Sparkles size={11} className="text-white" />
                          </div>
                        </button>

                        {/* Attach File Button */}
                        <button
                          type="button"
                          className={cn(
                            "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                            isDarkMode
                              ? "hover:bg-zinc-800/50 text-zinc-500 hover:text-white"
                              : "hover:bg-zinc-200/50 text-zinc-600 hover:text-black"
                          )}
                        >
                          <Paperclip size={18} />
                        </button>
                      </div>

                      {/* Input Field */}
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
                        placeholder="Describe what to build or change..."
                        rows={1}
                        className={cn(
                          "flex-1 bg-transparent resize-none focus:outline-none text-sm max-h-32 overflow-y-auto py-1",
                          isDarkMode
                            ? "placeholder:text-zinc-600 text-white"
                            : "placeholder:text-zinc-400 text-black"
                        )}
                        disabled={isLoading}
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                          input.trim() && !isLoading
                            ? isDarkMode
                              ? "bg-white text-black hover:bg-zinc-200"
                              : "bg-black text-white hover:bg-zinc-800"
                            : isDarkMode
                            ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                            : "bg-zinc-200/50 text-zinc-400 cursor-not-allowed"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <ArrowUp size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Improved Resize Handle with Presets */}
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 group",
              isDarkMode ? "bg-zinc-950" : "bg-zinc-100"
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
                  isDarkMode ? "bg-zinc-800 hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
                )}
                title="30/70 split"
              />
              <button
                onClick={() => setChatPanelWidth(50)}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all duration-200",
                  isDarkMode ? "bg-zinc-800 hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
                )}
                title="50/50 split"
              />
              <button
                onClick={() => setChatPanelWidth(70)}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all duration-200",
                  isDarkMode ? "bg-zinc-800 hover:bg-purple-500" : "bg-zinc-300 hover:bg-purple-500"
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
                  ? "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
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
            <div className="relative" style={{ width: `${100 - chatPanelWidth}%` }}>
              {/* Show loader overlay when generating code */}
              {isLoading && mode === 'code' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <CodeGeneratingLoader />
                </div>
              )}
              <CodeEditor code={editorCode} isDarkMode={isDarkMode} />
            </div>
          </div>{/* End Desktop Layout */}

          {/* Mobile Layout - Full screen with floating toggle */}
          <div className="md:hidden flex-1 flex flex-col overflow-hidden relative">
            {/* Secondary Toggle - Below mode switcher */}
            <div className={cn(
              "flex items-center justify-center py-2 border-b",
              isDarkMode ? "border-zinc-800/50" : "border-zinc-200/50"
            )}>
              <div className={cn(
                "flex items-center gap-1 p-0.5 rounded-full",
                isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
              )}>
                <button
                  onClick={() => setMobileCodeView('chat')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium lowercase transition-all duration-200",
                    mobileCodeView === 'chat'
                      ? isDarkMode
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : isDarkMode
                        ? "text-zinc-500"
                        : "text-zinc-600"
                  )}
                  style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                >
                  <MessageSquare size={12} />
                  chat
                </button>
                <button
                  onClick={() => setMobileCodeView('preview')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium lowercase transition-all duration-200",
                    mobileCodeView === 'preview'
                      ? isDarkMode
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : isDarkMode
                        ? "text-zinc-500"
                        : "text-zinc-600"
                  )}
                  style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                >
                  <Code2 size={12} />
                  preview
                </button>
              </div>
            </div>

            {/* Chat View - Full screen like text mode */}
            <AnimatePresence mode="wait">
              {mobileCodeView === 'chat' ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Messages - Full screen */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {messages.length === 0 && !isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="flex flex-col items-center space-y-6 w-full text-center relative z-10"
                        >
                          <div className="space-y-2">
                            <h3 className={`text-2xl font-bold lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                              style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                            >
                              let's build something
                            </h3>
                            <p className={`text-base ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              What can I help you create?
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                            {[
                              { label: 'Todo App', prompt: 'Create a modern todo list app with dark mode toggle and local storage' },
                              { label: 'Landing Page', prompt: 'Build a sleek landing page with hero section, features, and call-to-action' },
                              { label: 'Signup Form', prompt: 'Create a beautiful signup form with validation' },
                              { label: 'Dashboard', prompt: 'Build a clean dashboard with stats cards' },
                            ].map((action, index) => (
                              <motion.button
                                key={action.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                onClick={() => {
                                  setInput(action.prompt)
                                  inputRef.current?.focus()
                                }}
                                className={cn(
                                  "w-full rounded-xl px-3 py-3 text-left transition-all duration-200 border",
                                  isDarkMode
                                    ? "bg-zinc-900/50 border-zinc-800 active:bg-zinc-700/50"
                                    : "bg-zinc-100/50 border-zinc-200 active:bg-zinc-300/50"
                                )}
                                style={{ minHeight: '44px' }}
                              >
                                <div className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-black")}
                                  style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                                >
                                  {action.label}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-4 px-3 pt-4 pb-2">
                        {messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={cn(
                              "flex min-w-0 w-full",
                              message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="flex flex-col gap-1.5 min-w-0 w-full">
                              <div
                                className={`text-[10px] ${isDarkMode ? 'text-[#666]' : 'text-zinc-500'}`}
                                style={{
                                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                                  fontWeight: 600,
                                  textTransform: 'lowercase',
                                  letterSpacing: '2px',
                                }}
                              >
                                {message.role === 'user' ? 'you' : 'assistant'}
                              </div>
                              <div
                                className={cn(
                                  "rounded-2xl px-3 py-2.5 border text-sm",
                                  message.role === 'user'
                                    ? isDarkMode
                                      ? "bg-zinc-900 border-zinc-800"
                                      : "bg-zinc-100 border-zinc-200"
                                    : isDarkMode
                                    ? "bg-zinc-900/50 border-zinc-800/50"
                                    : "bg-zinc-50 border-zinc-200"
                                )}
                              >
                                <MarkdownMessage content={message.content} isDarkMode={isDarkMode} />
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex items-center gap-2 text-zinc-500 text-sm px-1">
                            <Loader2 size={14} className="animate-spin" />
                            <span>generating...</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input - Same style as text mode */}
                  <div className="relative flex-shrink-0 px-3 pb-3 pt-2">
                    <div
                      className="absolute inset-x-0 bottom-0 pointer-events-none"
                      style={{
                        height: '120px',
                        background: isDarkMode
                          ? 'linear-gradient(to top, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 40%, transparent 100%)'
                          : 'linear-gradient(to top, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 40%, transparent 100%)'
                      }}
                    />
                    <div className="relative z-10">
                      <form onSubmit={(e) => { e.preventDefault(); handleCodeSubmit(); }}>
                        <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-100/80 border-zinc-200'} backdrop-blur-sm`}>
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
                            placeholder="describe what to build..."
                            rows={1}
                            className={cn(
                              "flex-1 bg-transparent resize-none focus:outline-none text-sm py-2 px-2",
                              isDarkMode ? "placeholder:text-zinc-600 text-white" : "placeholder:text-zinc-400 text-black"
                            )}
                            style={{ minHeight: '40px', maxHeight: '80px', fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                            disabled={isLoading}
                          />
                          <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={cn(
                              "flex-shrink-0 p-2.5 rounded-xl transition-all duration-200",
                              input.trim() && !isLoading
                                ? isDarkMode
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                                : isDarkMode
                                ? "bg-zinc-800/50 text-zinc-600"
                                : "bg-zinc-200/50 text-zinc-400"
                            )}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                          >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {editorCode.html || editorCode.css || editorCode.javascript ? (
                    <>
                      {/* Show loader overlay when generating */}
                      {isLoading && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <CodeGeneratingLoader />
                        </div>
                      )}
                      <CodeEditor code={editorCode} isDarkMode={isDarkMode} />
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className={`w-16 h-16 rounded-2xl ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center mb-4`}>
                        <Code2 size={28} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-400'} />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}
                        style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                      >
                        no preview yet
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                        switch to chat and describe what you want to build
                      </p>
                      <button
                        onClick={() => setMobileCodeView('chat')}
                        className={cn(
                          "mt-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                          isDarkMode
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        )}
                        style={{ minHeight: '44px' }}
                      >
                        start building
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Messages Container */}
      {mode === 'text' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {messages.length === 0 && !isLoading ? (
            <ChatEmptyState
              userName={userName || 'User'}
              isDarkMode={isDarkMode}
              onQuickAction={(action) => {
                if (action === 'Content Help') {
                  setInput('Help me create a presentation')
                } else if (action === 'Suggestions') {
                  setInput('Give me some creative ideas')
                } else if (action === 'Job Application') {
                  setInput('Help me apply for a job application')
                }
                inputRef.current?.focus()
              }}
            />
        ) : (
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-4 sm:space-y-6">
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
                    "w-full sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border relative group transition-all duration-300",
                    message.role === 'user'
                      ? isDarkMode
                        ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        : "bg-zinc-100 border-zinc-200 hover:border-zinc-300"
                      : isDarkMode
                        ? "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  )}
                  style={
                    message.role === 'assistant'
                      ? {
                          boxShadow: isDarkMode
                            ? '0 0 20px rgba(255, 255, 255, 0.03), 0 0 1px rgba(255, 255, 255, 0.1)'
                            : '0 0 20px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.1)',
                        }
                      : undefined
                  }
                >
                  {/* Hover actions for AI messages */}
                  {message.role === 'assistant' && (
                    <div className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 flex gap-1.5 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                          showToast('success', 'Copied to clipboard!')
                        }}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/50 transition-colors backdrop-blur-sm"
                        title="Copy message"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleSaveMessage(message.id)}
                        disabled={savingMessageId === message.id}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/50 transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    fontWeight: 600,
                    textTransform: 'lowercase',
                    letterSpacing: '2.5px',
                  }}
                >
                  assistant
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
                  // Animated thinking indicator
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-100/80 border-zinc-200'} border rounded-2xl px-5 py-4`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Animated dots */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-zinc-500' : 'bg-zinc-400'}`}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                        }}
                      >
                        thinking
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      )}

      {/* Input Area - Redesigned */}
      {mode === 'text' && (
        <div className="relative flex-shrink-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 pt-2 sm:pt-3 md:pt-4">
          {/* Gradient Fade - Stronger and taller */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
            style={{
              height: '200px',
              background: isDarkMode
                ? 'linear-gradient(to top, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 70%, transparent 100%)'
                : 'linear-gradient(to top, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)'
            }}
          />

          <div className="max-w-4xl mx-auto w-full relative z-10">
            <form onSubmit={handleSendMessage}>
              <div className={`relative rounded-2xl ${isDarkMode ? 'bg-zinc-900/80 border-zinc-800/50' : 'bg-zinc-100/80 border-zinc-200/50'} border backdrop-blur-sm overflow-hidden transition-all duration-200 focus-within:border-zinc-700`}>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                  {/* Left Side Icons */}
                  <div className="flex items-center gap-1">
                    {/* Model Selector Icon */}
                    <button
                      type="button"
                      onClick={() => setShowModelSelector(true)}
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                        isDarkMode
                          ? "hover:bg-zinc-800/50 text-zinc-500 hover:text-white"
                          : "hover:bg-zinc-200/50 text-zinc-600 hover:text-black"
                      )}
                      style={{ minWidth: '40px', minHeight: '40px' }}
                      title={`Current model: ${getModelById(selectedModel)?.name || 'Select model'}`}
                    >
                      {(() => {
                        const selected = getModelById(selectedModel)
                        if (!selected) return <Sparkles size={18} />
                        const Icon = selected.icon
                        return (
                          <div className={cn(
                            "w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center",
                            selected.color
                          )}>
                            <Icon size={11} className="text-white" />
                          </div>
                        )
                      })()}
                    </button>

                    {/* Attach File Button - Hide on very small screens */}
                    <button
                      type="button"
                      className={cn(
                        "hidden xs:flex flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                        isDarkMode
                          ? "hover:bg-zinc-800/50 text-zinc-500 hover:text-white"
                          : "hover:bg-zinc-200/50 text-zinc-600 hover:text-black"
                      )}
                      style={{ minWidth: '40px', minHeight: '40px' }}
                      title="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>
                  </div>

                  {/* Input Field */}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ask me anything..."
                    rows={1}
                    className={cn(
                      "flex-1 bg-transparent resize-none focus:outline-none text-sm max-h-32 overflow-y-auto py-1",
                      isDarkMode
                        ? "placeholder:text-zinc-600 text-white"
                        : "placeholder:text-zinc-400 text-black"
                    )}
                    style={{
                      minHeight: '24px',
                      fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    }}
                  />

                  {/* Send Button - Circular with Arrow */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                      input.trim() && !isLoading
                        ? isDarkMode
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "bg-black text-white hover:bg-zinc-800"
                        : isDarkMode
                        ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        : "bg-zinc-200/50 text-zinc-400 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowUp size={18} />
                    )}
                  </button>
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
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[1001] flex flex-col gap-2">
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

