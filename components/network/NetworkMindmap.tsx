'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Node } from './Node'
import { ConnectionLines } from './ConnectionLines'
import {
  MindmapNode,
  MindmapConnection,
  generateMindmapLayout,
  calculateInitialZoom
} from '@/lib/mindmap-layout'

interface TopicCluster {
  topic: string
  users: {
    userId: string
    userName: string
    userBio: string | null
    modules: string[]
  }[]
}

interface NetworkMindmapProps {
  clusters: TopicCluster[]
  onUserClick: (userId: string) => void
  selectedTopic: string | null
}

export function NetworkMindmap({
  clusters,
  onUserClick,
  selectedTopic
}: NetworkMindmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<MindmapNode[]>([])
  const [connections, setConnections] = useState<MindmapConnection[]>([])
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 1200,
          height: rect.height || 800
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Generate layout when clusters change
  useEffect(() => {
    if (clusters.length === 0) return

    const filteredClusters = selectedTopic
      ? clusters.filter(c => c.topic === selectedTopic)
      : clusters

    const layout = generateMindmapLayout(filteredClusters, {
      width: dimensions.width,
      height: dimensions.height,
      centerRadius: 250,
      topicRadius: 120,
      userRadius: 80
    })

    setNodes(layout.nodes)
    setConnections(layout.connections)

    // Calculate and set initial zoom
    const initialZoom = calculateInitialZoom(layout.nodes.length)
    setZoom(initialZoom)

    // Reset pan to center
    setPan({ x: 0, y: 0 })
    setFocusedNodeId(null)
  }, [clusters, selectedTopic, dimensions])

  // Handle node drag end
  const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    )
  }, [])

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    if (node.type === 'user' && node.data?.userId) {
      onUserClick(node.data.userId)
    } else if (node.type === 'topic') {
      // Focus on topic
      setFocusedNodeId(focusedNodeId === nodeId ? null : nodeId)
    } else if (node.type === 'center') {
      // Reset focus
      setFocusedNodeId(null)
    }
  }, [nodes, onUserClick, focusedNodeId])

  // Handle zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prevZoom => Math.max(0.3, Math.min(3, prevZoom * delta)))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Handle canvas drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.mindmap-node')) return
    setIsDraggingCanvas(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false)
  }

  // Handle touch gestures
  const lastTouchDistance = useRef<number | null>(null)

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (lastTouchDistance.current !== null) {
        const delta = distance / lastTouchDistance.current
        setZoom(prevZoom => Math.max(0.3, Math.min(3, prevZoom * delta)))
      }

      lastTouchDistance.current = distance
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = null
  }

  // Get visible nodes based on focus
  const visibleNodes = focusedNodeId
    ? nodes.filter(node => {
        if (node.id === focusedNodeId || node.type === 'center') return true
        // Show nodes connected to focused node
        const isConnected = connections.some(
          conn =>
            (conn.from === focusedNodeId && conn.to === node.id) ||
            (conn.to === focusedNodeId && conn.from === node.id)
        )
        return isConnected
      })
    : nodes

  const visibleConnections = focusedNodeId
    ? connections.filter(
        conn => conn.from === focusedNodeId || conn.to === focusedNodeId
      )
    : connections

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        background: '#fafafa',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: isDraggingCanvas ? 'grabbing' : 'grab',
        border: '3px solid #000',
        boxShadow: 'none'
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setZoom(z => Math.min(3, z * 1.2))}
          style={{
            width: '44px',
            height: '44px',
            background: '#fff',
            border: '2px solid #000',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#000'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#000'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}
          style={{
            width: '44px',
            height: '44px',
            background: '#fff',
            border: '2px solid #000',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#000'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#000'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
            setFocusedNodeId(null)
          }}
          style={{
            width: '44px',
            height: '44px',
            background: '#fff',
            border: '2px solid #000',
            borderRadius: '8px',
            fontSize: '18px',
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#000'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#000'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ⟲
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          background: '#fff',
          border: '2px solid #000',
          borderRadius: '10px',
          padding: '12px 20px',
          color: '#000',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: 'none'
        }}
      >
        <span>🖱️ drag to pan</span>
        <span>🔍 scroll to zoom</span>
        <span>👆 click nodes</span>
      </div>

      {/* Mindmap Canvas */}
      <motion.div
        animate={{
          scale: zoom,
          x: pan.x,
          y: pan.y
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        style={{
          position: 'absolute',
          width: dimensions.width,
          height: dimensions.height,
          transformOrigin: 'center center'
        }}
      >
        {/* Connection Lines */}
        <ConnectionLines
          nodes={visibleNodes}
          connections={visibleConnections}
          hoveredNodeId={hoveredNodeId}
          focusedNodeId={focusedNodeId}
          width={dimensions.width}
          height={dimensions.height}
        />

        {/* Nodes */}
        {visibleNodes.map(node => (
          <div key={node.id} className="mindmap-node">
            <Node
              node={node}
              isHovered={hoveredNodeId === node.id}
              isFocused={focusedNodeId === node.id}
              onHover={setHoveredNodeId}
              onClick={handleNodeClick}
              onDragEnd={handleNodeDragEnd}
              zoom={zoom}
            />
          </div>
        ))}
      </motion.div>

      {/* Focus overlay info */}
      {focusedNodeId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#000',
            border: '2px solid #000',
            borderRadius: '10px',
            padding: '14px 24px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            textTransform: 'lowercase',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'none'
          }}
        >
          <span>✨ focused: {nodes.find(n => n.id === focusedNodeId)?.label}</span>
          <button
            onClick={() => setFocusedNodeId(null)}
            style={{
              background: '#fff',
              color: '#000',
              border: '1px solid #fff',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
            }}
          >
            clear
          </button>
        </motion.div>
      )}
    </div>
  )
}
