'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check } from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'navigate' | 'none' // What action progresses to next step
  highlightPulse?: boolean
}

interface TutorialOverlayProps {
  steps: TutorialStep[]
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
  currentSlideIndex: number
}

export function TutorialOverlay({
  steps,
  isActive,
  onComplete,
  onSkip,
  currentSlideIndex
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const targetElementRef = useRef<Element | null>(null)
  const rafRef = useRef<number | null>(null)

  const step = steps[currentStep]

  // Debounced position update using requestAnimationFrame
  const updatePosition = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Schedule update on next animation frame
    rafRef.current = requestAnimationFrame(() => {
      if (!step) return

      const target = document.querySelector(step.targetSelector)

      if (target && target instanceof Element) {
        targetElementRef.current = target
        const rect = target.getBoundingClientRect()

        // Only update if position actually changed (prevents unnecessary re-renders)
        setTargetRect(prevRect => {
          if (!prevRect ||
              Math.abs(prevRect.top - rect.top) > 1 ||
              Math.abs(prevRect.left - rect.left) > 1 ||
              Math.abs(prevRect.width - rect.width) > 1 ||
              Math.abs(prevRect.height - rect.height) > 1) {
            return rect
          }
          return prevRect
        })
      } else {
        // Element not found
        console.warn(`[Tutorial] Element not found: ${step.targetSelector}`)
        targetElementRef.current = null
        setTargetRect(null)
      }
    })
  }, [step])

  // Update target element position - simplified, no MutationObserver
  useEffect(() => {
    if (!isActive || !step) return

    // Initial position update with small delay for DOM to settle
    const initialTimeout = setTimeout(updatePosition, 100)

    // Use ResizeObserver only on the specific target element
    const target = document.querySelector(step.targetSelector)

    if (target) {
      resizeObserverRef.current = new ResizeObserver(updatePosition)
      resizeObserverRef.current.observe(target)
    } else {
      console.warn(`[Tutorial] Target not found on mount: ${step.targetSelector}`)
    }

    // Listen to window resize only (removed scroll listener - causes glitching)
    window.addEventListener('resize', updatePosition)

    return () => {
      clearTimeout(initialTimeout)
      window.removeEventListener('resize', updatePosition)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [isActive, step, currentSlideIndex, updatePosition])

  // Detect user actions to progress tutorial
  useEffect(() => {
    if (!isActive || !step) return

    const handleAction = (e: Event) => {
      const target = e.target as HTMLElement
      const tutorialTarget = document.querySelector(step.targetSelector)

      // Check if user clicked the highlighted element
      if (tutorialTarget && (tutorialTarget === target || tutorialTarget.contains(target))) {
        if (step.action === 'click') {
          nextStep()
        }
      }
    }

    if (step.action === 'click') {
      document.addEventListener('click', handleAction, true)
    }

    return () => {
      document.removeEventListener('click', handleAction, true)
    }
  }, [isActive, step])

  // Check for slide navigation
  useEffect(() => {
    if (!isActive || !step) return

    if (step.action === 'navigate' && currentSlideIndex > 0) {
      // User navigated to a different slide
      nextStep()
    }
  }, [currentSlideIndex, isActive, step])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleted(true)
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }

  const skipTutorial = () => {
    onSkip()
  }

  if (!isActive) return null

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const padding = 20
    const tooltipWidth = 400
    const tooltipHeight = 200

    switch (step.position) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)'
        }
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)'
        }
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)'
        }
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  return (
    <AnimatePresence>
      {!isCompleted && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          {/* Dark overlay with spotlight cutout */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Clickable area for highlighted element */}
          {targetRect && (
            <div
              style={{
                position: 'absolute',
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                pointerEvents: 'auto', // Allow clicks through to the element
                zIndex: 10000
              }}
            />
          )}

          {/* Highlighted element border with pulse */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                border: '3px solid #8b5cf6',
                borderRadius: '12px',
                boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.2)',
                pointerEvents: 'none',
                animation: step.highlightPulse !== false ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            />
          )}

          {/* Tooltip bubble */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              ...getTooltipPosition(),
              maxWidth: '400px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Step counter */}
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#a78bfa',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '12px'
            }}>
              {step.title}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#e0e7ff',
              marginBottom: '20px'
            }}>
              {step.description}
            </p>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={skipTutorial}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #4c1d95',
                  borderRadius: '8px',
                  color: '#c4b5fd',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(76, 29, 149, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Skip Tutorial
              </button>

              {step.action === 'none' && (
                <button
                  onClick={nextStep}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Action hint */}
            {step.action === 'click' && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center'
              }}>
                👆 Click the highlighted element to continue
              </div>
            )}

            {step.action === 'navigate' && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center'
              }}>
                📚 Click any slide in the sidebar to continue
              </div>
            )}
          </motion.div>

          {/* Completion checkmark */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Check size={50} color="white" strokeWidth={3} />
            </motion.div>
          )}

          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
              }
              50% {
                box-shadow: 0 0 0 12px rgba(139, 92, 246, 0.1);
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
}
