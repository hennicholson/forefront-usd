/**
 * Instruction Parser for Forefront Intelligence
 * Extracts explicit user requirements from messages to enforce instruction following
 *
 * Solves: User says "use sonar deep research" but system uses different model
 */

export interface ParsedInstructions {
  // Explicit model requirements
  modelPreferences: {
    imageGeneration?: string[]      // e.g., ["seed-dream-4", "flux"]
    textGeneration?: string[]       // e.g., ["llama-3.3-70b", "gemini-flash-2.0"]
    search?: string[]               // e.g., ["sonar-pro", "sonar-deep-research"]
    reasoning?: string[]            // e.g., ["deepseek-r1", "qwen-qwq-32b"]
    vision?: string[]               // e.g., ["llama-3.2-90b-vision"]
  }

  // Tool requirements
  toolRequirements: {
    mustUseTools: string[]          // Tools that MUST be used (e.g., ["search_web", "generate_image"])
    preferredTools: string[]        // Tools that should be preferred
  }

  // Reference indicators
  references: {
    hasReferences: boolean          // Does message contain "that", "it", "the previous", etc.
    referenceType?: 'prompt' | 'code' | 'image' | 'search-result' | 'analysis' | 'explanation'
    referenceIndicators: string[]   // The actual phrases: ["that prompt", "using it", etc.]
  }

  // Sequential workflow indicators
  workflow: {
    isMultiStep: boolean            // "first do X, then do Y"
    steps: string[]                 // Extracted steps
  }
}

/**
 * Parse user message to extract explicit instructions
 */
export function parseInstructions(message: string): ParsedInstructions {
  const normalizedMessage = message.toLowerCase()

  return {
    modelPreferences: extractModelPreferences(normalizedMessage),
    toolRequirements: extractToolRequirements(normalizedMessage),
    references: extractReferences(normalizedMessage, message),
    workflow: extractWorkflow(normalizedMessage)
  }
}

/**
 * Extract explicit model preferences from message
 */
function extractModelPreferences(message: string) {
  const preferences: ParsedInstructions['modelPreferences'] = {}

  // Image generation models
  const imageModels = [
    { pattern: /seed\s*dream|seedream/i, model: 'seed-dream-4' },
    { pattern: /flux\s*(1\.1|pro|dev)?/i, model: 'flux' },
    { pattern: /midjourney|mj/i, model: 'midjourney' },
    { pattern: /dalle|dall-e/i, model: 'dalle-3' }
  ]

  for (const { pattern, model } of imageModels) {
    if (pattern.test(message)) {
      if (!preferences.imageGeneration) preferences.imageGeneration = []
      preferences.imageGeneration.push(model)
    }
  }

  // Search models
  const searchModels = [
    { pattern: /sonar\s*deep\s*research/i, model: 'sonar-deep-research' },
    { pattern: /sonar\s*pro/i, model: 'sonar-pro' },
    { pattern: /sonar\s*reasoning/i, model: 'sonar-reasoning' },
    { pattern: /perplexity/i, model: 'sonar-pro' }
  ]

  for (const { pattern, model } of searchModels) {
    if (pattern.test(message)) {
      if (!preferences.search) preferences.search = []
      preferences.search.push(model)
    }
  }

  // Reasoning models
  const reasoningModels = [
    { pattern: /deepseek\s*r1/i, model: 'deepseek-r1' },
    { pattern: /qwen\s*qwq/i, model: 'qwen-qwq-32b' },
    { pattern: /o1\s*preview/i, model: 'o1-preview' }
  ]

  for (const { pattern, model } of reasoningModels) {
    if (pattern.test(message)) {
      if (!preferences.reasoning) preferences.reasoning = []
      preferences.reasoning.push(model)
    }
  }

  // Text generation models
  const textModels = [
    { pattern: /llama\s*3\.3\s*70b/i, model: 'llama-3.3-70b-versatile' },
    { pattern: /gemini\s*flash\s*2\.0/i, model: 'gemini-flash-2.0' },
    { pattern: /claude\s*3\.5/i, model: 'claude-3.5-sonnet' },
    { pattern: /gpt\s*4o/i, model: 'gpt-4o' }
  ]

  for (const { pattern, model } of textModels) {
    if (pattern.test(message)) {
      if (!preferences.textGeneration) preferences.textGeneration = []
      preferences.textGeneration.push(model)
    }
  }

  // Vision models
  const visionModels = [
    { pattern: /llama.*vision|vision.*llama/i, model: 'llama-3.2-90b-vision' },
    { pattern: /pixtral/i, model: 'pixtral-12b' }
  ]

  for (const { pattern, model } of visionModels) {
    if (pattern.test(message)) {
      if (!preferences.vision) preferences.vision = []
      preferences.vision.push(model)
    }
  }

  return preferences
}

/**
 * Extract tool requirements (what tools MUST be used)
 */
function extractToolRequirements(message: string) {
  const requirements: ParsedInstructions['toolRequirements'] = {
    mustUseTools: [],
    preferredTools: []
  }

  // Image generation indicators
  if (/(generate|create|make|produce).*image|image.*(generation|creation)|draw|illustrate/i.test(message)) {
    requirements.mustUseTools.push('generate_image')
  }

  // Web search indicators
  if (/(search|find|look up|research|latest|current|news|what is happening)|(what'?s new)/i.test(message)) {
    requirements.preferredTools.push('search_web')
  }

  // Code execution indicators
  if (/(run|execute|calculate|compute).*code|code.*(execution|run)|python|calculate this/i.test(message)) {
    requirements.preferredTools.push('execute_code')
  }

  // Data analysis indicators
  if (/analyze.*data|data.*(analysis|insights)|statistics|trends/i.test(message)) {
    requirements.preferredTools.push('analyze_data')
  }

  // Prompt enhancement indicators
  if (/(enhance|improve|optimize|refine|better).*prompt|prompt.*(enhancement|optimization)/i.test(message)) {
    requirements.preferredTools.push('enhance_prompt')
  }

  // Explanation indicators
  if (/(explain|what is|how does|describe|teach me|tell me about)/i.test(message)) {
    requirements.preferredTools.push('explain_concept')
  }

  return requirements
}

/**
 * Extract reference indicators (anaphora resolution)
 */
function extractReferences(normalizedMessage: string, originalMessage: string) {
  const referencePatterns = [
    // Demonstrative pronouns
    /\b(that|this|these|those)\s+(prompt|code|image|result|output|response|search|answer)/gi,

    // Personal/demonstrative pronouns alone
    /\b(it|them|that|this)\b/gi,

    // Relative references
    /\b(the\s+)?(previous|last|above|earlier|prior)\s+(prompt|code|image|result|output|response)/gi,

    // Implicit references
    /\busing\s+(it|that|this)\b/gi,
    /\bwith\s+(it|that|this|the\s+same)\b/gi,
    /\bfrom\s+(it|that|this|above|before)\b/gi,
  ]

  const indicators: string[] = []
  let hasReferences = false

  for (const pattern of referencePatterns) {
    const matches = originalMessage.matchAll(pattern)
    for (const match of matches) {
      indicators.push(match[0])
      hasReferences = true
    }
  }

  // Determine reference type
  let referenceType: ParsedInstructions['references']['referenceType']

  if (/prompt/i.test(originalMessage)) referenceType = 'prompt'
  else if (/code|script|function/i.test(originalMessage)) referenceType = 'code'
  else if (/image|picture|photo/i.test(originalMessage)) referenceType = 'image'
  else if (/search|results|findings/i.test(originalMessage)) referenceType = 'search-result'
  else if (/analysis|insights/i.test(originalMessage)) referenceType = 'analysis'
  else if (/explanation|concept/i.test(originalMessage)) referenceType = 'explanation'
  // else: leave referenceType undefined if we can't determine it

  return {
    hasReferences,
    referenceType,
    referenceIndicators: [...new Set(indicators)] // Remove duplicates
  }
}

/**
 * Extract workflow/sequential steps
 */
function extractWorkflow(message: string) {
  const workflow: ParsedInstructions['workflow'] = {
    isMultiStep: false,
    steps: []
  }

  // Check for multi-step indicators
  const multiStepPatterns = [
    /first.*then/i,
    /\d+\.\s/g,  // Numbered lists
    /(and then|next|after that|finally)/i,
    /(step 1|step one)/i
  ]

  for (const pattern of multiStepPatterns) {
    if (pattern.test(message)) {
      workflow.isMultiStep = true
      break
    }
  }

  // Extract steps from numbered lists
  const numberedSteps = message.match(/\d+\.\s+([^.]+)/g)
  if (numberedSteps && numberedSteps.length > 1) {
    workflow.isMultiStep = true
    workflow.steps = numberedSteps.map(step => step.replace(/^\d+\.\s+/, '').trim())
  }

  // Extract steps from "first...then..." pattern
  const firstThenMatch = message.match(/first,?\s+(.+?)[,;]\s*(?:and\s+)?then,?\s+(.+)/i)
  if (firstThenMatch) {
    workflow.isMultiStep = true
    workflow.steps = [firstThenMatch[1].trim(), firstThenMatch[2].trim()]
  }

  return workflow
}

/**
 * Validate if orchestrator decision respects user's explicit instructions
 */
export function validateAgainstInstructions(
  parsedInstructions: ParsedInstructions,
  selectedModel: string,
  selectedTools: string[]
): { valid: boolean; violations: string[] } {
  const violations: string[] = []

  // Check model preferences
  const { modelPreferences } = parsedInstructions

  // If user explicitly requested a specific model category, validate it
  if (modelPreferences.imageGeneration?.length) {
    const matchesPreference = modelPreferences.imageGeneration.some(
      pref => selectedModel.toLowerCase().includes(pref.toLowerCase())
    )
    if (!matchesPreference && selectedTools.includes('generate_image')) {
      violations.push(
        `User requested image generation with ${modelPreferences.imageGeneration.join(' or ')}, but using ${selectedModel}`
      )
    }
  }

  if (modelPreferences.search?.length) {
    const matchesPreference = modelPreferences.search.some(
      pref => selectedModel.toLowerCase().includes(pref.toLowerCase())
    )
    if (!matchesPreference && selectedTools.includes('search_web')) {
      violations.push(
        `User requested search with ${modelPreferences.search.join(' or ')}, but using ${selectedModel}`
      )
    }
  }

  // Check required tools
  const { toolRequirements } = parsedInstructions
  for (const requiredTool of toolRequirements.mustUseTools) {
    if (!selectedTools.includes(requiredTool)) {
      violations.push(
        `User's request requires tool '${requiredTool}' but it was not selected`
      )
    }
  }

  return {
    valid: violations.length === 0,
    violations
  }
}
