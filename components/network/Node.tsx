'use client'
import { motion, PanInfo } from 'framer-motion'
import { MindmapNode } from '@/lib/mindmap-layout'

interface NodeProps {
  node: MindmapNode
  isHovered: boolean
  isFocused: boolean
  onHover: (nodeId: string | null) => void
  onClick: (nodeId: string) => void
  onDragEnd: (nodeId: string, x: number, y: number) => void
  zoom: number
}

export function Node({
  node,
  isHovered,
  isFocused,
  onHover,
  onClick,
  onDragEnd,
  zoom
}: NodeProps) {
  const handleDragEnd = (event: any, info: PanInfo) => {
    onDragEnd(node.id, node.x + info.offset.x / zoom, node.y + info.offset.y / zoom)
  }

  const getNodeStyle = () => {
    switch (node.type) {
      case 'center':
        return {
          background: '#000',
          border: isHovered ? '4px solid #666' : '4px solid #000',
          boxShadow: 'none'
        }
      case 'topic':
        return {
          background: isHovered || isFocused ? '#333' : '#666',
          border: '3px solid #000',
          boxShadow: 'none'
        }
      case 'user':
        return {
          background: isHovered || isFocused ? '#000' : '#fff',
          border: '2px solid #000',
          boxShadow: 'none'
        }
    }
  }

  const getTextColor = () => {
    if (node.type === 'center' || node.type === 'topic') return '#fff'
    return isHovered || isFocused ? '#fff' : '#000'
  }

  const getFontSize = () => {
    switch (node.type) {
      case 'center':
        return '14px'
      case 'topic':
        return '12px'
      case 'user':
        return '11px'
    }
  }

  const isPinned = node.type === 'center'

  return (
    <motion.div
      drag={!isPinned}
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        x: node.x,
        y: node.y,
        scale: isHovered || isFocused ? 1.2 : 1,
        opacity: 1
      }}
      whileHover={{ scale: 1.15 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      style={{
        position: 'absolute',
        width: node.size,
        height: node.size,
        left: -node.size / 2,
        top: -node.size / 2,
        cursor: isPinned ? 'default' : 'grab',
        zIndex: isHovered || isFocused ? 100 : node.type === 'center' ? 50 : node.type === 'topic' ? 30 : 10
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node.id)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '8px',
          transition: 'all 0.3s ease',
          ...getNodeStyle()
        }}
      >
        <div
          style={{
            fontSize: getFontSize(),
            fontWeight: node.type === 'center' ? 900 : 700,
            color: getTextColor(),
            textTransform: node.type === 'center' ? 'uppercase' : 'lowercase',
            letterSpacing: node.type === 'center' ? '1px' : '0px',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: node.type === 'user' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
        >
          {node.label}
        </div>
      </div>

      {/* Pulse animation for center node */}
      {node.type === 'center' && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            border: '2px solid #fff',
            pointerEvents: 'none'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Hover tooltip */}
      {isHovered && node.type === 'user' && node.data?.userBio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            background: '#fff',
            border: '2px solid #000',
            borderRadius: '8px',
            padding: '12px 16px',
            minWidth: '200px',
            maxWidth: '280px',
            boxShadow: 'none',
            fontSize: '12px',
            color: '#000',
            lineHeight: 1.5,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>
            {node.data.userName}
          </div>
          <div style={{ color: '#666', fontSize: '11px' }}>
            {node.data.userBio}
          </div>
          {node.data.modules.length > 1 && (
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600
            }}>
              Learning {node.data.modules.length} topics
            </div>
          )}
        </motion.div>
      )}

      {/* Topic info on hover */}
      {isHovered && node.type === 'topic' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            background: '#000',
            border: '2px solid #000',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '11px',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {node.data?.userCount} learner{node.data?.userCount !== 1 ? 's' : ''}
        </motion.div>
      )}
    </motion.div>
  )
}
