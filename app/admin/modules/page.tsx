'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminModulesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)
    loadModules()
  }, [isAuthenticated, user, router])

  const loadModules = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/modules')
      if (!res.ok) throw new Error('Failed to fetch modules')
      const data = await res.json()
      setModules(data)
    } catch (err) {
      console.error('Error loading modules:', err)
      setError('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const handleAddModule = async () => {
    setError('')
    setSuccess('')

    try {
      const newModule = JSON.parse(jsonInput)

      // Validate required fields
      if (!newModule.title || !newModule.slug || !newModule.slides) {
        setError('Invalid module format. Must include title, slug, and slides.')
        return
      }

      // Generate moduleId if not present
      if (!newModule.moduleId) {
        newModule.moduleId = `module-${Date.now()}`
      }

      // Send to API
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule)
      })

      if (!res.ok) throw new Error('Failed to add module')

      setSuccess(`Module "${newModule.title}" added successfully!`)
      setJsonInput('')

      // Reload modules
      await loadModules()

      setTimeout(() => {
        setShowAddModal(false)
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError('Invalid JSON format or failed to save. Please check your input.')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const res = await fetch('/api/modules', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId })
        })

        if (!res.ok) throw new Error('Failed to delete module')

        // Reload modules
        await loadModules()
      } catch (err) {
        console.error('Error deleting module:', err)
        setError('Failed to delete module')
      }
    }
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <Link
            href="/admin"
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666',
              textDecoration: 'none',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'inline-block'
            }}
            className="hover:opacity-70"
          >
            ← back to admin
          </Link>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            manage modules
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '20px'
          }}>
            all modules ({modules.length})
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ cursor: 'pointer' }}
          >
            + Add New Module
          </button>
        </div>
      </div>

      {/* Module List */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{ display: 'grid', gap: '20px' }}>
            {modules.map((module, index) => (
              <div key={module.id} className="card" style={{ padding: '32px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Module {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 style={{
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 700,
                      marginBottom: '8px',
                      textTransform: 'lowercase'
                    }}>
                      {module.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px',
                      lineHeight: 1.6
                    }}>
                      {module.description}
                    </p>
                    <div style={{
                      fontSize: '13px',
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
                      <span>•</span>
                      <span>{module.slides.length} slides</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#999',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f00'
                      e.currentTarget.style.color = '#f00'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.color = '#999'
                    }}
                  >
                    Delete
                  </button>
                </div>
                <Link
                  href={`/modules/${module.slug}`}
                  style={{
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#000',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  View Module →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {showAddModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false)
              setJsonInput('')
              setError('')
              setSuccess('')
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '900px',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: '#000',
              color: '#fff',
              padding: '32px'
            }}>
              <h3 style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 700,
                textTransform: 'lowercase',
                marginBottom: '8px'
              }}>
                Add New Module
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#999'
              }}>
                Paste the JSON module structure from Claude below
              </p>
            </div>

            {/* Content */}
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`Paste JSON here, e.g.:
{
  "title": "Course Title",
  "slug": "course-slug",
  "description": "Description",
  "instructor": {
    "name": "Name",
    "title": "Student at USD",
    "bio": "Bio"
  },
  "duration": "30 minutes",
  "skillLevel": "beginner",
  "introVideo": "https://www.youtube.com/watch?v=...",
  "learningObjectives": ["Obj 1", "Obj 2"],
  "slides": [...],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"]
}`}
                style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '16px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.6
                }}
              />

              {error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#fff0f0',
                  border: '1px solid #f00',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#f00'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#f0fff0',
                  border: '1px solid #0f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#0a0'
                }}>
                  {success}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={handleAddModule}
                className="btn btn-primary"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                Add Module
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setJsonInput('')
                  setError('')
                  setSuccess('')
                }}
                className="btn btn-secondary"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
