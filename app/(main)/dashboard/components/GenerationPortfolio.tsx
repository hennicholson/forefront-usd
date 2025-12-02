'use client'
import { useEffect, useState } from 'react'
import { Star, Image as ImageIcon, FileText, Film, Bookmark, Search, Filter, Copy, Check, Sparkles, Calendar, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Generation {
  id: number
  userId: string
  moduleId: string | null
  slideId: string | null
  type: 'text' | 'image' | 'video'
  model: string
  prompt: string
  response: string | null
  metadata: any
  rating: number | null
  saved: boolean
  tags: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

export function GenerationPortfolio({ userId }: { userId: string }) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video'>('all')
  const [filterModel, setFilterModel] = useState<string>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    fetchGenerations()
  }, [userId])

  const fetchGenerations = async () => {
    try {
      const params = new URLSearchParams({
        userId,
        saved: 'true',
        limit: '100'
      })

      const res = await fetch(`/api/generation-history?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGenerations(data.history)
      }
    } catch (err) {
      console.error('Error loading generation portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateGeneration = async (generationId: number, updates: Partial<Generation>) => {
    try {
      const res = await fetch('/api/generation-history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          userId,
          ...updates
        })
      })

      if (res.ok) {
        const { generation } = await res.json()
        setGenerations(prev =>
          prev.map(g => g.id === generationId ? generation : g)
        )
      }
    } catch (err) {
      console.error('Error updating generation:', err)
    }
  }

  const handleRating = (generationId: number, rating: number) => {
    updateGeneration(generationId, { rating })
  }

  const handleUnsave = (generationId: number) => {
    updateGeneration(generationId, { saved: false }).then(() => {
      setGenerations(prev => prev.filter(g => g.id !== generationId))
    })
  }

  const handleCopyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Extract image URL from response content (handles both new and old format)
  const getImageUrl = (gen: Generation): string => {
    if (!gen.response) return ''

    // If response is already a clean URL, return it
    if (gen.response.startsWith('http') || gen.response.startsWith('/generations/')) {
      return gen.response
    }

    // Otherwise, try to extract URL from text (for old saved generations)
    const lines = gen.response.split('\n').filter(l => l.trim())
    const imageLine = lines.find(l => {
      const trimmed = l.trim()
      const cleaned = trimmed.replace(/^\*\s*/, '').replace(/^Image file path:\s*/i, '').trim()
      return cleaned.startsWith('http') || cleaned.startsWith('/generations/')
    })

    if (imageLine) {
      return imageLine.trim()
        .replace(/^\*\s*/, '')
        .replace(/^Image file path:\s*/i, '')
        .trim()
    }

    return gen.response
  }

  const models = Array.from(new Set(generations.map(g => g.model)))

  const filteredGenerations = generations.filter(gen => {
    if (filterType !== 'all' && gen.type !== filterType) return false
    if (filterModel !== 'all' && gen.model !== filterModel) return false
    if (minRating > 0 && (gen.rating || 0) < minRating) return false
    if (searchQuery && !gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <Bookmark size={48} className="text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No saved generations yet</h3>
          <p className="text-zinc-500">
            Save your favorite AI generations from the playground to build your portfolio
          </p>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText size={16} />
      case 'image': return <ImageIcon size={16} />
      case 'video': return <Film size={16} />
      default: return <FileText size={16} />
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Generation Portfolio</h1>
        </div>
        <p className="text-zinc-500 text-lg">
          {filteredGenerations.length} saved generation{filteredGenerations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-6 bg-zinc-950/50 border border-zinc-800 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Search Prompts
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm cursor-pointer focus:outline-none focus:border-zinc-600"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Model
                </label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm cursor-pointer focus:outline-none focus:border-zinc-600"
                >
                  <option value="all">All Models</option>
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm cursor-pointer focus:outline-none focus:border-zinc-600"
                >
                  <option value="0">Any Rating</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Generation Grid */}
      {filteredGenerations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No generations match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((gen) => (
            <motion.div
              key={gen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              {/* Corner Squares */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <div className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border border-zinc-800 backdrop-blur-sm rounded-lg p-6 transition-all duration-300 group-hover:border-zinc-600 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg">
                    {getTypeIcon(gen.type)}
                    <span className="text-xs font-semibold uppercase tracking-wider">{gen.type}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(gen.id, star)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          size={16}
                          fill={gen.rating && star <= gen.rating ? '#ffd700' : 'transparent'}
                          stroke={gen.rating && star <= gen.rating ? '#ffd700' : '#3f3f46'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model */}
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  {gen.model}
                </div>

                {/* Prompt */}
                <div className="mb-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Prompt</span>
                    <button
                      onClick={() => handleCopyPrompt(gen.prompt, gen.id)}
                      className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    >
                      {copiedId === gen.id ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-zinc-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">
                    {gen.prompt}
                  </p>
                </div>

                {/* Media Preview */}
                {gen.type === 'image' && gen.response && (() => {
                  const imageUrl = getImageUrl(gen)
                  return (
                    <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 relative group/media">
                      <img
                        src={imageUrl}
                        alt="Generated content"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          console.error('[Portfolio] Image load error:', imageUrl)
                          // Hide broken images
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {/* Download button overlay */}
                      <a
                        href={imageUrl}
                        download={`generation-${gen.id}.jpg`}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                    </div>
                  )
                })()}

                {gen.type === 'video' && gen.response && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 relative group/media">
                    <video
                      src={gen.response}
                      controls
                      className="w-full h-48 object-cover"
                    />
                    {/* Download button overlay */}
                    <a
                      href={gen.response}
                      download={`generation-${gen.id}.mp4`}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                )}

                {gen.type === 'text' && gen.response && (
                  <div className="mb-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-400 line-clamp-3 font-mono">
                      {gen.response}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar size={14} />
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleUnsave(gen.id)}
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-zinc-800 hover:border-red-400/20 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
