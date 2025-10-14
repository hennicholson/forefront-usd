'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas'
import { WorkflowNode, WorkflowConnection } from '@/lib/workflows/workflow-types'

export default function WorkflowViewPage() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<any>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [runMode, setRunMode] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isForkLoading, setIsForkLoading] = useState(false)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const res = await fetch(`/api/workflows?id=${workflowId}`)
        if (res.ok) {
          const data = await res.json()
          setWorkflow(data)
          setNodes(data.nodes || [])
          setConnections(data.connections || [])
        } else {
          console.error('Failed to load workflow')
        }
      } catch (error) {
        console.error('Error loading workflow:', error)
      }
    }

    loadWorkflow()
  }, [workflowId])

  const handleLike = async () => {
    setIsLiked(!isLiked)
    // TODO: API call to like workflow
    if (workflow) {
      setWorkflow({
        ...workflow,
        likesCount: isLiked ? workflow.likesCount - 1 : workflow.likesCount + 1
      })
    }
  }

  const handleFork = async () => {
    setIsForkLoading(true)
    try {
      // TODO: API call to fork workflow
      console.log('Forking workflow:', workflowId)
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/workflows/create')
    } catch (error) {
      console.error('Error forking workflow:', error)
    } finally {
      setIsForkLoading(false)
    }
  }

  const handleRunMode = () => {
    setRunMode(!runMode)
    setCurrentStepIndex(0)
  }

  const handleNextStep = () => {
    if (currentStepIndex < nodes.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  if (!workflow) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff'
      }}>
        Loading workflow...
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video': return '🎬'
      case 'coding': return '💻'
      case 'marketing': return '📱'
      case 'design': return '🎨'
      case 'content': return '✍️'
      case 'automation': return '⚡'
      default: return '📋'
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{getCategoryIcon(workflow.category)}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {workflow.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {workflow.viewsCount?.toLocaleString() || 0} views
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleLike}
            style={{
              padding: '10px 20px',
              background: isLiked ? '#fff' : 'transparent',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: isLiked ? '#000' : '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLiked) e.currentTarget.style.borderColor = '#fff'
            }}
            onMouseLeave={(e) => {
              if (!isLiked) e.currentTarget.style.borderColor = '#1a1a1a'
            }}
          >
            {isLiked ? '❤️' : '🤍'} {workflow.likesCount}
          </button>
          <button
            onClick={handleFork}
            disabled={isForkLoading}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isForkLoading ? 'not-allowed' : 'pointer',
              opacity: isForkLoading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !isForkLoading && (e.currentTarget.style.borderColor = '#fff')}
            onMouseLeave={(e) => !isForkLoading && (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            {isForkLoading ? 'Forking...' : `Fork (${workflow.forksCount})`}
          </button>
          <button
            onClick={handleRunMode}
            style={{
              padding: '10px 24px',
              background: runMode ? '#fff' : 'transparent',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: runMode ? '#000' : '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !runMode && (e.currentTarget.style.borderColor = '#fff')}
            onMouseLeave={(e) => !runMode && (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            {runMode ? '📖 View Mode' : '▶️ Run Mode'}
          </button>
        </div>
      </div>

      {/* Description Bar */}
      {workflow.description && (
        <div style={{
          padding: '16px 24px',
          background: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a',
          fontSize: '14px',
          color: '#999'
        }}>
          {workflow.description}
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <WorkflowCanvas
            initialNodes={nodes}
            initialConnections={connections}
            editable={false}
          />
        </div>

        {/* Run Mode Sidebar */}
        {runMode && (
          <div style={{
            width: '360px',
            background: '#0a0a0a',
            borderLeft: '1px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50
          }}>
            {/* Step Counter */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #1a1a1a'
            }}>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#666',
                fontWeight: 700,
                marginBottom: '12px'
              }}>
                Step {currentStepIndex + 1} of {nodes.length}
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: '#1a1a1a',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentStepIndex + 1) / nodes.length) * 100}%`,
                  height: '100%',
                  background: '#fff',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Current Step */}
            <div style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto'
            }}>
              {nodes[currentStepIndex] && (
                <>
                  <div style={{
                    fontSize: '11px',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}>
                    {nodes[currentStepIndex].type}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '12px'
                  }}>
                    {nodes[currentStepIndex].title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    lineHeight: 1.6,
                    marginBottom: '20px'
                  }}>
                    {nodes[currentStepIndex].description}
                  </div>

                  {/* Type-specific content */}
                  {nodes[currentStepIndex].type === 'tool' && nodes[currentStepIndex].data.toolUrl && (
                    <a
                      href={nodes[currentStepIndex].data.toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '14px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        marginBottom: '20px'
                      }}
                    >
                      Open {nodes[currentStepIndex].data.toolName} →
                    </a>
                  )}

                  {nodes[currentStepIndex].type === 'prompt' && nodes[currentStepIndex].data.promptText && (
                    <div style={{
                      padding: '16px',
                      background: '#000',
                      border: '1px solid #1a1a1a',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'Monaco, monospace',
                      color: '#ccc',
                      lineHeight: 1.6,
                      marginBottom: '20px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {nodes[currentStepIndex].data.promptText}
                    </div>
                  )}

                  {nodes[currentStepIndex].type === 'action' && (
                    <div style={{
                      padding: '16px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#ccc',
                      lineHeight: 1.6,
                      marginBottom: '20px'
                    }}>
                      <strong>Action required:</strong> {nodes[currentStepIndex].data.actionType}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Navigation */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #1a1a1a',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #1a1a1a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStepIndex === 0 ? 0.3 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => currentStepIndex > 0 && (e.currentTarget.style.borderColor = '#fff')}
                onMouseLeave={(e) => currentStepIndex > 0 && (e.currentTarget.style.borderColor = '#1a1a1a')}
              >
                ← Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={currentStepIndex === nodes.length - 1}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: currentStepIndex === nodes.length - 1 ? 'transparent' : '#fff',
                  border: '1px solid #1a1a1a',
                  borderRadius: '6px',
                  color: currentStepIndex === nodes.length - 1 ? '#fff' : '#000',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: currentStepIndex === nodes.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentStepIndex === nodes.length - 1 ? 0.3 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {currentStepIndex === nodes.length - 1 ? '✓ Complete' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
