'use client'
import { WorkflowNode } from '@/lib/workflows/workflow-types'

interface NodePropertyPanelProps {
  node: WorkflowNode | null
  onUpdate: (updates: Partial<WorkflowNode>) => void
  onClose: () => void
}

export function NodePropertyPanel({ node, onUpdate, onClose }: NodePropertyPanelProps) {
  if (!node) {
    return (
      <div style={{
        width: '380px',
        background: '#0a0a0a',
        borderLeft: '1px solid #1a1a1a',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Click a node to edit its properties
      </div>
    )
  }

  return (
    <div style={{
      width: '380px',
      background: '#0a0a0a',
      borderLeft: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#fff'
        }}>
          Edit Node
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
        >
          ×
        </button>
      </div>

      {/* Properties */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Title
          </label>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#000',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#fff'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Description
          </label>
          <input
            type="text"
            value={node.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#000',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#fff'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
          />
        </div>

        {/* Tool-specific fields */}
        {node.type === 'tool' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666',
                marginBottom: '8px'
              }}>
                Tool URL
              </label>
              <input
                type="url"
                value={node.data?.toolUrl || ''}
                onChange={(e) => onUpdate({
                  data: { ...node.data, toolUrl: e.target.value }
                })}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#000',
                  border: '1px solid #1a1a1a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#fff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
              />
            </div>
          </>
        )}

        {/* Prompt-specific fields */}
        {(node.type === 'prompt' || node.type === 'screenshot') && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666',
              marginBottom: '8px'
            }}>
              {node.type === 'prompt' ? 'Prompt Text' : 'Screenshot Instructions'}
            </label>
            <textarea
              value={node.data?.promptText || ''}
              onChange={(e) => onUpdate({
                data: { ...node.data, promptText: e.target.value }
              })}
              rows={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#000',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'Monaco, monospace',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#fff'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
            />
          </div>
        )}

        {/* Action-specific fields */}
        {node.type === 'action' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666',
              marginBottom: '8px'
            }}>
              Action Type
            </label>
            <select
              value={node.data?.actionType || 'copy'}
              onChange={(e) => onUpdate({
                data: { ...node.data, actionType: e.target.value as 'copy' | 'paste' | 'upload' | 'download' | 'wait' }
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#000',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="copy">Copy</option>
              <option value="paste">Paste</option>
              <option value="wait">Wait</option>
              <option value="upload">Upload</option>
              <option value="download">Download</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
