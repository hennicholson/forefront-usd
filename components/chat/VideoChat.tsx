'use client'

import { useState, useEffect, useRef } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Loader2, Play, AlertCircle, Mic, MicOff, Phone, PhoneOff, MessageSquare, Sparkles, ChevronDown, Send, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useConversation } from '@elevenlabs/react'

interface TranscriptEntry {
  text: string
  start: number
  duration: number
}

interface VideoChatProps {
  isDarkMode?: boolean
  onTranscriptLoaded?: (transcript: TranscriptEntry[], videoId: string) => void
  onTimeUpdate?: (currentTime: number, contextText: string) => void
  sessionId?: number | null
  userId?: string
}

export function VideoChat({ isDarkMode = true, onTranscriptLoaded, onTimeUpdate, sessionId, userId }: VideoChatProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Voice chat state
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const conversation = useConversation()

  // Transcript interaction modes
  const [transcriptMode, setTranscriptMode] = useState<'transcript' | 'voice' | 'chat' | 'summarize'>('transcript')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, timestamp: Date }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLoadVideo = async () => {
    if (!youtubeUrl.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load video')
      }

      const data = await response.json()

      console.log('Received data from API:', data)

      setVideoId(data.videoId)
      setTranscript(data.transcript)
      setVideoMetadata(data.metadata)

      if (onTranscriptLoaded) {
        onTranscriptLoaded(data.transcript, data.videoId)
      }
    } catch (err: any) {
      console.error('Error loading video:', err)
      // Provide more helpful error messages
      let errorMessage = err.message
      if (errorMessage.includes('No transcript available')) {
        errorMessage = 'This video does not have transcripts available. Try another video with captions enabled.'
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)

    // Build context from transcript up to current time
    const contextEntries = transcript.filter(entry => entry.start <= time)
    const contextText = contextEntries.map(entry => entry.text).join(' ')

    if (onTimeUpdate) {
      onTimeUpdate(time, contextText)
    }
  }

  const startVoiceSession = async () => {
    try {
      setIsVoiceConnecting(true)

      // Build context from watched video
      const contextEntries = transcript.filter(entry => entry.start <= currentTime)
      const videoContext = contextEntries.map(entry => entry.text).join(' ')

      const conversationHistory = [
        {
          role: 'system' as const,
          content: `You are helping a user understand this video. Here is what they have watched so far: "${videoContext}". Answer their questions about the video content.`,
          createdAt: new Date().toISOString()
        }
      ]

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
      setIsVoiceActive(true)
      setTranscriptMode('voice')
      setDropdownOpen(false)
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      setError(error.message || 'Failed to start voice session')
    } finally {
      setIsVoiceConnecting(false)
    }
  }

  const stopVoiceSession = async () => {
    try {
      await conversation.endSession()
      setAgentId(null)
      setIsVoiceActive(false)
      setTranscriptMode('transcript')
    } catch (error: any) {
      console.error('Error stopping voice session:', error)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading || !userId) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }])
    setIsChatLoading(true)

    try {
      // Build video transcript with timestamps for context
      const contextEntries = transcript.filter(entry => entry.start <= currentTime)
      const videoTranscript = contextEntries
        .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
        .join('\n')

      console.log('Sending video chat request with transcript length:', videoTranscript.length)

      const response = await fetch('/api/video-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: userMessage,
          videoTranscript,
          model: 'forefront-intelligence'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      console.log('Received response:', data.response.substring(0, 100))
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }])
    } catch (error: any) {
      console.error('Error sending chat message:', error)
      setError(error.message || 'Failed to send message')
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!userId) return

    setIsSummaryLoading(true)
    setTranscriptMode('summarize')
    setDropdownOpen(false)

    try {
      // Build video transcript with timestamps
      const contextEntries = transcript.filter(entry => entry.start <= currentTime)
      const videoTranscript = contextEntries
        .map(entry => `[${formatTime(entry.start)}] ${entry.text}`)
        .join('\n')

      console.log('Generating summary with transcript length:', videoTranscript.length)

      const summaryPrompt = `Please provide a comprehensive summary of this video. Structure your response with:

1. **Key Points** (bullet points of main takeaways)
2. **Main Topics** (grouped by theme)
3. **Important Timestamps** (with brief descriptions of what happens at key moments)

Be specific and reference the actual content from the video.`

      const response = await fetch('/api/video-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: summaryPrompt,
          videoTranscript,
          model: 'forefront-intelligence'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const data = await response.json()
      console.log('Summary generated, length:', data.response.length)
      setSummary(data.response)
    } catch (error: any) {
      console.error('Error generating summary:', error)
      setError(error.message || 'Failed to generate summary')
      setTranscriptMode('transcript')
    } finally {
      setIsSummaryLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-scroll to current transcript position
  useEffect(() => {
    if (!transcriptRef.current || transcriptMode !== 'transcript') return

    const currentEntry = transcript.findIndex(
      entry => entry.start <= currentTime && entry.start + entry.duration > currentTime
    )

    if (currentEntry >= 0) {
      const element = transcriptRef.current.children[currentEntry] as HTMLElement
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentTime, transcript])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* Video URL Input */}
      {!videoId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col items-center justify-center p-8 relative z-10"
        >
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <div className="max-w-2xl w-full space-y-8 relative z-10">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "w-24 h-24 rounded-2xl mx-auto flex items-center justify-center relative",
                  isDarkMode
                    ? "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-800"
                    : "bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 border border-zinc-300"
                )}
              >
                <Play size={40} className={isDarkMode ? "text-white" : "text-black"} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-4xl lowercase tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '-2px',
                  fontWeight: 700
                }}
              >
                video ai chat
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "text-sm lowercase tracking-wide max-w-md mx-auto",
                  isDarkMode ? "text-zinc-500" : "text-zinc-600"
                )}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  letterSpacing: '0.5px'
                }}
              >
                paste a youtube link and chat with ai about the video in real-time
              </motion.p>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLoadVideo()
                }}
                placeholder="https://youtube.com/watch?v=..."
                className={cn(
                  "w-full px-5 py-4 rounded-xl border focus:outline-none transition-all duration-300",
                  isDarkMode
                    ? "bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900"
                    : "bg-zinc-100/80 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-zinc-100"
                )}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0.3px'
                }}
                disabled={isLoading}
              />

              <motion.button
                onClick={handleLoadVideo}
                disabled={!youtubeUrl.trim() || isLoading}
                whileHover={!youtubeUrl.trim() || isLoading ? {} : { scale: 1.02 }}
                whileTap={!youtubeUrl.trim() || isLoading ? {} : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                  "w-full px-5 py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5",
                  !youtubeUrl.trim() || isLoading
                    ? isDarkMode
                      ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                    : isDarkMode
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-black text-white hover:bg-zinc-800"
                )}
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  textTransform: 'lowercase',
                  letterSpacing: '0.5px'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    loading video...
                  </>
                ) : (
                  'load video'
                )}
              </motion.button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-3",
                    isDarkMode
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600"
                  )}
                >
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Video Player + Transcript */}
      {videoId && (
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 flex flex-col gap-3">
            {videoMetadata && (
              <div className="space-y-1">
                <h3
                  className="text-lg lowercase tracking-wide truncate"
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '-0.5px',
                    fontWeight: 600
                  }}
                >
                  {videoMetadata.title}
                </h3>
                {videoMetadata.channelName && (
                  <p className={cn(
                    "text-xs lowercase tracking-wide",
                    isDarkMode ? "text-zinc-500" : "text-zinc-600"
                  )}
                    style={{
                      fontFamily: "'Core Sans A 65 Bold', sans-serif",
                      letterSpacing: '1px'
                    }}
                  >
                    {videoMetadata.channelName}
                  </p>
                )}
              </div>
            )}
            <VideoPlayer
              videoId={videoId}
              onTimeUpdate={handleTimeUpdate}
              onPlayStateChange={setIsPlaying}
              isDarkMode={isDarkMode}
            />

          </div>

          {/* Transcript */}
          <div className="w-96 flex flex-col">
            <div className={cn(
              "flex-1 rounded-xl border overflow-hidden flex flex-col",
              isDarkMode ? "bg-[#0a0a0a] border-[#2a2a2a]" : "bg-zinc-50 border-zinc-300"
            )}>
              <div className={cn(
                "px-4 py-3 border-b flex items-center justify-between",
                isDarkMode ? "border-[#2a2a2a] bg-[#1a1a1a]" : "border-zinc-300 bg-zinc-100"
              )}>
                <h4
                  className="text-sm lowercase tracking-wide"
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    letterSpacing: '1px',
                    fontWeight: 600
                  }}
                >
                  {transcriptMode === 'chat' ? 'video chat' : transcriptMode === 'summarize' ? 'summary' : transcriptMode === 'voice' ? 'voice chat' : 'transcript'}
                </h4>

                {/* Interaction Dropdown */}
                {!isPlaying && (
                  <div ref={dropdownRef} className="relative">
                    {/* Active Voice Indicator or Dropdown Button */}
                    {isVoiceActive ? (
                      <motion.button
                        onClick={stopVoiceSession}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          textTransform: 'lowercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        <PhoneOff size={14} />
                        end call
                      </motion.button>
                    ) : transcriptMode === 'chat' || transcriptMode === 'summarize' ? (
                      <motion.button
                        onClick={() => {
                          setTranscriptMode('transcript')
                          setSummary(null)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={cn(
                          "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2",
                          isDarkMode
                            ? "bg-zinc-800 text-white hover:bg-zinc-700"
                            : "bg-zinc-200 text-black hover:bg-zinc-300"
                        )}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          textTransform: 'lowercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        <ArrowLeft size={14} />
                        back
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={cn(
                          "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2",
                          isDarkMode
                            ? "bg-white text-black hover:bg-zinc-200"
                            : "bg-black text-white hover:bg-zinc-800"
                        )}
                        style={{
                          fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          textTransform: 'lowercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        interact
                        <ChevronDown size={14} className={cn(
                          "transition-transform duration-200",
                          dropdownOpen && "rotate-180"
                        )} />
                      </motion.button>
                    )}

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={cn(
                            "absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-20 overflow-hidden",
                            isDarkMode ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-zinc-300"
                          )}
                        >
                          <button
                            onClick={() => {
                              startVoiceSession()
                            }}
                            disabled={isVoiceConnecting}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors",
                              isDarkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-zinc-100",
                              isVoiceConnecting && "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              textTransform: 'lowercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            <Mic size={16} className="text-purple-500" />
                            {isVoiceConnecting ? 'connecting...' : 'activate voice'}
                          </button>

                          <button
                            onClick={() => {
                              setTranscriptMode('chat')
                              setDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors",
                              isDarkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-zinc-100"
                            )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              textTransform: 'lowercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            <MessageSquare size={16} className="text-blue-500" />
                            chat about video
                          </button>

                          <button
                            onClick={handleSummarize}
                            disabled={isSummaryLoading}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors",
                              isDarkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-zinc-100",
                              isSummaryLoading && "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              textTransform: 'lowercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            <Sparkles size={16} className="text-yellow-500" />
                            {isSummaryLoading ? 'generating...' : 'summarize'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden relative">
                {/* Voice Mode */}
                {transcriptMode === 'voice' && (
                  <div className="h-full flex items-center justify-center p-4">
                    <AnimatePresence>
                      {isVoiceActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm",
                        isDarkMode ? "bg-black/70" : "bg-white/70"
                      )}
                    >
                      <div className="text-center space-y-4 p-6">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto"
                        >
                          <Mic size={32} className="text-purple-500" />
                        </motion.div>

                        <div className="space-y-2">
                          <h3
                            className="text-lg lowercase tracking-wide"
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              letterSpacing: '-0.5px',
                              fontWeight: 600
                            }}
                          >
                            voice chat active
                          </h3>
                          <p className={cn(
                            "text-xs lowercase tracking-wide",
                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                          )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              letterSpacing: '0.5px'
                            }}
                          >
                            speak to ask questions about the video
                          </p>
                        </div>

                        <div className={cn(
                          "flex items-center gap-2 text-xs px-3 py-2 rounded-lg",
                          isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"
                        )}
                          style={{
                            fontFamily: "'Core Sans A 65 Bold', sans-serif",
                          }}
                        >
                          {conversation.status === 'connected' && (
                            <>
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              listening...
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Chat Mode */}
                {transcriptMode === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <MessageSquare size={32} className={cn(
                              "mx-auto",
                              isDarkMode ? "text-zinc-600" : "text-zinc-400"
                            )} />
                            <p className={cn(
                              "text-sm lowercase tracking-wide",
                              isDarkMode ? "text-zinc-500" : "text-zinc-600"
                            )}
                              style={{
                                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                                letterSpacing: '0.5px'
                              }}
                            >
                              ask questions about the video
                            </p>
                          </div>
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-lg",
                              msg.role === 'user'
                                ? isDarkMode
                                  ? "bg-purple-500/20 ml-8"
                                  : "bg-purple-100 ml-8"
                                : isDarkMode
                                ? "bg-[#1a1a1a] mr-8"
                                : "bg-white mr-8"
                            )}
                          >
                            <p className={cn(
                              "text-sm whitespace-pre-wrap",
                              isDarkMode ? "text-zinc-300" : "text-zinc-700"
                            )}
                              style={{
                                fontFamily: "'Core Sans A 65 Bold', sans-serif"
                              }}
                            >
                              {msg.content}
                            </p>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className={cn(
                          "p-3 rounded-lg mr-8",
                          isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
                        )}>
                          <Loader2 size={16} className="animate-spin text-purple-500" />
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className={cn(
                      "p-4 border-t",
                      isDarkMode ? "border-[#2a2a2a]" : "border-zinc-300"
                    )}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleChatSubmit()
                            }
                          }}
                          placeholder="ask about the video..."
                          disabled={isChatLoading}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg border focus:outline-none transition-all",
                            isDarkMode
                              ? "bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#555] focus:border-purple-500/50"
                              : "bg-zinc-50 border-zinc-300 text-black placeholder:text-zinc-400 focus:border-purple-500"
                          )}
                          style={{
                            fontFamily: "'Core Sans A 65 Bold', sans-serif",
                            fontSize: '13px'
                          }}
                        />
                        <button
                          onClick={handleChatSubmit}
                          disabled={!chatInput.trim() || isChatLoading}
                          className={cn(
                            "px-3 py-2 rounded-lg transition-all flex items-center justify-center",
                            chatInput.trim() && !isChatLoading
                              ? "bg-purple-500 text-white hover:bg-purple-600"
                              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          )}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summarize Mode */}
                {transcriptMode === 'summarize' && (
                  <div className="h-full overflow-y-auto p-4">
                    {isSummaryLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Loader2 size={32} className="animate-spin text-purple-500 mx-auto" />
                          <p className={cn(
                            "text-sm lowercase tracking-wide",
                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                          )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif",
                              letterSpacing: '0.5px'
                            }}
                          >
                            generating summary...
                          </p>
                        </div>
                      </div>
                    ) : summary ? (
                      <div className="space-y-3">
                        <div className={cn(
                          "p-4 rounded-lg",
                          isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
                        )}>
                          <p className={cn(
                            "text-sm whitespace-pre-wrap leading-relaxed",
                            isDarkMode ? "text-zinc-300" : "text-zinc-700"
                          )}
                            style={{
                              fontFamily: "'Core Sans A 65 Bold', sans-serif"
                            }}
                          >
                            {summary}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Transcript Mode (Default) */}
                {transcriptMode === 'transcript' && (
                  <div
                    ref={transcriptRef}
                    className="h-full overflow-y-auto p-4 space-y-2"
                  >
                    {transcript.map((entry, index) => {
                  const isActive = entry.start <= currentTime && entry.start + entry.duration > currentTime
                  const hasBeenWatched = entry.start < currentTime

                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        isActive
                          ? isDarkMode
                            ? "bg-purple-500/20 border border-purple-500/30"
                            : "bg-purple-100 border border-purple-200"
                          : hasBeenWatched
                          ? isDarkMode
                            ? "bg-[#1a1a1a]"
                            : "bg-white"
                          : isDarkMode
                          ? "opacity-50"
                          : "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "text-xs font-mono flex-shrink-0",
                            isActive
                              ? "text-purple-500"
                              : isDarkMode
                              ? "text-zinc-600"
                              : "text-zinc-500"
                          )}
                        >
                          {formatTime(entry.start)}
                        </span>
                        <p
                          className={cn(
                            "text-sm",
                            isDarkMode ? "text-zinc-300" : "text-zinc-700"
                          )}
                          style={{
                            fontFamily: "'Core Sans A 65 Bold', sans-serif"
                          }}
                        >
                          {entry.text}
                        </p>
                      </div>
                    </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
