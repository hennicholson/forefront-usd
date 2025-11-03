'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

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
    { id: 'video', name: 'Video', icon: '🎬', count: workflows.filter(w => w.category === 'video').length },
    { id: 'coding', name: 'Coding', icon: '💻', count: workflows.filter(w => w.category === 'coding').length },
    { id: 'marketing', name: 'Marketing', icon: '📱', count: workflows.filter(w => w.category === 'marketing').length },
    { id: 'design', name: 'Design', icon: '🎨', count: workflows.filter(w => w.category === 'design').length },
    { id: 'content', name: 'Content', icon: '✍️', count: workflows.filter(w => w.category === 'content').length },
    { id: 'automation', name: 'Automation', icon: '⚡', count: workflows.filter(w => w.category === 'automation').length },
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
          {isAdmin && (
            <Link href="/admin/workflows/new/edit" style={{
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
              <span>✨</span> Create Workflow
            </Link>
          )}
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
          {categories.map(cat => (
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
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span style={{ opacity: 0.5, fontSize: '12px' }}>({cat.count})</span>
            </button>
          ))}
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
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/workflows/${workflow.id}`}
                style={{
                  display: 'block',
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fff'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a1a1a'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#fff',
                    color: '#000',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px'
                  }}>
                    {categories.find(c => c.id === workflow.category)?.icon} {workflow.category}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    lineHeight: 1.3
                  }}>
                    {workflow.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#999',
                    lineHeight: 1.6
                  }}>
                    {workflow.description}
                  </p>
                </div>

                {/* Workflow Visualization */}
                <div style={{
                  position: 'relative',
                  height: '360px',
                  background: '#000',
                  border: '1px solid #1a1a1a',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  padding: '20px',
                  overflow: 'hidden'
                }}>
                  <svg style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}>
                    {/* Draw connections */}
                    {workflow.nodes.slice(0, -1).map((node: any, i: number) => {
                      const nextNode = workflow.nodes[i + 1]
                      const fromX = node.x
                      const fromY = node.y + 20
                      const toX = nextNode.x
                      const toY = nextNode.y

                      return (
                        <g key={`conn-${i}`}>
                          <line
                            x1={`${fromX}%`}
                            y1={`${fromY}%`}
                            x2={`${toX}%`}
                            y2={`${toY}%`}
                            stroke="#333"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          {/* Arrow */}
                          <circle
                            cx={`${toX}%`}
                            cy={`${toY - 2}%`}
                            r="3"
                            fill="#666"
                          />
                        </g>
                      )
                    })}
                  </svg>

                  {/* Draw nodes */}
                  {workflow.nodes.map((node: any, i: number) => (
                    <div
                      key={node.id}
                      style={{
                        position: 'absolute',
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 10
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#0a0a0a',
                        border: '2px solid #333',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        transition: 'all 0.2s'
                      }}>
                        {node.icon}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#999',
                        textAlign: 'center',
                        maxWidth: '80px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {node.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #1a1a1a'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>❤️ {workflow.likes}</span>
                    <span>👁️ {workflow.views}</span>
                    <span>📋 {workflow.steps} steps</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {workflow.difficulty}
                  </span>
                </div>
              </Link>
            </motion.div>
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
