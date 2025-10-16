'use client'
import { useState, useRef, useEffect } from 'react'

interface ImageCropperProps {
  imageUrl: string
  type: 'profile' | 'banner'
  onComplete: (croppedImage: string) => void
  onCancel: () => void
}

export function ImageCropper({ imageUrl, type, onComplete, onCancel }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Store ImageBitmap (handles EXIF orientation automatically)
  const imageBitmapRef = useRef<ImageBitmap | null>(null)
  const imageNaturalSizeRef = useRef({ width: 0, height: 0 })
  const minZoomRef = useRef(1)

  // Drag/touch state
  const dragStartRef = useRef({ x: 0, y: 0 })
  const initialPinchDistanceRef = useRef(0)
  const initialZoomRef = useRef(1)

  // Responsive sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const containerSize = type === 'banner'
    ? (isMobile
        ? { width: Math.min(window.innerWidth - 40, 600), height: Math.min(window.innerWidth - 40, 600) / 2 }
        : { width: 800, height: 400 })
    : (isMobile
        ? { width: Math.min(window.innerWidth - 40, 400), height: Math.min(window.innerWidth - 40, 400) }
        : { width: 500, height: 500 })

  const cropFrame = type === 'banner'
    ? (isMobile
        ? { width: containerSize.width, height: containerSize.width / 4 }
        : { width: 800, height: 200 })
    : (isMobile
        ? { width: containerSize.width, height: containerSize.width }
        : { width: 400, height: 400 })

  const outputSize = type === 'banner'
    ? { width: 1200, height: 300 }
    : { width: 400, height: 400 }

  // Load image with EXIF handling
  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // createImageBitmap automatically handles EXIF orientation
        const bitmap = await createImageBitmap(blob, {
          imageOrientation: 'from-image'
        })

        imageBitmapRef.current = bitmap
        imageNaturalSizeRef.current = { width: bitmap.width, height: bitmap.height }

        // Calculate minimum zoom to cover crop frame
        const minZoomX = cropFrame.width / bitmap.width
        const minZoomY = cropFrame.height / bitmap.height
        const calculatedMinZoom = Math.max(minZoomX, minZoomY)

        minZoomRef.current = calculatedMinZoom
        setZoom(calculatedMinZoom)

        // Center image
        const displayWidth = bitmap.width * calculatedMinZoom
        const displayHeight = bitmap.height * calculatedMinZoom

        setPosition({
          x: (containerSize.width - displayWidth) / 2,
          y: (containerSize.height - displayHeight) / 2
        })

        setImageLoaded(true)
      } catch (error) {
        console.error('Error loading image:', error)
      }
    }

    loadImage()

    return () => {
      if (imageBitmapRef.current) {
        imageBitmapRef.current.close()
      }
    }
  }, [imageUrl])

  // Render canvas whenever position or zoom changes
  useEffect(() => {
    if (!imageLoaded || !previewCanvasRef.current || !imageBitmapRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fill with black background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw image with current transform
    const displayWidth = imageNaturalSizeRef.current.width * zoom
    const displayHeight = imageNaturalSizeRef.current.height * zoom

    ctx.drawImage(
      imageBitmapRef.current,
      position.x,
      position.y,
      displayWidth,
      displayHeight
    )

    // Draw darkened overlay (areas outside crop frame)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'

    const frameX = (containerSize.width - cropFrame.width) / 2
    const frameY = (containerSize.height - cropFrame.height) / 2

    // Top
    ctx.fillRect(0, 0, canvas.width, frameY)
    // Bottom
    ctx.fillRect(0, frameY + cropFrame.height, canvas.width, canvas.height - (frameY + cropFrame.height))
    // Left
    ctx.fillRect(0, frameY, frameX, cropFrame.height)
    // Right
    ctx.fillRect(frameX + cropFrame.width, frameY, canvas.width - (frameX + cropFrame.width), cropFrame.height)

    // Draw crop frame border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3

    if (type === 'profile') {
      // Circular frame
      ctx.beginPath()
      ctx.arc(
        frameX + cropFrame.width / 2,
        frameY + cropFrame.height / 2,
        cropFrame.width / 2,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    } else {
      // Rectangular frame
      ctx.strokeRect(frameX, frameY, cropFrame.width, cropFrame.height)
    }
  }, [imageLoaded, zoom, position])

  // Constrain position
  const constrainPosition = (x: number, y: number, currentZoom: number) => {
    const scaledWidth = imageNaturalSizeRef.current.width * currentZoom
    const scaledHeight = imageNaturalSizeRef.current.height * currentZoom

    const frameX = (containerSize.width - cropFrame.width) / 2
    const frameY = (containerSize.height - cropFrame.height) / 2

    const maxX = frameX
    const minX = frameX + cropFrame.width - scaledWidth
    const maxY = frameY
    const minY = frameY + cropFrame.height - scaledHeight

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }

  // Event handlers
  useEffect(() => {
    const container = containerRef.current
    if (!container || !imageLoaded) return

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const newPos = constrainPosition(
        e.clientX - dragStartRef.current.x,
        e.clientY - dragStartRef.current.y,
        zoom
      )
      setPosition(newPos)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1) {
        setIsDragging(true)
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        }
      } else if (e.touches.length === 2) {
        setIsDragging(false)
        initialPinchDistanceRef.current = getTouchDistance(e.touches)
        initialZoomRef.current = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && isDragging) {
        const newPos = constrainPosition(
          e.touches[0].clientX - dragStartRef.current.x,
          e.touches[0].clientY - dragStartRef.current.y,
          zoom
        )
        setPosition(newPos)
      } else if (e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches)
        if (initialPinchDistanceRef.current > 0) {
          const scale = currentDistance / initialPinchDistanceRef.current
          const newZoom = Math.max(minZoomRef.current, Math.min(3, initialZoomRef.current * scale))

          const frameX = (containerSize.width - cropFrame.width) / 2
          const frameY = (containerSize.height - cropFrame.height) / 2
          const frameCenterX = frameX + cropFrame.width / 2
          const frameCenterY = frameY + cropFrame.height / 2

          const pointX = (frameCenterX - position.x) / zoom
          const pointY = (frameCenterY - position.y) / zoom

          const newPos = constrainPosition(
            frameCenterX - pointX * newZoom,
            frameCenterY - pointY * newZoom,
            newZoom
          )

          setZoom(newZoom)
          setPosition(newPos)
        }
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      initialPinchDistanceRef.current = 0
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const newZoom = Math.max(minZoomRef.current, Math.min(3, zoom + delta))

      const frameX = (containerSize.width - cropFrame.width) / 2
      const frameY = (containerSize.height - cropFrame.height) / 2
      const frameCenterX = frameX + cropFrame.width / 2
      const frameCenterY = frameY + cropFrame.height / 2

      const pointX = (frameCenterX - position.x) / zoom
      const pointY = (frameCenterY - position.y) / zoom

      const newPos = constrainPosition(
        frameCenterX - pointX * newZoom,
        frameCenterY - pointY * newZoom,
        newZoom
      )

      setZoom(newZoom)
      setPosition(newPos)
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)

      container.removeEventListener('wheel', handleWheel)
    }
  }, [imageLoaded, isDragging, zoom, position])

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(minZoomRef.current, Math.min(3, newZoom))

    const frameX = (containerSize.width - cropFrame.width) / 2
    const frameY = (containerSize.height - cropFrame.height) / 2
    const frameCenterX = frameX + cropFrame.width / 2
    const frameCenterY = frameY + cropFrame.height / 2

    const pointX = (frameCenterX - position.x) / zoom
    const pointY = (frameCenterY - position.y) / zoom

    const newPos = constrainPosition(
      frameCenterX - pointX * clampedZoom,
      frameCenterY - pointY * clampedZoom,
      clampedZoom
    )

    setZoom(clampedZoom)
    setPosition(newPos)
  }

  // Export cropped image
  const cropImage = () => {
    if (!exportCanvasRef.current || !imageBitmapRef.current) return

    const canvas = exportCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = outputSize.width
    canvas.height = outputSize.height

    const frameX = (containerSize.width - cropFrame.width) / 2
    const frameY = (containerSize.height - cropFrame.height) / 2

    // Calculate source coordinates in original image
    const sourceX = (frameX - position.x) / zoom
    const sourceY = (frameY - position.y) / zoom
    const sourceWidth = cropFrame.width / zoom
    const sourceHeight = cropFrame.height / zoom

    // Draw to export canvas at output resolution
    ctx.drawImage(
      imageBitmapRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize.width,
      outputSize.height
    )

    onComplete(canvas.toDataURL('image/jpeg', 0.92))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '20px' : '40px',
        maxWidth: type === 'banner' ? '950px' : '650px',
        width: '100%',
        maxHeight: '95vh',
        overflow: 'auto',
        border: '3px solid #000'
      }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? '20px' : '32px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            marginBottom: '8px',
            color: '#000'
          }}>
            crop {type === 'banner' ? 'banner' : 'profile picture'}
          </h2>
          <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#666', margin: 0 }}>
            {isMobile ? 'drag to move • pinch to zoom' : 'drag to reposition • scroll to zoom'}
          </p>
        </div>

        {/* Canvas Preview */}
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: `${containerSize.width}px`,
              height: `${containerSize.height}px`,
              margin: '0 auto',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: '8px',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <canvas
              ref={previewCanvasRef}
              width={containerSize.width}
              height={containerSize.height}
              style={{
                display: 'block',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        </div>

        {/* Zoom Control */}
        <div style={{
          marginBottom: isMobile ? '20px' : '32px',
          maxWidth: '500px',
          margin: `0 auto ${isMobile ? '20px' : '32px'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666'
            }}>zoom</span>
            <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, color: '#000' }}>
              {Math.round((zoom / minZoomRef.current) * 100)}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
            <button
              onClick={() => handleZoomChange(zoom - 0.1)}
              disabled={zoom <= minZoomRef.current}
              style={{
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                background: zoom <= minZoomRef.current ? '#f5f5f5' : '#fff',
                color: zoom <= minZoomRef.current ? '#ccc' : '#666',
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 600,
                cursor: zoom <= minZoomRef.current ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >−</button>
            <input
              type="range"
              min={minZoomRef.current}
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
                accentColor: '#000'
              }}
            />
            <button
              onClick={() => handleZoomChange(zoom + 0.1)}
              disabled={zoom >= 3}
              style={{
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                background: zoom >= 3 ? '#f5f5f5' : '#fff',
                color: zoom >= 3 ? '#ccc' : '#666',
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 600,
                cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >+</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              background: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 700,
              textTransform: 'lowercase',
              cursor: 'pointer',
              color: '#666',
              transition: 'all 0.2s ease'
            }}
          >cancel</button>
          <button
            onClick={cropImage}
            style={{
              padding: isMobile ? '12px 32px' : '14px 40px',
              background: '#000',
              border: 'none',
              borderRadius: '10px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 700,
              textTransform: 'lowercase',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
          >save & apply</button>
        </div>
      </div>

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
