'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas'
import { WorkflowNode, WorkflowConnection, NodeType } from '@/lib/workflows/workflow-types'

export default function CreateWorkflowPage() {
  const router = useRouter()
  const [title, setTitle] = useState('Untitled Workflow')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('video')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addNode = (type: NodeType) => {
    // Calculate position for new node - horizontally spaced
    const baseX = 200
    const baseY = 300
    const horizontalSpacing = 280

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title: type === 'tool' ? 'Tool' : type === 'prompt' ? 'Prompt' : type === 'screenshot' ? 'Screenshot' : type === 'action' ? 'Action' : type === 'decision' ? 'Decision' : 'Note',
      description: type === 'tool' ? 'Add a tool' : type === 'prompt' ? 'Add a prompt' : type === 'action' ? 'Manual action' : '',
      position: { x: baseX + nodes.length * horizontalSpacing, y: baseY },
      size: { width: type === 'prompt' || type === 'screenshot' ? 200 : 80, height: 80 },
      data: {}
    }

    // Type-specific defaults
    if (type === 'tool') {
      newNode.title = 'ChatGPT'
      newNode.description = 'AI text generation'
      newNode.data = {
        toolName: 'ChatGPT',
        toolUrl: 'https://chat.openai.com'
      }
    } else if (type === 'prompt') {
      newNode.title = 'Prompt'
      newNode.data = {
        promptText: 'Enter your prompt here...'
      }
    } else if (type === 'action') {
      newNode.title = 'Action'
      newNode.description = 'Manual step'
      newNode.data = {
        actionType: 'copy'
      }
    }

    setNodes([...nodes, newNode])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get current workflow state from canvas
      const exportWorkflow = (window as any).__exportWorkflow
      if (exportWorkflow) {
        const { nodes: currentNodes, connections: currentConnections } = exportWorkflow()
        // TODO: Save to database
        console.log('Saving workflow:', { title, description, category, nodes: currentNodes, connections: currentConnections })
      }
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/workflows')
    } catch (error) {
      console.error('Error saving workflow:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        height: '70px',
        background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
          >
            ← Back
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workflow Title"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              flex: 1,
              maxWidth: '400px'
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="video">🎬 Video</option>
            <option value="coding">💻 Coding</option>
            <option value="marketing">📱 Marketing</option>
            <option value="design">🎨 Design</option>
            <option value="content">✍️ Content</option>
            <option value="automation">⚡ Automation</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              background: '#fff',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Node Toolbar */}
        <div style={{
          width: '280px',
          background: '#0a0a0a',
          borderRight: '1px solid #1a1a1a',
          padding: '24px',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#666',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            Add Nodes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { type: 'tool' as NodeType, icon: '🔧', label: 'Tool', desc: 'Link to AI tools' },
              { type: 'prompt' as NodeType, icon: '💬', label: 'Prompt', desc: 'AI prompts & instructions' },
              { type: 'screenshot' as NodeType, icon: '📸', label: 'Screenshot', desc: 'Visual references' },
              { type: 'action' as NodeType, icon: '⚡', label: 'Action', desc: 'Manual steps' },
              { type: 'decision' as NodeType, icon: '🔀', label: 'Decision', desc: 'Conditional branching' },
              { type: 'note' as NodeType, icon: '📝', label: 'Note', desc: 'Additional context' }
            ].map(({ type, icon, label, desc }) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                style={{
                  padding: '16px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a1a1a'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <span style={{ fontSize: '28px' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #1a1a1a'
          }}>
            <div style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#666',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              Keyboard Shortcuts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#666' }}>
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>Del</kbd> Delete selected</div>
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>+/-</kbd> Zoom in/out</div>
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>Shift+Drag</kbd> Pan canvas</div>
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>Ctrl+0</kbd> Reset view</div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <WorkflowCanvas
            initialNodes={nodes}
            initialConnections={connections}
            onNodesChange={setNodes}
            onEdgesChange={setConnections}
            editable={true}
          />

          {/* Empty State */}
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                Start Building Your Workflow
              </div>
              <div style={{ fontSize: '14px' }}>
                Add nodes from the toolbar to get started
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
