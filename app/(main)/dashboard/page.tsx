'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Avatar } from '@/components/common/Avatar'

export default function DashboardPage() {
  const { user, isAuthenticated, progress } = useAuth()
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

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

  useEffect(() => {
    // Auto-scroll effect
    if (!scrollDirection) {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
        scrollAnimationRef.current = null
      }
      return
    }

    const scroll = () => {
      const carousel = carouselRef.current
      if (!carousel) return

      const speed = 5 // pixels per frame
      if (scrollDirection === 'left') {
        carousel.scrollLeft -= speed
      } else {
        carousel.scrollLeft += speed
      }

      scrollAnimationRef.current = requestAnimationFrame(scroll)
    }

    scrollAnimationRef.current = requestAnimationFrame(scroll)

    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
        scrollAnimationRef.current = null
      }
    }
  }, [scrollDirection])

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

  const clearRejectedSubmissions = async () => {
    if (!user?.id) return
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected')

    try {
      // Delete each rejected submission
      await Promise.all(rejectedSubmissions.map(submission =>
        fetch(`/api/submissions?id=${submission.id}&userId=${user.id}`, {
          method: 'DELETE'
        })
      ))
      // Reload submissions
      loadSubmissions()
    } catch (err) {
      console.error('Error clearing rejected submissions:', err)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setIsScrolled(target.scrollLeft > 0)
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current
    if (!carousel) return

    const rect = carousel.getBoundingClientRect()
    const x = e.clientX - rect.left
    const edgeThreshold = 150 // pixels from edge to trigger scroll

    // Left edge - scroll left
    if (x < edgeThreshold) {
      setScrollDirection('left')
    }
    // Right edge - scroll right
    else if (x > rect.width - edgeThreshold) {
      setScrollDirection('right')
    }
    // Middle - stop scrolling
    else {
      setScrollDirection(null)
    }
  }

  const handleMouseLeave = () => {
    setScrollDirection(null)
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero with Banner */}
      <div className="section" style={{
        paddingTop: '100px',
        paddingBottom: '40px',
        minHeight: 'auto',
        position: 'relative'
      }}>
        {/* Banner Background */}
        {user?.bannerImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            backgroundImage: `url(${user.bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: 0
          }} />
        )}

        <div className="content" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <Avatar
              src={user?.profileImage}
              name={user?.name || 'User'}
              size="xl"
              style={{
                border: '4px solid #000',
                boxShadow: '0 4px 16px rgba(255,255,255,0.1)'
              }}
            />
            <div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                dashboard
              </div>
              <h1 style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 900,
                textTransform: 'lowercase',
                letterSpacing: '-2px',
                marginBottom: '8px'
              }}>
                welcome back, {user?.name}
              </h1>
              <p style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: '#999'
              }}>
                your learning hub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Carousel */}
      <div className="section" style={{ paddingTop: '60px', paddingBottom: '60px', minHeight: 'auto', overflow: 'visible' }}>
        <div className="content" style={{ position: 'relative', overflow: 'visible' }}>
          {/* Fade masks - only show left when scrolled */}
          {isScrolled && (
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: '20px',
              width: '60px',
              background: 'linear-gradient(90deg, #000 0%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />
          )}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: '20px',
            width: '60px',
            background: 'linear-gradient(90deg, transparent 0%, #000 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          <div
            ref={carouselRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onScroll={handleScroll}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              overflowY: 'visible',
              scrollSnapType: scrollDirection ? 'none' : 'x mandatory',
              paddingBottom: '20px',
              paddingTop: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#333 transparent',
              scrollBehavior: 'auto'
            }}
          >
            {/* Continue Learning Card */}
            {continueModule && (
              <Link href={`/modules/${continueModule.slug}`} style={{ scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                <div className="card-dark" style={{
                  padding: '32px',
                  cursor: 'pointer',
                  width: '340px',
                  height: '260px',
                  display: 'flex',
                  flexDirection: 'column'
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
                    letterSpacing: '1px',
                    marginTop: 'auto'
                  }}>
                    resume →
                  </div>
                </div>
              </Link>
            )}

            {/* Newsletter Card */}
            <Link href="/newsletter" style={{ scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                width: '340px',
                height: '260px',
                display: 'flex',
                flexDirection: 'column'
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
                  marginBottom: 'auto',
                  lineHeight: 1.6
                }}>
                  latest ai breakthroughs, tools, and student discoveries
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginTop: '32px'
                }}>
                  read now →
                </div>
              </div>
            </Link>

            {/* Network Card */}
            <Link href="/network" style={{ scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                width: '340px',
                height: '260px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#666',
                  marginBottom: '16px',
                  fontWeight: 700
                }}>
                  connect & learn
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#fff',
                  textTransform: 'lowercase'
                }}>
                  student network
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: 'auto',
                  lineHeight: 1.6
                }}>
                  discover learners and join discussions
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginTop: '32px'
                }}>
                  explore →
                </div>
              </div>
            </Link>

            {/* Workflows Card */}
            <Link href="/workflows" style={{ scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                width: '340px',
                height: '260px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#666',
                  marginBottom: '16px',
                  fontWeight: 700
                }}>
                  visual guides
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#fff',
                  textTransform: 'lowercase'
                }}>
                  ai workflows
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: 'auto',
                  lineHeight: 1.6
                }}>
                  step-by-step visual workflows for ai tools
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginTop: '32px'
                }}>
                  explore →
                </div>
              </div>
            </Link>

            {/* Submit Course Card */}
            <Link href="/submit" style={{ scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div className="card-dark" style={{
                padding: '32px',
                cursor: 'pointer',
                width: '340px',
                height: '260px',
                display: 'flex',
                flexDirection: 'column'
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
                  marginBottom: 'auto',
                  lineHeight: 1.6
                }}>
                  share your ai knowledge with the community
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginTop: '32px'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="section-label">my course submissions</div>
              {submissions.some(s => s.status === 'rejected') && (
                <button
                  onClick={clearRejectedSubmissions}
                  style={{
                    padding: '12px 24px',
                    background: '#ff0000',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#cc0000'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ff0000'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  clear rejected
                </button>
              )}
            </div>

            {/* Approved Submissions - Highlighted */}
            {submissions.filter(s => s.status === 'approved').length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#00ff00',
                  marginBottom: '16px'
                }}>
                  ✓ approved courses
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {submissions.filter(s => s.status === 'approved').map((submission: any) => (
                    <div key={submission.id} className="card-dark" style={{
                      padding: '32px',
                      border: '2px solid #00ff00',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '8px 16px',
                        background: '#00ff00',
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        live
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', paddingRight: '80px' }}>
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
                      </div>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <span>{submission.skillLevel}</span>
                        <span>{submission.estimatedDuration}</span>
                        <span>published {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Submissions */}
            {submissions.filter(s => s.status !== 'approved').length > 0 && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {submissions.filter(s => s.status !== 'approved').map((submission: any) => (
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
                        background: submission.status === 'pending' ? '#333' : '#ff0000',
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
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '60px', minHeight: 'auto' }}>
        <div className="content">
          <div className="section-label" style={{ marginBottom: '32px', color: '#000' }}>your progress</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Completed Modules */}
            <div
              style={{
                padding: '32px',
                background: '#000',
                borderRadius: '16px',
                border: '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 'clamp(40px, 6vw, 56px)',
                fontWeight: 900,
                marginBottom: '8px',
                color: '#fff',
                lineHeight: 1
              }}>
                {completedModules}<span style={{ fontSize: '24px', color: '#666' }}>/{totalModules}</span>
              </div>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 700
              }}>
                modules completed
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#333'
              }}>
                <div style={{
                  height: '100%',
                  width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #fff 0%, #999 100%)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* In Progress */}
            <div
              style={{
                padding: '32px',
                background: '#000',
                borderRadius: '16px',
                border: '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 'clamp(40px, 6vw, 56px)',
                fontWeight: 900,
                marginBottom: '8px',
                color: '#fff',
                lineHeight: 1
              }}>
                {startedModules}
              </div>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 700
              }}>
                in progress
              </div>
              {startedModules > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: '#333'
                }}>
                  <div style={{
                    height: '100%',
                    width: '100%',
                    background: 'linear-gradient(90deg, #fff 0%, #666 50%, #fff 100%)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>
              )}
            </div>

            {/* Sections Completed */}
            <div
              style={{
                padding: '32px',
                background: '#000',
                borderRadius: '16px',
                border: '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 'clamp(40px, 6vw, 56px)',
                fontWeight: 900,
                marginBottom: '8px',
                color: '#fff',
                lineHeight: 1
              }}>
                {completedSlides}<span style={{ fontSize: '24px', color: '#666' }}>/{totalSlides}</span>
              </div>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 700
              }}>
                sections learned
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#333'
              }}>
                <div style={{
                  height: '100%',
                  width: `${totalSlides > 0 ? (completedSlides / totalSlides) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #fff 0%, #999 100%)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Overall Progress */}
            <div
              style={{
                padding: '32px',
                background: totalSlides > 0 && (completedSlides / totalSlides) * 100 === 100 ? 'linear-gradient(135deg, #000 0%, #333 100%)' : '#000',
                borderRadius: '16px',
                border: totalSlides > 0 && (completedSlides / totalSlides) * 100 === 100 ? '2px solid #fff' : '2px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = totalSlides > 0 && (completedSlides / totalSlides) * 100 === 100 ? '#fff' : '#333'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 'clamp(40px, 6vw, 56px)',
                fontWeight: 900,
                marginBottom: '8px',
                color: '#fff',
                lineHeight: 1
              }}>
                {totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0}%
              </div>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 700
              }}>
                overall progress
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#333'
              }}>
                <div style={{
                  height: '100%',
                  width: `${totalSlides > 0 ? (completedSlides / totalSlides) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #fff 0%, #999 100%)',
                  transition: 'width 0.5s ease'
                }} />
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
