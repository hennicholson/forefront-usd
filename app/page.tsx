'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingModuleSlug, setPendingModuleSlug] = useState<string | null>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <div className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="content center-text" style={{ maxWidth: '900px' }}>
          <div className="title-large" style={{ marginBottom: '32px' }}>[forefront]</div>
          <div className="subtitle" style={{
            marginBottom: '20px',
            fontSize: 'clamp(20px, 3.5vw, 28px)',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            textTransform: 'lowercase'
          }}>
            students teaching students
          </div>
          <div style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            color: '#666',
            maxWidth: '550px',
            margin: '0 auto 48px auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            practical ai courses from university of san diego
          </div>

          <a href="#modules" className="btn btn-primary" style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            padding: '16px 40px'
          }}>
            explore modules →
          </a>
        </div>
      </div>

      {/* Module List */}
      <div className="section white" id="modules" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
        <div className="content">
          <div className="section-label" style={{ marginBottom: '48px' }}>
            available modules ({modules.length})
          </div>

          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#666', fontSize: '18px' }}>
              Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#666', fontSize: '18px' }}>
              No modules available yet. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {modules.map((module, index) => {
              const handleClick = (e: React.MouseEvent) => {
                if (!isAuthenticated) {
                  e.preventDefault()
                  setPendingModuleSlug(module.slug)
                  setShowLoginModal(true)
                }
              }

              return (
                <Link key={module.id} href={`/modules/${module.slug}`} onClick={handleClick}>
                  <div
                    className="card"
                    style={{
                      padding: 'clamp(24px, 5vw, 48px)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
                      const arrow = e.currentTarget.querySelector('.module-arrow') as HTMLElement
                      if (arrow) {
                        arrow.style.opacity = '1'
                        arrow.style.transform = 'translateX(8px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                      const arrow = e.currentTarget.querySelector('.module-arrow') as HTMLElement
                      if (arrow) {
                        arrow.style.opacity = '0.3'
                        arrow.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 'clamp(20px, 4vw, 40px)',
                      alignItems: 'center'
                    }}>
                    {/* Module Number */}
                    <div style={{
                      fontSize: 'clamp(32px, 5vw, 56px)',
                      fontWeight: 800,
                      color: '#000',
                      width: 'clamp(60px, 8vw, 90px)',
                      opacity: 0.15,
                      lineHeight: 1
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{
                        fontSize: 'clamp(20px, 4vw, 32px)',
                        fontWeight: 700,
                        marginBottom: '12px',
                        textTransform: 'lowercase',
                        letterSpacing: '-0.5px',
                        color: '#000',
                        lineHeight: 1.2
                      }}>
                        {module.title}
                      </div>
                      <div style={{
                        fontSize: 'clamp(14px, 2vw, 17px)',
                        color: '#555',
                        marginBottom: '16px',
                        lineHeight: 1.6
                      }}>
                        {module.description}
                      </div>
                      <div style={{
                        fontSize: 'clamp(11px, 1.5vw, 13px)',
                        color: '#999',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600
                      }}>
                        <span>{module.instructor.name}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                        <span>•</span>
                        <span>{module.skillLevel}</span>
                      </div>
                    </div>

                      {/* Arrow */}
                      <div
                        className="module-arrow"
                        style={{
                          fontSize: '32px',
                          fontWeight: 700,
                          color: '#000',
                          opacity: 0.3,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false)
          setPendingModuleSlug(null)
        }}
        onSuccess={() => {
          if (pendingModuleSlug) {
            router.push(`/modules/${pendingModuleSlug}`)
          }
        }}
      />
    </main>
  )
}
