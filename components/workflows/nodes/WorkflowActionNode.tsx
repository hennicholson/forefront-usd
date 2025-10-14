'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export const WorkflowActionNode = memo(({ data, selected }: NodeProps) => {
  const getIcon = () => {
    if (data.type === 'decision') {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
          <line x1="5" y1="19" x2="19" y2="19"></line>
        </svg>
      )
    }
    if (data.type === 'note') {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
    if (data.type === 'screenshot') {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      )
    }
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: '#666',
          border: '2px solid #0a0a0a'
        }}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 100
      }}>
        {/* Circular Icon */}
        <div style={{
          width: 100,
          height: 100,
          background: selected ? '#1a1a1a' : '#0a0a0a',
          border: `2px solid ${selected ? '#fff' : '#333'}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: selected ? '0 0 0 4px rgba(255,255,255,0.1)' : '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          {getIcon()}
        </div>

        {/* Title */}
        <div style={{
          marginTop: 12,
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 160
        }}>
          {data.title || 'Action'}
        </div>

        {/* Description */}
        {data.description && (
          <div style={{
            fontSize: 11,
            color: '#666',
            textAlign: 'center',
            marginTop: 4,
            maxWidth: 160
          }}>
            {data.description}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: '#666',
          border: '2px solid #0a0a0a'
        }}
      />
    </>
  )
})

WorkflowActionNode.displayName = 'WorkflowActionNode'
