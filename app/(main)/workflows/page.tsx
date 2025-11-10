'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, ArrowRight, Heart, Eye, BookOpen, GraduationCap, Zap, Video, Code, TrendingUp, Palette, PenTool, User, BarChart } from 'lucide-react'
import { ParticleAnimation } from '@/components/ui/particle-animation'

export default function WorkflowsPage() {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin = user?.isAdmin === true

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows')
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data)
      }
    } catch (error) {
      console.error('Error loading workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'video', name: 'Video', icon: Video, count: workflows.filter(w => w.category === 'video').length },
    { id: 'coding', name: 'Coding', icon: Code, count: workflows.filter(w => w.category === 'coding').length },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: workflows.filter(w => w.category === 'marketing').length },
    { id: 'design', name: 'Design', icon: Palette, count: workflows.filter(w => w.category === 'design').length },
    { id: 'content', name: 'Content', icon: PenTool, count: workflows.filter(w => w.category === 'content').length },
    { id: 'automation', name: 'Automation', icon: Zap, count: workflows.filter(w => w.category === 'automation').length },
  ]

  const filteredWorkflows = workflows.filter(w => {
    const matchesCategory = !selectedCategory || w.category === selectedCategory
    const matchesSearch = !searchQuery ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Mock nodes for visualization - these would come from the database
  const mockWorkflows = [
    {
      id: 1,
      title: 'AI Video Production Pipeline',
      description: 'Complete workflow for generating professional AI videos from text to final export',
      category: 'video',
      author: { name: 'Sarah Chen', image: null },
      likes: 142,
      views: 1240,
      steps: 7,
      difficulty: 'intermediate',
      tools: ['ChatGPT', 'Midjourney', 'Runway', 'CapCut'],
      nodes: [
        { id: 'n1', type: 'prompt', icon: '💬', label: 'Video Concept', x: 50, y: 20 },
        { id: 'n2', type: 'tool', icon: '🔧', label: 'ChatGPT', x: 50, y: 70 },
        { id: 'n3', type: 'prompt', icon: '💬', label: 'Image Prompt', x: 50, y: 120 },
        { id: 'n4', type: 'tool', icon: '🔧', label: 'Midjourney', x: 50, y: 170 },
        { id: 'n5', type: 'tool', icon: '🔧', label: 'Runway', x: 50, y: 220 },
        { id: 'n6', type: 'action', icon: '⚡', label: 'Download', x: 50, y: 270 },
        { id: 'n7', type: 'tool', icon: '🔧', label: 'CapCut', x: 50, y: 320 }
      ]
    },
    {
      id: 2,
      title: 'Full-Stack App with Claude',
      description: 'Build and deploy a complete web application using AI-assisted coding',
      category: 'coding',
      author: { name: 'Alex Rivera', image: null },
      likes: 89,
      views: 672,
      steps: 6,
      difficulty: 'advanced',
      tools: ['Claude', 'Cursor', 'GitHub', 'Vercel'],
      nodes: [
        { id: 'n1', type: 'prompt', icon: '💬', label: 'App Spec', x: 50, y: 20 },
        { id: 'n2', type: 'tool', icon: '🔧', label: 'Claude', x: 50, y: 80 },
        { id: 'n3', type: 'tool', icon: '🔧', label: 'Cursor', x: 50, y: 140 },
        { id: 'n4', type: 'action', icon: '⚡', label: 'Commit', x: 50, y: 200 },
        { id: 'n5', type: 'tool', icon: '🔧', label: 'GitHub', x: 20, y: 260 },
        { id: 'n6', type: 'tool', icon: '🔧', label: 'Vercel', x: 80, y: 260 }
      ]
    },
    {
      id: 3,
      title: 'Social Media Content Calendar',
      description: 'Generate 30 days of engaging social content with AI in under an hour',
      category: 'marketing',
      author: { name: 'Jamie Lee', image: null },
      likes: 203,
      views: 1890,
      steps: 5,
      difficulty: 'beginner',
      tools: ['ChatGPT', 'Canva', 'Buffer'],
      nodes: [
        { id: 'n1', type: 'prompt', icon: '💬', label: 'Content Brief', x: 50, y: 20 },
        { id: 'n2', type: 'tool', icon: '🔧', label: 'ChatGPT', x: 50, y: 90 },
        { id: 'n3', type: 'tool', icon: '🔧', label: 'Canva', x: 50, y: 160 },
        { id: 'n4', type: 'action', icon: '⚡', label: 'Review', x: 50, y: 230 },
        { id: 'n5', type: 'tool', icon: '🔧', label: 'Buffer', x: 50, y: 300 }
      ]
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingTop: '80px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 40px 60px'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 700,
            marginBottom: '16px',
            letterSpacing: '-2px'
          }}>
            AI Workflows
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: '#999',
            maxWidth: '700px',
            lineHeight: 1.6
          }}>
            Visual, step-by-step guides for AI processes. Learn exactly how to use AI tools together to create professional results.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '50px',
          flexWrap: 'wrap'
        }}>
          <Link href="/workflows/create" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            background: '#fff',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '15px',
            transition: 'transform 0.2s',
          }}>
            Create Workflow
          </Link>
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '14px 20px',
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              minWidth: '300px',
              outline: 'none'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '50px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '10px 20px',
              background: selectedCategory === null ? '#fff' : '#0a0a0a',
              color: selectedCategory === null ? '#000' : '#fff',
              border: '1px solid ' + (selectedCategory === null ? '#fff' : '#1a1a1a'),
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All
          </button>
          {categories.map(cat => {
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 20px',
                  background: selectedCategory === cat.id ? '#fff' : '#0a0a0a',
                  color: selectedCategory === cat.id ? '#000' : '#fff',
                  border: '1px solid ' + (selectedCategory === cat.id ? '#fff' : '#1a1a1a'),
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <IconComponent size={16} />
                <span>{cat.name}</span>
                <span style={{ opacity: 0.5, fontSize: '12px' }}>({cat.count})</span>
              </button>
            )
          })}
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '14px'
          }}>
            Loading workflows...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {filteredWorkflows.map((workflow, index) => (
            <Link
              key={workflow.id}
              href={`/workflows/${workflow.id}`}
              className="group relative block"
            >
              {/* White Corner Squares */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <Card className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-600">
                <CardHeader className="space-y-4">
                  {/* Icon and Category */}
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-900/50">
                      <GraduationCap className="h-6 w-6 text-zinc-400" />
                    </div>
                    <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-800 flex items-center gap-1.5">
                      {(() => {
                        const CategoryIcon = categories.find(c => c.id === workflow.category)?.icon
                        return CategoryIcon ? <CategoryIcon size={12} /> : null
                      })()}
                      {workflow.category}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    {workflow.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {workflow.description}
                  </p>

                  {/* Particle Animation */}
                  <ParticleAnimation />

                  {/* Meta Info */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      <span>{workflow.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{workflow.likes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{workflow.steps} steps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <BarChart className="h-3.5 w-3.5 text-zinc-500" />
                      <span className={
                        workflow.difficulty === 'beginner' ? 'text-green-400' :
                        workflow.difficulty === 'intermediate' ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        {workflow.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors pt-2">
                    <Play className="h-4 w-4" />
                    <span>View Workflow</span>
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
              </Card>
            </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWorkflows.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <p style={{ fontSize: '18px' }}>No workflows found</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
