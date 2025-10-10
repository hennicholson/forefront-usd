'use client'
import { motion } from 'framer-motion'
import { MindmapNode, MindmapConnection } from '@/lib/mindmap-layout'

interface ConnectionLinesProps {
  nodes: MindmapNode[]
  connections: MindmapConnection[]
  hoveredNodeId: string | null
  focusedNodeId: string | null
  width: number
  height: number
}

export function ConnectionLines({
  nodes,
  connections,
  hoveredNodeId,
  focusedNodeId,
  width,
  height
}: ConnectionLinesProps) {
  const getNode = (id: string) => nodes.find(n => n.id === id)

  const isConnectionHighlighted = (conn: MindmapConnection) => {
    if (!hoveredNodeId && !focusedNodeId) return false
    const activeId = hoveredNodeId || focusedNodeId
    return conn.from === activeId || conn.to === activeId
  }

  const getRelatedNodeIds = (nodeId: string): string[] => {
    const related = new Set<string>()
    connections.forEach(conn => {
      if (conn.from === nodeId) related.add(conn.to)
      if (conn.to === nodeId) related.add(conn.from)
    })
    return Array.from(related)
  }

  const activeNodeId = hoveredNodeId || focusedNodeId
  const relatedIds = activeNodeId ? getRelatedNodeIds(activeNodeId) : []

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Gradient definitions for glowing lines */}
        <linearGradient id="centerGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>

        {/* Animated gradient */}
        <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8">
            <animate
              attributeName="stop-opacity"
              values="0.8;0.3;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#fff" stopOpacity="0.4">
            <animate
              attributeName="stop-opacity"
              values="0.4;0.8;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#fff" stopOpacity="0.8">
            <animate
              attributeName="stop-opacity"
              values="0.8;0.3;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* Filter for glow effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn, index) => {
        const fromNode = getNode(conn.from)
        const toNode = getNode(conn.to)

        if (!fromNode || !toNode) return null

        const isHighlighted = isConnectionHighlighted(conn)
        const isRelated = activeNodeId && (
          relatedIds.includes(conn.from) ||
          relatedIds.includes(conn.to)
        )

        // Calculate control points for curved line
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2

        // Add slight curve perpendicular to line direction
        const dx = toNode.x - fromNode.x
        const dy = toNode.y - fromNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const curvature = distance * 0.1
        const perpX = -dy / distance * curvature
        const perpY = dx / distance * curvature

        const controlX = midX + perpX
        const controlY = midY + perpY

        // Determine line properties based on connection type
        const isCenterConnection = fromNode.type === 'center' || toNode.type === 'center'
        const isTopicConnection = fromNode.type === 'topic' || toNode.type === 'topic'

        let strokeWidth = 1
        let strokeColor = '#ddd'
        let opacity = 0.3

        if (isHighlighted) {
          strokeWidth = 4
          strokeColor = fromNode.color || toNode.color || '#000'
          opacity = 0.8
        } else if (isRelated) {
          strokeWidth = 2
          strokeColor = fromNode.color || toNode.color || '#666'
          opacity = 0.5
        } else if (isCenterConnection) {
          strokeWidth = 2
          strokeColor = toNode.color || '#666'
          opacity = 0.4
        } else if (isTopicConnection) {
          strokeWidth = 1.5
          strokeColor = fromNode.color || toNode.color || '#ccc'
          opacity = 0.3
        }

        // Create path for curved line
        const pathData = `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`

        return (
          <g key={`conn-${index}`}>
            {/* Shadow/glow line */}
            {isHighlighted && (
              <motion.path
                d={pathData}
                stroke={strokeColor}
                strokeWidth={strokeWidth + 4}
                opacity={opacity * 0.3}
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}

            {/* Main line */}
            <motion.path
              d={pathData}
              stroke={isHighlighted ? 'url(#animatedGradient)' : strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: opacity,
                strokeWidth: strokeWidth
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: index * 0.02
              }}
            />

            {/* Animated particle/dot traveling along highlighted connections */}
            {isHighlighted && (
              <motion.circle
                r="4"
                fill={strokeColor}
                filter="url(#glow)"
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path={pathData}
                />
              </motion.circle>
            )}

            {/* Connection strength indicator (thicker for multi-topic users) */}
            {conn.strength > 1 && !isHighlighted && (
              <circle
                cx={midX}
                cy={midY}
                r={Math.min(conn.strength * 2, 8)}
                fill={strokeColor}
                opacity={opacity * 0.6}
              />
            )}
          </g>
        )
      })}

      {/* Relationship lines between users who share multiple topics */}
      {activeNodeId && (
        <>
          {relatedIds.map(relatedId => {
            const activeNode = getNode(activeNodeId)
            const relatedNode = getNode(relatedId)

            if (!activeNode || !relatedNode) return null
            if (activeNode.type !== 'user' || relatedNode.type !== 'user') return null

            // Check if they share topics
            const sharedTopics = activeNode.data?.modules?.filter(
              (m: string) => relatedNode.data?.modules?.includes(m)
            ) || []

            if (sharedTopics.length === 0) return null

            return (
              <motion.line
                key={`shared-${activeNodeId}-${relatedId}`}
                x1={activeNode.x}
                y1={activeNode.y}
                x2={relatedNode.x}
                y2={relatedNode.y}
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity={0.6}
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.5 }}
              />
            )
          })}
        </>
      )}
    </svg>
  )
}
