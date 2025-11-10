'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  GitFork,
  Play,
  BookOpen,
  Check,
  Circle,
  ExternalLink,
  Copy,
  CheckCircle,
  Home,
  User,
  Eye,
  BarChart,
  Zap,
  Image
} from 'lucide-react'
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas'
import { WorkflowNode, WorkflowConnection } from '@/lib/workflows/workflow-types'

export default function WorkflowViewPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<any>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [runMode, setRunMode] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const res = await fetch(`/api/workflows?id=${workflowId}`)
        if (res.ok) {
          const data = await res.json()
          setWorkflow(data)
          setNodes(data.nodes || [])
          setConnections(data.connections || [])
        }
      } catch (error) {
        console.error('Error loading workflow:', error)
      }
    }

    loadWorkflow()
  }, [workflowId])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (workflow) {
      setWorkflow({
        ...workflow,
        likes: isLiked ? workflow.likes - 1 : workflow.likes + 1
      })
    }
  }

  const handleRunMode = () => {
    setRunMode(!runMode)
    setCurrentStepIndex(0)
  }

  const handleNextStep = () => {
    if (currentStepIndex < nodes.length - 1) {
      setCompletedSteps(new Set([...completedSteps, currentStepIndex]))
      setCurrentStepIndex(currentStepIndex + 1)
      contentRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      contentRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCopyPrompt = (stepIndex: number) => {
    const node = nodes[stepIndex]
    if (node?.data?.promptText) {
      navigator.clipboard.writeText(node.data.promptText)
      setCopiedStep(stepIndex)
      setTimeout(() => setCopiedStep(null), 2000)
    }
  }

  const currentNode = nodes[currentStepIndex]
  const progress = ((currentStepIndex + 1) / nodes.length) * 100

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-50">
      {/* Header */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="h-16 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-6 z-50 absolute top-0 left-0 right-0"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/workflows')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Home className="h-5 w-5" />
              </button>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <h1 className="text-lg font-semibold">{workflow.title}</h1>
                <p className="text-xs text-zinc-500">{workflow.views || 0} views</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isLiked
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent border-zinc-800 hover:border-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-semibold">{workflow.likes || 0}</span>
              </button>
              <button
                onClick={() => router.push(`/workflows/create?fork=${workflowId}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 hover:border-white transition-colors"
              >
                <GitFork className="h-4 w-4" />
                <span className="text-sm font-semibold">Fork</span>
              </button>
              <button
                onClick={handleRunMode}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                  runMode
                    ? 'bg-white text-black'
                    : 'bg-transparent border border-zinc-800 hover:border-white'
                }`}
              >
                {runMode ? (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Exit Run Mode
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Mode
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex h-full" style={{ paddingTop: isFullscreen ? 0 : '64px' }}>
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || runMode) && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 bg-zinc-950/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                    {runMode ? 'Progress' : 'Workflow Steps'}
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {runMode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Step {currentStepIndex + 1} of {nodes.length}</span>
                      <span className="text-white font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {nodes.map((node, index) => {
                  const isActive = runMode && index === currentStepIndex
                  const isCompleted = completedSteps.has(index)

                  return (
                    <motion.button
                      key={node.id}
                      onClick={() => runMode && setCurrentStepIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-black'
                          : isCompleted
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs uppercase tracking-wide font-semibold mb-1 opacity-70">
                            {node.type}
                          </div>
                          <div className="font-semibold truncate">{node.title}</div>
                          {node.description && (
                            <div className="text-xs mt-1 opacity-70 line-clamp-2">
                              {node.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Author Info */}
              <div className="p-6 border-t border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{workflow.author?.name || 'Anonymous'}</div>
                    <div className="text-xs text-zinc-500">Creator</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {workflow.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart className="h-3.5 w-3.5" />
                    <span className={
                      workflow.difficulty === 'beginner' ? 'text-green-400' :
                      workflow.difficulty === 'intermediate' ? 'text-yellow-400' :
                      'text-red-400'
                    }>
                      {workflow.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-12 bg-zinc-950/50 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {!sidebarOpen && !runMode && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}
              {workflow.description && (
                <p className="text-sm text-zinc-500 max-w-2xl truncate">{workflow.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Canvas or Run Mode View */}
          <div className="flex-1 overflow-hidden relative">
            {runMode ? (
              <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8" ref={contentRef}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStepIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Step Header */}
                      <div>
                        <div className="inline-block px-3 py-1 bg-zinc-900 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                          {currentNode?.type}
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{currentNode?.title}</h2>
                        {currentNode?.description && (
                          <p className="text-xl text-zinc-400 leading-relaxed">{currentNode.description}</p>
                        )}
                      </div>

                      {/* Type-specific content */}
                      {currentNode?.type === 'tool' && currentNode.data?.toolUrl && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-zinc-500 mb-2">Open this tool</p>
                              <p className="font-semibold">{currentNode.data.toolName || 'External Tool'}</p>
                            </div>
                            <a
                              href={currentNode.data.toolUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                            >
                              Open Tool
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}

                      {currentNode?.type === 'prompt' && currentNode.data?.promptText && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Prompt
                            </span>
                            <button
                              onClick={() => handleCopyPrompt(currentStepIndex)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors text-sm"
                            >
                              {copiedStep === currentStepIndex ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-6 text-sm leading-relaxed font-mono text-zinc-300 overflow-x-auto">
                            {currentNode.data.promptText}
                          </pre>
                        </div>
                      )}

                      {currentNode?.type === 'action' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                              <Zap className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Action Required</h3>
                              <p className="text-zinc-400">
                                {currentNode.data?.actionType || 'Complete this action to continue'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentNode?.type === 'screenshot' && currentNode.data?.promptText && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                              <Image className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">Screenshot</h3>
                              <p className="text-zinc-400 whitespace-pre-wrap">{currentNode.data.promptText}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between pt-8 border-t border-zinc-800">
                        <button
                          onClick={handlePrevStep}
                          disabled={currentStepIndex === 0}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            currentStepIndex === 0
                              ? 'opacity-30 cursor-not-allowed'
                              : 'bg-zinc-900 hover:bg-zinc-800'
                          }`}
                        >
                          <ChevronLeft className="h-5 w-5" />
                          Previous
                        </button>

                        <div className="text-sm text-zinc-500">
                          Step {currentStepIndex + 1} of {nodes.length}
                        </div>

                        <button
                          onClick={handleNextStep}
                          disabled={currentStepIndex === nodes.length - 1}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                            currentStepIndex === nodes.length - 1
                              ? 'bg-green-500 text-black cursor-default'
                              : 'bg-white text-black hover:bg-zinc-200'
                          }`}
                        >
                          {currentStepIndex === nodes.length - 1 ? (
                            <>
                              <Check className="h-5 w-5" />
                              Complete
                            </>
                          ) : (
                            <>
                              Next
                              <ChevronRight className="h-5 w-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <WorkflowCanvas
                initialNodes={nodes}
                initialConnections={connections}
                editable={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
