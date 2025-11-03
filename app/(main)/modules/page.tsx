'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function ModulesPage() {
  const { isAuthenticated } = useAuth()
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [pendingModuleSlug, setPendingModuleSlug] = useState<string | null>(null)

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

  const handleModuleClick = (e: React.MouseEvent, slug: string) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setPendingModuleSlug(slug)
      setShowLoginModal(true)
    }
  }

  return (
    <main className="bg-black text-white min-h-screen" style={{ paddingTop: '80px' }}>
      <style jsx>{`
        @media (max-width: 1100px) {
          .module-card {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            margin: 64px 0 !important;
          }
          .module-text-content {
            width: 100% !important;
          }
        }

        @media (max-width: 720px) {
          .module-card {
            margin: 64px 0 !important;
            padding: 88px 36px 36px !important;
            flex-direction: column !important;
            border-radius: 24px !important;
          }
          .module-text-content h3 {
            max-width: calc(100% - 150px) !important;
            font-size: clamp(18px, 4vw, 22px) !important;
          }
          .module-text-content p,
          .module-text-content > div:last-child {
            font-size: 0.8em !important;
          }
          .module-visual {
            width: 150px !important;
            height: 150px !important;
            right: 16px !important;
            left: auto !important;
            top: 16px !important;
          }
          .module-visual > div {
            font-size: 48px !important;
          }
        }
      `}</style>
      {/* Hero Section */}
      <div className="section" style={{ minHeight: '60vh' }}>
        <div className="content">
          <div className="section-label" style={{ color: '#666' }}>
            Learning Modules
          </div>

          <h1 className="title-large" style={{ marginBottom: '32px' }}>
            ai-powered<br />learning modules
          </h1>

          <p className="subtitle" style={{ maxWidth: '700px', marginBottom: '48px' }}>
            Dive into curated learning modules designed specifically for University of San Diego students.
            Each module is AI-generated, interactive, and built to help you master complex topics through
            bite-sized lessons and real-world applications.
          </p>

          <div style={{
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2L10 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6L8 2Z" fill="#666"/>
              </svg>
              AI-Generated
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="#666" strokeWidth="2" fill="none"/>
                <circle cx="8" cy="8" r="2" fill="#666"/>
              </svg>
              Interactive
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="10" width="3" height="4" fill="#666"/>
                <rect x="6.5" y="6" width="3" height="8" fill="#666"/>
                <rect x="11" y="2" width="3" height="12" fill="#666"/>
              </svg>
              Progress Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#111',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 'clamp(24px, 4vw, 32px) 40px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px',
              letterSpacing: '-2px'
            }}>
              {modules.length}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 600
            }}>
              Total Modules
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px',
              letterSpacing: '-2px'
            }}>
              100%
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 600
            }}>
              AI-Powered
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '8px',
              letterSpacing: '-2px'
            }}>
              Free
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 600
            }}>
              For USD Students
            </div>
          </div>
        </div>
      </div>

      {/* All Modules - Alternating Card Layout */}
      <div style={{
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 96px)',
        background: '#fff'
      }}>
        <div style={{
          maxWidth: 'calc(min(60vw, 920px) + 248px)',
          margin: '0 auto',
          width: '100%'
        }}>
          <h2 className="title-medium" style={{
            margin: '0 0 64px 0',
            color: '#000',
            textAlign: 'center'
          }}>
            all modules ({modules.length})
          </h2>

          {loading ? (
            <div style={{
              padding: '120px 40px',
              textAlign: 'center',
              color: '#666',
              fontSize: '18px'
            }}>
              Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <div style={{
              padding: '120px 40px',
              textAlign: 'center',
              color: '#666',
              fontSize: '18px'
            }}>
              No modules available yet. Check back soon!
            </div>
          ) : (
            <>
              {modules.map((module, index) => {
                const isOdd = index % 2 === 1
                return (
                  <Link
                    key={module.id}
                    href={`/modules/${module.slug}`}
                    onClick={(e) => handleModuleClick(e, module.slug)}
                    style={{ textDecoration: 'none' }}
                  >
                    <section
                      className="module-card"
                      data-odd={isOdd}
                      style={{
                        background: '#fafafa',
                        borderRadius: isOdd ? '24px 24px 48px 24px' : '24px 24px 24px 48px',
                        padding: isOdd ? '48px 308px 48px 60px' : '48px 48px 48px 308px',
                        margin: isOdd ? '84px 0 84px 248px' : '84px 0',
                        width: 'min(60vw, 920px)',
                        maxWidth: '920px',
                        minWidth: '640px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignSelf: 'flex-start',
                        position: 'relative',
                        boxShadow: '5px 0 0 0 rgba(204, 204, 204, 0.3), -5px 0 0 0 rgba(204, 204, 204, 0.3), 0 5px 0 0 rgba(204, 204, 204, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        border: '2px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.boxShadow = '8px 0 0 0 rgba(0, 0, 0, 0.1), -8px 0 0 0 rgba(0, 0, 0, 0.1), 0 12px 24px 0 rgba(0, 0, 0, 0.15)'
                        e.currentTarget.style.borderColor = '#000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '5px 0 0 0 rgba(204, 204, 204, 0.3), -5px 0 0 0 rgba(204, 204, 204, 0.3), 0 5px 0 0 rgba(204, 204, 204, 0.3)'
                        e.currentTarget.style.borderColor = '#e0e0e0'
                      }}
                    >
                      {/* Text Content */}
                      <div className="module-text-content" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: 'calc(60vw - 192px)'
                      }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: 'clamp(20px, 3vw, 28px)',
                          fontWeight: 700,
                          textTransform: 'lowercase',
                          letterSpacing: '-0.5px',
                          color: '#000',
                          maxWidth: '20ch'
                        }}>
                          {module.title}
                        </h3>
                        <p style={{
                          margin: '16px 0 24px',
                          fontSize: 'clamp(14px, 2.5vw, 16px)',
                          lineHeight: 1.7,
                          color: '#555',
                          maxWidth: '36ch'
                        }}>
                          {module.description}
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          flexWrap: 'wrap',
                          fontSize: '12px',
                          color: '#999',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600,
                          marginBottom: '24px'
                        }}>
                          <span>{module.instructor?.name || 'Forefront AI'}</span>
                          <span>•</span>
                          <span>{module.slides?.length || 0} slides</span>
                          <span>•</span>
                          <span>~{Math.ceil((module.slides?.length || 0) * 2)} min</span>
                        </div>
                        <div
                          style={{
                            border: '3px solid #000',
                            color: '#000',
                            alignSelf: 'flex-start',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            transition: '400ms all',
                            fontWeight: 700,
                            fontSize: '14px',
                            textTransform: 'lowercase'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#000'
                            e.currentTarget.style.color = '#fff'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#000'
                          }}
                        >
                          start learning →
                        </div>
                      </div>

                      {/* Visual - Module Number Badge */}
                      <div className="module-visual" style={{
                        width: '240px',
                        height: '240px',
                        position: 'absolute',
                        top: '-24px',
                        left: isOdd ? 'auto' : '24px',
                        right: isOdd ? '24px' : 'auto',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        boxShadow: '1px 2px 6px rgba(255, 255, 255, 0.25), 2px 6px 12px rgba(0, 0, 0, 0.25)',
                        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #fff'
                      }}>
                        <div style={{
                          fontSize: '96px',
                          fontWeight: 900,
                          color: '#fff',
                          lineHeight: 1,
                          opacity: 0.9
                        }}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </section>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false)
            setPendingModuleSlug(null)
          }}
          onSuccess={() => {
            setShowLoginModal(false)
            if (pendingModuleSlug) {
              window.location.href = `/modules/${pendingModuleSlug}`
            }
          }}
          onSignupClick={() => {
            setShowLoginModal(false)
            setShowOnboarding(true)
          }}
        />
      )}

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setShowOnboarding(false)
            if (pendingModuleSlug) {
              window.location.href = `/modules/${pendingModuleSlug}`
            }
          }}
        />
      )}
    </main>
  )
}
