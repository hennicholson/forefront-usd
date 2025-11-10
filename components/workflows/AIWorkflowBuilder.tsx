'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { WorkflowNode, WorkflowConnection, WorkflowCategory } from '@/lib/workflows/workflow-types'

interface AIWorkflowBuilderProps {
  onWorkflowGenerated: (data: {
    title: string
    description: string
    category: WorkflowCategory
    nodes: WorkflowNode[]
    connections: WorkflowConnection[]
    metadata: any
  }) => void
  userId?: string
}

export function AIWorkflowBuilder({ onWorkflowGenerated, userId }: AIWorkflowBuilderProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<WorkflowCategory>('content')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const categories: { id: WorkflowCategory; name: string; icon: string }[] = [
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'coding', name: 'Coding', icon: '💻' },
    { id: 'marketing', name: 'Marketing', icon: '📱' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'content', name: 'Content', icon: '✍️' },
    { id: 'automation', name: 'Automation', icon: '⚡' }
  ]

  const examplePrompts = [
    'Create a LinkedIn post using ChatGPT, generate a header image with DALL-E, then schedule in Buffer',
    'Build a Next.js app with Cursor, commit to GitHub, and deploy on Vercel',
    'Generate a YouTube video: script with ChatGPT, visuals with Midjourney, animate with Runway, edit in CapCut',
    'Design a landing page in Figma, export assets, and code with Claude'
  ]

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your workflow')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          category,
          userId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow')
      }

      console.log('[AIWorkflowBuilder] Generated workflow:', data.workflow)

      setSuccess(true)
      setTimeout(() => {
        onWorkflowGenerated(data.workflow)
      }, 1000)
    } catch (err: any) {
      console.error('[AIWorkflowBuilder] Error:', err)
      setError(err.message || 'Failed to generate workflow. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">AI Workflow Builder</h2>
        </div>
        <p className="text-zinc-400 text-sm">
          Describe your workflow in plain English. Forefront Intelligence will parse it into a visual node graph.
        </p>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center justify-center gap-2
                ${category === cat.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Describe Your Workflow</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Create a YouTube thumbnail using ChatGPT for the title text, DALL-E for the background image, then polish it in Canva..."
          rows={6}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg
                   text-white placeholder:text-zinc-600 resize-none
                   focus:outline-none focus:border-purple-500 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-zinc-500">
          Tip: Press <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">⌘ + Enter</kbd> to generate
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Example Prompts</label>
        <div className="grid gap-2">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setDescription(prompt)}
              disabled={isGenerating}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                       rounded-lg text-left text-xs text-zinc-400 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !description.trim()}
        className={`
          w-full px-6 py-4 rounded-xl font-semibold text-base
          flex items-center justify-center gap-3
          transition-all duration-200
          ${isGenerating || !description.trim()
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Workflow...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Generated! Loading editor...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Workflow with AI</span>
          </>
        )}
      </button>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg
                     flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Generation Failed</p>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg
                     flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">Workflow Generated!</p>
              <p className="text-xs text-green-400/80 mt-1">
                Forefront Intelligence has parsed your description into a visual workflow.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State Details */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Analyzing description with Forefront Intelligence...</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span>Extracting tools and prompts...</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span>Building node graph...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
