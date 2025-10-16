'use client'
import { useState, useEffect } from 'react'

interface Stats {
  totalUsers: number
  totalModules: number
  completedLessons: number
  countriesReached: number
}

export function CommunityStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalModules: 0,
    completedLessons: 0,
    countriesReached: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        animateStats(data)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
      // Set fallback stats
      animateStats({
        totalUsers: 1250,
        totalModules: 24,
        completedLessons: 8500,
        countriesReached: 45
      })
    } finally {
      setLoading(false)
    }
  }

  const animateStats = (targetStats: Stats) => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        totalModules: Math.floor(targetStats.totalModules * progress),
        completedLessons: Math.floor(targetStats.completedLessons * progress),
        countriesReached: Math.floor(targetStats.countriesReached * progress)
      })

      if (currentStep >= steps) {
        setStats(targetStats)
        clearInterval(interval)
      }
    }, stepDuration)
  }

  const statItems = [
    {
      value: stats.totalUsers.toLocaleString(),
      label: 'active learners',
      suffix: '+'
    },
    {
      value: stats.totalModules.toLocaleString(),
      label: 'ai modules',
      suffix: ''
    },
    {
      value: stats.completedLessons.toLocaleString(),
      label: 'lessons completed',
      suffix: '+'
    },
    {
      value: stats.countriesReached.toLocaleString(),
      label: 'countries',
      suffix: ''
    }
  ]

  return (
    <div className="section" style={{
      paddingTop: '100px',
      paddingBottom: '100px',
      background: '#000'
    }}>
      <div className="content">
        <div className="section-label" style={{
          textAlign: 'center',
          marginBottom: '64px',
          color: '#666'
        }}>
          our growing community
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {statItems.map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '32px',
                background: '#1a1a1a',
                borderRadius: '16px',
                border: '2px solid #2a2a2a',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#fff'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1,
                marginBottom: '16px',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {loading ? '...' : stat.value}{stat.suffix}
              </div>
              <div style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 600
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
