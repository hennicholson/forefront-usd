'use client'
import { useRef, useState } from 'react'
import { WorkflowNode as WorkflowNodeType } from '@/lib/workflows/workflow-types'

interface WorkflowNodeProps {
  node: WorkflowNodeType
  isSelected: boolean
  editable: boolean
  onDragStart: () => void
  onDrag: (x: number, y: number) => void
  onDragEnd: () => void
  onConnectionStart: () => void
  onConnectionEnd: () => void
  onClick: () => void
}

export function WorkflowNode({
  node,
  isSelected,
  editable,
  onDragStart,
  onDrag,
  onDragEnd,
  onConnectionStart,
  onConnectionEnd,
  onClick
}: WorkflowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable) return
    e.stopPropagation()

    const canvas = nodeRef.current?.parentElement
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(canvas)
    const transform = computedStyle.transform

    // Extract scale from transform matrix
    let scale = 1
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat)
        scale = values[0]
      }
    }

    const clickX = (e.clientX - rect.left) / scale
    const clickY = (e.clientY - rect.top) / scale

    setDragOffset({
      x: clickX - node.position.x,
      y: clickY - node.position.y
    })

    setIsDragging(true)
    onDragStart()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !nodeRef.current) return

    // Get the canvas container to account for zoom and pan
    const canvas = nodeRef.current.parentElement
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(canvas)
    const transform = computedStyle.transform

    // Extract scale from transform matrix
    let scale = 1
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat)
        scale = values[0] // first value is scaleX
      }
    }

    // Calculate position relative to canvas, accounting for scale
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    onDrag(x - dragOffset.x, y - dragOffset.y)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      onDragEnd()
    }
  }

  // Add global mouse listeners when dragging
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  } else {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const getNodeIcon = () => {
    switch (node.type) {
      case 'tool': return '🔧'
      case 'prompt': return '💬'
      case 'screenshot': return '📸'
      case 'action': return '⚡'
      case 'decision': return '🔀'
      case 'note': return '📝'
      default: return '📌'
    }
  }

  const getNodeColor = () => {
    switch (node.type) {
      case 'tool': return '#fff'
      case 'prompt': return '#fff'
      case 'screenshot': return '#fff'
      case 'action': return '#fff'
      case 'decision': return '#fff'
      case 'note': return '#fff'
      default: return '#fff'
    }
  }

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: editable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
    >
      {/* Main Node Circle/Box */}
      <div style={{
        width: node.type === 'prompt' || node.type === 'screenshot' ? '200px' : '80px',
        minHeight: node.type === 'prompt' || node.type === 'screenshot' ? 'auto' : '80px',
        background: '#0a0a0a',
        border: `2px solid ${isSelected ? '#fff' : '#333'}`,
        borderRadius: node.type === 'prompt' || node.type === 'screenshot' ? '12px' : '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: node.type === 'prompt' || node.type === 'screenshot' ? '16px' : '0',
        boxShadow: isSelected ? '0 0 0 4px rgba(255,255,255,0.1)' : '0 2px 8px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
        position: 'relative'
      }}>
        {/* Icon for circular nodes */}
        {node.type !== 'prompt' && node.type !== 'screenshot' && (
          <span style={{ fontSize: '32px' }}>{getNodeIcon()}</span>
        )}

        {/* Prompt content */}
        {node.type === 'prompt' && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>{getNodeIcon()}</span>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {node.title}
              </div>
            </div>
            {node.data.promptText && (
              <div style={{
                padding: '12px',
                background: '#000',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'Monaco, monospace',
                color: '#999',
                lineHeight: 1.5,
                maxHeight: '100px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {node.data.promptText.substring(0, 100)}...
              </div>
            )}
          </div>
        )}

        {/* Screenshot content */}
        {node.type === 'screenshot' && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>{getNodeIcon()}</span>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {node.title}
              </div>
            </div>
            {node.data.imageUrl && (
              <img
                src={node.data.imageUrl}
                alt={node.data.imageCaption || 'Screenshot'}
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #1a1a1a'
                }}
              />
            )}
          </div>
        )}

        {/* Connection Points */}
        {editable && (
          <>
            {/* Input connection point (left) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                onConnectionEnd()
              }}
              style={{
                position: 'absolute',
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                background: '#666',
                border: '2px solid #0a0a0a',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#666'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            />

            {/* Output connection point (right) */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation()
                onConnectionStart()
              }}
              style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                background: '#666',
                border: '2px solid #0a0a0a',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#666'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            />
          </>
        )}
      </div>

      {/* Label below node */}
      <div style={{
        marginTop: '12px',
        textAlign: 'center',
        maxWidth: '140px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {node.type === 'prompt' || node.type === 'screenshot' ? '' : node.title}
        </div>
        {node.description && node.type !== 'prompt' && node.type !== 'screenshot' && (
          <div style={{
            fontSize: '11px',
            color: '#666',
            lineHeight: 1.4
          }}>
            {node.description}
          </div>
        )}
        {node.type === 'tool' && node.data.toolUrl && (
          <a
            href={node.data.toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '4px 10px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '11px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a1a'
              e.currentTarget.style.color = '#fff'
            }}
          >
            Open →
          </a>
        )}
      </div>
    </div>
  )
}
