/**
 * Dynamic Workflow Planner - Uses Llama 3.3 to generate execution plans
 * Replaces hardcoded chain logic with intelligent, request-based planning
 */

import { groqClient } from '@/lib/groq/client'
import type { QueryIntent } from './router'

export interface PlannedStep {
  stepId: string
  stepNumber: number
  purpose: 'web-search' | 'prompt-enhancement' | 'image-generation' | 'code-generation' | 'text-generation' | 'reasoning' | 'final-composition'
  recommendedModel: string
  systemPrompt: string
  instructions: string
  expectedOutputSchema: Record<string, any>
  inputFrom?: number  // Which step's output to use (undefined = user input)
}

export interface ExecutionPlan {
  steps: PlannedStep[]
  reasoning: string
  estimatedTotalTime: string
  requiresMultipleModels: boolean
}

/**
 * Generate a dynamic execution plan using Llama 3.3
 */
export async function generateExecutionPlan(params: {
  userMessage: string
  intent: QueryIntent
  context?: any
}): Promise<ExecutionPlan> {
  const { userMessage, intent, context } = params

  const planningPrompt = buildPlanningPrompt(userMessage, intent, context)

  console.log('[Planner] Generating execution plan with Llama 3.3...')

  try {
    const response = await groqClient.chat({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: PLANNER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: planningPrompt
        }
      ],
      temperature: 0.1,  // Low temperature for consistent planning
      maxTokens: 2000,
      stream: false
    }) as any

    const content = response.choices?.[0]?.message?.content || '{}'
    const plan = parsePlanResponse(content)

    console.log(`[Planner] Generated ${plan.steps.length}-step execution plan`)
    console.log(`[Planner] Reasoning: ${plan.reasoning}`)

    return plan
  } catch (error) {
    console.error('[Planner] Error generating plan:', error)
    // Fallback to simple single-step plan
    return generateFallbackPlan(userMessage, intent)
  }
}

/**
 * Planner system prompt - instructs Llama 3.3 how to create execution plans
 */
const PLANNER_SYSTEM_PROMPT = `You are an expert AI Workflow Planner. Your job is to analyze user requests and create optimal multi-step execution plans.

# YOUR ROLE
You orchestrate multiple specialized AI models to fulfill user requests. You decide:
1. What steps are needed (research, generation, optimization, etc.)
2. Which model is best for each step
3. How steps should flow (which step's output feeds into the next)
4. What output format each step should produce

# AVAILABLE MODELS & THEIR STRENGTHS

**Research & Web Search:**
- \`sonar-pro\` - Real-time web search, current events, factual information
- \`sonar\` - Lighter web search for simpler queries

**Text Generation & Reasoning:**
- \`llama-3.3-70b-versatile\` - Best for: complex reasoning, writing, prompt optimization, general-purpose
- \`gemini-2.0-flash\` - Best for: fast responses, 1M token context, multimodal understanding
- \`qwen/qwen3-32b\` - Best for: deep reasoning, "thinking" mode for complex problems

**Code Generation:**
- \`llama-3.3-70b-versatile\` - Excellent for code, supports tool calling
- \`openai/gpt-oss-120b\` - Strong coding capabilities
- \`meta-llama/llama-4-maverick-17b-128e-instruct\` - Efficient coding

**Image Generation:**
- \`seedream-4\` - State-of-the-art image generation (Seed Dream 4)
- Requires: Detailed prompt from prompt enhancement step

**Video Generation:**
- \`minividream\` - Short video generation
- Requires: Detailed scene description

# STEP TYPES YOU CAN USE

1. **web-search** - Gather current information, research topics, find facts
   - Model: sonar-pro or sonar
   - Output: Research findings, citations, key insights

2. **prompt-enhancement** - Optimize prompts for generation models
   - Model: llama-3.3-70b-versatile
   - Output: Detailed, optimized prompt for target model
   - Use BEFORE: image-generation, video-generation

3. **image-generation** - Create visual content
   - Model: seedream-4
   - Input: Enhanced prompt from previous step
   - Output: Image URL

4. **code-generation** - Write code, functions, scripts
   - Model: llama-3.3-70b-versatile
   - Output: Complete code with explanations

5. **text-generation** - Write documents, explanations, summaries
   - Model: llama-3.3-70b-versatile or gemini-2.0-flash
   - Output: Written content

6. **reasoning** - Complex analysis, problem-solving, multi-step thinking
   - Model: qwen/qwen3-32b or llama-3.3-70b-versatile
   - Output: Detailed reasoning and conclusions

7. **final-composition** - Synthesize all steps into cohesive answer
   - Model: llama-3.3-70b-versatile
   - Input: All previous step outputs
   - Output: Educational narrative showing the workflow

# PLANNING RULES

1. **Always include final-composition** as the last step when there are 2+ steps
2. **Research before generation** - If user wants to generate something + mentions research/search:
   - Step 1: web-search
   - Step 2: prompt-enhancement (use research)
   - Step 3: generation (image/code/text)
   - Step 4: final-composition

3. **Prompt enhancement required** for image/video generation:
   - Never send user's raw prompt directly to image models
   - Always optimize prompts first

4. **Code requests** - Usually don't need research unless user asks for it:
   - Step 1: code-generation
   - Or if research needed: web-search → code-generation → final-composition

5. **Text requests** (summaries, explanations, writing):
   - Simple: Just text-generation
   - Complex: web-search → text-generation → final-composition

6. **Keep it efficient** - Don't add unnecessary steps
   - 1 step for simple requests
   - 2-4 steps for complex requests
   - Composition only when 2+ content steps exist

# OUTPUT FORMAT

Return a JSON object with this EXACT structure:

\`\`\`json
{
  "reasoning": "Brief explanation of why you chose these steps",
  "estimatedTotalTime": "10-30 seconds" or similar,
  "requiresMultipleModels": true/false,
  "steps": [
    {
      "stepId": "research" | "enhance-prompt" | "generate-image" | "write-code" | "write-text" | "reason" | "compose",
      "stepNumber": 1,
      "purpose": "web-search" | "prompt-enhancement" | "image-generation" | "code-generation" | "text-generation" | "reasoning" | "final-composition",
      "recommendedModel": "model-id-from-list-above",
      "systemPrompt": "Role description for this step",
      "instructions": "What this step should do",
      "expectedOutputSchema": {
        "field": "description of expected output fields"
      },
      "inputFrom": 1 (optional - which step number provides input, undefined = user input)
    }
  ]
}
\`\`\`

# EXAMPLES

**Example 1: Simple question**
User: "What is quantum computing?"
Plan: 1 step - text-generation (llama-3.3-70b-versatile)

**Example 2: Research + Image**
User: "Research flying cars in 1980s NYC and generate an image"
Plan:
1. web-search (sonar-pro)
2. prompt-enhancement (llama-3.3-70b-versatile, input from step 1)
3. image-generation (seedream-4, input from step 2)
4. final-composition (llama-3.3-70b-versatile, input from all)

**Example 3: Code request**
User: "Write a Python function to parse JSON"
Plan: 1 step - code-generation (llama-3.3-70b-versatile)

**Example 4: Research + Code**
User: "Research best practices for async Python and write an example"
Plan:
1. web-search (sonar-pro)
2. code-generation (llama-3.3-70b-versatile, input from step 1)
3. final-composition (llama-3.3-70b-versatile, input from all)

Now analyze the user's request and create the optimal plan.`

/**
 * Build the planning prompt with context
 */
function buildPlanningPrompt(userMessage: string, intent: QueryIntent, context?: any): string {
  let prompt = `# USER REQUEST\n"${userMessage}"\n\n`

  prompt += `# INTENT ANALYSIS\n`
  prompt += `Type: ${intent.type}\n`
  prompt += `Complexity: ${intent.complexity}\n`
  prompt += `Needs web search: ${intent.needsWebSearch}\n`
  prompt += `Needs reasoning: ${intent.needsReasoning}\n`
  prompt += `Needs image generation: ${intent.needsImageGeneration}\n`
  prompt += `Needs code generation: ${intent.type === 'coding'}\n`
  prompt += `Confidence: ${(intent.confidence * 100).toFixed(0)}%\n\n`

  if (context?.conversationHistory && context.conversationHistory.length > 0) {
    prompt += `# CONVERSATION CONTEXT\n`
    const recentMessages = context.conversationHistory.slice(-3)
    recentMessages.forEach((msg: any, idx: number) => {
      prompt += `${msg.role}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}\n`
    })
    prompt += `\n`
  }

  prompt += `# YOUR TASK\nCreate an execution plan that will best fulfill this request. Return ONLY the JSON object.`

  return prompt
}

/**
 * Parse planner response into ExecutionPlan
 */
function parsePlanResponse(content: string): ExecutionPlan {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in planner response')
    }

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0])

    return {
      steps: json.steps || [],
      reasoning: json.reasoning || 'Plan generated',
      estimatedTotalTime: json.estimatedTotalTime || 'Varies',
      requiresMultipleModels: json.requiresMultipleModels !== false
    }
  } catch (error) {
    console.error('[Planner] Failed to parse plan:', error)
    throw error
  }
}

/**
 * Fallback plan generator for when planner fails
 */
export function generateFallbackPlan(userMessage: string, intent: QueryIntent): ExecutionPlan {
  const steps: PlannedStep[] = []

  // Simple heuristic-based planning as fallback
  if (intent.needsWebSearch) {
    steps.push({
      stepId: 'research',
      stepNumber: 1,
      purpose: 'web-search',
      recommendedModel: 'sonar-pro',
      systemPrompt: 'You are a research analyst gathering information.',
      instructions: 'Research the topic and provide key findings.',
      expectedOutputSchema: {
        keyFindings: 'array of insights',
        citations: 'array of sources'
      }
    })
  }

  if (intent.needsImageGeneration) {
    const nextStep = steps.length + 1
    steps.push({
      stepId: 'enhance-prompt',
      stepNumber: nextStep,
      purpose: 'prompt-enhancement',
      recommendedModel: 'llama-3.3-70b-versatile',
      systemPrompt: 'You are a prompt engineering specialist.',
      instructions: 'Create an optimized prompt for image generation.',
      expectedOutputSchema: {
        optimizedPrompt: 'detailed prompt'
      },
      inputFrom: nextStep > 1 ? 1 : undefined
    })

    steps.push({
      stepId: 'generate-image',
      stepNumber: nextStep + 1,
      purpose: 'image-generation',
      recommendedModel: 'seedream-4',
      systemPrompt: 'Generate high-quality images.',
      instructions: 'Create the requested image.',
      expectedOutputSchema: {
        imageUrl: 'url to generated image'
      },
      inputFrom: nextStep
    })
  } else if (intent.type === 'coding') {
    steps.push({
      stepId: 'write-code',
      stepNumber: steps.length + 1,
      purpose: 'code-generation',
      recommendedModel: 'llama-3.3-70b-versatile',
      systemPrompt: 'You are a senior software engineer.',
      instructions: 'Write clean, well-documented code.',
      expectedOutputSchema: {
        code: 'complete code implementation',
        language: 'programming language'
      },
      inputFrom: steps.length > 0 ? 1 : undefined
    })
  } else {
    steps.push({
      stepId: 'write-text',
      stepNumber: steps.length + 1,
      purpose: 'text-generation',
      recommendedModel: 'llama-3.3-70b-versatile',
      systemPrompt: 'You are a technical writer.',
      instructions: 'Provide a clear, comprehensive answer.',
      expectedOutputSchema: {
        content: 'written response'
      },
      inputFrom: steps.length > 0 ? 1 : undefined
    })
  }

  // Add final composition if multiple steps
  if (steps.length >= 2) {
    steps.push({
      stepId: 'compose',
      stepNumber: steps.length + 1,
      purpose: 'final-composition',
      recommendedModel: 'llama-3.3-70b-versatile',
      systemPrompt: 'You are a final composer synthesizing workflow steps.',
      instructions: 'Weave all step outputs into a cohesive educational response.',
      expectedOutputSchema: {
        narrative: 'complete educational response',
        artifacts: 'array of generated content'
      },
      inputFrom: undefined  // Takes all previous steps
    })
  }

  return {
    steps,
    reasoning: 'Fallback plan generated from intent heuristics',
    estimatedTotalTime: `${steps.length * 10}-${steps.length * 20} seconds`,
    requiresMultipleModels: steps.length > 1
  }
}
