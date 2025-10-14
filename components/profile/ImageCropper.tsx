'use client'
import { useState, useRef, useEffect } from 'react'

interface ImageCropperProps {
  imageUrl: string
  type: 'profile' | 'banner'
  onComplete: (position: { x: number; y: number }) => void
  onCancel: () => void
}

export function ImageCropper({ imageUrl, type, onComplete, onCancel }: ImageCropperProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const aspectRatio = type === 'banner' ? 4 / 1 : 1
  const previewSize = type === 'banner' ? { width: 600, height: 150 } : { width: 200, height: 200 }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...position }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100

      setPosition({
        x: Math.max(0, Math.min(100, startPos.x + deltaX)),
        y: Math.max(0, Math.min(100, startPos.y + deltaY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '700px',
        width: '100%',
        border: '3px solid #000'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            marginBottom: '8px'
          }}>
            crop {type === 'banner' ? 'banner' : 'profile picture'}
          </h2>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Drag the image to reposition. The preview shows what will be displayed.
          </p>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '24px' }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            style={{
              position: 'relative',
              width: `${previewSize.width}px`,
              height: `${previewSize.height}px`,
              margin: '0 auto',
              borderRadius: type === 'profile' ? '50%' : '12px',
              overflow: 'hidden',
              border: '3px solid #000',
              cursor: isDragging ? 'grabbing' : 'grab',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: `${position.x}% ${position.y}%`,
              pointerEvents: 'none'
            }} />
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#999',
            marginTop: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            {isDragging ? 'dragging...' : 'click and drag to adjust'}
          </p>
        </div>

        {/* Slider Controls */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666',
              marginBottom: '8px'
            }}>
              Horizontal Position
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.x}
              onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666',
              marginBottom: '8px'
            }}>
              Vertical Position
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              background: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              color: '#666',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.color = '#666'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onComplete(position)}
            style={{
              padding: '12px 24px',
              background: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000'
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
