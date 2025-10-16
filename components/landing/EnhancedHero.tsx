'use client'
import { useState, useEffect } from 'react'

interface EnhancedHeroProps {
  onGetStarted: () => void
  onWatchDemo?: () => void
}

export function EnhancedHero({ onGetStarted, onWatchDemo }: EnhancedHeroProps) {
  const [stats, setStats] = useState({
    students: 0,
    modules: 0,
    hours: 0
  })

  useEffect(() => {
    // Fetch platform stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        animateStats({
          students: data.totalUsers || 1250,
          modules: data.totalModules || 24,
          hours: Math.floor((data.completedLessons || 8500) / 60) // Convert lessons to approximate hours
        })
      })
      .catch(() => {
        // Fallback stats
        animateStats({
          students: 1250,
          modules: 24,
          hours: 5000
        })
      })
  }, [])

  const animateStats = (targetStats: typeof stats) => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        students: Math.floor(targetStats.students * progress),
        modules: Math.floor(targetStats.modules * progress),
        hours: Math.floor(targetStats.hours * progress)
      })

      if (currentStep >= steps) {
        setStats(targetStats)
        clearInterval(interval)
      }
    }, stepDuration)
  }

  return (
    <div className="section" style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '60px',
      paddingBottom: '40px'
    }}>
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'pulse 8s ease-in-out infinite'
      }} />

      <div className="content center-text" style={{
        maxWidth: '900px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="title-large" style={{ marginBottom: '24px' }}>
          [forefront]
        </div>

        <div className="subtitle" style={{
          marginBottom: '20px',
          fontSize: 'clamp(20px, 3.5vw, 28px)',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          textTransform: 'lowercase'
        }}>
          students teaching students
        </div>

        <div style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)',
          color: '#666',
          maxWidth: '550px',
          margin: '0 auto 32px auto',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Learn practical AI skills from fellow students. Build your network. Advance your career.
        </div>

        {/* Compact inline stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(20px, 4vw, 32px)',
          marginBottom: '40px',
          flexWrap: 'wrap',
          fontSize: 'clamp(13px, 2vw, 14px)',
          color: '#666',
          fontWeight: 600
        }}>
          <div>{stats.students.toLocaleString()}+ Students</div>
          <div>•</div>
          <div>{stats.modules} Modules</div>
          <div>•</div>
          <div>100% Free</div>
        </div>

        {/* Single primary CTA */}
        <button
          onClick={onGetStarted}
          className="btn btn-primary"
          style={{
            fontSize: 'clamp(15px, 2vw, 17px)',
            padding: '20px 48px',
            background: '#fff',
            color: '#000',
            border: 'none'
          }}
        >
          Start Learning Free →
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
