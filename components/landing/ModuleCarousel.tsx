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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

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

  // Cursor arrow effect for CTA button - only active in CTA section
  useEffect(() => {
    const canvas = document.getElementById('cta-overlay') as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isEffectActive = false

    // Update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Check scroll position to activate/deactivate effect
    const checkScrollPosition = () => {
      const target = document.getElementById('cta-target')
      if (!target) return

      const rect = target.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Activate when CTA button is in view (after passing modules)
      // Deactivate when scrolled too far past or before
      if (rect.top < windowHeight * 0.9 && rect.bottom > windowHeight * 0.1) {
        isEffectActive = true
      } else {
        isEffectActive = false
      }
    }

    // Add scroll listener
    window.addEventListener('scroll', checkScrollPosition)
    checkScrollPosition() // Check initial position

    // Draw arrow function
    const drawArrow = () => {
      // Only draw if effect is active
      if (!isEffectActive) return

      const target = document.getElementById('cta-target')
      if (!target || !ctx) return

      const x0 = mouseRef.current.x
      const y0 = mouseRef.current.y

      if (!x0 || !y0) return

      // Get target center
      const rect = target.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      // Calculate arrow endpoint
      const angle = Math.atan2(cy - y0, cx - x0)
      const x1 = cx - Math.cos(angle) * (rect.width / 2 + 12)
      const y1 = cy - Math.sin(angle) * (rect.height / 2 + 12)

      // Calculate curve control point
      const midX = (x0 + x1) / 2
      const midY = (y0 + y1) / 2
      const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5)
      const t = Math.max(-1, Math.min(1, (y0 - y1) / 200))
      const controlX = midX
      const controlY = midY + offset * t

      // Calculate opacity based on distance
      const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)
      const opacity = Math.min(0.75, Math.max(0, (r - Math.max(rect.width, rect.height) / 2 - 50) / 750))

      // Fade in/out based on activation state
      const finalOpacity = isEffectActive ? opacity : 0

      ctx.strokeStyle = `rgba(255,255,255,${finalOpacity})`
      ctx.lineWidth = 1

      // Draw curved line
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.quadraticCurveTo(controlX, controlY, x1, y1)
      ctx.setLineDash([10, 4])
      ctx.stroke()
      ctx.restore()

      // Draw arrowhead
      const arrowAngle = Math.atan2(y1 - controlY, x1 - controlX)
      const headLength = 10
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(
        x1 - headLength * Math.cos(arrowAngle - Math.PI / 6),
        y1 - headLength * Math.sin(arrowAngle - Math.PI / 6)
      )
      ctx.moveTo(x1, y1)
      ctx.lineTo(
        x1 - headLength * Math.cos(arrowAngle + Math.PI / 6),
        y1 - headLength * Math.sin(arrowAngle + Math.PI / 6)
      )
      ctx.stroke()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawArrow()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', checkScrollPosition)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [loading])

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
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 48px auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1
            }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            style={{ marginBottom: '24px' }}
          >
            AI is Moving Fast. So Are We.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px'
            }}
          >
            Every day, new AI tools emerge. Every week, the bar rises. As students, we're not just learning—we're racing to stay ahead.
            That's why we built Forefront: <strong style={{ color: '#fff' }}>students teaching students</strong>, because nobody understands the learning curve better than those who just climbed it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: '#fff',
              color: '#000',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            100% Free • Student-Led • Real Skills
          </motion.div>
        </div>

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

        {/* Clean CTA Section - No Heavy Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: 'center',
            marginTop: '80px',
            position: 'relative'
          }}
        >
          <div style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: '16px',
            color: '#fff'
          }}>
            Ready to Dive Deeper?
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            These are just the beginning. Browse {modules.length > 0 ? 'all our' : 'our full collection of'} modules and start building the skills that matter.
          </p>

          {/* Clean CTA Button with minimal styling */}
          <Link
            id="cta-target"
            href="/modules"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              background: 'transparent',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Browse All Modules
          </Link>
        </motion.div>

        {/* Canvas for cursor arrow effect */}
        <canvas
          id="cta-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      </div>
    </div>
  )
}
