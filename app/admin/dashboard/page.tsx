'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'modules' | 'users' | 'submissions' | 'newsletters'

interface Module {
  id: number
  moduleId: string
  title: string
  slug: string
  description: string
  duration: string
  skillLevel: string
  instructor: any
  slides: any[]
}

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: string
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('modules')
  const [modules, setModules] = useState<Module[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      loadModules(),
      loadUsers()
    ])
    setLoading(false)
  }

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users/all')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const handleUpdateModule = async (module: Module) => {
    setSaving(true)
    try {
      const res = await fetch('/api/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module)
      })
      if (res.ok) {
        await loadModules()
        setEditingModule(null)
      }
    } catch (err) {
      console.error('Error updating module:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      const res = await fetch('/api/modules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId })
      })
      if (res.ok) {
        await loadModules()
      }
    } catch (err) {
      console.error('Error deleting module:', err)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadUsers()
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <Link
            href="/"
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
          >
            ← back to home
          </Link>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginTop: '16px',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            admin dashboard
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '32px'
          }}>
            manage platform
          </h1>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '2px solid #333',
            paddingBottom: '2px',
            flexWrap: 'wrap'
          }}>
            {(['modules', 'users', 'submissions', 'newsletters'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div className="content">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              Loading...
            </div>
          ) : (
            <>
              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                  }}>
                    <h2 style={{
                      fontSize: 'clamp(24px, 4vw, 32px)',
                      fontWeight: 700,
                      textTransform: 'lowercase'
                    }}>
                      modules ({modules.length})
                    </h2>
                    <Link href="/admin/modules">
                      <button className="btn btn-primary" style={{ cursor: 'pointer' }}>
                        + add new module
                      </button>
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gap: '20px' }}>
                    {modules.map((module) => (
                      <div key={module.id} className="card" style={{ padding: '32px' }}>
                        {editingModule?.id === module.id ? (
                          <div>
                            <input
                              value={editingModule.title}
                              onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '24px',
                                fontWeight: 700,
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontFamily: 'inherit'
                              }}
                            />
                            <textarea
                              value={editingModule.description}
                              onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                minHeight: '100px',
                                fontFamily: 'inherit'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                onClick={() => handleUpdateModule(editingModule)}
                                className="btn btn-primary"
                                style={{ cursor: 'pointer' }}
                                disabled={saving}
                              >
                                {saving ? 'saving...' : 'save changes'}
                              </button>
                              <button
                                onClick={() => setEditingModule(null)}
                                className="btn btn-secondary"
                                style={{ cursor: 'pointer' }}
                              >
                                cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              marginBottom: '16px'
                            }}>
                              <div>
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
                                  <span>{module.instructor?.name || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{module.duration}</span>
                                  <span>•</span>
                                  <span>{module.skillLevel}</span>
                                  <span>•</span>
                                  <span>{module.slides?.length || 0} slides</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => setEditingModule(module)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  edit
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(module.moduleId)}
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
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  delete
                                </button>
                              </div>
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
                              view module →
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h2 style={{
                    fontSize: 'clamp(24px, 4vw, 32px)',
                    fontWeight: 700,
                    marginBottom: '32px',
                    textTransform: 'lowercase'
                  }}>
                    users ({users.length})
                  </h2>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {users.map((user) => (
                      <div key={user.id} className="card" style={{
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            marginBottom: '4px'
                          }}>
                            {user.name}
                            {user.isAdmin && (
                              <span style={{
                                marginLeft: '12px',
                                padding: '4px 8px',
                                background: '#000',
                                color: '#fff',
                                fontSize: '10px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                              }}>
                                admin
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {user.email}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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
                              fontFamily: 'inherit'
                            }}
                          >
                            delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === 'submissions' && (
                <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                    submissions stored in localStorage
                  </div>
                  <Link href="/admin">
                    <button className="btn btn-primary" style={{ cursor: 'pointer' }}>
                      view submissions →
                    </button>
                  </Link>
                </div>
              )}

              {/* Newsletters Tab */}
              {activeTab === 'newsletters' && (
                <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                    manage newsletters
                  </div>
                  <Link href="/admin/newsletter">
                    <button className="btn btn-primary" style={{ cursor: 'pointer' }}>
                      edit newsletter →
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
