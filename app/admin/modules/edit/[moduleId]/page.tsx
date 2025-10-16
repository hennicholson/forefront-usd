'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ContentBlockEditor } from '@/components/admin/ContentBlock'
import { SlidePreview } from '@/components/admin/SlidePreview'
import { migrateLegacySlideToBlocks } from '@/lib/migrations/migrate-to-blocks'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'video' | 'note' | 'codePreview' | 'chart' | 'quiz'
  data: any
}

interface Slide {
  id: number
  title: string
  description?: string
  blocks: ContentBlock[]
}

interface Module {
  id: string
  moduleId: string
  title: string
  slug: string
  description: string
  duration: string
  skillLevel: string
  instructor: any
  introVideo: string
  learningObjectives: string[]
  slides: Slide[]
  keyTakeaways: string[]
}

// Sortable Slide Tab Component
function SortableSlideTab({ slide, index, isActive, onClick, onDuplicate, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })
  const [showContextMenu, setShowContextMenu] = React.useState(false)
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  React.useEffect(() => {
    const handleClick = () => setShowContextMenu(false)
    if (showContextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [showContextMenu])

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onContextMenu={handleContextMenu}
        onClick={onClick}
        className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium relative transition-all ${
          isActive
            ? 'bg-[#fff] text-[#000]'
            : 'bg-[#0a0a0a] text-[#666] hover:bg-[#1a1a1a] border border-[#333]'
        }`}
      >
        Slide {index + 1}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPos.x,
            top: contextMenuPos.y,
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden min-w-[180px]">
            <button
              onClick={() => {
                onDuplicate()
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2.5 text-left text-[#fff] hover:bg-[#333] flex items-center gap-3 text-sm font-medium transition-colors"
            >
              <span>📋</span>
              <span>Duplicate Slide</span>
            </button>
            <button
              onClick={() => {
                onDelete()
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2.5 text-left text-[#ef4444] hover:bg-[#333] flex items-center gap-3 text-sm font-medium transition-colors border-t border-[#333]"
            >
              <span>🗑️</span>
              <span>Delete Slide</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Sortable Block Component
function SortableBlock({ block, onChange, onDelete, onDuplicate }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    scale: isDragging ? '0.98' : '1',
    boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.25), 0 0 0 4px rgba(255, 255, 255, 0.3)' : 'none',
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drop indicator - shows where block will land */}
      {isOver && !isDragging && (
        <div style={{
          position: 'absolute',
          top: -8,
          left: 0,
          right: 0,
          height: 4,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
          animation: 'pulse 1.5s infinite',
          zIndex: 100
        }} />
      )}

      <div className="flex items-start gap-3 mb-6">
        <div
          {...attributes}
          {...listeners}
          className="mt-6 cursor-grab active:cursor-grabbing p-2.5 bg-[#1a1a1a] hover:bg-[#333] hover:shadow-md rounded-lg transition-all flex items-center justify-center w-10 h-10 group border-2 border-[#333] hover:border-[#666]"
          style={{
            touchAction: 'none'
          }}
        >
          <div className="flex flex-col gap-[3px]">
            <div className="w-4 h-[2px] bg-[#666] group-hover:bg-[#999] rounded-full transition-colors"></div>
            <div className="w-4 h-[2px] bg-[#666] group-hover:bg-[#999] rounded-full transition-colors"></div>
            <div className="w-4 h-[2px] bg-[#666] group-hover:bg-[#999] rounded-full transition-colors"></div>
          </div>
        </div>
        <div className="flex-1">
          <ContentBlockEditor
            block={block}
            onChange={onChange}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </div>
      </div>
    </div>
  )
}

export default function ModuleEditorPageNew() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string

  const [module, setModule] = useState<Module | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    })
  )

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    loadModule()
  }, [isAuthenticated, user, router, moduleId])

  const loadModule = async () => {
    try {
      const res = await fetch(`/api/modules?moduleId=${moduleId}`)
      if (!res.ok) throw new Error('Failed to load module')
      const data = await res.json()

      // Auto-migrate legacy content to blocks
      const migratedModule = {
        ...data[0],
        slides: data[0].slides.map((slide: any) => migrateLegacySlideToBlocks(slide))
      }

      setModule(migratedModule)
    } catch (err) {
      console.error('Error loading module:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save with debouncing
  useEffect(() => {
    if (!module || loading) return

    setAutoSaveStatus('saving')
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(module)
        })
        if (!res.ok) throw new Error('Auto-save failed')
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch (err) {
        console.error('Auto-save error:', err)
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
    }, 1500) // 1.5 second debounce

    return () => clearTimeout(timeoutId)
  }, [module, loading])

  const handleSave = async () => {
    if (!module) return
    setSaving(true)
    try {
      const res = await fetch('/api/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module)
      })
      if (!res.ok) throw new Error('Failed to save')
      alert('Module saved successfully!')
    } catch (err) {
      alert('Failed to save module')
    } finally {
      setSaving(false)
    }
  }

  const handleAddBlock = (type: ContentBlock['type']) => {
    if (!module) return
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      data: {}
    }
    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex].blocks = [...(updatedSlides[currentSlideIndex].blocks || []), newBlock]
    setModule({ ...module, slides: updatedSlides })
  }

  const handleUpdateBlock = (blockId: string, updatedBlock: ContentBlock) => {
    if (!module) return
    const updatedSlides = [...module.slides]
    const blocks = updatedSlides[currentSlideIndex].blocks
    const index = blocks.findIndex(b => b.id === blockId)
    if (index !== -1) {
      blocks[index] = updatedBlock
      setModule({ ...module, slides: updatedSlides })
    }
  }

  const handleDeleteBlock = (blockId: string) => {
    if (!module) return
    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex].blocks = updatedSlides[currentSlideIndex].blocks.filter(b => b.id !== blockId)
    setModule({ ...module, slides: updatedSlides })
  }

  const handleDuplicateBlock = (blockId: string) => {
    if (!module) return
    const updatedSlides = [...module.slides]
    const blocks = updatedSlides[currentSlideIndex].blocks
    const index = blocks.findIndex(b => b.id === blockId)
    if (index !== -1) {
      const newBlock = { ...blocks[index], id: `block-${Date.now()}` }
      blocks.splice(index + 1, 0, newBlock)
      setModule({ ...module, slides: updatedSlides })
    }
  }

  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !module) return

    const updatedSlides = [...module.slides]
    const blocks = updatedSlides[currentSlideIndex].blocks
    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)

    if (oldIndex !== newIndex) {
      updatedSlides[currentSlideIndex].blocks = arrayMove(blocks, oldIndex, newIndex)
      setModule({ ...module, slides: updatedSlides })
    }
  }

  const handleAddSlide = () => {
    if (!module) return
    const newSlide: Slide = {
      id: Date.now(),
      title: `New Slide ${module.slides.length + 1}`,
      description: '',
      blocks: []
    }
    setModule({ ...module, slides: [...module.slides, newSlide] })
    setCurrentSlideIndex(module.slides.length)
  }

  const handleDuplicateSlide = (index: number) => {
    if (!module) return
    const slideToDuplicate = module.slides[index]
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now(),
      title: `${slideToDuplicate.title} (Copy)`,
      blocks: slideToDuplicate.blocks.map(block => ({
        ...block,
        id: `block-${Date.now()}-${Math.random()}`
      }))
    }
    const updatedSlides = [...module.slides]
    updatedSlides.splice(index + 1, 0, duplicatedSlide)
    setModule({ ...module, slides: updatedSlides })
    setCurrentSlideIndex(index + 1)
  }

  const handleDeleteSlide = (index: number) => {
    if (!module || module.slides.length === 1) {
      alert('Cannot delete the last slide')
      return
    }
    if (!confirm('Are you sure you want to delete this slide?')) return

    const updatedSlides = module.slides.filter((_, i) => i !== index)
    setModule({ ...module, slides: updatedSlides })

    // Adjust current slide index if needed
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1)
    } else if (currentSlideIndex > index) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleSlideDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !module) return

    const oldIndex = module.slides.findIndex(s => s.id === active.id)
    const newIndex = module.slides.findIndex(s => s.id === over.id)

    if (oldIndex !== newIndex) {
      const reorderedSlides = arrayMove(module.slides, oldIndex, newIndex)
      setModule({ ...module, slides: reorderedSlides })

      // Update current slide index to follow the moved slide
      if (currentSlideIndex === oldIndex) {
        setCurrentSlideIndex(newIndex)
      } else if (currentSlideIndex > oldIndex && currentSlideIndex <= newIndex) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      } else if (currentSlideIndex < oldIndex && currentSlideIndex >= newIndex) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }
    }
  }

  if (!isAuthenticated || !user?.isAdmin) return null
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#000] text-[#fff]">Loading...</div>
  if (!module) return <div className="min-h-screen flex items-center justify-center bg-[#000] text-[#fff]">Module not found</div>

  const currentSlide = module.slides[currentSlideIndex]

  return (
    <main className="min-h-screen bg-[#000]">
      {/* Header */}
      <div className="bg-[#000] border-b border-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard" className="text-sm text-[#999] hover:text-[#fff] mb-2 block">
                ← Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#fff]">{module.title}</h1>
                {/* Auto-save status indicator */}
                {autoSaveStatus !== 'idle' && (
                  <div className="flex items-center gap-2 text-sm">
                    {autoSaveStatus === 'saving' && (
                      <>
                        <div className="w-2 h-2 bg-[#999] rounded-full animate-pulse"></div>
                        <span className="text-[#999] font-medium">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <div className="w-2 h-2 bg-[#fff] rounded-full"></div>
                        <span className="text-[#fff] font-medium">Saved</span>
                      </>
                    )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <div className="w-2 h-2 bg-[#666] rounded-full"></div>
                        <span className="text-[#666] font-medium">Error saving</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-4 py-2 rounded-lg font-medium ${showSettings ? 'bg-[#fff] text-[#000]' : 'bg-[#0a0a0a] border border-[#333] text-[#666]'}`}
              >
                {showSettings ? '✓ Settings' : 'Settings'}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg font-medium ${showPreview ? 'bg-[#fff] text-[#000]' : 'bg-[#0a0a0a] border border-[#333] text-[#666]'}`}
              >
                {showPreview ? '✓ Preview' : 'Show Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#fff] text-[#000] rounded-lg font-medium hover:bg-[#f0f0f0] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Module'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Tabs */}
      <div className="bg-[#000] border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSlideDragEnd}>
            <SortableContext items={module.slides.map(s => s.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 overflow-x-auto py-3">
                {module.slides.map((slide, index) => (
                  <SortableSlideTab
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isActive={currentSlideIndex === index}
                    onClick={() => setCurrentSlideIndex(index)}
                    onDuplicate={() => handleDuplicateSlide(index)}
                    onDelete={() => handleDeleteSlide(index)}
                  />
                ))}
                <button
                  onClick={handleAddSlide}
                  className="px-4 py-2 rounded-lg bg-[#fff] text-[#000] font-medium hover:bg-[#f0f0f0] whitespace-nowrap"
                >
                  + Add Slide
                </button>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Module Settings Modal */}
      {showSettings && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettings(false)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div style={{
            background: '#0a0a0a',
            width: '100%',
            maxWidth: '700px',
            borderRadius: '16px',
            border: '1px solid #1a1a1a',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: '#000',
              color: '#fff',
              padding: '32px',
              borderBottom: '1px solid #1a1a1a'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                textTransform: 'lowercase',
                marginBottom: '8px'
              }}>
                Module Settings
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666'
              }}>
                Edit instructor, duration, and skill level
              </p>
            </div>

            {/* Content */}
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{ marginBottom: '24px' }}>
                <label className="block text-sm font-semibold text-[#fff] mb-3">Instructor Name</label>
                <input
                  type="text"
                  value={module?.instructor?.name || ''}
                  onChange={(e) => {
                    if (module) {
                      setModule({
                        ...module,
                        instructor: { ...module.instructor, name: e.target.value }
                      })
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#000] border border-[#333] rounded-lg text-[#fff] focus:ring-2 focus:ring-[#fff] focus:border-[#fff] transition-all"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="block text-sm font-semibold text-[#fff] mb-3">Duration</label>
                <input
                  type="text"
                  value={module?.duration || ''}
                  onChange={(e) => {
                    if (module) {
                      setModule({ ...module, duration: e.target.value })
                    }
                  }}
                  placeholder="e.g., 2 hours"
                  className="w-full px-4 py-3 bg-[#000] border border-[#333] rounded-lg text-[#fff] focus:ring-2 focus:ring-[#fff] focus:border-[#fff] transition-all placeholder-[#666]"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="block text-sm font-semibold text-[#fff] mb-3">Skill Level</label>
                <select
                  value={module?.skillLevel || ''}
                  onChange={(e) => {
                    if (module) {
                      setModule({ ...module, skillLevel: e.target.value })
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#000] border border-[#333] rounded-lg text-[#fff] focus:ring-2 focus:ring-[#fff] focus:border-[#fff] transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #1a1a1a',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 bg-[#fff] text-[#000] rounded-lg font-medium hover:bg-[#f0f0f0]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor + Preview */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8 max-w-[1800px] mx-auto px-8 py-8`}>
        {/* Editor Panel */}
        <div className="bg-[#0a0a0a] rounded-xl shadow-sm border border-[#1a1a1a] p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#fff] mb-3">Slide Title</label>
            <input
              type="text"
              value={currentSlide.title}
              onChange={(e) => {
                const updated = [...module.slides]
                updated[currentSlideIndex].title = e.target.value
                setModule({ ...module, slides: updated })
              }}
              className="w-full px-4 py-3 bg-[#000] border border-[#333] rounded-lg text-[#fff] focus:ring-2 focus:ring-[#fff] focus:border-[#fff] transition-all text-base placeholder-[#666]"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#fff] mb-3">Description (optional)</label>
            <input
              type="text"
              value={currentSlide.description || ''}
              onChange={(e) => {
                const updated = [...module.slides]
                updated[currentSlideIndex].description = e.target.value
                setModule({ ...module, slides: updated })
              }}
              className="w-full px-4 py-3 bg-[#000] border border-[#333] rounded-lg text-[#fff] focus:ring-2 focus:ring-[#fff] focus:border-[#fff] transition-all placeholder-[#666]"
              placeholder="Brief description of this slide"
            />
          </div>

          <div className="border-t border-[#1a1a1a] pt-8 mt-8">
            <h3 className="font-bold text-[#fff] mb-6 text-lg">Content Blocks</h3>

            {/* Add Block Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <button onClick={() => handleAddBlock('text')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Text
              </button>
              <button onClick={() => handleAddBlock('code')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Code
              </button>
              <button onClick={() => handleAddBlock('image')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Image
              </button>
              <button onClick={() => handleAddBlock('video')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Video
              </button>
              <button onClick={() => handleAddBlock('note')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Note
              </button>
              <button onClick={() => handleAddBlock('quiz')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Quiz
              </button>
              <button onClick={() => handleAddBlock('codePreview')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Live Code
              </button>
              <button onClick={() => handleAddBlock('chart')} className="px-4 py-3 bg-[#fff] hover:bg-[#f0f0f0] text-[#000] rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Chart
              </button>
            </div>

            {/* Blocks List */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
              <SortableContext items={(currentSlide.blocks || []).map(b => b.id)} strategy={verticalListSortingStrategy}>
                {(currentSlide.blocks || []).map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onChange={(updated: ContentBlock) => handleUpdateBlock(block.id, updated)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onDuplicate={() => handleDuplicateBlock(block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {(!currentSlide.blocks || currentSlide.blocks.length === 0) && (
              <div className="text-center py-16 px-6 text-[#666] border-2 border-dashed border-[#333] rounded-xl bg-[#000]">
                <div className="text-lg font-medium mb-2">No content blocks yet</div>
                <div className="text-sm">Click a button above to add your first block</div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-black rounded-lg shadow-sm overflow-hidden">
            <SlidePreview slide={currentSlide} slideNumber={currentSlideIndex + 1} />
          </div>
        )}
      </div>
    </main>
  )
}
