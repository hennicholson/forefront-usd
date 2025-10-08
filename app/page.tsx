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
      <div className="section">
        <div className="content center-text">
          <div className="title-large">[forefront]</div>
          <div className="subtitle" style={{ marginBottom: '12px' }}>
            ai learning network
          </div>
          <div className="subtitle" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#666', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            pilot network at university of san diego → student-taught courses on practical ai
          </div>

          <a href="#modules" className="btn btn-primary">
            view all modules
          </a>
        </div>
      </div>

      {/* Module List */}
      <div className="section white" id="modules">
        <div className="content">
          <div className="section-label">available modules ({modules.length})</div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              No modules available yet. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px', marginTop: '40px' }}>
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
                  <div className="card" style={{ padding: '40px', cursor: 'pointer' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '32px', alignItems: 'center' }}>
                    {/* Module Number */}
                    <div style={{
                      fontSize: 'clamp(36px, 5vw, 52px)',
                      fontWeight: 700,
                      color: '#000',
                      width: '80px',
                      opacity: 0.4
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{
                        fontSize: 'clamp(22px, 4vw, 36px)',
                        fontWeight: 600,
                        marginBottom: '12px',
                        textTransform: 'lowercase',
                        letterSpacing: '-1px',
                        color: '#000'
                      }}>
                        {module.title}
                      </div>
                      <div style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: '#666',
                        marginBottom: '16px',
                        lineHeight: 1.6
                      }}>
                        {module.description}
                      </div>
                      <div style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        color: '#999',
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{module.instructor.name}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                        <span>•</span>
                        <span>{module.skillLevel}</span>
                      </div>
                    </div>

                      {/* Arrow */}
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#000',
                        opacity: 0.3,
                        transition: 'all 0.3s ease'
                      }}>
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
