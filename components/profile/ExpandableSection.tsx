'use client'
import { useState, useRef, useEffect } from 'react'

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  maxCollapsedHeight?: number
}

export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  maxCollapsedHeight = 150
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [needsExpansion, setNeedsExpansion] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if content height exceeds max collapsed height
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight
      setNeedsExpansion(contentHeight > maxCollapsedHeight)
    }
  }, [children, maxCollapsedHeight])

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Section Title */}
      <h3 style={{
        fontSize: 'clamp(13px, 2vw, 15px)',
        fontWeight: 700,
        textTransform: 'lowercase',
        letterSpacing: '0.3px',
        color: '#000',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        {title}
      </h3>

      {/* Content Container */}
      <div style={{ position: 'relative' }}>
        <div
          ref={contentRef}
          style={{
            maxHeight: isExpanded ? '5000px' : `${maxCollapsedHeight}px`,
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
        >
          {children}
        </div>

        {/* Gradient Fade Overlay (only when collapsed and needs expansion) */}
        {!isExpanded && needsExpansion && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to bottom, rgba(250,250,250,0) 0%, rgba(250,250,250,0.7) 30%, rgba(250,250,250,0.95) 70%, rgba(250,250,250,1) 100%)',
            pointerEvents: 'none'
          }} />
        )}

        {/* Show More/Less Button */}
        {needsExpansion && (
          <div style={{
            background: '#fafafa',
            paddingTop: isExpanded ? '0' : '8px',
            position: 'relative',
            zIndex: 1
          }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                marginTop: isExpanded ? '16px' : '0',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 0',
                textDecoration: 'underline',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666'
              }}
            >
              {isExpanded ? '← show less' : 'show more →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
