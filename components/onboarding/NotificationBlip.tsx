'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Sun, BookOpen } from 'lucide-react'

interface NotificationBlipProps {
  isActive: boolean
  currentSlideIndex: number
}

interface Blip {
  id: string
  icon: React.ReactNode
  message: string
  targetId: string // ID attribute of the button/element
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  slideIndex: number // Which slide triggers this blip
}

const blipConfigs: Blip[] = [
  {
    id: 'sidebar-blip',
    icon: <BookOpen size={14} />,
    message: 'Track progress here!',
    targetId: 'sidebar-container',
    position: 'top-right',
    slideIndex: 1  // Slide 2: "Sidebar Navigation"
  },
  {
    id: 'ai-blip',
    icon: <Sparkles size={14} />,
    message: 'Ask AI questions!',
    targetId: 'ai-playground-btn',
    position: 'bottom-right',
    slideIndex: 2  // Slide 3: "AI Playground"
  },
  {
    id: 'notes-blip',
    icon: <MessageSquare size={14} />,
    message: 'Take notes here',
    targetId: 'notes-btn',
    position: 'bottom-right',
    slideIndex: 3  // Slide 4: "Notes Panel"
  },
  {
    id: 'theme-blip',
    icon: <Sun size={14} />,
    message: 'Customize your view',
    targetId: 'theme-btn',
    position: 'bottom-right',
    slideIndex: 6  // Slide 7: "Module Controls"
  }
]

export function NotificationBlip({ isActive, currentSlideIndex }: NotificationBlipProps) {
  const [activeBlips, setActiveBlips] = useState<string[]>([])
  const [blipPositions, setBlipPositions] = useState<{ [key: string]: { top: number, left: number } }>({})

  useEffect(() => {
    if (!isActive) return

    // Find blips that should show for this slide
    const blipsForSlide = blipConfigs.filter(b => b.slideIndex === currentSlideIndex)

    if (blipsForSlide.length === 0) {
      setActiveBlips([])
      return
    }

    // Calculate positions for each blip
    const positions: { [key: string]: { top: number, left: number } } = {}

    blipsForSlide.forEach(blip => {
      const targetElement = document.getElementById(blip.targetId)

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()

        // Calculate position based on config
        let top = 0
        let left = 0

        switch (blip.position) {
          case 'bottom-right':
            top = rect.bottom + 8
            left = rect.right - 120 // Offset for notification width
            break
          case 'bottom-left':
            top = rect.bottom + 8
            left = rect.left
            break
          case 'top-right':
            top = rect.top - 40
            left = rect.right - 120
            break
          case 'top-left':
            top = rect.top - 40
            left = rect.left
            break
        }

        positions[blip.id] = { top, left }
      }
    })

    setBlipPositions(positions)
    setActiveBlips(blipsForSlide.map(b => b.id))

    // Auto-hide after 3 seconds
    const timeout = setTimeout(() => {
      setActiveBlips([])
    }, 3000)

    return () => clearTimeout(timeout)
  }, [currentSlideIndex, isActive])

  if (!isActive) return null

  return (
    <AnimatePresence>
      {activeBlips.map(blipId => {
        const blip = blipConfigs.find(b => b.id === blipId)
        const position = blipPositions[blipId]

        if (!blip || !position) return null

        return (
          <motion.div
            key={blipId}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 10001,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                animation: 'gentle-pulse 2s ease-in-out infinite'
              }}
            >
              {blip.icon}
              {blip.message}
            </div>

            <style jsx>{`
              @keyframes gentle-pulse {
                0%, 100% {
                  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                }
                50% {
                  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
                }
              }
            `}</style>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}
