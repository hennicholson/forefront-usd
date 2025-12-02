import { ForefrontOrchestrator } from '@/lib/forefront/orchestrator'
import { WorkflowNode, WorkflowConnection, NodeType, WorkflowCategory } from './workflow-types'

export interface WorkflowBuildRequest {
  description: string
  category?: WorkflowCategory
  userId?: string
}

export interface WorkflowBuildResponse {
  title: string
  description: string
  category: WorkflowCategory
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: {
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
    tools: string[]
  }
}

/**
 * Workflow Builder AI - Uses Forefront Intelligence to parse natural language
 * descriptions and generate structured workflow node graphs.
 */
export class WorkflowBuilderAI {
  private orchestrator: ForefrontOrchestrator

  constructor() {
    this.orchestrator = new ForefrontOrchestrator()
  }

  /**
   * Parse natural language workflow description into structured nodes and connections
   */
  async buildWorkflow(request: WorkflowBuildRequest): Promise<WorkflowBuildResponse> {
    const systemPrompt = this.buildSystemPrompt()

    const userPrompt = `
Parse this workflow description and extract all the steps:

Description: "${request.description}"
${request.category ? `Category: ${request.category}` : ''}

Return a structured JSON with the following format:
{
  "title": "Short title for the workflow",
  "description": "One sentence summary",
  "category": "video|coding|marketing|design|content|automation",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": "5 minutes|30 minutes|1 hour|etc",
  "steps": [
    {
      "type": "prompt|tool|action|decision|note",
      "title": "Step name",
      "description": "What happens in this step",
      "toolName": "ChatGPT|Midjourney|etc (if type=tool)",
      "toolUrl": "https://... (if type=tool)",
      "promptText": "Actual prompt (if type=prompt)",
      "actionType": "download|upload|copy|paste|wait (if type=action)",
      "actionDetails": "What to do (if type=action)"
    }
  ],
  "tags": ["tag1", "tag2"]
}

Important:
- Extract ALL explicit tools mentioned (ChatGPT, Midjourney, Cursor, CapCut, etc.)
- Add prompt nodes BEFORE each tool node if prompts are described
- Add action nodes for manual steps (download, copy, upload, wait, etc.)
- Connect steps in logical order
- Suggest prompts if they're implied but not explicitly stated
`

    try {
      const response = await this.orchestrator.execute({
        message: userPrompt,
        context: {
          userId: request.userId,
          moduleTitle: 'Workflow Builder',
          currentSlide: {
            title: 'Create Workflow',
            content: systemPrompt,
            type: 'workflow'
          },
          conversationHistory: []
        }
      })

      // Handle chained response (shouldn't happen for workflow builder, but handle it)
      if ('isChained' in response) {
        throw new Error('Unexpected chained response for workflow builder')
      }

      // Parse JSON from response
      const parsed = this.parseWorkflowJSON(response.content)

      // Convert to WorkflowNode format
      const { nodes, connections } = this.convertToNodes(parsed.steps)

      return {
        title: parsed.title,
        description: parsed.description,
        category: this.mapCategory(parsed.category),
        nodes,
        connections,
        metadata: {
          tags: parsed.tags || [],
          difficulty: parsed.difficulty || 'intermediate',
          estimatedTime: parsed.estimatedTime || '30 minutes',
          tools: this.extractTools(nodes)
        }
      }
    } catch (error) {
      console.error('[WorkflowBuilderAI] Error building workflow:', error)
      throw new Error('Failed to parse workflow description. Please try rephrasing.')
    }
  }

  /**
   * Suggest next steps for an existing workflow
   */
  async suggestNextSteps(
    currentNodes: WorkflowNode[],
    context: string
  ): Promise<WorkflowNode[]> {
    const prompt = `
Given this workflow so far:
${currentNodes.map((n, i) => `${i + 1}. ${n.title} (${n.type})`).join('\n')}

Context: ${context}

Suggest 3-5 logical next steps. Return JSON array:
[
  {
    "type": "prompt|tool|action",
    "title": "Step name",
    "description": "Why this step",
    "toolName": "Tool name if applicable"
  }
]
`

    try {
      const response = await this.orchestrator.execute({
        message: prompt,
        context: {
          moduleTitle: 'Workflow Suggestions',
          currentSlide: {
            title: 'Next Steps',
            content: 'Suggesting next workflow steps',
            type: 'workflow'
          },
          conversationHistory: []
        }
      })

      // Handle chained response
      if ('isChained' in response) {
        throw new Error('Unexpected chained response for workflow suggestions')
      }

      const suggestions = this.parseWorkflowJSON(response.content)
      if (!Array.isArray(suggestions)) return []

      // Convert suggestions to nodes (without positions yet)
      return suggestions.map((step: any, index: number) => ({
        id: `suggested-${Date.now()}-${index}`,
        type: step.type as NodeType,
        title: step.title,
        description: step.description,
        position: { x: 0, y: 0 }, // Will be positioned by caller
        data: step.toolName ? { toolName: step.toolName } : {}
      }))
    } catch (error) {
      console.error('[WorkflowBuilderAI] Error suggesting steps:', error)
      return []
    }
  }

  /**
   * Optimize an existing workflow
   */
  async optimizeWorkflow(
    nodes: WorkflowNode[],
    connections: WorkflowConnection[]
  ): Promise<{
    suggestions: string[]
    optimizedNodes: WorkflowNode[]
    reasoning: string
  }> {
    const prompt = `
Analyze this workflow and suggest optimizations:

Nodes:
${nodes.map((n, i) => `${i + 1}. ${n.title} (${n.type}): ${n.description || ''}`).join('\n')}

Look for:
1. Redundant steps that can be combined
2. Faster/cheaper model alternatives
3. Steps that can run in parallel
4. Missing error handling
5. Bottlenecks

Return JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "reasoning": "Overall analysis",
  "optimizations": [
    {"nodeIndex": 0, "change": "what to change", "reason": "why"}
  ]
}
`

    try {
      const response = await this.orchestrator.execute({
        message: prompt,
        context: {
          moduleTitle: 'Workflow Optimization',
          currentSlide: {
            title: 'Optimize',
            content: 'Analyzing workflow for improvements',
            type: 'workflow'
          },
          conversationHistory: []
        }
      })

      // Handle chained response
      if ('isChained' in response) {
        throw new Error('Unexpected chained response for workflow optimization')
      }

      const result = this.parseWorkflowJSON(response.content)

      return {
        suggestions: result.suggestions || [],
        optimizedNodes: nodes, // For now, return original (future: apply optimizations)
        reasoning: result.reasoning || ''
      }
    } catch (error) {
      console.error('[WorkflowBuilderAI] Error optimizing workflow:', error)
      return {
        suggestions: [],
        optimizedNodes: nodes,
        reasoning: 'Optimization failed'
      }
    }
  }

  /**
   * Convert parsed steps into WorkflowNode and WorkflowConnection arrays
   */
  private convertToNodes(steps: any[]): {
    nodes: WorkflowNode[]
    connections: WorkflowConnection[]
  } {
    const nodes: WorkflowNode[] = []
    const connections: WorkflowConnection[] = []

    // Layout: Horizontal flow with slight vertical alternation for visual appeal
    const startX = 100
    const startY = 300
    const horizontalSpacing = 350
    const verticalOffset = 80 // Alternate up/down for visual interest

    steps.forEach((step, index) => {
      const nodeId = `node-${index}`

      // Alternate vertical position for zigzag effect
      const yOffset = index % 2 === 0 ? 0 : verticalOffset

      // Create node
      const node: WorkflowNode = {
        id: nodeId,
        type: this.mapNodeType(step.type),
        title: step.title || `Step ${index + 1}`,
        description: step.description,
        position: {
          x: startX + index * horizontalSpacing,
          y: startY + yOffset
        },
        data: {}
      }

      // Add type-specific data
      if (step.type === 'tool' && step.toolName) {
        node.data.toolName = step.toolName
        node.data.toolUrl = step.toolUrl || this.guessToolUrl(step.toolName)
        node.data.toolIcon = this.getToolIcon(step.toolName)
      } else if (step.type === 'prompt' && step.promptText) {
        node.data.promptText = step.promptText
      } else if (step.type === 'action') {
        node.data.actionType = step.actionType || 'copy'
        node.data.actionDetails = step.actionDetails
      }

      nodes.push(node)

      // Create connection to previous node
      if (index > 0) {
        connections.push({
          id: `conn-${index - 1}-${index}`,
          from: `node-${index - 1}`,
          to: nodeId,
          type: 'default'
        })
      }
    })

    return { nodes, connections }
  }

  /**
   * Parse JSON from LLM response (handles markdown code blocks)
   */
  private parseWorkflowJSON(content: string): any {
    try {
      // Try direct parse first
      return JSON.parse(content)
    } catch {
      // Extract from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }

      // Try finding JSON object
      const objectMatch = content.match(/\{[\s\S]*\}/)
      if (objectMatch) {
        return JSON.parse(objectMatch[0])
      }

      throw new Error('Could not extract JSON from response')
    }
  }

  /**
   * Build system prompt for workflow parsing
   */
  private buildSystemPrompt(): string {
    return `You are a workflow designer AI. Your job is to parse natural language descriptions of AI workflows and extract structured steps.

Common AI Tools:
- ChatGPT, Claude, Gemini: Text generation
- Midjourney, DALL-E, Stable Diffusion: Image generation
- Runway, Pika Labs: Video generation
- Cursor, GitHub Copilot: Code assistance
- Canva, Figma: Design tools
- CapCut, Premiere Pro: Video editing
- Buffer, Hootsuite: Social media scheduling

Node Types:
- prompt: User inputs text prompt
- tool: Uses an AI tool or software
- action: Manual step (download, copy, upload, wait)
- decision: Branching logic
- note: Documentation/explanation

Always extract:
1. The GOAL of the workflow
2. Each TOOL mentioned
3. PROMPTS used (or suggest them if implied)
4. MANUAL ACTIONS (downloads, uploads, etc.)
5. The SEQUENCE of steps

Return valid JSON only.`
  }

  /**
   * Map string category to WorkflowCategory enum
   */
  private mapCategory(category: string): WorkflowCategory {
    const categories: WorkflowCategory[] = ['video', 'coding', 'marketing', 'design', 'content', 'automation']
    return categories.includes(category as WorkflowCategory)
      ? (category as WorkflowCategory)
      : 'content'
  }

  /**
   * Map string type to NodeType
   */
  private mapNodeType(type: string): NodeType {
    const types: NodeType[] = ['tool', 'prompt', 'screenshot', 'action', 'decision', 'note']
    return types.includes(type as NodeType) ? (type as NodeType) : 'note'
  }

  /**
   * Extract tool names from nodes
   */
  private extractTools(nodes: WorkflowNode[]): string[] {
    return nodes
      .filter(n => n.type === 'tool' && n.data.toolName)
      .map(n => n.data.toolName!)
  }

  /**
   * Guess tool URL from name
   */
  private guessToolUrl(toolName: string): string {
    const urlMap: Record<string, string> = {
      'ChatGPT': 'https://chat.openai.com',
      'Claude': 'https://claude.ai',
      'Gemini': 'https://gemini.google.com',
      'Midjourney': 'https://www.midjourney.com',
      'DALL-E': 'https://labs.openai.com',
      'Runway': 'https://runwayml.com',
      'Cursor': 'https://cursor.sh',
      'Canva': 'https://www.canva.com',
      'CapCut': 'https://www.capcut.com',
      'Buffer': 'https://buffer.com',
      'Figma': 'https://figma.com',
      'GitHub': 'https://github.com',
      'Perplexity': 'https://perplexity.ai'
    }

    return urlMap[toolName] || 'https://google.com/search?q=' + encodeURIComponent(toolName)
  }

  /**
   * Get emoji icon for tool
   */
  private getToolIcon(toolName: string): string {
    const iconMap: Record<string, string> = {
      'ChatGPT': '💬',
      'Claude': '🤖',
      'Gemini': '✨',
      'Midjourney': '🎨',
      'DALL-E': '🖼️',
      'Runway': '🎬',
      'Cursor': '💻',
      'Canva': '🎨',
      'CapCut': '✂️',
      'Buffer': '📱',
      'Figma': '🎨',
      'GitHub': '🐙',
      'Perplexity': '🔍'
    }

    return iconMap[toolName] || '🔧'
  }
}
