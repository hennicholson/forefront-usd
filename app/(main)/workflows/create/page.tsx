'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas'
import { NodePropertyPanel } from '@/components/workflows/NodePropertyPanel'
import { AIWorkflowBuilder } from '@/components/workflows/AIWorkflowBuilder'
import { WorkflowNode, WorkflowConnection, WorkflowCategory, NodeType } from '@/lib/workflows/workflow-types'
import { Sparkles, Grid, ArrowLeft, Loader2, Wrench, MessageSquare, Camera, Zap, GitFork, FileText, Film, Code, Megaphone, Palette, Save, Play, Plus, Maximize2, Move, ArrowRight, Clock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import WorkflowAnimation from '@/components/ui/workflow-animation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CreationMethod = 'choose' | 'ai' | 'manual'

export default function CreateWorkflowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [method, setMethod] = useState<CreationMethod>('choose')
  const [title, setTitle] = useState('Untitled Workflow')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<WorkflowCategory>('content')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingFromSaved, setLoadingFromSaved] = useState(false)

  // Check if creating from saved generation
  useEffect(() => {
    const fromSavedId = searchParams.get('fromSaved')
    if (fromSavedId && user?.id) {
      loadWorkflowFromSaved(parseInt(fromSavedId))
    }
  }, [searchParams, user?.id])

  // Load workflow from saved generation
  const loadWorkflowFromSaved = async (generationId: number) => {
    setLoadingFromSaved(true)
    try {
      const response = await fetch('/api/workflows/from-saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId, userId: user?.id })
      })

      if (!response.ok) throw new Error('Failed to load workflow')

      const data = await response.json()
      handleAIGenerated(data.workflow)
    } catch (error) {
      console.error('Error loading workflow from saved:', error)
      alert('Failed to load workflow from saved generation')
    } finally {
      setLoadingFromSaved(false)
    }
  }

  // Handle AI-generated workflow
  const handleAIGenerated = (workflow: any) => {
    setTitle(workflow.title)
    setDescription(workflow.description)
    setCategory(workflow.category)
    setNodes(workflow.nodes)
    setConnections(workflow.connections)
    setMethod('manual') // Switch to manual editor to review/edit
  }

  // Get selected node
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null

  // Add new node
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

  // Update node
  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prevNodes => prevNodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId))
    // Also remove connections related to this node
    setConnections(prevConnections =>
      prevConnections.filter(conn => conn.from !== nodeId && conn.to !== nodeId)
    )
    // Clear selection if deleted node was selected
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
  }

  // Reorder node (move up or down)
  const reorderNode = (nodeId: string, direction: 'up' | 'down') => {
    setNodes(prevNodes => {
      const currentIndex = prevNodes.findIndex(n => n.id === nodeId)
      if (currentIndex === -1) return prevNodes

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= prevNodes.length) return prevNodes

      const newNodes = [...prevNodes]
      const [movedNode] = newNodes.splice(currentIndex, 1)
      newNodes.splice(newIndex, 0, movedNode)

      // Update positions to reflect new order
      return newNodes.map((node, index) => ({
        ...node,
        position: { ...node.position, y: 300 + index * 150 }
      }))
    })
  }

  // Duplicate node
  const duplicateNode = (nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId)
    if (!nodeToDuplicate) return

    const newNode: WorkflowNode = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      title: `${nodeToDuplicate.title} (Copy)`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      }
    }

    setNodes(prevNodes => [...prevNodes, newNode])
  }

  // Save workflow
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
        isPublic: true,
        nodes,
        connections
      }

      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Workflow "${title}" created successfully!`)
        router.push('/workflows')
      } else {
        alert(`Failed to create workflow: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Failed to save workflow. Check console for details.')
    } finally {
      setIsSaving(false)
    }
  }

  // Loading state for fromSaved
  if (loadingFromSaved) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
          <p className="text-zinc-400">Building workflow from saved generation...</p>
        </div>
      </div>
    )
  }

  // Choose Method Screen
  if (method === 'choose') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Workflows
            </button>
            <h1 className="text-4xl font-bold">Create New Workflow</h1>
            <p className="text-zinc-400 text-lg">Choose how you'd like to build your workflow</p>
          </div>

          {/* Method Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* AI Builder */}
            <div
              onClick={() => setMethod('ai')}
              className="group relative block cursor-pointer"
            >
              {/* White Corner Squares */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <Card className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-600">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-900/50">
                      <Sparkles className="h-6 w-6 text-purple-400" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30">
                      NEW
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    AI Builder
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Describe your workflow in plain English. Forefront Intelligence automatically parses it into a visual node graph.
                  </p>

                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Powered by AI</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Quick setup</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      <span>Perfect for beginners</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors pt-2">
                    <Play className="h-4 w-4" />
                    <span>Start Building</span>
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>

                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
              </Card>
            </div>

            {/* From Saved */}
            <div
              onClick={() => router.push('/workflows/from-saved')}
              className="group relative block cursor-pointer"
            >
              {/* White Corner Squares */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <Card className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-600">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-900/50">
                      <Sparkles className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    From Saved Prompts
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Turn your saved AI generations into workflows. Auto-populates with your prompts, models, and results.
                  </p>

                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Uses saved work</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Zap className="h-3.5 w-3.5" />
                      <span>AI suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      <span>Share process</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors pt-2">
                    <Play className="h-4 w-4" />
                    <span>Browse Saved</span>
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>

                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
              </Card>
            </div>

            {/* Manual Builder */}
            <div
              onClick={() => setMethod('manual')}
              className="group relative block cursor-pointer"
            >
              {/* White Corner Squares */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              <Card className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-600">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-900/50">
                      <Grid className="h-6 w-6 text-zinc-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    Manual Builder
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Build your workflow from scratch using our visual node editor. Drag, drop, and customize every detail.
                  </p>

                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Grid className="h-3.5 w-3.5" />
                      <span>Full control</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Move className="h-3.5 w-3.5" />
                      <span>Visual editor</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                      <span>Advanced users</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors pt-2">
                    <Play className="h-4 w-4" />
                    <span>Start Building</span>
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>

                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // AI Builder Screen
  if (method === 'ai') {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => setMethod('choose')}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Creation Methods
          </button>

          <AIWorkflowBuilder
            onWorkflowGenerated={handleAIGenerated}
            userId={user?.id}
          />
        </div>
      </div>
    )
  }

  // Manual Editor Screen (also used after AI generation)
  return (
    <div className="fixed top-20 left-0 right-0 bottom-0 bg-zinc-950 flex flex-col">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-20 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-6 z-[100]"
      >
        {/* Left: Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMethod('choose')}
          className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 transition-all inline-flex items-center gap-2 glow-border"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* Center: Title & Description */}
        <div className="flex-1 flex flex-col items-center gap-1 px-8 max-w-2xl mx-auto">
          <motion.input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Workflow"
            className="w-full bg-transparent border-none text-white text-xl font-bold text-center focus:outline-none placeholder:text-zinc-600"
            whileFocus={{ scale: 1.01 }}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full bg-transparent border-none text-zinc-500 text-sm text-center focus:outline-none placeholder:text-zinc-700"
          />
        </div>

        {/* Right: Save Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Workflow
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Premium Node Palette */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-[300px] bg-zinc-900/30 backdrop-blur-sm border-r border-zinc-800 p-6 overflow-y-auto"
        >
          <div className="flex items-center gap-2 mb-6">
            <Plus size={16} className="text-purple-400" />
            <span className="text-sm font-semibold tracking-wide text-zinc-400">ADD NODES</span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { type: 'tool' as NodeType, Icon: Wrench, label: 'Tool', desc: 'AI tools & APIs', color: 'blue' },
              { type: 'prompt' as NodeType, Icon: MessageSquare, label: 'Prompt', desc: 'Instructions & prompts', color: 'purple' },
              { type: 'screenshot' as NodeType, Icon: Camera, label: 'Screenshot', desc: 'Visual references', color: 'pink' },
              { type: 'action' as NodeType, Icon: Zap, label: 'Action', desc: 'Manual steps', color: 'orange' },
              { type: 'decision' as NodeType, Icon: GitFork, label: 'Decision', desc: 'Conditional logic', color: 'green' },
              { type: 'note' as NodeType, Icon: FileText, label: 'Note', desc: 'Documentation', color: 'zinc' }
            ].map(({ type, Icon, label, desc, color }, idx) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addNode(type)}
                className="relative p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl text-left transition-all hover:bg-zinc-800/50 hover:border-zinc-600 flex items-center gap-3 group glow-border overflow-hidden"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-2.5 bg-zinc-900/50 rounded-lg group-hover:bg-zinc-900 transition-colors border border-zinc-700/30">
                  <Icon size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <div className="relative flex-1">
                  <div className="text-sm font-semibold text-zinc-200 mb-0.5">
                    {label}
                  </div>
                  <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {desc}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-zinc-600" />
              <span className="text-xs font-semibold tracking-wide text-zinc-500">SHORTCUTS</span>
            </div>
            <div className="flex flex-col gap-2.5 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-[10px] font-mono">Del</kbd>
                <span>Delete node</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-[10px] font-mono">⌘ +/-</kbd>
                <span>Zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-[10px] font-mono">Space</kbd>
                <span>Pan canvas</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            initialNodes={nodes}
            initialConnections={connections}
            onNodesChange={setNodes}
            onEdgesChange={setConnections}
            onNodeSelect={setSelectedNodeId}
            onNodeDelete={deleteNode}
            onNodeReorder={(nodeId, direction) => reorderNode(nodeId, direction)}
            onNodeDuplicate={duplicateNode}
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
