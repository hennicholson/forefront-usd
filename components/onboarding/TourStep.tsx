'use client'
import { useState, useEffect } from 'react'

interface TourStepProps {
  onNext: () => void
}

const TOUR_SLIDES = [
  {
    title: 'learn practical ai skills',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    description: 'access curated modules on ai tools, workflows, and real-world applications',
    features: [
      'interactive slide-based learning',
      'track your progress',
      'take notes as you learn',
      'earn achievements'
    ]
  },
  {
    title: 'connect with learners',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    description: 'join a network of students learning together',
    features: [
      'see who\'s learning what',
      'discover learning partners',
      'topic-based communities',
      'collaborative learning'
    ]
  },
  {
    title: 'build your profile',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    description: 'showcase your skills and experience professionally',
    features: [
      'comprehensive resume builder',
      'add experience & projects',
      'display your achievements',
      'connect with opportunities'
    ]
  },
  {
    title: 'share & collaborate',
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    description: 'engage with the community through activity feeds',
    features: [
      'share your learning journey',
      'ask questions & get help',
      'topic-based discussions',
      'mention and connect'
    ]
  }
]

export function TourStep({ onNext }: TourStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isPaused) return

    const duration = 5000 // 5 seconds per slide
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Auto advance to next slide
          if (currentSlide < TOUR_SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1)
          }
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [currentSlide, isPaused])

  const handleNext = () => {
    if (currentSlide < TOUR_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1)
      setProgress(0)
    } else {
      onNext()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
      setProgress(0)
    }
  }

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  const slide = TOUR_SLIDES[currentSlide]

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        marginBottom: '32px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        platform tour · {currentSlide + 1}/{TOUR_SLIDES.length}
      </div>

      {/* Slide Content */}
      <div
        style={{
          background: 'rgba(250, 250, 250, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '3px solid rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          padding: '48px',
          marginBottom: '32px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          transition: 'opacity 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Auto-progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #000 0%, #333 100%)',
            transition: 'width 0.05s linear'
          }} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingBottom: '20px'
        }}>
          <div style={{
            marginBottom: '24px',
            color: '#000',
            display: 'flex',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {slide.icon}
          </div>

          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            marginBottom: '16px',
            color: '#000',
            textAlign: 'center',
            flexShrink: 0
          }}>
            {slide.title}
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px auto',
            textAlign: 'center',
            flexShrink: 0
          }}>
            {slide.description}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            textAlign: 'left',
            flex: '1',
            alignContent: 'start'
          }}>
          {slide.features.map((feature, i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '2px solid rgba(224, 224, 224, 0.5)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: '#000', fontWeight: 700 }}>✓</span>
              {feature}
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {TOUR_SLIDES.map((slideItem, i) => (
          <div
            key={i}
            onClick={() => handleSlideClick(i)}
            onMouseEnter={(e) => {
              if (i !== currentSlide) {
                e.currentTarget.style.transform = 'scale(1.2)'
                e.currentTarget.style.background = '#666'
              }
            }}
            onMouseLeave={(e) => {
              if (i !== currentSlide) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = '#e0e0e0'
              }
            }}
            style={{
              position: 'relative',
              width: currentSlide === i ? '48px' : '12px',
              height: '12px',
              background: currentSlide === i ? '#000' : '#e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
          >
            {currentSlide === i && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                background: 'rgba(255, 255, 255, 0.3)',
                transition: 'width 0.05s linear'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {currentSlide > 0 && (
          <button
            onClick={handlePrev}
            style={{
              padding: '14px 32px',
              background: '#fff',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.color = '#666'
            }}
          >
            ← previous
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            padding: '14px 32px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          {currentSlide < TOUR_SLIDES.length - 1 ? 'next →' : 'finish tour →'}
        </button>
      </div>

      <button
        onClick={onNext}
        style={{
          marginTop: '24px',
          background: 'none',
          border: 'none',
          color: '#999',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'underline',
          cursor: 'pointer',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        skip tour
      </button>
    </div>
  )
}
