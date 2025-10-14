'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export const WorkflowPromptNode = memo(({ data, selected }: NodeProps) => {
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
        width: 240,
        background: selected ? '#1a1a1a' : '#0a0a0a',
        border: `2px solid ${selected ? '#fff' : '#333'}`,
        borderRadius: 12,
        padding: 16,
        boxShadow: selected ? '0 0 0 4px rgba(255,255,255,0.1)' : '0 2px 8px rgba(0,0,0,0.5)',
        transition: 'all 0.2s'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            flex: 1
          }}>
            {data.title || 'Prompt'}
          </div>
        </div>

        {/* Prompt Text */}
        {data.data?.promptText && (
          <div style={{
            padding: 12,
            background: '#000',
            border: '1px solid #1a1a1a',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'Monaco, monospace',
            color: '#999',
            lineHeight: 1.5,
            maxHeight: 100,
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {data.data.promptText.length > 150
              ? data.data.promptText.substring(0, 150) + '...'
              : data.data.promptText
            }
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

WorkflowPromptNode.displayName = 'WorkflowPromptNode'
