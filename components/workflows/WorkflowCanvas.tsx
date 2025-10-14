'use client'
import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes
} from 'reactflow'
import 'reactflow/dist/style.css'
import { WorkflowNode, WorkflowConnection } from '@/lib/workflows/workflow-types'
import { WorkflowToolNode } from './nodes/WorkflowToolNode'
import { WorkflowPromptNode } from './nodes/WorkflowPromptNode'
import { WorkflowActionNode } from './nodes/WorkflowActionNode'

interface WorkflowCanvasProps {
  initialNodes: WorkflowNode[]
  initialConnections: WorkflowConnection[]
  onNodesChange?: (nodes: WorkflowNode[]) => void
  onEdgesChange?: (edges: WorkflowConnection[]) => void
  onNodeSelect?: (nodeId: string | null) => void
  editable?: boolean
}

// Define custom node types following React Flow patterns
const nodeTypes: NodeTypes = {
  tool: WorkflowToolNode,
  prompt: WorkflowPromptNode,
  action: WorkflowActionNode,
  screenshot: WorkflowPromptNode, // Use prompt node for screenshots
  decision: WorkflowActionNode, // Use action node for decisions
  note: WorkflowActionNode // Use action node for notes
}

function WorkflowCanvasInner({
  initialNodes,
  initialConnections,
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onNodeSelect,
  editable = true
}: WorkflowCanvasProps) {
  // Convert workflow nodes to React Flow nodes
  const convertToReactFlowNodes = useCallback((workflowNodes: WorkflowNode[]): Node[] => {
    return workflowNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node,
        onChange: (updates: Partial<WorkflowNode>) => {
          // Update node data when edited
          setNodes((nodes) =>
            nodes.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  data: { ...n.data, ...updates }
                }
              }
              return n
            })
          )
        }
      }
    }))
  }, [])

  // Convert workflow connections to React Flow edges
  const convertToReactFlowEdges = useCallback((workflowConnections: WorkflowConnection[]): Edge[] => {
    return workflowConnections.map(conn => ({
      id: conn.id,
      source: conn.from,
      target: conn.to,
      type: 'straight',
      animated: false,
      style: {
        stroke: '#555',
        strokeWidth: 2
      }
    }))
  }, [])

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(convertToReactFlowNodes(initialNodes))
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(convertToReactFlowEdges(initialConnections))

  // Wrap edge changes to notify parent
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes)

    // Defer parent notification to avoid render-during-render
    if (onEdgesChangeCallback && editable) {
      setTimeout(() => {
        setEdges((currentEdges) => {
          const workflowConnections = currentEdges.map(edge => ({
            id: edge.id,
            from: edge.source,
            to: edge.target,
            type: 'default' as const
          }))
          onEdgesChangeCallback(workflowConnections)
          return currentEdges
        })
      }, 0)
    }
  }, [onEdgesChangeInternal, onEdgesChangeCallback, editable, setEdges])

  // Update React Flow nodes when initialNodes change
  useEffect(() => {
    setNodes(convertToReactFlowNodes(initialNodes))
  }, [initialNodes, convertToReactFlowNodes, setNodes])

  // Update React Flow edges when initialConnections change - only on mount or when IDs change
  useEffect(() => {
    const edgeIds = initialConnections.map(c => c.id).join(',')
    setEdges(convertToReactFlowEdges(initialConnections))
  }, [initialConnections.map(c => c.id).join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!editable) return
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'straight',
      style: { stroke: '#555', strokeWidth: 2 }
    }
    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds)

      // Defer parent notification to avoid render-during-render
      if (onEdgesChangeCallback) {
        setTimeout(() => {
          const workflowConnections = updatedEdges.map(edge => ({
            id: edge.id,
            from: edge.source,
            to: edge.target,
            type: 'default' as const
          }))
          onEdgesChangeCallback(workflowConnections)
        }, 0)
      }

      return updatedEdges
    })
  }, [editable, setEdges, onEdgesChangeCallback])

  // Handle node drag end - update parent with new positions
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: any) => {
    if (onNodesChangeCallback) {
      const updatedNodes = nodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n.data,
            position: node.position
          }
        }
        return n.data
      })
      onNodesChangeCallback(updatedNodes as WorkflowNode[])
    }
  }, [nodes, onNodesChangeCallback])

  // Handle node click for selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (onNodeSelect) {
      onNodeSelect(node.id)
    }
  }, [onNodeSelect])

  // Handle canvas click to deselect
  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null)
    }
  }, [onNodeSelect])

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        style={{
          background: '#000'
        }}
      >
        <Background
          gap={40}
          size={1}
          color="#222"
          style={{ background: '#000' }}
        />
        <Controls
          style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px'
          }}
        />
        {!editable && (
          <MiniMap
            style={{
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '8px'
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
          />
        )}
      </ReactFlow>
    </div>
  )
}

// Export wrapped component with ReactFlowProvider
export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
