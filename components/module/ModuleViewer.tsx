'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Module } from '@/lib/data/modules'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer'

interface ModuleViewerProps {
  module: Module
  moduleIndex: number
  totalModules: number
}

export function ModuleViewer({ module, moduleIndex, totalModules }: ModuleViewerProps) {
  const { updateProgress, addNote, getSlideNotes, isAuthenticated, user } = useAuth()
  const [activeSlideNote, setActiveSlideNote] = useState<number | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [isLearning, setIsLearning] = useState(false)
  const [loadingLearning, setLoadingLearning] = useState(false)

  const checkLearningStatus = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/learning?userId=${user.id}`)
      if (res.ok) {
        const learning = await res.json()
        const isCurrentlyLearning = learning.some(
          (l: any) => l.moduleId === module.moduleId && l.status === 'learning'
        )
        setIsLearning(isCurrentlyLearning)
      }
    } catch (err) {
      console.error('Error checking learning status:', err)
    }
  }

  useEffect(() => {
    if (!user) return
    checkLearningStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, module.moduleId])

  const toggleLearning = async () => {
    if (!user) return
    setLoadingLearning(true)
    try {
      if (isLearning) {
        const res = await fetch('/api/learning', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, moduleId: module.moduleId })
        })
        if (!res.ok) throw new Error('Failed to remove from learning')
        setIsLearning(false)
      } else {
        // First, sync user to database if needed
        const syncRes = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio || null,
            interests: user.interests || [],
            isAdmin: user.isAdmin || false
          })
        })

        if (!syncRes.ok) {
          throw new Error('Failed to sync user account')
        }

        // Then add to learning
        const res = await fetch('/api/learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, moduleId: module.moduleId })
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to add to learning')
        }
        setIsLearning(true)
      }
    } catch (err: any) {
      console.error('Error toggling learning:', err)
      alert(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoadingLearning(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    // Track progress when viewing slides
    const handleScroll = () => {
      module.slides.forEach((slide, index) => {
        const element = document.getElementById(`slide-${slide.id}`)
        if (element) {
          const rect = element.getBoundingClientRect()
          const isVisible = rect.top >= 0 && rect.top <= window.innerHeight / 2
          if (isVisible) {
            updateProgress(module.id, index)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [module, updateProgress, isAuthenticated])

  const handleSaveNote = (slideId: number) => {
    if (noteContent.trim()) {
      addNote(module.id, slideId, noteContent)
      setNoteContent('')
      setActiveSlideNote(null)
    }
  }

  const handleCompleteModule = () => {
    updateProgress(module.id, module.slides.length - 1, true)
  }

  return (
    <>
      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        height: '4px',
        background: '#333',
        zIndex: 999
      }}>
        <div style={{
          height: '100%',
          background: '#fff',
          width: '0%',
          transition: 'width 0.3s ease'
        }} id="progress-bar" />
      </div>

      {/* Video Section */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
        <div className="content">
          {/* Breadcrumb */}
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '30px',
            fontWeight: 700
          }}>
            module {String(moduleIndex + 1).padStart(2, '0')} of {totalModules}
          </div>

          {/* Title */}
          <h1 className="title-large" style={{ marginBottom: '30px', textAlign: 'left' }}>
            {module.title.toLowerCase()}
          </h1>

          {/* Meta Info */}
          <div style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '30px',
            fontSize: '14px',
            color: '#999'
          }}>
            <span>{module.instructor.name}</span>
            <span>•</span>
            <span>{module.duration}</span>
            <span>•</span>
            <span>{module.skillLevel}</span>
            <span>•</span>
            <span>{module.slides.length} sections</span>
          </div>

          {/* Learning Status Button */}
          {isAuthenticated && (
            <div style={{ marginBottom: '50px' }}>
              <button
                onClick={toggleLearning}
                disabled={loadingLearning}
                style={{
                  padding: '14px 32px',
                  background: isLearning ? '#000' : '#fff',
                  color: isLearning ? '#fff' : '#000',
                  border: '3px solid #000',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  cursor: loadingLearning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                  opacity: loadingLearning ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loadingLearning) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loadingLearning
                  ? '...'
                  : isLearning
                    ? '✓ currently learning'
                    : '+ add to learning'
                }
              </button>
            </div>
          )}

          {/* Video Container */}
          <div style={{
            width: '100%',
            background: '#fff',
            padding: '12px',
            borderRadius: '16px',
            marginBottom: '40px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{
              width: '100%',
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <VideoPlayer url={module.introVideo} />
            </div>
          </div>

          {/* What You'll Learn */}
          <div style={{
            background: '#1a1a1a',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 2px 16px rgba(255, 255, 255, 0.04)',
            marginBottom: '40px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <h2 style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: '24px',
              letterSpacing: '1px'
            }}>
              What You&apos;ll Learn
            </h2>
            <ul style={{
              listStyle: 'none',
              display: 'grid',
              gap: '12px',
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.6
            }}>
              {module.learningObjectives.map((objective, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <span style={{ color: '#fff', flexShrink: 0 }}>→</span>
                  <span style={{ color: '#ccc' }}>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            borderTop: '1px solid #333',
            borderBottom: '1px solid #333'
          }}>
            <h3 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Start Learning
            </h3>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: '#999',
              marginBottom: '32px'
            }}>
              scroll down to explore all {module.slides.length} sections
            </p>
            <a href="#slide-1" className="btn btn-primary">
              begin course →
            </a>
          </div>
        </div>
      </div>

      {/* Slides */}
      {module.slides.map((slide, index) => {
        const existingNote = getSlideNotes(module.id, index)
        const isNoteActive = activeSlideNote === index

        return (
          <div
            key={slide.id}
            id={`slide-${slide.id}`}
            className={index % 2 === 0 ? 'section' : 'section white'}
            style={{ scrollMarginTop: '70px' }}
          >
            <div className="content">
              {/* Section Number */}
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: index % 2 === 0 ? '#666' : '#999',
                marginBottom: '20px',
                fontWeight: 700
              }}>
                section {String(index + 1).padStart(2, '0')} / {module.slides.length}
              </div>

              {/* Heading */}
              {slide.content.heading && (
                <h2 style={{
                  fontSize: 'clamp(32px, 6vw, 64px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: '30px',
                  color: index % 2 === 0 ? '#fff' : '#000'
                }}>
                  {slide.content.heading}
                </h2>
              )}

              {/* Body */}
              {slide.content.body && (
                <p style={{
                  fontSize: 'clamp(16px, 2.5vw, 24px)',
                  lineHeight: 1.6,
                  marginBottom: '30px',
                  color: index % 2 === 0 ? '#ccc' : '#666',
                  maxWidth: '800px'
                }}>
                  {slide.content.body}
                </p>
              )}

              {/* Bullets */}
              {slide.content.bulletPoints && (
                <ul style={{
                  listStyle: 'none',
                  display: 'grid',
                  gap: '16px',
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  lineHeight: 1.6,
                  marginTop: '30px'
                }}>
                  {slide.content.bulletPoints.map((point, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '16px',
                      color: index % 2 === 0 ? '#fff' : '#333'
                    }}>
                      <span style={{
                        flexShrink: 0,
                        color: index % 2 === 0 ? '#fff' : '#000',
                        fontWeight: 900
                      }}>→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Code */}
              {slide.content.code && (
                <div style={{
                  background: index % 2 === 0 ? '#1a1a1a' : '#f5f5f5',
                  padding: '32px',
                  borderRadius: '12px',
                  marginTop: '30px',
                  boxShadow: index % 2 === 0
                    ? '0 2px 16px rgba(255, 255, 255, 0.04)'
                    : '0 2px 12px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    color: index % 2 === 0 ? '#666' : '#999',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {slide.content.code.language}
                  </div>
                  <pre style={{
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    color: index % 2 === 0 ? '#ccc' : '#000',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    lineHeight: 1.6
                  }}>
                    <code>{slide.content.code.snippet}</code>
                  </pre>
                </div>
              )}

              {/* Note */}
              {slide.content.note && (
                <div style={{
                  marginTop: '30px',
                  padding: '24px',
                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                  borderLeft: index % 2 === 0 ? '4px solid #fff' : '4px solid #000',
                  fontSize: 'clamp(14px, 2vw, 18px)',
                  color: index % 2 === 0 ? '#ccc' : '#666',
                  lineHeight: 1.6,
                  borderRadius: '8px',
                  boxShadow: index % 2 === 0
                    ? '0 2px 8px rgba(255, 255, 255, 0.02)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}>
                  <strong style={{ color: index % 2 === 0 ? '#fff' : '#000' }}>Note:</strong> {slide.content.note}
                </div>
              )}

              {/* User Notes Section */}
              {isAuthenticated && (
                <div style={{
                  marginTop: '40px',
                  padding: '24px',
                  background: index % 2 === 0 ? '#1a1a1a' : '#f5f5f5',
                  borderRadius: '12px',
                  boxShadow: index % 2 === 0
                    ? '0 2px 12px rgba(255, 255, 255, 0.04)'
                    : '0 2px 12px rgba(0, 0, 0, 0.06)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    color: index % 2 === 0 ? '#999' : '#666',
                    fontWeight: 700
                  }}>
                    your notes
                  </div>

                  {existingNote ? (
                    <div>
                      <p style={{
                        fontSize: '14px',
                        color: index % 2 === 0 ? '#ccc' : '#333',
                        marginBottom: '12px',
                        lineHeight: 1.6
                      }}>
                        {existingNote.content}
                      </p>
                      <button
                        onClick={() => {
                          setActiveSlideNote(index)
                          setNoteContent(existingNote.content)
                        }}
                        style={{
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          color: index % 2 === 0 ? '#fff' : '#000',
                          background: 'transparent',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          fontFamily: 'inherit'
                        }}
                      >
                        edit note
                      </button>
                    </div>
                  ) : isNoteActive ? (
                    <div>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="add your notes here..."
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '12px',
                          fontSize: '14px',
                          border: index % 2 === 0 ? '1px solid #333' : '1px solid #ddd',
                          borderRadius: '8px',
                          background: index % 2 === 0 ? '#000' : '#fff',
                          color: index % 2 === 0 ? '#fff' : '#000',
                          resize: 'vertical',
                          marginBottom: '12px',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleSaveNote(index)}
                          style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            padding: '8px 16px',
                            background: index % 2 === 0 ? '#fff' : '#000',
                            color: index % 2 === 0 ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'inherit'
                          }}
                        >
                          save note
                        </button>
                        <button
                          onClick={() => {
                            setActiveSlideNote(null)
                            setNoteContent('')
                          }}
                          style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            padding: '8px 16px',
                            background: 'transparent',
                            color: index % 2 === 0 ? '#999' : '#666',
                            border: index % 2 === 0 ? '1px solid #333' : '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'inherit'
                          }}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSlideNote(index)}
                      style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: index % 2 === 0 ? '#fff' : '#000',
                        background: 'transparent',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        fontFamily: 'inherit'
                      }}
                    >
                      + add note
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Arrows */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '60px',
                paddingTop: '40px',
                borderTop: index % 2 === 0 ? '1px solid #333' : '1px solid #ddd'
              }}>
                {index > 0 ? (
                  <a
                    href={`#slide-${module.slides[index - 1].id}`}
                    style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: index % 2 === 0 ? '#fff' : '#000',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                    className="hover:opacity-70"
                  >
                    ← previous
                  </a>
                ) : <div />}

                {index < module.slides.length - 1 ? (
                  <a
                    href={`#slide-${module.slides[index + 1].id}`}
                    style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: index % 2 === 0 ? '#fff' : '#000',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                    className="hover:opacity-70"
                  >
                    next →
                  </a>
                ) : (
                  <a
                    href="#completion"
                    style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: index % 2 === 0 ? '#fff' : '#000',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                    className="hover:opacity-70"
                  >
                    finish →
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Completion */}
      <div className="section white" id="completion" style={{ scrollMarginTop: '70px' }}>
        <div className="content center-text">
          <div style={{
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-4px',
            lineHeight: 0.9,
            marginBottom: '30px'
          }}>
            complete!
          </div>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 28px)',
            color: '#666',
            marginBottom: '50px'
          }}>
            you&apos;ve finished {module.title.toLowerCase()}
          </p>

          {/* Key Takeaways */}
          <div style={{
            background: '#000',
            color: '#fff',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'left',
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px auto',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <h3 style={{
              fontSize: 'clamp(20px, 4vw, 32px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              Key Takeaways
            </h3>
            <ul style={{
              listStyle: 'none',
              display: 'grid',
              gap: '12px',
              fontSize: 'clamp(14px, 2vw, 18px)',
              lineHeight: 1.6
            }}>
              {module.keyTakeaways.map((takeaway, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px' }}>
                  <span>→</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleCompleteModule}
              className="btn btn-primary"
              style={{ marginBottom: '16px', cursor: 'pointer' }}
            >
              mark as complete →
            </button>
          )}

          <Link href="/" className="btn btn-secondary">
            back to all modules
          </Link>
        </div>
      </div>
    </>
  )
}
