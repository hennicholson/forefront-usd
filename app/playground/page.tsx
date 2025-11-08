'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Save, Download, Upload, Code, Eye, Layers, Settings, Plus, Trash2, Copy, Edit3 } from 'lucide-react'

interface Slide {
  id: string
  title: string
  content: string
  type: 'text' | 'code' | 'markdown' | 'quiz'
  codeLanguage?: string
}

interface Module {
  id: string
  title: string
  description: string
  slides: Slide[]
  thumbnail?: string
  tags: string[]
}

const defaultModule: Module = {
  id: '1',
  title: 'Introduction to AI',
  description: 'Learn the fundamentals of artificial intelligence',
  tags: ['AI', 'Machine Learning', 'Beginner'],
  slides: [
    {
      id: '1',
      title: 'Welcome to AI',
      content: '# Welcome to the World of AI\n\nArtificial Intelligence is transforming how we interact with technology.\n\n## What you\'ll learn:\n- Core AI concepts\n- Machine learning basics\n- Practical applications\n- Future trends',
      type: 'markdown'
    },
    {
      id: '2',
      title: 'What is AI?',
      content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn.\n\nKey components:\n• Machine Learning\n• Neural Networks\n• Natural Language Processing\n• Computer Vision',
      type: 'text'
    },
    {
      id: '3',
      title: 'Python Example',
      content: `# Simple AI example using Python
import numpy as np
from sklearn.linear_model import LinearRegression

# Generate sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Train model
model = LinearRegression()
model.fit(X, y)

# Make prediction
prediction = model.predict([[6]])
print(f"Prediction for x=6: {prediction[0]}")`,
      type: 'code',
      codeLanguage: 'python'
    }
  ]
}

export default function PlaygroundPage() {
  const [module, setModule] = useState<Module>(defaultModule)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(true)
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentSlide = module.slides[currentSlideIndex]

  // Handle split panel dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSplitPosition(Math.min(Math.max(percentage, 20), 80))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const handleSlideUpdate = (field: keyof Slide, value: string) => {
    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      [field]: value
    }
    setModule({ ...module, slides: updatedSlides })
  }

  const addNewSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: 'Enter your content here...',
      type: 'text'
    }
    setModule({
      ...module,
      slides: [...module.slides, newSlide]
    })
    setCurrentSlideIndex(module.slides.length)
  }

  const deleteSlide = (index: number) => {
    if (module.slides.length <= 1) return
    const updatedSlides = module.slides.filter((_, i) => i !== index)
    setModule({ ...module, slides: updatedSlides })
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1)
    }
  }

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = module.slides[index]
    const newSlide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      title: `${slideToDuplicate.title} (Copy)`
    }
    const updatedSlides = [
      ...module.slides.slice(0, index + 1),
      newSlide,
      ...module.slides.slice(index + 1)
    ]
    setModule({ ...module, slides: updatedSlides })
  }

  const renderPreview = () => {
    switch (currentSlide.type) {
      case 'markdown':
        return (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{
              __html: currentSlide.content
                .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-3">$1</h3>')
                .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*)\*/g, '<em>$1</em>')
                .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                .replace(/\n/g, '<br/>')
            }} />
          </div>
        )
      case 'code':
        return (
          <div className="relative">
            <div className="absolute top-2 right-2 px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">
              {currentSlide.codeLanguage || 'code'}
            </div>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono">
                {currentSlide.content}
              </code>
            </pre>
          </div>
        )
      default:
        return (
          <div className="text-white whitespace-pre-wrap leading-relaxed">
            {currentSlide.content}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Module Playground</h1>
          <input
            type="text"
            value={module.title}
            onChange={(e) => setModule({ ...module, title: e.target.value })}
            className="bg-gray-800 px-3 py-1 rounded text-sm"
            placeholder="Module Title"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isEditing ? <Edit3 size={16} /> : <Eye size={16} />}
            {isEditing ? 'Editing' : 'Preview Only'}
          </button>

          <button className="p-2 hover:bg-gray-800 rounded">
            <Save size={20} />
          </button>

          <button className="p-2 hover:bg-gray-800 rounded">
            <Download size={20} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="fixed top-16 left-0 right-0 bottom-0 flex"
      >
        {/* Left Panel - Editor */}
        <div
          style={{ width: `${splitPosition}%` }}
          className="flex flex-col bg-gray-950 border-r border-gray-800"
        >
          {/* Slide List */}
          <div className="h-32 bg-gray-900 border-b border-gray-800 overflow-x-auto">
            <div className="flex items-center h-full px-4 gap-3">
              {module.slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`relative group flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg p-3 cursor-pointer transition-all ${
                    index === currentSlideIndex ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">Slide {index + 1}</div>
                  <div className="text-sm font-medium truncate">{slide.title}</div>
                  <div className="text-xs text-gray-500">{slide.type}</div>

                  {isEditing && (
                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSlide(index)
                        }}
                        className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSlide(index)
                        }}
                        className="p-1 bg-red-600 rounded hover:bg-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isEditing && (
                <button
                  onClick={addNewSlide}
                  className="flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Plus size={24} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Slide Title</label>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={(e) => handleSlideUpdate('title', e.target.value)}
                    className="w-full bg-gray-800 px-4 py-2 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Content Type</label>
                  <select
                    value={currentSlide.type}
                    onChange={(e) => handleSlideUpdate('type', e.target.value as Slide['type'])}
                    className="w-full bg-gray-800 px-4 py-2 rounded-lg text-white"
                  >
                    <option value="text">Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="code">Code</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                {currentSlide.type === 'code' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Language</label>
                    <input
                      type="text"
                      value={currentSlide.codeLanguage || ''}
                      onChange={(e) => handleSlideUpdate('codeLanguage', e.target.value)}
                      placeholder="python, javascript, etc."
                      className="w-full bg-gray-800 px-4 py-2 rounded-lg text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Content</label>
                  <textarea
                    value={currentSlide.content}
                    onChange={(e) => handleSlideUpdate('content', e.target.value)}
                    className="w-full h-96 bg-gray-800 px-4 py-3 rounded-lg text-white font-mono text-sm resize-none"
                    placeholder={
                      currentSlide.type === 'markdown'
                        ? '# Heading\n\n## Subheading\n\nYour content here...'
                        : 'Enter your content...'
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Preview mode active</p>
                  <p className="text-sm mt-2">Click "Editing" to modify content</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors relative"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-8 bg-gray-600 rounded-full" />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div
          style={{ width: `${100 - splitPosition}%` }}
          className="flex flex-col bg-black"
        >
          {/* Navigation Bar */}
          <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm">
                {currentSlideIndex + 1} / {module.slides.length}
              </span>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(module.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === module.slides.length - 1}
                className="p-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {module.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-800 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-12 max-w-4xl mx-auto"
              >
                <h1 className="text-4xl font-bold mb-8">{currentSlide.title}</h1>
                {renderPreview()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-900">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / module.slides.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 p-8 rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Module Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={module.description}
                    onChange={(e) => setModule({ ...module, description: e.target.value })}
                    className="w-full bg-gray-800 px-4 py-2 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={module.tags.join(', ')}
                    onChange={(e) => setModule({
                      ...module,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    className="w-full bg-gray-800 px-4 py-2 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}