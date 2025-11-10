'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles, Loader2, ArrowLeft, Clock, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface SavedGeneration {
  id: number
  type: 'text' | 'image' | 'video'
  model: string
  prompt: string
  response: string | null
  rating: number | null
  saved: boolean
  tags: string[]
  notes: string | null
  createdAt: string
}

export default function CreateFromSavedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [generations, setGenerations] = useState<SavedGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'image' | 'video'>('all')
  const [buildingFrom, setBuildingFrom] = useState<number | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadSavedGenerations()
    }
  }, [user?.id, selectedType])

  const loadSavedGenerations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        userId: user!.id,
        saved: 'true',
        ...(selectedType !== 'all' && { type: selectedType })
      })

      const response = await fetch(`/api/generations/saved?${params}`)
      if (!response.ok) throw new Error('Failed to load saved generations')

      const data = await response.json()
      setGenerations(data.generations || [])
    } catch (error) {
      console.error('Error loading saved generations:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildWorkflowFromGeneration = async (generation: SavedGeneration) => {
    setBuildingFrom(generation.id)

    try {
      const response = await fetch('/api/workflows/from-saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId: generation.id,
          userId: user?.id
        })
      })

      if (!response.ok) throw new Error('Failed to build workflow')

      const data = await response.json()

      // Redirect to workflow editor with pre-populated data
      router.push(`/workflows/create?fromSaved=${generation.id}`)
    } catch (error) {
      console.error('Error building workflow:', error)
      alert('Failed to build workflow from saved generation')
    } finally {
      setBuildingFrom(null)
    }
  }

  const getModelEmoji = (model: string): string => {
    if (model.includes('gemini')) return '✨'
    if (model.includes('gpt') || model.includes('chatgpt')) return '💬'
    if (model.includes('claude')) return '🤖'
    if (model.includes('dall-e') || model.includes('midjourney')) return '🎨'
    if (model.includes('seedream') || model.includes('runway')) return '🎬'
    return '🔮'
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'image': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'video': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Workflows
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Build from Saved Prompts</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Turn your saved AI generations into shareable workflows that others can learn from
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'text', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${selectedType === type
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }
              `}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {/* Empty State */}
        {!loading && generations.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-400 mb-2">No saved generations yet</h3>
            <p className="text-zinc-600 mb-6">
              Create and save AI generations in the playground first
            </p>
            <button
              onClick={() => router.push('/learn')}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              Go to Playground
            </button>
          </div>
        )}

        {/* Generations Grid */}
        {!loading && generations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getModelEmoji(gen.model)}</span>
                    <div>
                      <div className="text-xs text-zinc-500 uppercase font-mono">{gen.model}</div>
                      {gen.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: gen.rating }).map((_, i) => (
                            <Star key={i} size={12} className="fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(gen.type)}`}>
                    {gen.type}
                  </span>
                </div>

                {/* Prompt */}
                <div className="mb-3">
                  <p className="text-sm text-zinc-300 line-clamp-3">
                    {gen.prompt}
                  </p>
                </div>

                {/* Tags */}
                {gen.tags && gen.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {gen.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={12} />
                    <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => buildWorkflowFromGeneration(gen)}
                    disabled={buildingFrom === gen.id}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold
                      transition-all flex items-center gap-1.5
                      ${buildingFrom === gen.id
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 active:scale-95'
                      }
                    `}
                  >
                    {buildingFrom === gen.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Build Workflow
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
