/**
 * Entity Tracker for Forefront Intelligence
 * Tracks conversation artifacts (prompts, images, code, search results) for reference resolution
 *
 * Solves: User says "generate image with that prompt" → need to know which prompt
 */

export type EntityType = 'prompt' | 'image' | 'code' | 'search-result' | 'analysis' | 'explanation'

export interface TrackedEntity {
  id: string
  type: EntityType
  content: string
  metadata?: {
    model?: string
    toolUsed?: string
    timestamp?: number
    [key: string]: any
  }
  turnIndex: number  // Which turn in conversation this was created
}

export class ConversationEntityTracker {
  private entities: TrackedEntity[] = []
  private currentTurnIndex: number = 0

  /**
   * Track a new entity from tool execution
   */
  trackEntity(type: EntityType, content: string, metadata?: any): string {
    const id = this.generateEntityId(type)

    this.entities.push({
      id,
      type,
      content,
      metadata: {
        ...metadata,
        timestamp: Date.now()
      },
      turnIndex: this.currentTurnIndex
    })

    console.log(`[Entity Tracker] Tracked ${type} entity: ${id}`)
    return id
  }

  /**
   * Get the most recent entity of a specific type
   */
  getMostRecent(type?: EntityType): TrackedEntity | null {
    const filtered = type
      ? this.entities.filter(e => e.type === type)
      : this.entities

    return filtered.length > 0 ? filtered[filtered.length - 1] : null
  }

  /**
   * Get entity by ID
   */
  getById(id: string): TrackedEntity | null {
    return this.entities.find(e => e.id === id) || null
  }

  /**
   * Get all entities of a specific type
   */
  getByType(type: EntityType): TrackedEntity[] {
    return this.entities.filter(e => e.type === type)
  }

  /**
   * Get recent entities (last N turns)
   */
  getRecent(count: number = 5): TrackedEntity[] {
    return this.entities.slice(-count)
  }

  /**
   * Increment turn counter (call this after each user message)
   */
  nextTurn(): void {
    this.currentTurnIndex++
  }

  /**
   * Clear all entities (for new conversation)
   */
  clear(): void {
    this.entities = []
    this.currentTurnIndex = 0
  }

  /**
   * Get all tracked entities (for debugging)
   */
  getAll(): TrackedEntity[] {
    return [...this.entities]
  }

  /**
   * Generate unique entity ID
   */
  private generateEntityId(type: EntityType): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${type}_${timestamp}_${random}`
  }

  /**
   * Serialize tracker state (for session persistence)
   */
  serialize(): string {
    return JSON.stringify({
      entities: this.entities,
      currentTurnIndex: this.currentTurnIndex
    })
  }

  /**
   * Restore tracker state from serialized data
   */
  static deserialize(data: string): ConversationEntityTracker {
    const tracker = new ConversationEntityTracker()
    const parsed = JSON.parse(data)

    tracker.entities = parsed.entities || []
    tracker.currentTurnIndex = parsed.currentTurnIndex || 0

    return tracker
  }
}

/**
 * Reference Resolver - Maps user references to actual entities
 */
export class ReferenceResolver {
  constructor(private tracker: ConversationEntityTracker) {}

  /**
   * Resolve a reference like "that prompt" or "the code above" to actual content
   */
  resolve(
    referencePhrase: string,
    referenceType?: EntityType,
    conversationHistory?: any[]
  ): string | null {
    const normalized = referencePhrase.toLowerCase()

    // Determine entity type from reference phrase if not provided
    const entityType = referenceType || this.inferEntityType(normalized)

    // Get the most recent entity of that type
    const entity = entityType
      ? this.tracker.getMostRecent(entityType)
      : this.tracker.getMostRecent()

    if (!entity) {
      console.log(`[Reference Resolver] No entity found for reference: "${referencePhrase}"`)
      return null
    }

    console.log(`[Reference Resolver] Resolved "${referencePhrase}" → ${entity.type} entity (${entity.content.substring(0, 50)}...)`)
    return entity.content
  }

  /**
   * Resolve ALL references in a user message
   */
  resolveAll(
    userMessage: string,
    references: { referenceType?: EntityType; referenceIndicators: string[] }
  ): string {
    let resolvedMessage = userMessage

    // If no references, return as-is
    if (references.referenceIndicators.length === 0) {
      return userMessage
    }

    // Get the most recent entity of the reference type
    const entity = references.referenceType
      ? this.tracker.getMostRecent(references.referenceType)
      : this.tracker.getMostRecent()

    if (!entity) {
      console.log('[Reference Resolver] No entity to resolve references to')
      return userMessage
    }

    // Replace each reference indicator with actual content
    for (const indicator of references.referenceIndicators) {
      // Create a case-insensitive regex
      const regex = new RegExp(this.escapeRegex(indicator), 'gi')

      // Only replace if the message is asking to use the reference
      // e.g., "generate image with that prompt" → replace "that prompt" with actual prompt
      if (this.isActionableReference(resolvedMessage, indicator)) {
        resolvedMessage = resolvedMessage.replace(regex, `"${entity.content}"`)
        console.log(`[Reference Resolver] Replaced "${indicator}" with actual ${entity.type} content`)
      }
    }

    return resolvedMessage
  }

  /**
   * Check if reference is actionable (needs resolution)
   * e.g., "generate with that" = YES, "I like that" = NO
   */
  private isActionableReference(message: string, reference: string): boolean {
    const actionVerbs = [
      'generate', 'create', 'make', 'use', 'using', 'with',
      'run', 'execute', 'apply', 'show', 'display'
    ]

    const normalizedMessage = message.toLowerCase()
    const referencePosition = normalizedMessage.indexOf(reference.toLowerCase())

    // Check if there's an action verb near the reference
    const beforeReference = normalizedMessage.substring(0, referencePosition)
    const afterReference = normalizedMessage.substring(referencePosition)

    const hasActionVerb = actionVerbs.some(verb =>
      beforeReference.includes(verb) || afterReference.substring(0, 50).includes(verb)
    )

    return hasActionVerb
  }

  /**
   * Infer entity type from reference phrase
   */
  private inferEntityType(referencePhrase: string): EntityType | undefined {
    if (/prompt/i.test(referencePhrase)) return 'prompt'
    if (/code|script|function/i.test(referencePhrase)) return 'code'
    if (/image|picture|photo/i.test(referencePhrase)) return 'image'
    if (/search|results?/i.test(referencePhrase)) return 'search-result'
    if (/analysis/i.test(referencePhrase)) return 'analysis'
    if (/explanation/i.test(referencePhrase)) return 'explanation'

    return undefined
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * Track tool execution results as entities
 */
export function trackToolResult(
  tracker: ConversationEntityTracker,
  toolName: string,
  result: any,
  metadata?: any
): void {
  switch (toolName) {
    case 'enhance_prompt':
      // Track the enhanced prompt
      tracker.trackEntity('prompt', result.content, {
        ...metadata,
        toolUsed: 'enhance_prompt',
        originalPrompt: result.metadata?.originalPrompt
      })
      break

    case 'generate_image':
      // Track the generated image URL
      tracker.trackEntity('image', result.metadata?.imageUrl || result.content, {
        ...metadata,
        toolUsed: 'generate_image',
        prompt: result.metadata?.prompt
      })
      break

    case 'execute_code':
      // Track the executed code
      tracker.trackEntity('code', result.metadata?.code || result.content, {
        ...metadata,
        toolUsed: 'execute_code',
        language: result.metadata?.language
      })
      break

    case 'search_web':
      // Track search results
      tracker.trackEntity('search-result', result.content, {
        ...metadata,
        toolUsed: 'search_web',
        citations: result.metadata?.citations,
        query: result.metadata?.query
      })
      break

    case 'analyze_data':
      // Track analysis
      tracker.trackEntity('analysis', result.content, {
        ...metadata,
        toolUsed: 'analyze_data',
        analysisType: result.metadata?.analysisType
      })
      break

    case 'explain_concept':
      // Track explanation
      tracker.trackEntity('explanation', result.content, {
        ...metadata,
        toolUsed: 'explain_concept',
        concept: result.metadata?.concept
      })
      break
  }
}
