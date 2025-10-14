'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas'
import { NodePropertyPanel } from '@/components/workflows/NodePropertyPanel'
import { WorkflowNode, WorkflowConnection, NodeType } from '@/lib/workflows/workflow-types'

export default function AdminEditWorkflowPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const workflowId = params.id as string
  const isNew = workflowId === 'new'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('video')
  const [isPublic, setIsPublic] = useState(true)
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (!isNew) {
      loadWorkflow()
    }
  }, [workflowId, isNew])

  const loadWorkflow = async () => {
    try {
      const res = await fetch(`/api/workflows?id=${workflowId}`)
      if (res.ok) {
        const workflow = await res.json()
        setTitle(workflow.title)
        setDescription(workflow.description || '')
        setCategory(workflow.category)
        setIsPublic(workflow.isPublic)
        setNodes(workflow.nodes || [])
        setConnections(workflow.connections || [])
      }
    } catch (error) {
      console.error('Error loading workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null

  const addNode = (type: NodeType) => {
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

    if (type === 'tool') {
      newNode.title = 'Tool'
      newNode.description = 'AI tool'
      newNode.data = {
        toolName: 'Tool',
        toolUrl: 'https://example.com'
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

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prevNodes => prevNodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save workflows')
      return
    }

    if (!title.trim()) {
      alert('Please enter a workflow name')
      return
    }

    setIsSaving(true)
    try {
      const workflowData = {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        isPublic,
        nodes,
        connections
      }

      console.log('Saving workflow:', workflowData)

      if (isNew) {
        // Create new workflow
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowData)
        })

        const data = await res.json()
        console.log('Create response:', data)

        if (res.ok) {
          alert(`Workflow "${title}" created successfully!`)
          router.push('/admin/workflows')
        } else {
          alert(`Failed to create workflow: ${data.error || 'Unknown error'}`)
        }
      } else {
        // Update existing workflow
        const res = await fetch('/api/workflows', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: workflowId,
            ...workflowData
          })
        })

        const data = await res.json()
        console.log('Update response:', data)

        if (res.ok) {
          alert(`Workflow "${title}" updated successfully!`)
          router.push('/admin/workflows')
        } else {
          alert(`Failed to update workflow: ${data.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Failed to save workflow. Check console for details.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Loading workflow...
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
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
            onClick={() => router.push('/admin/workflows')}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter workflow name..."
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '10px 14px',
                outline: 'none',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                width: '100%',
                maxWidth: '400px'
              }}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#666',
                fontSize: '12px',
                width: '100%',
                maxWidth: '400px',
                paddingLeft: '14px'
              }}
            />
          </div>
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
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              Public
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            style={{
              padding: '12px 28px',
              background: '#fff',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontSize: '14px',
              fontWeight: 700,
              cursor: (isSaving || !title.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isSaving || !title.trim()) ? 0.5 : 1,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
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
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>Drag</kbd> Pan canvas</div>
              <div><kbd style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>Click</kbd> Edit node text</div>
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
            onNodeSelect={setSelectedNodeId}
            editable={true}
          />
        </div>

        {/* Property Panel */}
        <NodePropertyPanel
          node={selectedNode}
          onUpdate={(updates) => {
            if (selectedNodeId) {
              updateNode(selectedNodeId, updates)
            }
          }}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  )
}
