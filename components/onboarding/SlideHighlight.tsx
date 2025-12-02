'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SlideHighlightProps {
  isActive: boolean
  currentSlideIndex: number
}

export function SlideHighlight({ isActive, currentSlideIndex }: SlideHighlightProps) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [showHighlight, setShowHighlight] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Highlight only the slide title when navigating
  const getTitleElement = useCallback(() => {
    // Get the main content h1 (not the header title)
    const mainContent = document.querySelector('div.max-w-5xl')
    if (mainContent) {
      return mainContent.querySelector('h1')
    }
    return null
  }, [])

  // Trigger highlight animation when slide changes
  useEffect(() => {
    if (!isActive) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Small delay to let new content render
    timeoutRef.current = setTimeout(() => {
      const titleElement = getTitleElement()

      if (titleElement) {
        const rect = titleElement.getBoundingClientRect()
        setHighlightRect(rect)
        setShowHighlight(true)

        // Hide highlight after 1 second (shorter, less intrusive)
        timeoutRef.current = setTimeout(() => {
          setShowHighlight(false)
        }, 1000)
      }
    }, 200)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentSlideIndex, isActive, getTitleElement])

  if (!isActive || !showHighlight || !highlightRect) return null

  return (
    <AnimatePresence>
      {showHighlight && highlightRect && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9998 // Below tutorial overlay
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: highlightRect.left - 8,
              top: highlightRect.top - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              border: '2px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.03)',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)',
              animation: 'shimmer 1s ease-in-out'
            }}
          />

          <style jsx>{`
            @keyframes shimmer {
              0%, 100% {
                box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
              }
              50% {
                box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
}
