'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Module {
  id: number
  title: string
  description: string
  slug: string
  duration: string
  skillLevel: string
  instructor: {
    name: string
  }
}

interface FeaturedModulesProps {
  isAuthenticated: boolean
  onModuleClick?: (slug: string) => void
}

export function FeaturedModules({ isAuthenticated, onModuleClick }: FeaturedModulesProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        // Show only first 3 modules
        setModules(data.slice(0, 3))
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="section white" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="content">
          <div style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
            Loading featured modules...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section white" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <div className="content">
        <div className="section-label" style={{ textAlign: 'center', marginBottom: '32px' }}>
          Start Learning Today
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {modules.map((module, index) => {
            const handleClick = (e: React.MouseEvent) => {
              if (!isAuthenticated) {
                e.preventDefault()
                onModuleClick?.(module.slug)
              }
            }

            return (
              <Link key={module.id} href={`/modules/${module.slug}`} onClick={handleClick}>
                <div
                  className="card"
                  style={{
                    padding: '32px',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.borderColor = '#000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#f0f0f0'
                  }}
                >
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    color: '#000',
                    opacity: 0.1,
                    lineHeight: 1,
                    marginBottom: '16px'
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <h3 style={{
                    fontSize: 'clamp(18px, 2.5vw, 22px)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.5px',
                    marginBottom: '12px',
                    color: '#000'
                  }}>
                    {module.title}
                  </h3>

                  <p style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#666',
                    marginBottom: '24px',
                    flex: 1
                  }}>
                    {module.description}
                  </p>

                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <span>{module.instructor.name}</span>
                    <span>•</span>
                    <span>{module.duration}</span>
                    <span>•</span>
                    <span>{module.skillLevel}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/modules" className="btn btn-primary">
            view all modules →
          </a>
        </div>
      </div>
    </div>
  )
}
