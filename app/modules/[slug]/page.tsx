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
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'video' | 'note' | 'codePreview' | 'chart' | 'quiz' | 'markdown'
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
  const [autoPlay, setAutoPlay] = useState(false)
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set())

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
    if (slide.blocks?.some((b: ContentBlock) => b.type === 'quiz')) return 'quiz'
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

  // Load saved notes
  useEffect(() => {
    if (module && user) {
      fetchNotes()
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
          completed: currentSlideIndex === module.slides.length - 1
        })
      })
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Module not found</p>
      </div>
    )
  }

  const currentSlide = module.slides[currentSlideIndex]
  const progress = (completedSlides.size / module.slides.length) * 100

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
          <div key={block.id} className={`prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}>
            <div dangerouslySetInnerHTML={{
              __html: (block.data.content || '')
                .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-bold mb-8">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-500">$1</strong>')
                .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc my-2">$1</li>')
                .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')
                .replace(/✅/g, '<span class="text-green-500 text-xl">✅</span>')
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
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Run Code
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(block.data.code)}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="absolute top-4 left-4 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
              {block.data.language || 'code'}
            </div>
            <pre className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 pt-12 rounded-lg overflow-x-auto`}>
              <code className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
        return (
          <div key={block.id} className="mb-6 p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">
              <HelpCircle className="inline mr-2" size={24} />
              {block.data.question}
            </h3>
            <div className="space-y-2">
              {block.data.options?.map((option: string, i: number) => (
                <button
                  key={i}
                  className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  {String.fromCharCode(65 + i)}. {option}
                </button>
              ))}
            </div>
          </div>
        )

      case 'note':
        const noteContent = block.data.text || block.data.content || ''
        return (
          <div key={block.id} className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded">
            <div
              className={`prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}
              dangerouslySetInnerHTML={{ __html: noteContent }}
            />
          </div>
        )

      case 'codePreview':
        // Handle Henry's interactive HTML/CSS/JS blocks
        const previewHtml = block.data.html || ''
        const previewCss = block.data.css || ''
        const previewJs = block.data.js || ''

        // Combine HTML, CSS, and JS into a single iframe
        const iframeContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${previewCss}</style>
            </head>
            <body>
              ${previewHtml}
              <script>${previewJs}</script>
            </body>
          </html>
        `

        return (
          <div key={block.id} className="mb-6">
            <div className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <iframe
                srcDoc={iframeContent}
                className="w-full bg-white"
                style={{ minHeight: '400px', border: 'none' }}
                sandbox="allow-scripts"
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 h-16 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-b flex items-center justify-between px-4 z-40`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div>
            <h1 className="font-bold text-lg">{module.title}</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {module.instructor.name} • {module.duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`p-2 rounded-lg ${autoPlay ? 'bg-blue-600' : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {autoPlay ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={`p-2 rounded-lg ${notesOpen ? 'bg-blue-600' : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
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
              className={`fixed left-0 top-16 bottom-0 w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-r overflow-y-auto z-30`}
            >
              <div className="p-4">
                <h2 className="font-bold text-lg mb-4">Module Content</h2>

                <div className="space-y-2">
                  {module.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        index === currentSlideIndex
                          ? isDarkMode ? 'bg-blue-600/20 border-blue-500' : 'bg-blue-100 border-blue-500'
                          : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      } border ${index === currentSlideIndex ? '' : 'border-transparent'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${completedSlides.has(slide.id.toString()) ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {completedSlides.has(slide.id.toString()) ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSlideIcon(slide.type)}
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {slide.duration}
                            </span>
                          </div>
                          <h3 className="font-medium">{slide.title}</h3>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Section {index + 1} of {module.slides.length}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-3">Your Progress</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-bold">{completedSlides.size}/{module.slides.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes Taken</span>
                      <span className="font-bold">{Object.keys(notes).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-80' : ''} transition-all duration-300`}>
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {getSlideIcon(currentSlide.type)}
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Section {currentSlideIndex + 1} • {currentSlide.duration}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{currentSlide.title}</h1>
              {currentSlide.description && (
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                  currentSlideIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-2">
                {module.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlideIndex
                        ? 'w-8 bg-blue-500'
                        : completedSlides.has(module.slides[index].id.toString())
                          ? 'bg-green-500'
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(module.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === module.slides.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                  currentSlideIndex === module.slides.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors text-white`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <AnimatePresence>
          {notesOpen && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed right-0 top-16 bottom-0 w-96 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-l overflow-y-auto z-30`}
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
                  className={`w-full h-64 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />

                <div className="mt-8">
                  <h3 className="font-semibold mb-3">All Section Notes</h3>
                  <div className="space-y-3">
                    {Object.entries(notes).map(([slideId, note]) => {
                      const slide = module.slides.find(s => s.id.toString() === slideId)
                      if (!slide || !note) return null
                      return (
                        <div key={slideId} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <h4 className="font-medium text-sm mb-1">{slide.title}</h4>
                          <p className="text-sm opacity-75">{note}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}