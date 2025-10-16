'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StickyFooterCTAProps {
  onGetStarted: () => void
}

export function StickyFooterCTA({ onGetStarted }: StickyFooterCTAProps) {
  const { scrollYProgress } = useScroll()
  const [visible, setVisible] = useState(false)

  // Show sticky CTA after scrolling 30% down the page
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setVisible(latest > 0.3)
    })
    return unsubscribe
  }, [scrollYProgress])

  const y = useTransform(scrollYProgress, [0.3, 0.35], [100, 0])

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
        borderTop: '2px solid #333',
        padding: '16px 24px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.5px'
            }}>
              Ready to Start Learning?
            </div>
            <div style={{
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              color: '#999'
            }}>
              Join 1,250+ students • 100% Free • No credit card required
            </div>
          </div>

          {/* CTA button */}
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
              padding: '14px 32px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Get Started Free →
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
