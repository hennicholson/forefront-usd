'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface QAItem {
  question: string
  answer: string
}

const qaItems: QAItem[] = [
  {
    question: "IS IT FREE?",
    answer: "Yes, 100% free.|Forever. No catch."
  },
  {
    question: "WHO TEACHES?",
    answer: "Students who mastered|AI tools last month."
  },
  {
    question: "HOW LONG|ARE MODULES?",
    answer: "10-30 minutes.|Learn during lunch."
  },
  {
    question: "DO I NEED|EXPERIENCE?",
    answer: "Zero.|We start from the basics."
  },
  {
    question: "WHEN CAN|I START?",
    answer: "NOW.|[CLICK HERE]"
  },
  {
    question: "WHY FOREFRONT?",
    answer: "We speak your language.|No corporate BS."
  },
  {
    question: "WHAT WILL|I LEARN?",
    answer: "ChatGPT, Claude,|Midjourney, and more."
  },
  {
    question: "HOW MANY|STUDENTS?",
    answer: "1,250+ worldwide|and growing fast."
  }
]

interface FAQRotatorProps {
  onGetStarted?: () => void
}

export function FAQRotator({ onGetStarted }: FAQRotatorProps) {
  const lineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const isQuestionRef = useRef(true)

  useEffect(() => {
    if (!lineRef.current || !containerRef.current) return

    let timeline: gsap.core.Timeline | null = null

    const setLine = (text: string) => {
      if (!lineRef.current) return []

      lineRef.current.innerHTML = ''
      const chars: HTMLElement[] = []

      // Check viewport width for responsive line breaks
      const viewportWidth = window.innerWidth
      const shouldBreak = viewportWidth < 768 // Mobile breakpoint

      // Replace | with line breaks for smaller screens, remove for larger screens
      const processedText = shouldBreak
        ? text.replace(/\|/g, '\n')
        : text.replace(/\|/g, ' ')

      // Split by lines first (for line breaks)
      const lines = processedText.split('\n')

      lines.forEach((line, lineIndex) => {
        // Create a line wrapper
        const lineWrapper = document.createElement('div')
        lineWrapper.style.display = 'block'
        lineWrapper.style.textAlign = 'center'

        // Check if line contains clickable CTA and process it
        if (line.includes('[') && line.includes(']')) {
          // Split the line into parts: before CTA, CTA, and after CTA
          const beforeCTA = line.substring(0, line.indexOf('['))
          const ctaMatch = line.match(/\[(.*?)\]/)
          const ctaText = ctaMatch ? ctaMatch[1] : ''
          const afterCTA = line.substring(line.indexOf(']') + 1)

          // Process text before CTA
          if (beforeCTA) {
            const beforeWords = beforeCTA.trim().split(' ').filter(w => w)
            beforeWords.forEach((word) => {
              const wordSpan = document.createElement('span')
              wordSpan.style.display = 'inline-block'
              wordSpan.style.whiteSpace = 'nowrap'
              wordSpan.style.marginRight = '0.3em'

              Array.from(word).forEach(ch => {
                const span = document.createElement('span')
                span.className = 'char'
                span.textContent = ch
                span.style.display = 'inline-block'
                span.style.willChange = 'transform, opacity, filter'
                wordSpan.appendChild(span)
                chars.push(span)
              })

              lineWrapper.appendChild(wordSpan)
            })
          }

          // Create the entire CTA as one clickable element
          if (ctaText && onGetStarted) {
            const ctaSpan = document.createElement('span')
            ctaSpan.style.display = 'inline-block'
            ctaSpan.style.cursor = 'pointer'
            ctaSpan.style.borderBottom = '2px solid rgba(76, 175, 80, 0.8)'
            ctaSpan.style.paddingBottom = '2px'
            ctaSpan.style.transition = 'all 0.3s ease'
            ctaSpan.style.marginRight = afterCTA ? '0.3em' : '0'

            // Add hover effects to the entire CTA
            ctaSpan.addEventListener('click', onGetStarted)
            ctaSpan.addEventListener('mouseenter', () => {
              ctaSpan.style.borderColor = 'rgba(76, 175, 80, 1)'
              ctaSpan.style.transform = 'translateY(-2px)'
            })
            ctaSpan.addEventListener('mouseleave', () => {
              ctaSpan.style.borderColor = 'rgba(76, 175, 80, 0.8)'
              ctaSpan.style.transform = 'translateY(0)'
            })

            // Add all characters of CTA text (including spaces)
            Array.from(ctaText).forEach(ch => {
              const span = document.createElement('span')
              span.className = 'char'
              span.textContent = ch
              span.style.display = 'inline-block'
              span.style.willChange = 'transform, opacity, filter'
              span.style.color = '#4CAF50'
              span.style.fontWeight = '900'
              if (ch === ' ') {
                span.style.width = '0.3em' // Ensure space has width
              }
              ctaSpan.appendChild(span)
              chars.push(span)
            })

            lineWrapper.appendChild(ctaSpan)
          }

          // Process text after CTA
          if (afterCTA) {
            const afterWords = afterCTA.trim().split(' ').filter(w => w)
            afterWords.forEach((word, idx) => {
              const wordSpan = document.createElement('span')
              wordSpan.style.display = 'inline-block'
              wordSpan.style.whiteSpace = 'nowrap'
              wordSpan.style.marginRight = idx < afterWords.length - 1 ? '0.3em' : '0'

              Array.from(word).forEach(ch => {
                const span = document.createElement('span')
                span.className = 'char'
                span.textContent = ch
                span.style.display = 'inline-block'
                span.style.willChange = 'transform, opacity, filter'
                wordSpan.appendChild(span)
                chars.push(span)
              })

              lineWrapper.appendChild(wordSpan)
            })
          }
        } else {
          // No CTA in this line, process normally
          const words = line.split(' ')
          words.forEach((word, wordIndex) => {
            if (!word) return

            const wordSpan = document.createElement('span')
            wordSpan.style.display = 'inline-block'
            wordSpan.style.whiteSpace = 'nowrap'
            wordSpan.style.marginRight = wordIndex < words.length - 1 ? '0.3em' : '0'

            Array.from(word).forEach(ch => {
              const span = document.createElement('span')
              span.className = 'char'
              span.textContent = ch
              span.style.display = 'inline-block'
              span.style.willChange = 'transform, opacity, filter'
              wordSpan.appendChild(span)
              chars.push(span)
            })

            lineWrapper.appendChild(wordSpan)
          })
        }

        lineRef.current!.appendChild(lineWrapper)
      })

      return chars
    }

    const playNext = () => {
      const currentItem = qaItems[indexRef.current % qaItems.length]
      const text = isQuestionRef.current ? currentItem.question : currentItem.answer
      const chars = setLine(text)

      // Timing configuration
      const durIn = isQuestionRef.current ? 0.8 : 0.6  // Questions fade in slower
      const durOut = 0.5
      const hold = isQuestionRef.current ? 1.8 : 2.5  // Answers stay longer

      // Create new timeline
      timeline = gsap.timeline()

      // Fade in animation
      timeline.fromTo(
        chars,
        {
          y: 30,
          opacity: 0,
          filter: 'blur(10px)',
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: durIn,
          ease: 'power3.out',
          stagger: 0.02
        }
      )

      // Hold, then fade out
      timeline.to(chars, {
        y: -25,
        opacity: 0,
        filter: 'blur(12px)',
        scale: 0.98,
        duration: durOut,
        ease: 'power2.in',
        stagger: 0.015,
        delay: hold,
        onComplete: () => {
          // Toggle between question and answer
          if (!isQuestionRef.current) {
            indexRef.current++ // Move to next Q&A pair after showing answer
          }
          isQuestionRef.current = !isQuestionRef.current
          playNext()
        }
      })
    }

    // Start the animation
    playNext()

    return () => {
      // Cleanup
      if (timeline) {
        timeline.kill()
      }
      const chars = lineRef.current?.querySelectorAll('.char')
      if (chars) {
        gsap.killTweensOf(chars)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="faq-section"
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '80px 20px',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120%',
        height: '120%',
        background: 'radial-gradient(circle at center, rgba(76, 175, 80, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      {/* Section label */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '14px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'rgba(255, 255, 255, 0.3)'
      }}>
        Frequently Asked
      </div>

      {/* Main rotating text */}
      <div
        ref={lineRef}
        className="faq-line"
        style={{
          fontSize: 'clamp(24px, 5vw, 72px)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: '#fff',
          textAlign: 'center',
          maxWidth: '90%',
          margin: '0 auto',
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.8)',
          wordWrap: 'break-word',
          hyphens: 'manual'
        }}
      />

      {/* Bottom hint */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          background: 'rgba(76, 175, 80, 0.6)',
          borderRadius: '50%',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        Auto-cycling through {qaItems.length} questions
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}