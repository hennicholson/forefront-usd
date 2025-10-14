'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { WorkflowNode as WorkflowNodeType } from '@/lib/workflows/workflow-types'

export const CustomWorkflowNode = memo(({ data }: NodeProps) => {
  const node = data as WorkflowNodeType & { editable: boolean }

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

  const isExpandedNode = node.type === 'prompt' || node.type === 'screenshot'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'all'
    }}>
      {/* Input Handle (left) */}
      {node.editable && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: '12px',
            height: '12px',
            background: '#666',
            border: '2px solid #0a0a0a',
            left: '-6px'
          }}
        />
      )}

      {/* Main Node */}
      <div style={{
        width: isExpandedNode ? '200px' : '80px',
        minHeight: isExpandedNode ? 'auto' : '80px',
        background: '#0a0a0a',
        border: '2px solid #333',
        borderRadius: isExpandedNode ? '12px' : '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isExpandedNode ? '16px' : '0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
        position: 'relative'
      }}>
        {/* Icon for circular nodes */}
        {!isExpandedNode && (
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
      </div>

      {/* Label below node (only for circular nodes) */}
      {!isExpandedNode && (
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
            {node.title}
          </div>
          {node.description && (
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
      )}

      {/* Output Handle (right) */}
      {node.editable && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: '12px',
            height: '12px',
            background: '#666',
            border: '2px solid #0a0a0a',
            right: '-6px',
            top: isExpandedNode ? '50%' : '40px'
          }}
        />
      )}
    </div>
  )
})

CustomWorkflowNode.displayName = 'CustomWorkflowNode'
