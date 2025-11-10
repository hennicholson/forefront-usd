'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  Code,
  Video,
  CheckCircle,
  Circle,
  Clock,
  Award,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  Bookmark,
  Share2,
  Download,
  Sun,
  Moon,
  Image,
  BarChart,
  HelpCircle,
  Home
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AIPlayground } from './components/AIPlayground'
import { KnowledgeCheck } from './components/KnowledgeCheck'

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'video' | 'note' | 'codePreview' | 'chart' | 'quiz' | 'knowledgeCheck' | 'markdown'
  data: any
}

interface Slide {
  id: string | number
  title: string
  description?: string
  type?: 'intro' | 'lesson' | 'code' | 'video' | 'quiz' | 'summary'
  duration?: string
  blocks: ContentBlock[]
  completed?: boolean
}

interface Module {
  id: string | number
  moduleId?: string
  title: string
  description: string
  instructor: {
    name: string
    photo?: string
    year?: string
    major?: string
  }
  duration: string
  skillLevel: string
  introVideo?: string
  learningObjectives?: string[]
  keyTakeaways?: string[]
  slides: Slide[]
}

export default function ModuleViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params)
  const slug = unwrappedParams.slug
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set())
  const [quizResults, setQuizResults] = useState<{ [key: string]: boolean }>({})
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const [playgroundWidth, setPlaygroundWidth] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)
  const [highlightedText, setHighlightedText] = useState<string>('')
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 })

  // Fetch module data
  useEffect(() => {
    fetchModule()
  }, [slug])

  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/modules/${slug}`)
      if (!res.ok) throw new Error('Module not found')
      const data = await res.json()

      // Ensure slides have proper structure
      const processedModule = {
        ...data,
        slides: data.slides.map((slide: any, index: number) => ({
          ...slide,
          id: slide.id || index.toString(),
          type: slide.type || determineSlideType(slide, index, data.slides.length),
          duration: slide.duration || '5 min',
          blocks: slide.blocks || convertToBlocks(slide)
        }))
      }

      setModule(processedModule)
    } catch (err) {
      console.error('Error loading module:', err)
      router.push('/modules')
    } finally {
      setLoading(false)
    }
  }

  // Determine slide type based on content and position
  const determineSlideType = (slide: any, index: number, totalSlides: number): string => {
    if (index === 0) return 'intro'
    if (index === totalSlides - 1) return 'summary'
    if (slide.blocks?.some((b: ContentBlock) => b.type === 'code')) return 'code'
    if (slide.blocks?.some((b: ContentBlock) => b.type === 'video')) return 'video'
    if (slide.blocks?.some((b: ContentBlock) => b.type === 'quiz' || b.type === 'knowledgeCheck')) return 'quiz'
    if (slide.type === 'quiz') return 'quiz' // Also check slide-level type
    return 'lesson'
  }

  // Convert old slide format to blocks if needed
  const convertToBlocks = (slide: any): ContentBlock[] => {
    if (slide.blocks && Array.isArray(slide.blocks)) {
      return slide.blocks
    }

    const blocks: ContentBlock[] = []

    // Convert old format to blocks
    if (slide.title) {
      blocks.push({
        id: 'title',
        type: 'text',
        data: {
          text: slide.title,
          variant: 'h1'
        }
      })
    }

    if (slide.description || slide.content) {
      blocks.push({
        id: 'content',
        type: 'markdown',
        data: {
          content: slide.description || slide.content
        }
      })
    }

    return blocks
  }

  // Load saved notes, progress, and knowledge check responses
  useEffect(() => {
    if (module && user) {
      fetchNotes()
      fetchProgress()
      fetchKnowledgeChecks()
    }
  }, [module, user])

  const fetchNotes = async () => {
    if (!user || !module) return
    try {
      const moduleId = module.moduleId || module.id
      const res = await fetch(`/api/notes?userId=${user.id}&moduleId=${moduleId}`)
      if (res.ok) {
        const notesData = await res.json()
        const notesMap: { [key: string]: string } = {}
        notesData.forEach((note: any) => {
          notesMap[note.slideId] = note.content
        })
        setNotes(notesMap)
      }
    } catch (err) {
      console.error('Error loading notes:', err)
    }
  }

  const fetchProgress = async () => {
    if (!user || !module) return
    try {
      const moduleId = module.moduleId || module.id
      const res = await fetch(`/api/progress?userId=${user.id}&moduleId=${moduleId}`)
      if (res.ok) {
        const progressData = await res.json()
        if (progressData) {
          // Load completed slides from database
          const completed = progressData.completedSlides || []
          setCompletedSlides(new Set(completed.map((id: any) => id.toString())))

          // Resume from last viewed slide
          if (progressData.lastViewed !== undefined) {
            setCurrentSlideIndex(progressData.lastViewed)
          }
        }
      }
    } catch (err) {
      console.error('Error loading progress:', err)
    }
  }

  const fetchKnowledgeChecks = async () => {
    if (!user || !module) return
    try {
      const moduleId = module.moduleId || module.id
      const res = await fetch(`/api/knowledge-checks?userId=${user.id}&moduleId=${moduleId}`)
      if (res.ok) {
        const { responses } = await res.json()
        // Build quiz results map from responses
        const resultsMap: { [key: string]: boolean } = {}
        responses.forEach((response: any) => {
          resultsMap[response.slideId] = response.isCorrect
        })
        setQuizResults(resultsMap)
      }
    } catch (err) {
      console.error('Error loading knowledge checks:', err)
    }
  }

  // Save note
  const saveNote = async (slideId: string, content: string) => {
    if (!user || !module) return

    const moduleId = module.moduleId || module.id

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId,
          slideId: parseInt(slideId),
          content
        })
      })

      if (res.ok) {
        setNotes({ ...notes, [slideId]: content })
      }
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }

  // Scroll to top when slide changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentSlideIndex])

  // Mark slide as completed
  useEffect(() => {
    if (module && currentSlide && !completedSlides.has(currentSlide.id.toString())) {
      const timer = setTimeout(() => {
        setCompletedSlides(prev => new Set(prev).add(currentSlide.id.toString()))
        if (user) {
          updateProgress()
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentSlideIndex, module])

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()

    if (selectedText && selectedText.length > 0) {
      setHighlightedText(selectedText)

      // Get selection position
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        setHighlightMenuPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        })
        setShowHighlightMenu(true)
      }
    } else {
      setShowHighlightMenu(false)
    }
  }

  // Listen for text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      handleTextSelection()
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const containerWidth = window.innerWidth
      const newWidth = (e.clientX / containerWidth) * 100
      setPlaygroundWidth(Math.max(30, Math.min(70, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const updateProgress = async () => {
    if (!user || !module) return

    const moduleId = module.moduleId || module.id

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId,
          slideIndex: currentSlideIndex,
          completedSlides: Array.from(completedSlides),
          completed: currentSlideIndex === module.slides.length - 1
        })
      })
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500">Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-500">Module not found</p>
      </div>
    )
  }

  const currentSlide = module.slides[currentSlideIndex]
  const progress = (completedSlides.size / module.slides.length) * 100

  // Check if a slide is accessible based on previous quiz completion
  const isSlideAccessible = (slideIndex: number) => {
    if (slideIndex === 0) return true // First slide always accessible

    // Check all previous slides for quizzes or knowledge checks
    for (let i = 0; i < slideIndex; i++) {
      const slide = module.slides[i]
      const hasQuiz = slide.blocks?.some(block =>
        block.type === 'quiz' || block.type === 'knowledgeCheck'
      )

      if (hasQuiz && !quizResults[slide.id.toString()]) {
        return false // Previous quiz not completed
      }
    }

    return true
  }

  const getSlideIcon = (type?: string) => {
    switch (type) {
      case 'intro': return <Sparkles size={16} />
      case 'lesson': return <BookOpen size={16} />
      case 'code': return <Code size={16} />
      case 'video': return <Video size={16} />
      case 'quiz': return <Target size={16} />
      case 'summary': return <Award size={16} />
      default: return <FileText size={16} />
    }
  }

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        const TextTag = block.data.variant || 'p'
        const textClassMap: Record<string, string> = {
          h1: 'text-5xl font-bold mb-8',
          h2: 'text-3xl font-bold mt-8 mb-4',
          h3: 'text-2xl font-semibold mt-6 mb-3',
          p: 'text-lg leading-relaxed mb-4'
        }
        const textClass = textClassMap[TextTag] || 'mb-4'

        // Handle HTML content from Henry's modules
        const htmlContent = block.data.html || block.data.text || ''

        return (
          <div
            key={block.id}
            className={`${textClass} prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )

      case 'markdown':
        return (
          <div key={block.id} className="prose prose-neutral dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{
              __html: (block.data.content || '')
                .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-bold mb-8">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc my-2">$1</li>')
                .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-border pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
                .replace(/✅/g, '<span class="text-xl">✅</span>')
                .replace(/🎯/g, '<span class="text-2xl">🎯</span>')
                .replace(/💡/g, '<span class="text-2xl">💡</span>')
                .replace(/🚀/g, '<span class="text-2xl">🚀</span>')
                .replace(/\n/g, '<br/>')
            }} />
          </div>
        )

      case 'code':
        return (
          <div key={block.id} className="relative group mb-6">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button className={`px-3 py-1 rounded-lg text-sm transition-colors shadow-sm ${isDarkMode ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-zinc-200 text-black hover:bg-zinc-300'}`}>
                Run Code
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(block.data.code)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors shadow-sm ${isDarkMode ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-zinc-200 text-black hover:bg-zinc-300'}`}
              >
                Copy
              </button>
            </div>
            <div className={`absolute top-4 left-4 px-2 py-1 backdrop-blur rounded text-xs border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-400 border-zinc-700' : 'bg-zinc-100/50 text-zinc-600 border-zinc-300'}`}>
              {block.data.language || 'code'}
            </div>
            <pre className={`border p-6 pt-12 rounded-lg overflow-x-auto ${isDarkMode ? 'bg-zinc-900/30 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
              <code className="text-sm font-mono">
                {block.data.code}
              </code>
            </pre>
          </div>
        )

      case 'video':
        return (
          <div key={block.id} className="mb-6">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              {block.data.url ? (
                <iframe
                  src={block.data.url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              ) : (
                <Play size={64} className="text-white opacity-50" />
              )}
            </div>
            {block.data.caption && (
              <p className="text-sm text-gray-500 mt-2">{block.data.caption}</p>
            )}
          </div>
        )

      case 'image':
        return (
          <div key={block.id} className="mb-6">
            <img
              src={block.data.url}
              alt={block.data.alt || ''}
              className="w-full rounded-lg"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-500 mt-2">{block.data.caption}</p>
            )}
          </div>
        )

      case 'quiz':
      case 'knowledgeCheck':
        return (
          <KnowledgeCheck
            key={block.id}
            question={block.data.question}
            options={block.data.options || []}
            correctIndex={block.data.correctIndex || 0}
            explanation={block.data.explanation}
            isDarkMode={isDarkMode}
            onComplete={async (correct, selectedIndex) => {
              setQuizResults(prev => ({
                ...prev,
                [currentSlide.id.toString()]: correct
              }))
              if (correct) {
                setCompletedSlides(prev => new Set([...prev, currentSlide.id.toString()]))
              }

              // Save knowledge check response to database
              if (user && module) {
                try {
                  const moduleId = module.moduleId || module.id
                  await fetch('/api/knowledge-checks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: user.id,
                      moduleId: moduleId.toString(),
                      slideId: currentSlide.id.toString(),
                      blockId: block.id,
                      question: block.data.question,
                      selectedIndex,
                      correctIndex: block.data.correctIndex || 0,
                      isCorrect: correct
                    })
                  })
                } catch (err) {
                  console.error('Error saving knowledge check response:', err)
                }
              }
            }}
            onContinue={() => {
              if (currentSlideIndex < module.slides.length - 1) {
                setCurrentSlideIndex(currentSlideIndex + 1)
              }
            }}
          />
        )

      case 'note':
        const noteContent = block.data.text || block.data.content || ''
        return (
          <div key={block.id} className={`mb-6 p-4 border-l-4 rounded-lg ${isDarkMode ? 'bg-zinc-800/50 border-zinc-600' : 'bg-zinc-100 border-zinc-400'}`}>
            <div
              className={`prose max-w-none ${isDarkMode ? 'prose-invert' : 'prose-zinc'}`}
              dangerouslySetInnerHTML={{ __html: noteContent }}
            />
          </div>
        )

      case 'codePreview':
        // Handle Henry's interactive HTML/CSS/JS blocks
        const previewHtml = block.data.html || ''
        const previewCss = block.data.css || ''
        const previewJs = block.data.js || ''

        // Combine HTML, CSS, and JS into a single iframe with proper structure
        const iframeContent = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  line-height: 1.5;
                }
                ${previewCss}
              </style>
            </head>
            <body>
              ${previewHtml}
              <script>
                try {
                  ${previewJs}
                } catch (error) {
                  console.error('JavaScript Error:', error);
                }
              </script>
            </body>
          </html>
        `

        return (
          <div key={block.id} className="mb-6">
            <div className="rounded-lg overflow-hidden border border-zinc-700 bg-white shadow-sm">
              <iframe
                srcDoc={iframeContent}
                className="w-full bg-white"
                style={{ minHeight: '400px', border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-same-origin"
                title="Code Preview"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Add to AI chat with highlighted text
  const sendHighlightedToChat = () => {
    setPlaygroundOpen(true)
    setShowHighlightMenu(false)
    // The highlighted text will be passed via context
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 h-16 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-zinc-200'} backdrop-blur-sm border-b flex items-center justify-between px-4 z-40`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
            title="Back to Dashboard"
          >
            <Home size={20} />
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div>
            <h1 className="font-bold text-lg">{module.title}</h1>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
              {module.instructor.name} • {module.duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-32 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <div
                className={`h-full transition-all duration-300 ${isDarkMode ? 'bg-white' : 'bg-black'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{Math.round(progress)}%</span>
          </div>

          <button
            onClick={() => {
              setPlaygroundOpen(!playgroundOpen)
              if (!playgroundOpen) {
                setSidebarOpen(false)
              }
            }}
            className={`p-2 rounded-lg transition-colors ${playgroundOpen ? (isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100') : (isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}`}
            title="AI Playground"
          >
            <Sparkles size={18} />
          </button>

          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={`p-2 rounded-lg transition-colors ${notesOpen ? (isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100') : (isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}`}
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed left-0 top-16 bottom-0 w-80 border-r overflow-y-auto z-30 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
            >
              <div className="p-4">
                <h2 className={`font-semibold text-sm mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Course Progress</h2>
                <div className="text-4xl font-bold mb-2">{completedSlides.size}</div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>/ {module.slides.length} completed</p>

                <div className="space-y-2">
                  {module.slides.map((slide, index) => {
                    const isAccessible = isSlideAccessible(index)
                    const isLocked = !isAccessible

                    return (
                      <button
                        key={slide.id}
                        onClick={() => isAccessible && setCurrentSlideIndex(index)}
                        disabled={isLocked}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          index === currentSlideIndex
                            ? (isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200')
                            : isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : (isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100')
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${completedSlides.has(slide.id.toString()) ? 'text-green-500' : (isDarkMode ? 'text-zinc-600' : 'text-zinc-400')}`}>
                            {completedSlides.has(slide.id.toString()) ? <CheckCircle size={18} /> : <Circle size={18} />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{getSlideIcon(slide.type)}</span>
                              <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                {slide.duration}
                              </span>
                            </div>
                            <h3 className={`font-normal text-sm leading-snug ${isLocked ? (isDarkMode ? 'text-zinc-700' : 'text-zinc-400') : ''}`}>
                              {slide.title}
                            </h3>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
                              Section {index + 1} of {module.slides.length}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content & Playground Split View */}
        <div className="flex flex-1 relative">
          {/* Main Content */}
          <div
            className={`${sidebarOpen ? 'ml-80' : ''} transition-all duration-300`}
            style={{
              width: playgroundOpen ? `${playgroundWidth}%` : '100%',
              transition: 'width 0.3s ease'
            }}
          >
            <div ref={contentRef} className="max-w-5xl mx-auto px-8 py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-500">{getSlideIcon(currentSlide.type)}</span>
                <span className="text-sm text-zinc-500">
                  Section {currentSlideIndex + 1} • {currentSlide.duration}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{currentSlide.title}</h1>
              {currentSlide.description && (
                <p className="text-lg text-zinc-400">
                  {currentSlide.description}
                </p>
              )}
            </div>

            {/* Render content blocks */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentSlide.blocks?.map(block => renderContentBlock(block))}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className={`flex justify-between items-center mt-12 pt-8 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  currentSlideIndex === 0
                    ? `opacity-50 cursor-not-allowed ${isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-200 text-zinc-400'}`
                    : (isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-black')
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-2">
                {module.slides.map((_, index) => {
                  const isAccessible = isSlideAccessible(index)
                  return (
                    <button
                      key={index}
                      onClick={() => isAccessible && setCurrentSlideIndex(index)}
                      disabled={!isAccessible}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlideIndex
                          ? `w-8 ${isDarkMode ? 'bg-white' : 'bg-black'}`
                          : completedSlides.has(module.slides[index].id.toString())
                            ? `w-2 ${isDarkMode ? 'bg-white/50' : 'bg-black/50'}`
                            : !isAccessible
                              ? `w-2 cursor-not-allowed ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`
                              : `w-2 ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`
                      }`}
                    />
                  )
                })}
              </div>

              <button
                onClick={() => {
                  const nextSlideIndex = currentSlideIndex + 1
                  if (isSlideAccessible(nextSlideIndex)) {
                    setCurrentSlideIndex(nextSlideIndex)
                  }
                }}
                disabled={
                  currentSlideIndex === module.slides.length - 1 ||
                  !isSlideAccessible(currentSlideIndex + 1)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  currentSlideIndex === module.slides.length - 1 ||
                  !isSlideAccessible(currentSlideIndex + 1)
                    ? `opacity-50 cursor-not-allowed ${isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-200 text-zinc-400'}`
                    : (isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800')
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        {playgroundOpen && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className={`absolute top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-zinc-700 transition-colors ${isResizing ? 'bg-zinc-700' : 'bg-transparent'}`}
            style={{ left: `${playgroundWidth}%` }}
          />
        )}

        {/* AI Playground Panel */}
        <AnimatePresence>
          {playgroundOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-16 bottom-0 z-30"
              style={{
                width: `${100 - playgroundWidth}%`,
                minWidth: '400px'
              }}
            >
              <AIPlayground
                moduleTitle={module.title}
                moduleId={module.moduleId || String(module.id)}
                moduleSlug={slug}
                slideId={String(currentSlide.id)}
                userId={user?.id}
                currentSlide={{
                  title: currentSlide.title,
                  content: currentSlide.description || '',
                  type: currentSlide.type
                }}
                highlightedText={highlightedText}
                isDarkMode={isDarkMode}
                onClose={() => setPlaygroundOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Notes Panel */}
        <AnimatePresence>
          {notesOpen && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed right-0 top-16 bottom-0 w-96 border-l overflow-y-auto z-30 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
            >
              <div className="p-6">
                <h2 className="font-bold text-lg mb-4">Your Notes</h2>

                <textarea
                  value={notes[currentSlide.id] || ''}
                  onChange={(e) => {
                    const newNotes = { ...notes, [currentSlide.id]: e.target.value }
                    setNotes(newNotes)
                  }}
                  onBlur={() => {
                    if (notes[currentSlide.id]) {
                      saveNote(currentSlide.id.toString(), notes[currentSlide.id])
                    }
                  }}
                  placeholder="Take notes for this section..."
                  className={`w-full h-64 p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-zinc-600' : 'bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus:ring-zinc-400'}`}
                />

                <div className="mt-8">
                  <h3 className="font-semibold mb-3">All Section Notes</h3>
                  <div className="space-y-3">
                    {Object.entries(notes).map(([slideId, note]) => {
                      const slide = module.slides.find(s => s.id.toString() === slideId)
                      const slideIndex = module.slides.findIndex(s => s.id.toString() === slideId)
                      if (!slide || !note) return null
                      return (
                        <button
                          key={slideId}
                          onClick={() => setCurrentSlideIndex(slideIndex)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700' : 'bg-white hover:bg-zinc-50 border-zinc-200'}`}
                        >
                          <h4 className="font-medium text-sm mb-1">{slide.title}</h4>
                          <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{note}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Highlight Menu */}
        <AnimatePresence>
          {showHighlightMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                left: highlightMenuPosition.x,
                top: highlightMenuPosition.y,
                transform: 'translateX(-50%) translateY(-100%)',
                zIndex: 100
              }}
              className={`rounded-lg shadow-lg border overflow-hidden ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
              }`}
            >
              <button
                onClick={sendHighlightedToChat}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isDarkMode ? 'hover:bg-zinc-700 text-white' : 'hover:bg-zinc-50 text-black'
                }`}
              >
                <Sparkles size={14} />
                Ask AI about this
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}