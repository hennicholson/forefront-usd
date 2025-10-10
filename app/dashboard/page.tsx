'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, progress } = useAuth()
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)
    loadModules()
    loadSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

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

  const loadSubmissions = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/submissions?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const totalModules = modules.length
  const startedModules = progress.length
  const completedModules = progress.filter(p => p.completed).length
  const totalSlides = modules.reduce((acc, m) => acc + m.slides.length, 0)
  const completedSlides = progress.reduce((acc, p) => acc + p.completedSlides.length, 0)

  const inProgressModules = progress.filter(p => !p.completed && p.completedSlides.length > 0)
  const continueModule = inProgressModules.length > 0
    ? modules.find(m => m.moduleId === inProgressModules[0].moduleId)
    : null

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            dashboard
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '12px'
          }}>
            welcome back, {user?.name}
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            marginTop: '8px'
          }}>
            your learning hub
          </p>
        </div>
      </div>

      {/* Quick Actions Carousel */}
      <div className="section" style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '20px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 transparent'
          }}>
            {/* Continue Learning Card */}
            {continueModule && (
              <Link href={`/modules/${continueModule.slug}`} style={{ scrollSnapAlign: 'start' }}>
                <div className="card-dark" style={{
                  padding: '32px',
                  cursor: 'pointer',
                  minWidth: '320px',
                  width: '320px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#666',
                    marginBottom: '16px',
                    fontWeight: 700
                  }}>
                    continue learning
                  </div>
                  <div style={{
                    fontSize: 'clamp(20px, 3vw, 24px)',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#fff',
                    textTransform: 'lowercase'
                  }}>
                    {continueModule.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '20px'
                  }}>
                    {progress.find(p => p.moduleId === continueModule.id)?.completedSlides.length || 0} / {continueModule.slides.length} sections
                  </div>
                  <div style={{
                    background: '#000',
                    height: '6px',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      background: '#fff',
                      height: '100%',
                      width: `${Math.round(((progress.find(p => p.moduleId === continueModule.id)?.completedSlides.length || 0) / continueModule.slides.length) * 100)}%`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    resume →
                  </div>
                </div>
              </Link>
            )}

            {/* Newsletter Card */}
            <Link href="/newsletter" style={{ scrollSnapAlign: 'start' }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                minWidth: '320px',
                width: '320px'
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#666',
                  marginBottom: '16px',
                  fontWeight: 700
                }}>
                  stay updated
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#fff',
                  textTransform: 'lowercase'
                }}>
                  this week's newsletter
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '32px',
                  lineHeight: 1.6
                }}>
                  latest ai breakthroughs, tools, and student discoveries
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  read now →
                </div>
              </div>
            </Link>

            {/* Submit Course Card */}
            <Link href="/submit" style={{ scrollSnapAlign: 'start' }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                minWidth: '320px',
                width: '320px'
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#666',
                  marginBottom: '16px',
                  fontWeight: 700
                }}>
                  share knowledge
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#fff',
                  textTransform: 'lowercase'
                }}>
                  submit a course
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '32px',
                  lineHeight: 1.6
                }}>
                  share your ai knowledge with the community
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  get started →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* My Submissions */}
      {submissions.length > 0 && (
        <div className="section" style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: 'auto' }}>
          <div className="content">
            <div className="section-label" style={{ marginBottom: '32px' }}>my course submissions</div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {submissions.map((submission: any) => (
                <div key={submission.id} className="card-dark" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <div style={{
                        fontSize: 'clamp(18px, 3vw, 24px)',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '8px',
                        textTransform: 'lowercase'
                      }}>
                        {submission.title}
                      </div>
                      <div style={{ fontSize: '14px', color: '#999', marginBottom: '12px' }}>
                        {submission.description}
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      background: submission.status === 'pending' ? '#333' : submission.status === 'approved' ? '#00ff00' : '#ff0000',
                      color: submission.status === 'pending' ? '#fff' : '#000'
                    }}>
                      {submission.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span>{submission.skillLevel}</span>
                    <span>{submission.estimatedDuration}</span>
                    <span>submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '60px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '24px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 900,
                marginBottom: '4px',
                color: '#fff'
              }}>
                {completedModules}/{totalModules}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666'
              }}>
                completed
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 900,
                marginBottom: '4px',
                color: '#fff'
              }}>
                {startedModules}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666'
              }}>
                in progress
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 900,
                marginBottom: '4px',
                color: '#fff'
              }}>
                {completedSlides}/{totalSlides}
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666'
              }}>
                sections
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: '#000',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                fontWeight: 900,
                marginBottom: '4px',
                color: '#fff'
              }}>
                {totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0}%
              </div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666'
              }}>
                overall
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="section" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content">
          <div className="section-label">all modules</div>

          <div style={{ display: 'grid', gap: '20px', marginTop: '40px' }}>
            {modules.map((module, index) => {
              const moduleProgress = progress.find(p => p.moduleId === module.id)
              const progressPercent = moduleProgress
                ? Math.round((moduleProgress.completedSlides.length / module.slides.length) * 100)
                : 0
              const isCompleted = moduleProgress?.completed
              const isStarted = !!moduleProgress

              return (
                <Link key={module.id} href={`/modules/${module.slug}`}>
                  <div className="card-dark" style={{ padding: '40px', cursor: 'pointer' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '32px',
                      alignItems: 'center'
                    }}>
                      {/* Module Number */}
                      <div style={{
                        fontSize: 'clamp(36px, 5vw, 52px)',
                        fontWeight: 700,
                        color: '#fff',
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
                          color: '#fff'
                        }}>
                          {module.title}
                        </div>
                        <div style={{
                          fontSize: 'clamp(14px, 2vw, 16px)',
                          color: '#999',
                          marginBottom: '16px',
                          lineHeight: 1.6
                        }}>
                          {module.description}
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                          background: '#000',
                          height: '8px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            background: '#fff',
                            height: '100%',
                            width: `${progressPercent}%`,
                            transition: 'width 0.5s ease',
                            borderRadius: '4px'
                          }} />
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px'
                        }}>
                          {isCompleted
                            ? '✓ completed'
                            : isStarted
                            ? `${progressPercent}% complete → section ${moduleProgress.lastViewed + 1}/${module.slides.length}`
                            : 'not started'}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#fff',
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
        </div>
      </div>
    </main>
  )
}
