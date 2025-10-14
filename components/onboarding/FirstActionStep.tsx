'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FirstActionStepProps {
  onComplete: () => void
}

export function FirstActionStep({ onComplete }: FirstActionStepProps) {
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data.slice(0, 3)) // Show first 3 modules
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSelect = (slug: string) => {
    onComplete()
    router.push(`/modules/${slug}`)
  }

  const handleExploreNetwork = () => {
    onComplete()
    router.push('/network')
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        marginBottom: '48px'
      }}>
        <div style={{
          marginBottom: '24px',
          color: '#000',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 800,
          textTransform: 'lowercase',
          letterSpacing: '-1px',
          marginBottom: '16px',
          color: '#000'
        }}>
          you're all set!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: 1.6,
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          choose your first action to get started
        </p>
      </div>

      {/* Action Cards */}
      <div style={{
        display: 'grid',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Start Learning */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#fff',
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}>
          <div style={{
            marginBottom: '16px',
            color: '#fff'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            textTransform: 'lowercase',
            marginBottom: '8px'
          }}>
            start learning
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#999',
            marginBottom: '24px',
            lineHeight: 1.5
          }}>
            jump into a module and start building your ai skills
          </p>

          {loading ? (
            <div style={{ color: '#666', fontSize: '14px' }}>loading modules...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.slug)}
                  style={{
                    padding: '14px 20px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'lowercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  {module.title} →
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Explore Network */}
        <button
          onClick={handleExploreNetwork}
          style={{
            background: 'rgba(250, 250, 250, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#000',
            padding: '32px',
            borderRadius: '16px',
            border: '3px solid rgba(224, 224, 224, 0.5)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.8)'
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(224, 224, 224, 0.5)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <div style={{
            marginBottom: '16px',
            color: '#000'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            textTransform: 'lowercase',
            marginBottom: '8px'
          }}>
            explore the network
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.5
          }}>
            discover other learners and join the community →
          </p>
        </button>
      </div>

      <div style={{
        padding: '20px',
        background: 'rgba(245, 245, 245, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(224, 224, 224, 0.5)',
        borderRadius: '12px',
        fontSize: '13px',
        color: '#666',
        lineHeight: 1.6,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div><strong style={{ color: '#000' }}>Pro tip:</strong> You can always access your profile, modules, and network from the navigation menu</div>
      </div>
    </div>
  )
}
