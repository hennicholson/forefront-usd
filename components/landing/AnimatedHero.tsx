'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { SplineScene } from '@/components/ui/splite'
import type { Application } from '@splinetool/runtime'

interface AnimatedHeroProps {
  onGetStarted: () => void
}

export function AnimatedHero({ onGetStarted }: AnimatedHeroProps) {
  const [stats, setStats] = useState({
    students: 1250,
    modules: 24
  })
  const [splineApp, setSplineApp] = useState<Application | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      justifyContent: 'center',
      padding: '40px 20px',
      marginBottom: '0'
    }}>
      <Card ref={cardRef} className="w-full max-w-[1400px] h-[600px] bg-black/[0.96] relative overflow-hidden border-white/10">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="title-large"
              style={{ marginBottom: '24px' }}
            >
              [forefront]
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
              style={{
                marginBottom: '20px',
                letterSpacing: '-0.5px',
                textTransform: 'lowercase'
              }}
            >
              Students Teaching Students
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-neutral-300 max-w-lg"
              style={{
                fontSize: 'clamp(15px, 2.5vw, 18px)',
                marginBottom: '32px',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              AI is accelerating faster than ever. Don't get left behind. Learn from students who just mastered it—because we speak your language, we know your struggles, and we're all in this together.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                display: 'flex',
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
                ref={buttonRef}
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

          {/* Right content - 3D Scene */}
          <div className="flex-1 relative hidden md:block">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
              onLoad={setSplineApp}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
