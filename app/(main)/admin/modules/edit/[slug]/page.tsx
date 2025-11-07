'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Type,
  Code,
  Image,
  Video,
  MessageSquare,
  HelpCircle,
  Copy,
  Move,
  FileText,
  Sparkles,
  X,
  BookOpen,
  Edit3,
  List,
  Layers,
  Settings,
  Users,
  Undo,
  Redo,
  Grid3x3,
  Maximize2
} from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface ContentBlock {
  id: string
  type: 'text' | 'markdown' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'quiz'
  data: any
}

interface Slide {
  id: string | number
  title: string
  description?: string
  type?: 'intro' | 'lesson' | 'code' | 'video' | 'quiz' | 'summary'
  duration?: string
  blocks: ContentBlock[]
}

interface Module {
  id?: string | number
  moduleId?: string
  slug: string
  title: string
  description: string
  instructor: {
    name: string
    photo?: string
    year?: string
    major?: string
  }
  duration: string
  skillLevel: string
  introVideo?: string
  learningObjectives?: string[]
  keyTakeaways?: string[]
  slides: Slide[]
  displayOrder?: number
}

const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: Type, description: 'Simple text block', color: '#4CAF50' },
  { type: 'markdown', label: 'Rich Text', icon: FileText, description: 'Formatted content', color: '#2196F3' },
  { type: 'code', label: 'Code', icon: Code, description: 'Syntax highlighted code', color: '#FF9800' },
  { type: 'codePreview', label: 'Live Demo', icon: Sparkles, description: 'Interactive preview', color: '#9C27B0' },
  { type: 'image', label: 'Image', icon: Image, description: 'Pictures & diagrams', color: '#00BCD4' },
  { type: 'video', label: 'Video', icon: Video, description: 'Embedded video', color: '#F44336' },
  { type: 'note', label: 'Note', icon: MessageSquare, description: 'Callout box', color: '#FFC107' },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Test knowledge', color: '#795548' }
]

// CodePreview Editor Component with AI Generation
function CodePreviewEditor({ block, onUpdate, userId }: { block: ContentBlock; onUpdate: (data: any) => void; userId?: string }) {
  const [prompt, setPrompt] = useState('')
  const [refinePrompt, setRefinePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)

  const commonInputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'Monaco, Consolas, monospace',
  }

  const generateCode = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId })
      })

      if (!res.ok) throw new Error('Failed to generate code')

      const data = await res.json()
      onUpdate({
        ...block.data,
        html: data.html || '',
        css: data.css || '',
        js: data.js || ''
      })
      setPrompt('')
    } catch (error) {
      console.error('Error generating code:', error)
      alert('Failed to generate code. Make sure your Gemini API key is set in your profile.')
    } finally {
      setIsGenerating(false)
    }
  }

  const refineCode = async () => {
    if (!refinePrompt.trim()) return

    setIsRefining(true)
    try {
      const res = await fetch('/api/refine-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: refinePrompt,
          currentHtml: block.data?.html || '',
          currentCss: block.data?.css || '',
          currentJs: block.data?.js || '',
          userId
        })
      })

      if (!res.ok) throw new Error('Failed to refine code')

      const data = await res.json()
      onUpdate({
        ...block.data,
        html: data.html || block.data?.html || '',
        css: data.css || block.data?.css || '',
        js: data.js || block.data?.js || ''
      })
      setRefinePrompt('')
    } catch (error) {
      console.error('Error refining code:', error)
      alert('Failed to refine code. Make sure your Gemini API key is set in your profile.')
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div>
      {/* AI Code Generation */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        background: '#f8f8f8',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          ✨ AI Code Generator
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateCode()}
            placeholder="Describe what you want to create... (e.g., 'A button with hover effect')"
            disabled={isGenerating}
            style={{
              ...commonInputStyle,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              background: '#fff'
            }}
          />
          <button
            onClick={generateCode}
            disabled={isGenerating || !prompt.trim()}
            style={{
              padding: '10px 20px',
              background: isGenerating ? '#ccc' : '#9C27B0',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Code Editors */}
      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            HTML
          </label>
          <textarea
            value={block.data?.html || ''}
            onChange={(e) => onUpdate({ ...block.data, html: e.target.value })}
            placeholder="<div>Your HTML here...</div>"
            style={{
              ...commonInputStyle,
              minHeight: '120px',
              fontSize: '12px',
              resize: 'vertical',
              marginTop: '6px'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            CSS (Optional)
          </label>
          <textarea
            value={block.data?.css || ''}
            onChange={(e) => onUpdate({ ...block.data, css: e.target.value })}
            placeholder=".class { color: red; }"
            style={{
              ...commonInputStyle,
              minHeight: '80px',
              fontSize: '12px',
              resize: 'vertical',
              marginTop: '6px'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            JavaScript (Optional)
          </label>
          <textarea
            value={block.data?.js || ''}
            onChange={(e) => onUpdate({ ...block.data, js: e.target.value })}
            placeholder="console.log('Hello');"
            style={{
              ...commonInputStyle,
              minHeight: '80px',
              fontSize: '12px',
              resize: 'vertical',
              marginTop: '6px'
            }}
          />
        </div>
      </div>

      {/* AI Code Refinement */}
      {(block.data?.html || block.data?.css || block.data?.js) && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f0f7ff',
          borderRadius: '8px',
          border: '1px solid #d0e7ff'
        }}>
          <div style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            🔧 AI Code Refiner
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && refineCode()}
              placeholder="Describe changes... (e.g., 'Make the button blue' or 'Add a click animation')"
              disabled={isRefining}
              style={{
                ...commonInputStyle,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                background: '#fff'
              }}
            />
            <button
              onClick={refineCode}
              disabled={isRefining || !refinePrompt.trim()}
              style={{
                padding: '10px 20px',
                background: isRefining ? '#ccc' : '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: isRefining ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              {isRefining ? 'Refining...' : 'Refine'}
            </button>
          </div>
        </div>
      )}

      {/* Live Preview */}
      {(block.data?.html || block.data?.css || block.data?.js) && (
        <div style={{
          marginTop: '12px',
          padding: '16px',
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '10px', color: '#999', marginBottom: '12px', fontWeight: 600 }}>LIVE PREVIEW</div>
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>${block.data?.css || ''}</style>
                </head>
                <body>
                  ${block.data?.html || ''}
                  <script>${block.data?.js || ''}</script>
                </body>
              </html>
            `}
            style={{
              width: '100%',
              minHeight: '300px',
              border: 'none',
              borderRadius: '4px'
            }}
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  )
}

// Sortable Block Component
function SortableBlock({
  block,
  slideIndex,
  blockIndex,
  totalBlocks,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isHighlighted,
  userId
}: {
  block: ContentBlock
  slideIndex: number
  blockIndex: number
  totalBlocks: number
  onUpdate: (value: any) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isHighlighted?: boolean
  userId?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const blockType = BLOCK_TYPES.find(t => t.type === block.type)
  const Icon = blockType?.icon || Type

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-container group ${isHighlighted ? 'block-highlighted' : ''}`}
    >
      {/* Order Controls */}
      <div className="order-controls">
        <div className="block-number">{blockIndex + 1}</div>
        <button
          onClick={onMoveUp}
          disabled={blockIndex === 0}
          className="order-btn"
          title="Move Up"
        >
          <ChevronLeft size={14} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={blockIndex === totalBlocks - 1}
          className="order-btn"
          title="Move Down"
        >
          <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>

      {/* Block Content */}
      <div className="block-content">
        {/* Block Header */}
        <div className="block-header">
          <div className="block-type" style={{ '--block-color': blockType?.color } as any}>
            <Icon size={14} />
            <span>{blockType?.label}</span>
          </div>
          <div className="block-actions">
            <button onClick={onDuplicate} className="action-btn" title="Duplicate">
              <Copy size={14} />
            </button>
            <button onClick={onDelete} className="action-btn delete" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Block Editor */}
        <div className="block-editor">
          {renderBlockEditor(block, onUpdate, userId)}
        </div>
      </div>

      <style jsx>{`
        .block-container {
          position: relative;
          display: flex;
          gap: 8px;
          background: #fff;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .block-container:hover {
          border-color: #e0e0e0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .block-highlighted {
          border-color: #4CAF50 !important;
          background: #f0fff0 !important;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2), 0 4px 12px rgba(0,0,0,0.08) !important;
          animation: highlight-pulse 1s ease-out;
        }

        @keyframes highlight-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0,0,0,0.08);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.2), 0 4px 12px rgba(0,0,0,0.08);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2), 0 4px 12px rgba(0,0,0,0.08);
          }
        }

        .order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px;
          background: #fafafa;
          border-right: 1px solid #f0f0f0;
        }

        .block-number {
          font-size: 11px;
          font-weight: 700;
          color: #999;
          padding: 2px 6px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .order-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .order-btn:hover:not(:disabled) {
          background: #333;
          color: #fff;
          border-color: #333;
        }

        .order-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .block-content {
          flex: 1;
          padding: 16px 20px 16px 12px;
          min-width: 0;
        }

        .block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .block-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--block-color, #666);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 8px;
          background: #f8f8f8;
          border-radius: 6px;
        }

        .block-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .block-container:hover .block-actions {
          opacity: 1;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #f8f8f8;
          border: none;
          border-radius: 6px;
          color: #666;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: #333;
          color: #fff;
        }

        .action-btn.delete:hover {
          background: #f44336;
        }

        .block-editor {
          width: 100%;
        }
      `}</style>
    </div>
  )
}

// Block Editor Renderer
function renderBlockEditor(block: ContentBlock, onUpdate: (value: any) => void, userId?: string) {
  const commonInputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fafafa',
    color: '#000',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease'
  }

  const handleHtmlChange = (value: string) => {
    // Parse HTML to extract text if needed
    const parser = new DOMParser()
    const doc = parser.parseFromString(value, 'text/html')
    const textContent = doc.body.textContent || ''

    onUpdate({
      ...block.data,
      html: value,
      text: textContent
    })
  }

  switch (block.type) {
    case 'text':
      const htmlContent = block.data?.html || ''
      // Extract just the text content from HTML tags
      const textMatch = htmlContent.match(/>([^<]*)</g)
      const displayText = textMatch ? textMatch.map((m: string) => m.slice(1, -1)).join(' ') : htmlContent

      return (
        <textarea
          value={displayText}
          onChange={(e) => {
            // Preserve HTML structure if it exists, otherwise use plain text
            if (htmlContent.includes('<')) {
              // Update the text within the HTML tags
              const updatedHtml = htmlContent.replace(/>([^<]*)</g, `>${e.target.value}<`)
              handleHtmlChange(updatedHtml)
            } else {
              onUpdate({ ...block.data, text: e.target.value, html: e.target.value })
            }
          }}
          placeholder="Enter text content..."
          style={{
            ...commonInputStyle,
            minHeight: '80px',
            resize: 'vertical',
            lineHeight: '1.6'
          }}
        />
      )

    case 'markdown':
      return (
        <div>
          <textarea
            value={block.data?.content || ''}
            onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
            placeholder="Enter markdown content... (supports **bold**, *italic*, # headers, etc.)"
            style={{
              ...commonInputStyle,
              minHeight: '150px',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '13px',
              resize: 'vertical',
              background: '#f8f8f8'
            }}
          />
          {block.data?.content && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px', fontWeight: 600 }}>PREVIEW</div>
              <div className="markdown-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.data.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )

    case 'code':
      return (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <select
              value={block.data?.language || 'javascript'}
              onChange={(e) => onUpdate({ ...block.data, language: e.target.value })}
              style={{
                ...commonInputStyle,
                width: 'auto',
                padding: '6px 12px',
                fontSize: '12px',
                background: '#fff'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="jsx">JSX</option>
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <MonacoEditor
              height="200px"
              language={block.data?.language || 'javascript'}
              theme="vs-dark"
              value={block.data?.code || ''}
              onChange={(value) => onUpdate({ ...block.data, code: value })}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 10, bottom: 10 }
              }}
            />
          </div>
        </div>
      )

    case 'codePreview':
      return (
        <CodePreviewEditor
          block={block}
          onUpdate={onUpdate}
          userId={userId}
        />
      )

    case 'image':
      return (
        <div>
          <input
            type="text"
            value={block.data?.url || ''}
            onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
            placeholder="Image URL (e.g., https://example.com/image.jpg)"
            style={commonInputStyle}
          />
          <input
            type="text"
            value={block.data?.alt || ''}
            onChange={(e) => onUpdate({ ...block.data, alt: e.target.value })}
            placeholder="Alt text (describe the image)"
            style={{ ...commonInputStyle, marginTop: '8px' }}
          />
          {block.data?.url && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f8f8f8',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <img
                src={block.data.url}
                alt={block.data.alt || ''}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '6px'
                }}
              />
            </div>
          )}
        </div>
      )

    case 'video':
      return (
        <div>
          <input
            type="text"
            value={block.data?.url || ''}
            onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
            placeholder="YouTube or Vimeo embed URL (e.g., https://www.youtube.com/embed/...)"
            style={commonInputStyle}
          />
          {block.data?.url && (
            <div style={{
              marginTop: '12px',
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
              background: '#000'
            }}>
              <iframe
                src={block.data.url}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
              />
            </div>
          )}
        </div>
      )

    case 'note':
      return (
        <textarea
          value={block.data?.content || block.data?.text || ''}
          onChange={(e) => onUpdate({ ...block.data, content: e.target.value, text: e.target.value })}
          placeholder="💡 Enter a tip, warning, or important note..."
          style={{
            ...commonInputStyle,
            minHeight: '80px',
            resize: 'vertical',
            background: '#fffbf0',
            borderColor: '#ffd93d'
          }}
        />
      )

    case 'quiz':
      return (
        <div>
          <input
            type="text"
            value={block.data?.question || ''}
            onChange={(e) => onUpdate({ ...block.data, question: e.target.value })}
            placeholder="Enter your quiz question..."
            style={{
              ...commonInputStyle,
              fontWeight: 600,
              fontSize: '15px'
            }}
          />
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Options (one per line)
            </label>
            <textarea
              value={block.data?.options?.join('\n') || ''}
              onChange={(e) => onUpdate({ ...block.data, options: e.target.value.split('\n').filter(o => o.trim()) })}
              placeholder="Option 1\nOption 2\nOption 3\nOption 4"
              style={{
                ...commonInputStyle,
                minHeight: '100px',
                resize: 'vertical',
                marginTop: '6px'
              }}
            />
          </div>
          <div style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Correct Answer (0-based index)
            </label>
            <input
              type="number"
              value={block.data?.correctAnswer || 0}
              onChange={(e) => onUpdate({ ...block.data, correctAnswer: parseInt(e.target.value) })}
              min="0"
              max={(block.data?.options?.length || 1) - 1}
              style={{
                ...commonInputStyle,
                width: '100px',
                marginTop: '6px'
              }}
            />
          </div>
        </div>
      )

    default:
      return <div style={{ color: '#999' }}>Unsupported block type: {block.type}</div>
  }
}

export default function EditModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(true)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [showSlidesList, setShowSlidesList] = useState(false)
  const [editingModuleInfo, setEditingModuleInfo] = useState(false)

  // Undo/Redo state
  const [history, setHistory] = useState<Module[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Track last moved block for highlighting
  const [lastMovedBlockId, setLastMovedBlockId] = useState<string | null>(null)

  // Unwrap params with React.use()
  const unwrappedParams = React.use(params)
  const slug = unwrappedParams.slug

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    fetchModule()
  }, [isAuthenticated, user, slug])

  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/modules/${slug}`)
      if (!res.ok) throw new Error('Module not found')
      const data = await res.json()

      const processedModule = {
        ...data,
        slides: data.slides.map((slide: any, index: number) => ({
          ...slide,
          id: slide.id || index.toString(),
          blocks: (slide.blocks || []).map((block: any) => ({
            ...block,
            id: block.id || `block-${Date.now()}-${Math.random()}`
          }))
        }))
      }

      setModule(processedModule)
    } catch (err) {
      console.error('Error loading module:', err)
      alert('Failed to load module')
      router.push('/admin/modules')
    } finally {
      setLoading(false)
    }
  }

  const saveModule = async () => {
    if (!module) return

    setSaving(true)
    try {
      const res = await fetch(`/api/modules/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module)
      })

      if (!res.ok) throw new Error('Failed to save module')

      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'save-notification'
      notification.innerHTML = '✓ Saved successfully!'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    } catch (err) {
      console.error('Error saving module:', err)
      alert('Failed to save module')
    } finally {
      setSaving(false)
    }
  }

  // Add to history for undo/redo
  const addToHistory = (newModule: Module) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newModule)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setModule(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setModule(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveModule()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history, module])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && module) {
      const currentSlide = module.slides[currentSlideIndex]
      const oldIndex = currentSlide.blocks.findIndex(b => b.id === active.id)
      const newIndex = currentSlide.blocks.findIndex(b => b.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(currentSlide.blocks, oldIndex, newIndex)
        const updatedSlides = [...module.slides]
        updatedSlides[currentSlideIndex] = { ...currentSlide, blocks: newBlocks }
        const newModule = { ...module, slides: updatedSlides }
        setModule(newModule)
        addToHistory(newModule)
      }
    }

    setActiveBlockId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveBlockId(event.active.id as string)
  }

  // Move block up/down with simple numeric ordering
  const moveBlock = (blockIndex: number, direction: 'up' | 'down') => {
    if (!module) return

    const currentSlide = module.slides[currentSlideIndex]
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1

    if (newIndex < 0 || newIndex >= currentSlide.blocks.length) return

    const newBlocks = [...currentSlide.blocks]
    const [movedBlock] = newBlocks.splice(blockIndex, 1)
    newBlocks.splice(newIndex, 0, movedBlock)

    // Highlight the moved block
    setLastMovedBlockId(movedBlock.id)

    // Clear highlight after animation
    setTimeout(() => {
      setLastMovedBlockId(null)
    }, 1000)

    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex] = { ...currentSlide, blocks: newBlocks }
    const newModule = { ...module, slides: updatedSlides }
    setModule(newModule)
    addToHistory(newModule)
  }

  const addBlock = (type: string) => {
    if (!module) return

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: type as any,
      data: {}
    }

    const currentSlide = module.slides[currentSlideIndex]
    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      blocks: [...currentSlide.blocks, newBlock]
    }

    setModule({ ...module, slides: updatedSlides })
    setShowBlockPicker(false)
  }

  const updateBlock = (blockIndex: number, data: any) => {
    if (!module) return

    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex].blocks[blockIndex].data = data
    setModule({ ...module, slides: updatedSlides })
  }

  const deleteBlock = (blockIndex: number) => {
    if (!module) return

    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex].blocks = updatedSlides[currentSlideIndex].blocks.filter((_, i) => i !== blockIndex)
    setModule({ ...module, slides: updatedSlides })
  }

  const duplicateBlock = (blockIndex: number) => {
    if (!module) return

    const blockToDuplicate = module.slides[currentSlideIndex].blocks[blockIndex]
    const newBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random()}`,
      data: { ...blockToDuplicate.data }
    }

    const updatedSlides = [...module.slides]
    updatedSlides[currentSlideIndex].blocks.splice(blockIndex + 1, 0, newBlock)
    setModule({ ...module, slides: updatedSlides })
  }

  const addSlide = () => {
    if (!module) return

    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `New Slide ${module.slides.length + 1}`,
      type: 'lesson',
      duration: '5 min',
      blocks: []
    }

    setModule({ ...module, slides: [...module.slides, newSlide] })
    setCurrentSlideIndex(module.slides.length)
  }

  const deleteSlide = (index: number) => {
    if (!module || module.slides.length <= 1) return

    const updatedSlides = module.slides.filter((_, i) => i !== index)
    setModule({ ...module, slides: updatedSlides })

    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading module...</div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f8f8f8;
            gap: 16px;
            color: #666;
            font-size: 14px;
          }
          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e0e0e0;
            border-top-color: #333;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!module) return null

  const currentSlide = module.slides[currentSlideIndex]

  return (
    <div className="editor-container">
      {/* Top Bar */}
      <div className="top-bar">
        <Link href="/admin/modules" className="back-button">
          <ChevronLeft size={16} />
          Back to Modules
        </Link>

        <div className="module-title">
          {editingModuleInfo ? (
            <input
              type="text"
              value={module.title}
              onChange={(e) => setModule({ ...module, title: e.target.value })}
              onBlur={() => setEditingModuleInfo(false)}
              autoFocus
              className="title-input"
            />
          ) : (
            <h1 onClick={() => setEditingModuleInfo(true)} className="title-display">
              {module.title}
              <Edit3 size={14} style={{ marginLeft: '8px', opacity: 0.5 }} />
            </h1>
          )}
        </div>

        <div className="top-actions">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="undo-redo-button"
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="undo-redo-button"
            title="Redo (Ctrl/Cmd + Y)"
          >
            <Redo size={16} />
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="preview-toggle">
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button onClick={saveModule} disabled={saving} className="save-button">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Sidebar */}
        <div className="sidebar">
          {/* Module Info */}
          <div className="sidebar-section">
            <div className="section-header">
              <Settings size={14} />
              Module Settings
            </div>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Duration</label>
                <input
                  type="text"
                  value={module.duration}
                  onChange={(e) => setModule({ ...module, duration: e.target.value })}
                  placeholder="30 min"
                />
              </div>
              <div className="setting-item">
                <label>Level</label>
                <select
                  value={module.skillLevel}
                  onChange={(e) => setModule({ ...module, skillLevel: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="setting-item full-width">
                <label>Instructor</label>
                <input
                  type="text"
                  value={module.instructor.name}
                  onChange={(e) => setModule({
                    ...module,
                    instructor: { ...module.instructor, name: e.target.value }
                  })}
                  placeholder="Instructor name"
                />
              </div>
            </div>
          </div>

          {/* Slides List */}
          <div className="sidebar-section">
            <div className="section-header">
              <Layers size={14} />
              Slides ({module.slides.length})
              <button onClick={addSlide} className="add-slide-btn">
                <Plus size={14} />
              </button>
            </div>
            <div className="slides-list">
              {module.slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`slide-item ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="slide-number">{index + 1}</div>
                  <div className="slide-info">
                    <div className="slide-title">{slide.title}</div>
                    <div className="slide-meta">
                      {slide.blocks.length} blocks
                    </div>
                  </div>
                  {module.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(index)
                      }}
                      className="delete-slide"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="main-editor">
          {/* Slide Header */}
          <div className="slide-header">
            <div className="slide-nav">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="nav-btn"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="slide-info">
                <div className="slide-counter">
                  Slide {currentSlideIndex + 1} of {module.slides.length}
                </div>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => {
                    const updatedSlides = [...module.slides]
                    updatedSlides[currentSlideIndex].title = e.target.value
                    setModule({ ...module, slides: updatedSlides })
                  }}
                  className="slide-title-input"
                  placeholder="Slide title..."
                />
              </div>
              <button
                onClick={() => setCurrentSlideIndex(Math.min(module.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === module.slides.length - 1}
                className="nav-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Content Blocks */}
          <div className="blocks-area">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentSlide.blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {currentSlide.blocks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <div className="empty-title">No content yet</div>
                    <div className="empty-desc">Add your first content block to get started</div>
                  </div>
                ) : (
                  currentSlide.blocks.map((block, blockIndex) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      slideIndex={currentSlideIndex}
                      blockIndex={blockIndex}
                      totalBlocks={currentSlide.blocks.length}
                      onUpdate={(data) => updateBlock(blockIndex, data)}
                      onDelete={() => deleteBlock(blockIndex)}
                      onDuplicate={() => duplicateBlock(blockIndex)}
                      onMoveUp={() => moveBlock(blockIndex, 'up')}
                      onMoveDown={() => moveBlock(blockIndex, 'down')}
                      isHighlighted={block.id === lastMovedBlockId}
                      userId={user?.id}
                    />
                  ))
                )}
              </SortableContext>

              <DragOverlay>
                {activeBlockId ? (
                  <div className="drag-overlay">
                    Moving block...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Block Button */}
            <div className="add-block-container">
              {showBlockPicker ? (
                <div className="block-picker">
                  <div className="picker-header">
                    <span>Choose block type</span>
                    <button onClick={() => setShowBlockPicker(false)} className="close-picker">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="picker-grid">
                    {BLOCK_TYPES.map(blockType => {
                      const Icon = blockType.icon
                      return (
                        <button
                          key={blockType.type}
                          onClick={() => addBlock(blockType.type)}
                          className="block-option"
                          style={{ '--block-color': blockType.color } as any}
                        >
                          <Icon size={20} />
                          <span className="block-label">{blockType.label}</span>
                          <span className="block-desc">{blockType.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowBlockPicker(true)}
                  className="add-block-button"
                >
                  <Plus size={20} />
                  Add Content Block
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="preview-panel">
            <div className="preview-header">
              <div className="preview-title">Preview</div>
              <div className="preview-device-selector">
                <button className="device-btn active">💻</button>
                <button className="device-btn">📱</button>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-slide">
                <div className="preview-slide-header">
                  <div className="preview-slide-number">
                    SLIDE {currentSlideIndex + 1} OF {module.slides.length}
                  </div>
                  <h2 className="preview-slide-title">{currentSlide.title}</h2>
                </div>

                {currentSlide.blocks.length === 0 ? (
                  <div className="preview-empty">
                    No content to preview
                  </div>
                ) : (
                  currentSlide.blocks.map((block) => (
                    <div key={block.id} className="preview-block">
                      {renderBlockPreview(block)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
          overflow: hidden;
          color: #000;
        }

        .editor-container h1,
        .editor-container h2,
        .editor-container h3,
        .editor-container h4,
        .editor-container h5,
        .editor-container h6,
        .editor-container p,
        .editor-container span,
        .editor-container div {
          color: inherit;
        }

        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          z-index: 100;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #333;
        }

        .module-title {
          flex: 1;
          text-align: center;
        }

        .title-input, .title-display {
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          margin: 0;
          color: #000;
        }

        .title-input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          color: #000;
        }

        .title-display {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #000;
        }

        .title-display:hover {
          background: #f0f0f0;
          color: #000;
        }

        .top-actions {
          display: flex;
          gap: 8px;
        }

        .preview-toggle, .save-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .preview-toggle {
          background: #f0f0f0;
          color: #333;
        }

        .preview-toggle:hover {
          background: #e0e0e0;
        }

        .save-button {
          background: #333;
          color: #fff;
        }

        .save-button:hover:not(:disabled) {
          background: #000;
        }

        .save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .undo-redo-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #f0f0f0;
          color: #333;
        }

        .undo-redo-button:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .undo-redo-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .editor-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sidebar {
          width: 260px;
          background: #fff;
          border-right: 1px solid #e0e0e0;
          overflow-y: auto;
        }

        .sidebar-section {
          border-bottom: 1px solid #f0f0f0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
        }

        .add-slide-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
        }

        .add-slide-btn:hover {
          background: #333;
          color: #fff;
        }

        .settings-grid {
          padding: 0 16px 16px;
          display: grid;
          gap: 12px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .setting-item.full-width {
          grid-column: 1 / -1;
        }

        .setting-item label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .setting-item input,
        .setting-item select {
          padding: 8px 10px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
          background: #fafafa;
          color: #000;
        }

        .setting-item input:focus,
        .setting-item select:focus {
          border-color: #333;
          background: #fff;
          color: #000;
        }

        .slides-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .slide-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          color: #000;
        }

        .slide-item:hover {
          background: #f8f8f8;
          color: #000;
        }

        .slide-item.active {
          background: #333;
          color: #fff;
        }

        .slide-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #f0f0f0;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #333;
        }

        .slide-item.active .slide-number {
          background: #fff;
          color: #333;
        }

        .slide-info {
          flex: 1;
          min-width: 0;
        }

        .slide-title {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: inherit;
        }

        .slide-meta {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 2px;
          color: inherit;
        }

        .delete-slide {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #999;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }

        .slide-item:hover .delete-slide {
          opacity: 1;
        }

        .delete-slide:hover {
          background: #f44336;
          color: #fff;
        }

        .main-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fafafa;
          overflow: hidden;
        }

        .slide-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 16px 24px;
        }

        .slide-nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: #333;
          color: #fff;
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .slide-info {
          flex: 1;
          text-align: center;
        }

        .slide-counter {
          font-size: 11px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .slide-title-input {
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #000;
        }

        .slide-title-input:focus {
          background: #f0f0f0;
          color: #000;
        }

        .blocks-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        .empty-desc {
          font-size: 14px;
          color: #999;
        }

        .add-block-container {
          margin-top: 16px;
        }

        .add-block-button {
          width: 100%;
          padding: 20px;
          background: #fff;
          border: 2px dashed #d0d0d0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .add-block-button:hover {
          border-color: #999;
          background: #fafafa;
          color: #333;
        }

        .block-picker {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          font-weight: 600;
        }

        .close-picker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-picker:hover {
          background: #f0f0f0;
        }

        .picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
        }

        .block-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 12px;
          background: #fafafa;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .block-option:hover {
          background: #fff;
          border-color: var(--block-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .block-option:hover svg {
          color: var(--block-color);
        }

        .block-label {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .block-desc {
          font-size: 11px;
          color: #999;
        }

        .preview-panel {
          width: 40%;
          max-width: 600px;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #e0e0e0;
        }

        .preview-panel h1,
        .preview-panel h2,
        .preview-panel h3,
        .preview-panel h4,
        .preview-panel h5,
        .preview-panel h6,
        .preview-panel p,
        .preview-panel span,
        .preview-panel div {
          color: #fff;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .preview-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.6;
        }

        .preview-device-selector {
          display: flex;
          gap: 4px;
        }

        .device-btn {
          padding: 6px 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .device-btn.active,
        .device-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
        }

        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .preview-slide {
          max-width: 100%;
        }

        .preview-slide-header {
          margin-bottom: 32px;
        }

        .preview-slide-number {
          font-size: 11px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .preview-slide-title {
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
          color: #fff;
        }

        .preview-empty {
          padding: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          text-align: center;
          color: #666;
        }

        .preview-block {
          margin-bottom: 24px;
        }

        .drag-overlay {
          padding: 16px 24px;
          background: #333;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .save-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          background: #4CAF50;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(76,175,80,0.3);
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .markdown-preview h1 { font-size: 24px; margin: 16px 0; }
        .markdown-preview h2 { font-size: 20px; margin: 14px 0; }
        .markdown-preview h3 { font-size: 18px; margin: 12px 0; }
        .markdown-preview p { margin: 10px 0; line-height: 1.6; }
        .markdown-preview ul, .markdown-preview ol { margin: 10px 0; padding-left: 20px; }
        .markdown-preview li { margin: 4px 0; }
        .markdown-preview code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 13px;
        }
        .markdown-preview pre {
          background: #f4f4f4;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
        }
        .markdown-preview blockquote {
          border-left: 4px solid #ddd;
          padding-left: 16px;
          margin: 16px 0;
          color: #666;
        }
        .markdown-preview strong { font-weight: 600; }
        .markdown-preview em { font-style: italic; }
        .markdown-preview a { color: #0066cc; text-decoration: underline; }
      `}</style>
    </div>
  )
}

// Preview Renderer
function renderBlockPreview(block: ContentBlock) {
  switch (block.type) {
    case 'text':
      const htmlContent = block.data?.html || block.data?.text || ''
      // If it contains HTML tags, render as HTML
      if (htmlContent.includes('<')) {
        return <div style={{ color: '#fff' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      }
      return <div style={{ fontSize: '16px', lineHeight: 1.7, color: '#fff' }}>{htmlContent}</div>

    case 'markdown':
      return (
        <div className="markdown-preview" style={{ fontSize: '16px', lineHeight: 1.7, color: '#fff' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {block.data?.content || ''}
          </ReactMarkdown>
        </div>
      )

    case 'code':
      return (
        <div style={{
          background: '#1e1e1e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#2d2d2d',
            borderBottom: '1px solid #3e3e3e',
            fontSize: '12px',
            color: '#999'
          }}>
            {block.data?.language || 'code'}
          </div>
          <pre style={{
            margin: 0,
            padding: '16px',
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: 1.6
          }}>
            <code>{block.data?.code || ''}</code>
          </pre>
        </div>
      )

    case 'codePreview':
      // Match student-facing viewer implementation with iframe
      const previewHtml = block.data?.html || ''
      const previewCss = block.data?.css || ''
      const previewJs = block.data?.js || ''

      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${previewCss}</style>
          </head>
          <body>
            ${previewHtml}
            <script>${previewJs}</script>
          </body>
        </html>
      `

      return (
        <div style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #444'
        }}>
          <iframe
            srcDoc={iframeContent}
            style={{
              width: '100%',
              minHeight: '400px',
              border: 'none',
              background: '#fff'
            }}
            sandbox="allow-scripts"
          />
        </div>
      )

    case 'image':
      return block.data?.url ? (
        <img
          src={block.data.url}
          alt={block.data.alt || ''}
          style={{
            maxWidth: '100%',
            borderRadius: '8px'
          }}
        />
      ) : null

    case 'video':
      return block.data?.url ? (
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          <iframe
            src={block.data.url}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allowFullScreen
          />
        </div>
      ) : null

    case 'note':
      const noteContent = block.data?.text || block.data?.content || ''
      return (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255, 235, 59, 0.1)',
          borderLeft: '4px solid #ffeb3b',
          borderRadius: '8px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: '#fff'
        }}>
          {noteContent.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: noteContent }} />
          ) : (
            noteContent
          )}
        </div>
      )

    case 'quiz':
      return (
        <div style={{
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            {block.data?.question || ''}
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(block.data?.options || []).map((option: string, i: number) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  background: i === block.data?.correctAnswer
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === block.data?.correctAnswer
                    ? 'rgba(76, 175, 80, 0.5)'
                    : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}