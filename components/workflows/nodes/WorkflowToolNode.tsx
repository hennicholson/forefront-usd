'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export const WorkflowToolNode = memo(({ data, selected }: NodeProps) => {
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
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
          {data.title || 'Tool'}
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

        {/* Tool URL */}
        {data.data?.toolUrl && (
          <a
            href={data.data.toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: 6,
              padding: '4px 10px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#fff',
              fontSize: 11,
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

WorkflowToolNode.displayName = 'WorkflowToolNode'
