export type NodeType = 'tool' | 'prompt' | 'screenshot' | 'action' | 'decision' | 'note'

export interface WorkflowNode {
  id: string
  type: NodeType
  title: string
  description?: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
  data: {
    // Tool node
    toolName?: string
    toolUrl?: string
    toolIcon?: string
    modelId?: string  // NEW: Link to Forefront Intelligence model
    savedGenerationId?: number  // NEW: Link to generationHistory

    // Prompt node
    promptText?: string
    variables?: string[]

    // Screenshot node
    imageUrl?: string
    imageCaption?: string

    // Action node
    actionType?: 'upload' | 'download' | 'copy' | 'paste' | 'wait'
    actionDetails?: string

    // Decision node
    condition?: string
    branches?: { label: string; targetId: string }[]

    // Note node
    noteText?: string
    noteColor?: string
  }
}

export interface WorkflowConnection {
  id: string
  from: string  // source node id
  to: string    // target node id
  label?: string
  type?: 'default' | 'success' | 'error' | 'conditional'
  style?: {
    strokeWidth?: number
    strokeDasharray?: string
    animated?: boolean
  }
}

export interface Workflow {
  id: number
  userId: string
  title: string
  description: string | null
  category: WorkflowCategory
  isPublic: boolean
  publishStatus: 'draft' | 'review' | 'published'  // NEW: Publication workflow
  likesCount: number
  viewsCount: number
  forksCount: number
  executionCount: number  // NEW: How many times workflow was run
  avgExecutionTime: number  // NEW: Average execution time in ms
  forkedFrom: number | null
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  modelMapping: Record<string, string>  // NEW: nodeId -> modelId mapping
  collaborators: string[]  // NEW: Array of user IDs who can edit
  realTimeSessionId: string | null  // NEW: Ably channel for live editing
  canvasSettings: {
    zoom: number
    pan: { x: number; y: number }
  }
  metadata: {
    tags?: string[]
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime?: string
    tools?: string[]
  }
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    name: string
    profileImage: string | null
  }
}

export type WorkflowCategory = 'video' | 'coding' | 'marketing' | 'design' | 'content' | 'automation'

export interface WorkflowTemplate {
  name: string
  category: WorkflowCategory
  description: string
  icon: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
}

export interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  selectedNodeId: string | null
  selectedConnectionId: string | null
  isDragging: boolean
  isConnecting: boolean
  connectionStart: string | null
}
