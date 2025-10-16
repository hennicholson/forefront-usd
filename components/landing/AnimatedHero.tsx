'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnimatedHeroProps {
  onGetStarted: () => void
}

export function AnimatedHero({ onGetStarted }: AnimatedHeroProps) {
  const [stats, setStats] = useState({
    students: 1250,
    modules: 24
  })

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          students: data.totalUsers || 1250,
          modules: data.totalModules || 24
        })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="section" style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="content center-text" style={{ maxWidth: '900px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="title-large"
          style={{ marginBottom: '24px' }}
        >
          [forefront]
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            marginBottom: '20px',
            fontSize: 'clamp(20px, 3.5vw, 28px)',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            textTransform: 'lowercase'
          }}
        >
          Students Teaching Students
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          AI is accelerating faster than ever. Don't get left behind. Learn from students who just mastered it—because we speak your language, we know your struggles, and we're all in this together.
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(20px, 4vw, 32px)',
            marginBottom: '40px',
            flexWrap: 'wrap',
            fontSize: 'clamp(13px, 2vw, 14px)',
            color: '#666',
            fontWeight: 600
          }}
        >
          <div>{stats.students.toLocaleString()}+ Students</div>
          <div>•</div>
          <div>{stats.modules} Modules</div>
          <div>•</div>
          <div>100% Free</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
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
        </motion.div>
      </div>
    </div>
  )
}
