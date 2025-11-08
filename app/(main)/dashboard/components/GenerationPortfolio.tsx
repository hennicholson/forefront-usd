'use client'
import { useEffect, useState } from 'react'
import { Star, Image as ImageIcon, FileText, Film, Bookmark, Search, Filter, X } from 'lucide-react'

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
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all')

  useEffect(() => {
    fetchGenerations()
    fetchFolders()
  }, [userId])

  const fetchFolders = async () => {
    try {
      const res = await fetch(`/api/folders?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      }
    } catch (err) {
      console.error('Error loading folders:', err)
    }
  }

  const fetchGenerations = async () => {
    try {
      const params = new URLSearchParams({
        userId,
        saved: 'true', // Only show saved generations in portfolio
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
      // Remove from UI immediately
      setGenerations(prev => prev.filter(g => g.id !== generationId))
    })
  }

  // Get unique models
  const models = Array.from(new Set(generations.map(g => g.model)))

  // Filter generations
  const filteredGenerations = generations.filter(gen => {
    if (filterType !== 'all' && gen.type !== filterType) return false
    if (filterModel !== 'all' && gen.model !== filterModel) return false
    if (minRating > 0 && (gen.rating || 0) < minRating) return false
    if (searchQuery && !gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedFolderFilter !== 'all' && !gen.tags.includes(selectedFolderFilter)) return false
    return true
  })

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        loading your portfolio...
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        background: '#000',
        borderRadius: '16px',
        border: '2px dashed #333'
      }}>
        <Bookmark size={48} style={{ color: '#666', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          no saved generations yet
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          save your favorite AI generations from the playground to build your portfolio
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
      {/* Header with Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000',
            marginBottom: '4px'
          }}>
            generation portfolio
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {filteredGenerations.length} saved generation{filteredGenerations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '12px 24px',
            background: showFilters ? '#000' : '#fff',
            color: showFilters ? '#fff' : '#000',
            border: '2px solid #000',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Filter size={16} />
          {showFilters ? 'hide filters' : 'show filters'}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          padding: '24px',
          background: '#000',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '2px solid #333'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                search prompts
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">all types</option>
                <option value="text">text</option>
                <option value="image">image</option>
                <option value="video">video</option>
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                model
              </label>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">all models</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666',
                  marginBottom: '8px',
                  fontWeight: 700
                }}>
                  folder
                </label>
                <select
                  value={selectedFolderFilter}
                  onChange={(e) => setSelectedFolderFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">all folders</option>
                  {folders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                minimum rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="0">any rating</option>
                <option value="1">1+ stars</option>
                <option value="2">2+ stars</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Generation Grid */}
      {filteredGenerations.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#000',
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <div style={{ fontSize: '16px', color: '#666' }}>
            no generations match your filters
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredGenerations.map((gen) => (
            <div
              key={gen.id}
              className="card-dark"
              style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '280px'
              }}
            >
              {/* Type Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '6px 12px',
                background: '#111',
                borderRadius: '6px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {getTypeIcon(gen.type)}
                {gen.type}
              </div>

              {/* Model */}
              <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '12px',
                fontWeight: 700
              }}>
                {gen.model}
              </div>

              {/* Prompt */}
              <div style={{
                fontSize: '14px',
                color: '#fff',
                marginBottom: '16px',
                lineHeight: 1.6,
                flex: 1
              }}>
                <strong style={{ color: '#999', display: 'block', marginBottom: '8px' }}>
                  prompt:
                </strong>
                {gen.prompt.length > 150 ? `${gen.prompt.substring(0, 150)}...` : gen.prompt}
              </div>

              {/* Response Preview */}
              {gen.response && gen.type === 'text' && (
                <div style={{
                  padding: '12px',
                  background: '#111',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '16px',
                  border: '1px solid #333',
                  maxHeight: '100px',
                  overflow: 'hidden'
                }}>
                  {gen.response.length > 100 ? `${gen.response.substring(0, 100)}...` : gen.response}
                </div>
              )}

              {/* Image/Video Display */}
              {(gen.type === 'image' || gen.type === 'video') && gen.response && (
                <div style={{
                  marginBottom: '16px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #333'
                }}>
                  {gen.type === 'image' ? (
                    <img
                      src={gen.response}
                      alt="Generated content"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  ) : (
                    <video
                      src={gen.response}
                      controls
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  )}
                </div>
              )}

              {/* Rating */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#666',
                  marginBottom: '8px',
                  fontWeight: 700
                }}>
                  rate this generation
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(gen.id, star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <Star
                        size={20}
                        fill={gen.rating && star <= gen.rating ? '#ffd700' : 'transparent'}
                        stroke={gen.rating && star <= gen.rating ? '#ffd700' : '#666'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #333'
              }}>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {new Date(gen.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => handleUnsave(gen.id)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ff0000'
                    e.currentTarget.style.color = '#000'
                    e.currentTarget.style.borderColor = '#ff0000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#666'
                    e.currentTarget.style.borderColor = '#333'
                  }}
                >
                  remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
