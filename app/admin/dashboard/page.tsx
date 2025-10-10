'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'overview' | 'modules' | 'users' | 'submissions' | 'newsletters'

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

interface Submission {
  id: number
  userId: string
  title: string
  description: string
  content: string
  skillLevel: string
  estimatedDuration: string
  status: string
  submittedAt: string
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [modules, setModules] = useState<Module[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [saving, setSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
      loadUsers(),
      loadSubmissions()
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

  const loadSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
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

  const handleApproveSubmission = async (submissionId: number) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submissionId, status: 'approved' })
      })

      if (res.ok) {
        await loadSubmissions()
        alert('Submission approved!')
      }
    } catch (err) {
      console.error('Error approving submission:', err)
      alert('Failed to approve submission')
    }
  }

  const handleRejectSubmission = async (submissionId: number) => {
    if (!confirm('Are you sure you want to reject this submission?')) return

    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submissionId, status: 'rejected' })
      })

      if (res.ok) {
        await loadSubmissions()
        alert('Submission rejected')
      }
    } catch (err) {
      console.error('Error rejecting submission:', err)
      alert('Failed to reject submission')
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const navItems = [
    { id: 'overview' as Tab, label: 'Overview', icon: '◉' },
    { id: 'modules' as Tab, label: 'Modules', icon: '⬚' },
    { id: 'users' as Tab, label: 'Users', icon: '◎' },
    { id: 'submissions' as Tab, label: 'Submissions', icon: '✓' },
    { id: 'newsletters' as Tab, label: 'Newsletters', icon: '✉' }
  ]

  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length

  return (
    <main style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#000',
      color: '#fff'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? '80px' : '280px',
        background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{
          padding: '32px 24px',
          borderBottom: '1px solid #1a1a1a'
        }}>
          <Link href="/" style={{
            fontSize: sidebarCollapsed ? '20px' : '24px',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            color: '#fff',
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.3s'
          }}>
            {sidebarCollapsed ? 'ff' : 'forefront'}
          </Link>
          {!sidebarCollapsed && (
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#666',
              marginTop: '8px',
              fontWeight: 700
            }}>
              admin
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '24px 0',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: activeTab === item.id ? '#fff' : 'transparent',
                color: activeTab === item.id ? '#000' : '#666',
                border: 'none',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: activeTab === item.id ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = '#1a1a1a'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#666'
                }
              }}
            >
              <span style={{ fontSize: '16px', opacity: 0.8 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.id === 'submissions' && pendingSubmissions > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  padding: '2px 8px',
                  background: '#fff',
                  color: '#000',
                  fontSize: '11px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  {pendingSubmissions}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            padding: '20px',
            background: '#1a1a1a',
            color: '#666',
            border: 'none',
            borderTop: '1px solid #1a1a1a',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#222'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1a1a1a'
            e.currentTarget.style.color = '#666'
          }}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#000',
          borderBottom: '1px solid #1a1a1a',
          padding: '24px 48px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-1px'
          }}>
            {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          padding: '48px',
          minHeight: 'calc(100vh - 100px)'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: '#666',
              fontSize: '14px'
            }}>
              Loading...
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '48px'
                  }}>
                    {/* Stats Cards */}
                    <div style={{
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: '16px',
                      padding: '32px',
                      transition: 'all 0.3s'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        fontWeight: 900,
                        marginBottom: '12px'
                      }}>
                        {modules.length}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 700
                      }}>
                        Total Modules
                      </div>
                    </div>

                    <div style={{
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: '16px',
                      padding: '32px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        fontWeight: 900,
                        marginBottom: '12px'
                      }}>
                        {users.length}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 700
                      }}>
                        Total Users
                      </div>
                    </div>

                    <div style={{
                      background: '#0a0a0a',
                      border: pendingSubmissions > 0 ? '1px solid #fff' : '1px solid #1a1a1a',
                      borderRadius: '16px',
                      padding: '32px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        fontWeight: 900,
                        marginBottom: '12px'
                      }}>
                        {pendingSubmissions}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 700
                      }}>
                        Pending Reviews
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    color: '#fff'
                  }}>
                    Quick Actions
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px'
                  }}>
                    <Link href="/admin/modules" style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: '#fff',
                        color: '#000',
                        borderRadius: '12px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid #fff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>+</div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>Create Module</div>
                      </div>
                    </Link>

                    <div onClick={() => setActiveTab('submissions')} style={{
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: '12px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = '#1a1a1a'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Review Submissions</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700
                    }}>
                      {modules.length} Total Modules
                    </div>
                    <Link href="/admin/modules">
                      <button style={{
                        padding: '12px 24px',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s'
                      }}>
                        + New Module
                      </button>
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {modules.map((module) => (
                      <div key={module.id} style={{
                        background: '#0a0a0a',
                        border: '1px solid #1a1a1a',
                        borderRadius: '12px',
                        padding: '32px',
                        transition: 'all 0.2s'
                      }}>
                        {editingModule?.id === module.id ? (
                          <div>
                            <input
                              value={editingModule.title}
                              onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '20px',
                                fontWeight: 700,
                                border: '1px solid #333',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontFamily: 'inherit',
                                background: '#000',
                                color: '#fff'
                              }}
                            />
                            <textarea
                              value={editingModule.description}
                              onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '14px',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                minHeight: '100px',
                                fontFamily: 'inherit',
                                background: '#000',
                                color: '#fff',
                                lineHeight: 1.6
                              }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button
                                onClick={() => handleUpdateModule(editingModule)}
                                disabled={saving}
                                style={{
                                  padding: '12px 24px',
                                  background: '#fff',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingModule(null)}
                                style={{
                                  padding: '12px 24px',
                                  background: 'transparent',
                                  color: '#666',
                                  border: '1px solid #333',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              gap: '24px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{
                                  fontSize: '22px',
                                  fontWeight: 700,
                                  marginBottom: '12px',
                                  textTransform: 'lowercase',
                                  letterSpacing: '-0.5px',
                                  color: '#fff'
                                }}>
                                  {module.title}
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#999',
                                  marginBottom: '16px',
                                  lineHeight: 1.6
                                }}>
                                  {module.description}
                                </p>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#666',
                                  display: 'flex',
                                  gap: '12px',
                                  flexWrap: 'wrap',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  fontWeight: 600
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
                              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <Link href={`/admin/modules/edit/${module.moduleId}`}>
                                  <button
                                    style={{
                                      padding: '10px 20px',
                                      background: '#fff',
                                      color: '#000',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      fontFamily: 'inherit',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    Edit
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleDeleteModule(module.moduleId)}
                                  style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    color: '#666',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
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
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    marginBottom: '32px'
                  }}>
                    {users.length} Total Users
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {users.map((user) => (
                      <div key={user.id} style={{
                        background: '#0a0a0a',
                        border: '1px solid #1a1a1a',
                        borderRadius: '12px',
                        padding: '32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            marginBottom: '8px',
                            textTransform: 'lowercase',
                            letterSpacing: '-0.5px',
                            color: '#fff'
                          }}>
                            {user.name}
                            {user.isAdmin && (
                              <span style={{
                                marginLeft: '12px',
                                padding: '4px 12px',
                                background: '#fff',
                                color: '#000',
                                fontSize: '10px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 700
                              }}>
                                admin
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                            {user.email}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600
                          }}>
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{
                              padding: '10px 20px',
                              background: 'transparent',
                              border: '1px solid #333',
                              borderRadius: '8px',
                              fontSize: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              color: '#666',
                              fontFamily: 'inherit',
                              transition: 'all 0.2s'
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
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700
                    }}>
                      {submissions.length} Total Submissions
                    </div>
                    <Link href="/admin">
                      <button style={{
                        padding: '12px 24px',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s'
                      }}>
                        AI Generator →
                      </button>
                    </Link>
                  </div>

                  {submissions.length === 0 ? (
                    <div style={{
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: '12px',
                      padding: '60px',
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      No submissions yet
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {submissions.map((submission) => (
                        <div key={submission.id} style={{
                          background: '#0a0a0a',
                          border: '1px solid #1a1a1a',
                          borderRadius: '12px',
                          padding: '32px',
                          transition: 'all 0.2s'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '16px',
                            gap: '24px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                marginBottom: '12px',
                                textTransform: 'lowercase',
                                letterSpacing: '-0.5px',
                                color: '#fff'
                              }}>
                                {submission.title}
                              </h3>
                              <p style={{
                                fontSize: '14px',
                                color: '#999',
                                marginBottom: '16px',
                                lineHeight: 1.6
                              }}>
                                {submission.description}
                              </p>
                              <div style={{
                                fontSize: '12px',
                                color: '#666',
                                display: 'flex',
                                gap: '12px',
                                flexWrap: 'wrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: 600
                              }}>
                                <span>{submission.skillLevel}</span>
                                <span>•</span>
                                <span>{submission.estimatedDuration}</span>
                                <span>•</span>
                                <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: 700,
                              background: submission.status === 'pending' ? '#fff' : submission.status === 'approved' ? '#fff' : '#fff',
                              color: '#000',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              {submission.status}
                            </div>
                          </div>

                          {submission.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button
                                onClick={() => handleApproveSubmission(submission.id)}
                                style={{
                                  padding: '10px 20px',
                                  background: '#fff',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s'
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectSubmission(submission.id)}
                                style={{
                                  padding: '10px 20px',
                                  background: 'transparent',
                                  color: '#666',
                                  border: '1px solid #333',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s'
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Newsletters Tab */}
              {activeTab === 'newsletters' && (
                <div style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '12px',
                  padding: '60px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    color: '#fff',
                    textTransform: 'lowercase',
                    letterSpacing: '-0.5px'
                  }}>
                    manage newsletters
                  </div>
                  <Link href="/admin/newsletter">
                    <button style={{
                      padding: '12px 24px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}>
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
