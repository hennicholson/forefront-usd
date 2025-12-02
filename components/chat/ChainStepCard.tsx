'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Sparkles, Image as ImageIcon, Clock, Copy, Check, Code2, FileText, Brain } from 'lucide-react'
import { MarkdownMessage } from '@/components/ui/markdown-message'
import { CitationDisplay } from '@/components/ui/citation-display'
import { Badge } from '@/components/ui/badge'

interface ChainStepCardProps {
  step: {
    step: number
    model: string
    content: string
    type: 'text' | 'image' | 'video' | 'code'
    purpose: string
    executionTime: number
    metadata?: {
      citations?: string[]
      searchResults?: any[]
      aspectRatio?: string
      prompt?: string
      coordinatorNotes?: string
      extractedForNextStep?: string
      language?: string  // For code artifacts
    }
  }
  stepIndex: number
  totalSteps: number
  onFocus?: () => void
}

export function ChainStepCard({ step, stepIndex, totalSteps, onFocus }: ChainStepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract optimized prompt for prompt-enhancement steps
  const getOptimizedPrompt = (): string | null => {
    if (step.purpose !== 'prompt-enhancement') return null

    // FIRST: Check if coordinator extracted the prompt for the next step
    // This is the most reliable source as it's what actually gets sent to the next model
    if (step.metadata?.extractedForNextStep) {
      return step.metadata.extractedForNextStep
    }

    // FALLBACK: Try to parse from step content
    const lines = step.content.split('\n')

    // Look for various possible optimized prompt headers
    const promptIndex = lines.findIndex(l =>
      l.includes('**Optimized Image Prompt:**') ||
      l.includes('**Optimized Code Prompt:**') ||
      l.includes('**Optimized Text Prompt:**') ||
      l.includes('**Optimized Task Prompt:**') ||
      l.includes('Optimized Image Prompt:') ||
      l.includes('Optimized Code Prompt:') ||
      l.includes('Optimized Text Prompt:') ||
      l.includes('Optimized Task Prompt:') ||
      l.includes('**Final Prompt:**') ||
      l.includes('Final Prompt:')
    )

    if (promptIndex === -1) {
      // If no structured format, return the last paragraph
      const paragraphs = step.content.split('\n\n').filter(p => p.trim())
      if (paragraphs.length === 0) return null
      const lastParagraph = paragraphs[paragraphs.length - 1]
      // Remove markdown formatting
      return lastParagraph.replace(/\*\*/g, '').trim()
    }

    // Get everything after the prompt header until the next section or end
    const promptLines = []
    for (let i = promptIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim()

      // Stop if we hit another section header
      if (line.startsWith('**') && line.includes(':')) break
      if (line.startsWith('#')) break

      // Skip empty lines at the start
      if (promptLines.length === 0 && !line) continue

      // Add the line
      if (line) promptLines.push(line)
    }

    // Join and clean up
    return promptLines.join(' ').replace(/\*\*/g, '').trim()
  }

  const optimizedPrompt = getOptimizedPrompt()

  // Determine card styling based on purpose
  const getStepConfig = () => {
    switch (step.purpose) {
      case 'web-search':
        return {
          icon: Search,
          color: 'blue',
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-blue-500/5',
          iconColor: 'text-blue-400',
          title: '🔍 RESEARCH',
          description: 'Gathering real-world information'
        }
      case 'prompt-enhancement':
        return {
          icon: Sparkles,
          color: 'purple',
          borderColor: 'border-purple-500/30',
          bgColor: 'bg-purple-500/5',
          iconColor: 'text-purple-400',
          title: '✨ PROMPT OPTIMIZATION',
          description: 'Transforming research into detailed prompt'
        }
      case 'image-generation':
        return {
          icon: ImageIcon,
          color: 'green',
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-500/5',
          iconColor: 'text-green-400',
          title: '🎨 IMAGE GENERATION',
          description: 'Creating visual output'
        }
      case 'code-generation':
        return {
          icon: Code2,
          color: 'emerald',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-500/5',
          iconColor: 'text-emerald-400',
          title: '💻 CODE GENERATION',
          description: 'Writing code implementation'
        }
      case 'text-generation':
        return {
          icon: FileText,
          color: 'amber',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/5',
          iconColor: 'text-amber-400',
          title: '📝 TEXT GENERATION',
          description: 'Creating written content'
        }
      case 'reasoning':
        return {
          icon: Brain,
          color: 'pink',
          borderColor: 'border-pink-500/30',
          bgColor: 'bg-pink-500/5',
          iconColor: 'text-pink-400',
          title: '🧠 REASONING',
          description: 'Analyzing and problem-solving'
        }
      case 'final-composition':
        return {
          icon: Sparkles,
          color: 'indigo',
          borderColor: 'border-indigo-500/30',
          bgColor: 'bg-indigo-500/5',
          iconColor: 'text-indigo-400',
          title: '✨ SYNTHESIS',
          description: 'Composing final response'
        }
      default:
        return {
          icon: Sparkles,
          color: 'zinc',
          borderColor: 'border-zinc-500/30',
          bgColor: 'bg-zinc-500/5',
          iconColor: 'text-zinc-400',
          title: step.purpose.toUpperCase().replace(/-/g, ' '),
          description: 'Processing step'
        }
    }
  }

  const config = getStepConfig()
  const Icon = config.icon

  // Extract preview (first 3-4 lines for text, or show image thumbnail)
  const getPreview = () => {
    if (step.type === 'image') {
      return null // Will show image directly
    }

    const lines = step.content.split('\n').filter(l => l.trim())
    const previewLines = lines.slice(0, 4)
    return previewLines.join('\n')
  }

  // Check if content is long enough to need expansion
  const needsExpansion = step.type === 'text' && step.content.split('\n').filter(l => l.trim()).length > 4

  // Count citations if present
  const citationCount = (step.metadata?.citations?.length || 0) + (step.metadata?.searchResults?.length || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
      className={`border rounded-xl overflow-hidden ${config.borderColor} ${config.bgColor}`}
      id={`step-${step.step}`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-zinc-800/50 ${config.iconColor}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white"
                  style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                >
                  STEP {stepIndex + 1}/{totalSteps}: {config.title}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mb-2">{config.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40">
                  {step.model}
                </Badge>
                <Badge className="text-xs bg-zinc-800/60 border-zinc-700/40 flex items-center gap-1">
                  <Clock size={10} />
                  {(step.executionTime / 1000).toFixed(1)}s
                </Badge>
                {citationCount > 0 && (
                  <Badge className="text-xs bg-blue-800/60 border-blue-700/40">
                    📚 {citationCount} sources
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {step.type === 'image' ? (
          // Image content - always show full size with prompt display
          <div className="space-y-3">
            {/* Show the optimized prompt used for generation */}
            {step.metadata?.prompt && (
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold text-zinc-300">Optimized Prompt Used:</p>
                  <button
                    onClick={() => handleCopy(step.metadata?.prompt || '')}
                    className="p-1 rounded hover:bg-zinc-800 transition-colors"
                    title="Copy prompt"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-zinc-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.metadata?.prompt || ''}</p>
              </div>
            )}
            <img
              src={step.content}
              alt={config.title}
              className="rounded-xl w-full h-auto border border-zinc-700/50"
            />
          </div>
        ) : (
          // Text content - collapsible
          <div>
            {/* Show copyable optimized prompt for prompt-enhancement steps */}
            {step.purpose === 'prompt-enhancement' && optimizedPrompt && (
              <div className="mb-4 p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold text-purple-300">📋 Optimized Prompt (Click to Copy):</p>
                  <button
                    onClick={() => handleCopy(optimizedPrompt)}
                    className="p-1 rounded hover:bg-purple-800/30 transition-colors"
                    title="Copy prompt"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-purple-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{optimizedPrompt}</p>
              </div>
            )}

            <div className={needsExpansion && !isExpanded ? 'line-clamp-4' : ''}>
              <MarkdownMessage content={isExpanded ? step.content : (getPreview() || step.content)} isDarkMode={true} />
            </div>

            {needsExpansion && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 mt-3 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show Full Output
                  </>
                )}
              </button>
            )}

            {/* Citations - always show for web-search, not just when expanded */}
            {step.purpose === 'web-search' && citationCount > 0 && (
              <div className="mt-4">
                <CitationDisplay
                  citations={step.metadata?.citations}
                  searchResults={step.metadata?.searchResults}
                  isDarkMode={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
