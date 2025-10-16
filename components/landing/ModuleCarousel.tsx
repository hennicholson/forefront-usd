'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable)
}

interface Module {
  id: number
  title: string
  description: string
  slug: string
  duration: string
  skillLevel: string
  instructor: {
    name: string
  }
  slides?: any[]
}

interface ModuleCarouselProps {
  isAuthenticated: boolean
  onModuleClick?: (slug: string) => void
}

export function ModuleCarousel({ isAuthenticated, onModuleClick }: ModuleCarouselProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef<HTMLUListElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const dragProxyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data) // Load all modules for infinite scroll
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && modules.length > 0 && cardsRef.current) {
      initInfiniteScroll()
    }
  }, [loading, modules])

  const initInfiniteScroll = () => {
    if (!cardsRef.current || !galleryRef.current) return

    const cards = gsap.utils.toArray('.module-card') as HTMLElement[]
    if (cards.length === 0) return

    // Clone cards for seamless infinite loop
    const cardsContainer = cardsRef.current
    const originalCards = [...cards]

    // Clone the cards three times for truly seamless looping
    for (let i = 0; i < 3; i++) {
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true) as HTMLElement
        cardsContainer.appendChild(clone)
      })
    }

    const allCards = gsap.utils.toArray('.module-card') as HTMLElement[]
    const cardWidth = 370 // 350px width + 20px gap
    const totalWidth = cardWidth * originalCards.length

    // Position all cards (original + clones) in a continuous line
    allCards.forEach((card, i) => {
      gsap.set(card, {
        x: i * cardWidth - cardWidth * originalCards.length, // Start off-screen to the left
        opacity: 1,
        scale: 1
      })
    })

    // Create seamless infinite loop
    const animation = gsap.to(allCards, {
      x: `+=${totalWidth}`, // Move to the right
      duration: originalCards.length * 10, // 10 seconds per card for slower scroll
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const val = parseFloat(x)
          // When a card goes off the right edge, wrap it back to the left
          if (val > cardWidth * originalCards.length * 2) {
            return val - totalWidth * 4
          }
          return val
        })
      }
    })

    // Pause on hover
    const handleMouseEnter = () => animation.pause()
    const handleMouseLeave = () => animation.play()

    galleryRef.current.addEventListener('mouseenter', handleMouseEnter)
    galleryRef.current.addEventListener('mouseleave', handleMouseLeave)

    // Optional: Add dragging
    if (dragProxyRef.current) {
      let startProgress = 0
      Draggable.create(dragProxyRef.current, {
        type: 'x',
        trigger: cardsRef.current,
        onPress() {
          animation.pause()
          startProgress = animation.progress()
        },
        onDrag() {
          const dragDistance = this.x
          const progressChange = dragDistance / (totalWidth * 4)
          animation.progress((startProgress - progressChange) % 1)
        },
        onDragEnd() {
          animation.play()
        }
      })
    }

    return () => {
      animation.kill()
      galleryRef.current?.removeEventListener('mouseenter', handleMouseEnter)
      galleryRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      // Clean up clones
      while (cardsContainer.children.length > originalCards.length) {
        cardsContainer.removeChild(cardsContainer.lastChild!)
      }
    }
  }

  if (loading) {
    return (
      <div className="section white" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <div className="content">
          <div style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
            Loading modules...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{ paddingTop: '30px', paddingBottom: '50px', background: '#000' }}>
      <div className="content">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 48px auto' }}
        >
          <div className="section-label" style={{ marginBottom: '16px', color: '#fff' }}>
            AI is Moving Fast. So Are We.
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '24px'
          }}>
            Every day, new AI tools emerge. Every week, the bar rises. As students, we're not just learning—we're racing to stay ahead.
            That's why we built Forefront: <strong style={{ color: '#fff' }}>students teaching students</strong>, because nobody understands the learning curve better than those who just climbed it.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '16px 32px',
            background: '#fff',
            color: '#000',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            100% Free • Student-Led • Real Skills
          </div>
        </motion.div>

        {/* What You'll Learn Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="section-label"
          style={{ textAlign: 'center', marginBottom: '64px', color: '#fff' }}
        >
          What You'll Learn
        </motion.div>

        {/* Infinite Scroll Gallery */}
        <div ref={galleryRef} className="module-gallery" style={{
          position: 'relative',
          width: '100%',
          height: '550px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Left fade gradient - fading to black background */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '150px',
            background: 'linear-gradient(to right, rgb(0,0,0) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0) 100%)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* Right fade gradient - fading to black background */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '150px',
            background: 'linear-gradient(to left, rgb(0,0,0) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0) 100%)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          <ul ref={cardsRef} className="module-cards" style={{
            position: 'relative',
            width: '100%',
            height: '480px',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
          {modules.map((module, index) => {
            const handleClick = (e: React.MouseEvent) => {
              if (!isAuthenticated) {
                e.preventDefault()
                onModuleClick?.(module.slug)
              }
            }

            return (
              <li
                key={module.id}
                className="module-card"
                style={{
                  position: 'absolute',
                  width: '350px',
                  aspectRatio: '9/16',
                  top: 0,
                  left: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <Link href={`/modules/${module.slug}`} onClick={handleClick} style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}>
                  <div
                    className="card"
                    style={{
                      padding: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      top: '-50px',
                      right: '-50px',
                      width: '150px',
                      height: '150px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                      borderRadius: '50%'
                    }} />

                    {/* Module badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '24px',
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      width: 'fit-content'
                    }}>
                      {/* Custom icon based on module type */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          style={{ color: '#4CAF50' }}
                        />
                        <path d="M12 7V12L15 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: '#4CAF50' }}
                        />
                      </svg>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        Module
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: 'clamp(20px, 2.5vw, 24px)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.5px',
                      marginBottom: '16px',
                      color: '#fff',
                      lineHeight: 1.2
                    }}>
                      {module.title}
                    </h3>

                    <p style={{
                      fontSize: '14px',
                      lineHeight: 1.8,
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '24px',
                      flex: 1
                    }}>
                      {module.description}
                    </p>

                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{module.duration}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{module.skillLevel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M16 20v-2a4 4 0 00-8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{module.instructor.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
          </ul>
          <div ref={dragProxyRef} className="drag-proxy" style={{ visibility: 'hidden', position: 'absolute' }} />
        </div>

        {/* View all modules CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: 'center',
            marginTop: '56px',
            padding: '40px 32px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            marginBottom: '12px',
            color: '#fff'
          }}>
            Ready to Dive Deeper?
          </div>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '24px',
            maxWidth: '500px',
            margin: '0 auto 24px auto',
            lineHeight: 1.6
          }}>
            These are just the beginning. Browse {modules.length > 0 ? 'all our' : 'our full collection of'} modules and start building the skills that matter.
          </p>
          <Link
            href="/modules"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
              color: '#000',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Browse All Modules →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
