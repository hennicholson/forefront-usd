'use client'
import { useState, useEffect } from 'react'
import { RichTextEditor } from './RichTextEditor'

export type ContentBlockType = 'text' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'chart' | 'quiz'

export interface ContentBlock {
  id: string
  type: ContentBlockType
  data: any
}

interface ContentBlockProps {
  block: ContentBlock
  onChange: (block: ContentBlock) => void
  onDelete: () => void
  onDuplicate?: () => void
}

export function ContentBlockEditor({ block, onChange, onDelete, onDuplicate }: ContentBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [html, setHtml] = useState(block.data?.html || '')
  const [css, setCSS] = useState(block.data?.css || '')
  const [js, setJS] = useState(block.data?.js || '')

  useEffect(() => {
    if (block.type === 'codePreview') {
      onChange({ ...block, data: { html, css, js } })
    }
  }, [html, css, js])

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#374151'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#1f2937',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    outline: 'none'
  }

  const textareaStyle = {
    ...inputStyle,
    fontFamily: 'monospace',
    lineHeight: 1.6,
    resize: 'vertical' as const
  }

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '13px', color: '#374151' }}>
              Text Content
            </label>
            <RichTextEditor
              content={block.data?.html || block.data?.text || ''}
              onChange={(html) => onChange({ ...block, data: { html, text: html } })}
              placeholder="Enter your text content..."
            />
          </div>
        )

      case 'code':
        return (
          <div>
            <label style={labelStyle}>Language</label>
            <select
              value={block.data?.language || 'javascript'}
              onChange={(e) => onChange({ ...block, data: { ...block.data, language: e.target.value } })}
              style={{ ...inputStyle, marginBottom: '16px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="bash">Bash</option>
              <option value="sql">SQL</option>
            </select>
            <label style={labelStyle}>Code</label>
            <textarea
              value={block.data?.code || ''}
              onChange={(e) => onChange({ ...block, data: { ...block.data, code: e.target.value } })}
              rows={10}
              style={textareaStyle}
              placeholder="Paste your code here..."
            />
          </div>
        )

      case 'codePreview':
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={labelStyle}>HTML</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="<div>Your HTML here...</div>"
              />
            </div>
            <div>
              <label style={labelStyle}>CSS</label>
              <textarea
                value={css}
                onChange={(e) => setCSS(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="body { ... }"
              />
            </div>
            <div>
              <label style={labelStyle}>JavaScript</label>
              <textarea
                value={js}
                onChange={(e) => setJS(e.target.value)}
                rows={6}
                style={textareaStyle}
                placeholder="console.log('Hello');"
              />
            </div>
            <div>
              <label style={labelStyle}>Live Preview</label>
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>${css}</style>
                    </head>
                    <body>
                      ${html}
                      <script>${js}</script>
                    </body>
                  </html>
                `}
                style={{
                  width: '100%',
                  height: '300px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#fff'
                }}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div>
            <label style={labelStyle}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onloadend = () => {
                  onChange({ ...block, data: { src: reader.result as string } })
                }
                reader.readAsDataURL(file)
              }}
              style={{
                ...inputStyle,
                padding: '10px',
                cursor: 'pointer'
              }}
            />
            {block.data?.src && (
              <div style={{ marginTop: '16px' }}>
                <label style={labelStyle}>Preview</label>
                <img
                  src={block.data.src}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <div>
            <label style={labelStyle}>Video URL (YouTube/Vimeo)</label>
            <input
              type="text"
              value={block.data?.url || ''}
              onChange={(e) => onChange({ ...block, data: { url: e.target.value } })}
              placeholder="https://www.youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>
        )

      case 'note':
        return (
          <div>
            <label style={labelStyle}>Note / Pro Tip</label>
            <textarea
              value={block.data?.text || ''}
              onChange={(e) => onChange({ ...block, data: { text: e.target.value } })}
              rows={4}
              style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' as const }}
              placeholder="Enter a helpful note or pro tip..."
            />
          </div>
        )

      case 'chart':
        return (
          <div>
            <label style={labelStyle}>Chart Data (JSON Format)</label>
            <textarea
              value={block.data?.chartData || ''}
              onChange={(e) => onChange({ ...block, data: { chartData: e.target.value } })}
              rows={10}
              style={textareaStyle}
              placeholder='{"labels": ["Jan", "Feb", "Mar"], "data": [10, 20, 15]}'
            />
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f0fdfa',
              border: '1px solid #14b8a6',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0f766e'
            }}>
              <strong>Format:</strong> Use JSON with "labels" array and "data" array
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Question</label>
              <input
                type="text"
                value={block.data?.question || ''}
                onChange={(e) => onChange({ ...block, data: { ...block.data, question: e.target.value } })}
                placeholder="What is the correct answer?"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Answer Options (one per line)</label>
              <textarea
                value={block.data?.options || ''}
                onChange={(e) => onChange({ ...block, data: { ...block.data, options: e.target.value } })}
                rows={5}
                placeholder={"Option 1\nOption 2\nOption 3\nOption 4"}
                style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' as const }}
              />
            </div>
            <div>
              <label style={labelStyle}>Correct Answer (0 = first option, 1 = second, etc.)</label>
              <input
                type="number"
                value={block.data?.correctAnswer ?? 0}
                onChange={(e) => onChange({ ...block, data: { ...block.data, correctAnswer: parseInt(e.target.value) } })}
                min="0"
                style={inputStyle}
              />
            </div>
          </div>
        )

      default:
        return <div>Unknown block type</div>
    }
  }

  const blockColors = {
    text: { bg: '#3b82f6', light: '#eff6ff' },
    code: { bg: '#8b5cf6', light: '#f5f3ff' },
    codePreview: { bg: '#6366f1', light: '#eef2ff' },
    image: { bg: '#10b981', light: '#f0fdf4' },
    video: { bg: '#ef4444', light: '#fef2f2' },
    note: { bg: '#eab308', light: '#fefce8' },
    chart: { bg: '#14b8a6', light: '#f0fdfa' },
    quiz: { bg: '#ec4899', light: '#fdf2f8' }
  }

  const color = blockColors[block.type as keyof typeof blockColors] || { bg: '#6b7280', light: '#f9fafb' }

  return (
    <div style={{
      padding: '0',
      background: '#ffffff',
      border: `2px solid ${color.bg}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: color.bg,
        borderBottom: isCollapsed ? 'none' : `2px solid ${color.bg}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#fff'
          }}>
            {block.type === 'codePreview' ? 'Live Code' :
             block.type === 'text' ? 'Text Block' :
             block.type === 'code' ? 'Code Block' :
             block.type === 'image' ? 'Image Block' :
             block.type === 'video' ? 'Video Block' :
             block.type === 'note' ? 'Note Block' :
             block.type === 'chart' ? 'Chart Block' :
             block.type === 'quiz' ? 'Quiz Block' : 'Unknown'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s'
              }}
              title="Duplicate this block"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              Duplicate
            </button>
          )}
          <button
            onClick={onDelete}
            style={{
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content - only shown when not collapsed */}
      {!isCollapsed && (
        <div style={{ padding: '20px', background: '#ffffff' }}>
          {renderEditor()}
        </div>
      )}
    </div>
  )
}
