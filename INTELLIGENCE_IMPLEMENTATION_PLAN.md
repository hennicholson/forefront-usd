# Forefront Intelligence V2 - Implementation Plan

## Executive Summary

This plan transforms Forefront Intelligence from a fixed-chain orchestrator into a true meta-model orchestration system. The current implementation works for image generation but lacks generalization, quality enforcement, and true intelligence.

**Current State**: Fixed 3-step chain (Research → Optimize → Generate) hardcoded for image generation

**Target State**: Dynamic multi-model orchestrator that works across ALL domains with automatic quality validation and self-improvement

## Architecture Comparison

### Current Architecture (V1)
```
User Input
    ↓
[Router: Classify Intent] (temperature=0.0)
    ↓
[Fixed Chain Detection]
    ↓
IF image generation:
    Step 1: sonar-pro (research)
    Step 2: llama-3.3-70b-versatile (optimize)
    Step 3: seedream-4 (generate)
ELSE:
    [Tool-Calling with single model]
    ↓
Output
```

**Limitations**:
- ❌ Only works for image generation
- ❌ Fixed chain structure (no dynamic workflows)
- ❌ No quality validation or re-research loops
- ❌ Single model per step (no consensus)
- ❌ No cross-domain generalization
- ❌ No self-improvement mechanisms

### Target Architecture (V2)
```
User Input
    ↓
[Universal Intent Classifier]
    ↓
[Dynamic Workflow Builder] ← Constructs optimal chain at runtime
    ↓
[Multi-Model Execution Engine]
    ├─ Step 1: Research (if needed)
    ├─ Step 2: Consensus (2-3 models validate)
    ├─ Step 3: Optimization
    ├─ Step 4: Generation/Execution
    └─ Step 5: Formatting
    ↓
[Quality Validation Layer] ←─────┐
    ↓                             │
IF validation fails:              │
    [Re-Research] ────────────────┘
ELSE:
    Output
```

**Capabilities**:
- ✅ Works across ALL domains (image, video, code, learning, research)
- ✅ Dynamic workflow construction based on intent
- ✅ Multi-model consensus and validation
- ✅ Automatic quality checks and re-research
- ✅ Self-improving through feedback loops
- ✅ Educational step-by-step visualization

## Gap Analysis

### Current Codebase Strengths
1. **Solid Foundation**:
   - `/lib/forefront/orchestrator.ts` - Working execution engine
   - `/lib/forefront/router.ts` - Intent classification (needs enhancement)
   - `/components/chat/ChainStepCard.tsx` - Educational UI for steps
   - `/components/chat/OrchestrationFlowDiagram.tsx` - Workflow visualization

2. **Working Features**:
   - Deterministic routing (temperature=0.0)
   - Multi-step chain execution
   - Citation display and source tracking
   - Execution time tracking
   - Step-by-step UI with expand/collapse

### Critical Gaps

#### Gap 1: Intent Classification (High Priority)
**Current**: Simple keyword-based classification with single-dimension output
```typescript
// Current: lib/forefront/router.ts:42
export async function classifyQuery(message: string, context?: RouterContext): Promise<QueryIntent>
```

**Needed**: Multi-dimensional semantic understanding
```typescript
// Target: lib/forefront/intent-classifier.ts
interface UniversalIntent {
  domain: 'creative' | 'analytical' | 'learning' | 'technical' | 'hybrid'
  taskType: 'generation' | 'analysis' | 'research' | 'optimization' | 'teaching'
  complexity: 'trivial' | 'moderate' | 'complex' | 'expert'
  capabilities: {
    needsResearch: boolean
    needsMultiModelConsensus: boolean
    needsOptimization: boolean
    needsValidation: boolean
    needsSpecializedTools: string[]
  }
  qualityThresholds: {
    factualAccuracy: number
    creativityLevel: number
    technicalDepth: number
    educationalValue: number
  }
}
```

**Implementation**:
- Create `/lib/forefront/intent-classifier.ts`
- Use llama-3.3-70b-versatile for semantic analysis (not 8B instant)
- Implement confidence scoring
- Add ambiguity detection
- Build intent validation layer

#### Gap 2: Dynamic Workflow Builder (High Priority)
**Current**: Fixed chains hardcoded in `selectOptimalModel()` (router.ts:230-296)

**Needed**: Runtime workflow construction based on intent

**Implementation**:
- Create `/lib/forefront/workflow-builder.ts`
- Implement workflow templates for each domain
- Add step dependency resolver
- Build parallel execution planner
- Create fallback strategy system

#### Gap 3: Multi-Model Consensus (Medium Priority)
**Current**: Single model per step

**Needed**: Multiple models validate and improve outputs

**Implementation**:
- Create `/lib/forefront/consensus.ts`
- Implement parallel validation (2-3 models evaluate same input)
- Build sequential refinement (models improve each other's outputs)
- Add debate resolution (models critique each other)
- Create weighted voting system

#### Gap 4: Quality Validation (High Priority)
**Current**: No automated quality checks

**Needed**: Domain-specific validators with automatic enforcement

**Implementation**:
- Create `/lib/forefront/validators.ts`
- Implement factual accuracy validator
- Build research sufficiency checker
- Add consensus threshold validator
- Create prompt optimization validator
- Implement validation reporting

#### Gap 5: Re-Research Loop (Medium Priority)
**Current**: Single-pass research, no iteration

**Needed**: Automatic re-research when quality insufficient

**Implementation**:
- Create `/lib/forefront/re-research.ts`
- Implement quality failure detection
- Build additional query generator
- Add iterative improvement loop (max 3 iterations)
- Create convergence detection

#### Gap 6: Cross-Domain Support (Medium Priority)
**Current**: Only works for image generation

**Needed**: Handle video, code, writing, research, learning

**Implementation**:
- Create `/lib/forefront/domains/` directory
- Implement domain-specific handlers:
  - `image-generation.ts` (already working)
  - `video-generation.ts`
  - `code-generation.ts`
  - `learning-content.ts`
  - `research-analysis.ts`
- Build universal orchestration entry point
- Create domain detection system

#### Gap 7: Self-Improvement (Low Priority)
**Current**: No feedback loop or optimization

**Needed**: Learn from past executions to improve

**Implementation**:
- Create `/lib/forefront/feedback-loop.ts`
- Build execution logging system
- Implement quality trend analysis
- Add automatic model selection optimization
- Create A/B testing framework

## Phase 1: Enhanced Intent Classification (Week 1)

### Objective
Build universal intent classifier that deeply understands requests across all domains.

### Tasks

**Task 1.1: Create Intent Classifier Core**
- File: `/lib/forefront/intent-classifier.ts`
- Implement multi-dimensional classification
- Use llama-3.3-70b-versatile with structured output
- Add confidence scoring
- **Acceptance**: Correctly classifies 10 test cases across 5 domains

**Task 1.2: Semantic Analyzer**
- File: `/lib/forefront/semantic-analyzer.ts`
- Extract key entities, actions, and constraints
- Detect ambiguity and missing information
- Build context integration layer
- **Acceptance**: Extracts all key elements from complex requests

**Task 1.3: Quality Threshold Calculator**
- Function: `calculateQualityThresholds(intent: UniversalIntent)`
- Map domain + task type → quality requirements
- Adjust thresholds based on complexity
- **Acceptance**: Returns appropriate thresholds for all domains

**Task 1.4: Integration & Testing**
- Modify `/lib/forefront/orchestrator.ts` to use new classifier
- Create test suite with 50 diverse requests
- Benchmark classification accuracy
- **Acceptance**: >95% accuracy, <500ms latency

### Code Examples

```typescript
// lib/forefront/intent-classifier.ts
import { groqClient } from '@/lib/groq/client'

export interface UniversalIntent {
  domain: 'creative' | 'analytical' | 'learning' | 'technical' | 'hybrid'
  taskType: 'generation' | 'analysis' | 'research' | 'optimization' | 'teaching'
  complexity: 'trivial' | 'moderate' | 'complex' | 'expert'
  capabilities: {
    needsResearch: boolean
    needsMultiModelConsensus: boolean
    needsOptimization: boolean
    needsValidation: boolean
    needsSpecializedTools: string[]
  }
  qualityThresholds: {
    factualAccuracy: number
    creativityLevel: number
    technicalDepth: number
    educationalValue: number
  }
  deliveryFormat: 'visual' | 'code' | 'text' | 'interactive' | 'multimedia'
  confidence: number
  rawIntent?: string  // For debugging
}

export async function classifyUniversalIntent(
  message: string,
  context?: any
): Promise<UniversalIntent> {
  const systemPrompt = buildUniversalClassifierPrompt()
  const userPrompt = buildContextualPrompt(message, context)

  const response = await groqClient.chat({
    model: 'llama-3.3-70b-versatile',  // Use 70B for semantic understanding
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.0,  // Deterministic
    maxTokens: 500
  })

  const content = response.choices[0].message.content
  const intent = parseIntentJSON(content)

  // Validate intent structure
  validateIntent(intent)

  // Calculate quality thresholds
  intent.qualityThresholds = calculateQualityThresholds(intent)

  return intent
}

function buildUniversalClassifierPrompt(): string {
  return `You are a universal intent classifier for Forefront Intelligence.

Analyze the user's request and classify it across multiple dimensions:

1. DOMAIN: What type of task is this?
   - creative: Art, design, content generation
   - analytical: Research, data analysis, evaluation
   - learning: Education, explanation, tutoring
   - technical: Code, engineering, problem-solving
   - hybrid: Combination of above

2. TASK TYPE: What action is needed?
   - generation: Create something new
   - analysis: Examine and understand
   - research: Gather information
   - optimization: Improve existing thing
   - teaching: Explain and educate

3. COMPLEXITY: How difficult is this?
   - trivial: Simple, single-step
   - moderate: Multi-step but straightforward
   - complex: Requires expertise, multiple stages
   - expert: Cutting-edge, highly specialized

4. CAPABILITIES: What does this require?
   - needsResearch: Requires web search or documentation lookup
   - needsMultiModelConsensus: Needs validation from multiple models
   - needsOptimization: Needs refinement of input/prompt
   - needsValidation: Needs quality checks
   - needsSpecializedTools: List specific tools ["tool1", "tool2"]

5. DELIVERY FORMAT: How should output be presented?
   - visual: Images, diagrams, visualizations
   - code: Programming code, scripts
   - text: Written content, documents
   - interactive: Learning modules, step-by-step
   - multimedia: Video, audio, mixed media

Return ONLY valid JSON with this exact structure:
{
  "domain": "creative|analytical|learning|technical|hybrid",
  "taskType": "generation|analysis|research|optimization|teaching",
  "complexity": "trivial|moderate|complex|expert",
  "capabilities": {
    "needsResearch": boolean,
    "needsMultiModelConsensus": boolean,
    "needsOptimization": boolean,
    "needsValidation": boolean,
    "needsSpecializedTools": ["tool1", "tool2"]
  },
  "deliveryFormat": "visual|code|text|interactive|multimedia",
  "confidence": 0.0-1.0
}

Examples:

Input: "Generate an image of a cyberpunk city"
Output: {"domain":"creative","taskType":"generation","complexity":"moderate","capabilities":{"needsResearch":true,"needsMultiModelConsensus":false,"needsOptimization":true,"needsValidation":false,"needsSpecializedTools":["image-generator"]},"deliveryFormat":"visual","confidence":0.95}

Input: "Explain how transformers work in machine learning"
Output: {"domain":"learning","taskType":"teaching","complexity":"complex","capabilities":{"needsResearch":true,"needsMultiModelConsensus":true,"needsOptimization":false,"needsValidation":true,"needsSpecializedTools":[]},"deliveryFormat":"interactive","confidence":0.9}

Input: "Debug this Python code and optimize it"
Output: {"domain":"technical","taskType":"optimization","complexity":"moderate","capabilities":{"needsResearch":false,"needsMultiModelConsensus":true,"needsOptimization":false,"needsValidation":true,"needsSpecializedTools":["code-analyzer"]},"deliveryFormat":"code","confidence":0.85}

Be precise and thoughtful in your classification.`
}

function calculateQualityThresholds(intent: UniversalIntent) {
  const base = {
    factualAccuracy: 0.8,
    creativityLevel: 0.5,
    technicalDepth: 0.5,
    educationalValue: 0.6
  }

  // Adjust based on domain
  if (intent.domain === 'analytical' || intent.domain === 'learning') {
    base.factualAccuracy = 0.95
    base.educationalValue = 0.9
  } else if (intent.domain === 'creative') {
    base.creativityLevel = 0.9
    base.factualAccuracy = 0.5
  } else if (intent.domain === 'technical') {
    base.technicalDepth = 0.9
    base.factualAccuracy = 0.9
  }

  // Adjust based on complexity
  if (intent.complexity === 'expert' || intent.complexity === 'complex') {
    base.factualAccuracy = Math.min(base.factualAccuracy + 0.1, 1.0)
    base.technicalDepth = Math.min(base.technicalDepth + 0.2, 1.0)
  }

  return base
}
```

### Testing Strategy
```typescript
// tests/intent-classifier.test.ts
import { classifyUniversalIntent } from '@/lib/forefront/intent-classifier'

describe('Universal Intent Classifier', () => {
  test('Image generation request', async () => {
    const intent = await classifyUniversalIntent('Generate an image of a sunset over mountains')
    expect(intent.domain).toBe('creative')
    expect(intent.taskType).toBe('generation')
    expect(intent.capabilities.needsOptimization).toBe(true)
    expect(intent.deliveryFormat).toBe('visual')
  })

  test('Code debugging request', async () => {
    const intent = await classifyUniversalIntent('Debug this Python code and explain the issue')
    expect(intent.domain).toBe('technical')
    expect(intent.taskType).toBe('optimization')
    expect(intent.capabilities.needsValidation).toBe(true)
  })

  test('Learning content request', async () => {
    const intent = await classifyUniversalIntent('Explain quantum computing with examples')
    expect(intent.domain).toBe('learning')
    expect(intent.taskType).toBe('teaching')
    expect(intent.capabilities.needsResearch).toBe(true)
    expect(intent.qualityThresholds.educationalValue).toBeGreaterThan(0.8)
  })
})
```

## Phase 2: Dynamic Workflow Builder (Week 2)

### Objective
Replace fixed chains with runtime workflow construction based on intent.

### Tasks

**Task 2.1: Workflow Builder Core**
- File: `/lib/forefront/workflow-builder.ts`
- Implement dynamic step generation
- Add step dependency resolution
- Create model selection logic
- **Acceptance**: Builds workflows for 5 test intents

**Task 2.2: Domain Templates**
- Files: `/lib/forefront/domains/*.ts`
- Create workflow templates for each domain
- Define step sequences
- Map capabilities to steps
- **Acceptance**: Templates exist for 5 domains

**Task 2.3: Execution Engine Enhancement**
- Modify `/lib/forefront/orchestrator.ts`
- Support parallel step execution
- Implement step result passing
- Add timeout handling
- **Acceptance**: Executes workflows with 2-5 steps

**Task 2.4: Integration**
- Connect intent classifier → workflow builder → execution engine
- Update API route handler
- Test end-to-end flow
- **Acceptance**: Complete flow works for all domains

### Code Examples

```typescript
// lib/forefront/workflow-builder.ts
import { UniversalIntent } from './intent-classifier'

export interface WorkflowStep {
  stepId: string
  stepNumber: number
  purpose: 'interpret' | 'research' | 'validate' | 'optimize' | 'generate' | 'format'
  models: string[]  // Can use multiple models for consensus
  dependsOn: string[]  // Step IDs that must complete first
  successCriteria: {
    minimumConfidence: number
    requiredFields: string[]
  }
  maxRetries: number
  timeoutMs: number
  parallel: boolean  // Can this run in parallel with other steps?
}

export interface DynamicWorkflow {
  workflowId: string
  intent: UniversalIntent
  steps: WorkflowStep[]
  estimatedTime: number
  qualityGates: QualityGate[]
}

export interface QualityGate {
  afterStep: string
  validators: string[]  // Validator names
  threshold: number
  onFailure: 'retry' | 're_research' | 'escalate' | 'continue'
}

export async function buildWorkflow(intent: UniversalIntent): Promise<DynamicWorkflow> {
  const steps: WorkflowStep[] = []
  let stepNumber = 1

  // Step 1: Always interpret and extract key information (fast)
  steps.push({
    stepId: 'interpret',
    stepNumber: stepNumber++,
    purpose: 'interpret',
    models: ['llama-3.1-8b-instant'],
    dependsOn: [],
    successCriteria: { minimumConfidence: 0.7, requiredFields: ['extractedIntent'] },
    maxRetries: 1,
    timeoutMs: 5000,
    parallel: false
  })

  // Step 2: Research if needed
  if (intent.capabilities.needsResearch) {
    steps.push({
      stepId: 'research',
      stepNumber: stepNumber++,
      purpose: 'research',
      models: ['sonar-pro'],
      dependsOn: ['interpret'],
      successCriteria: { minimumConfidence: 0.8, requiredFields: ['citations', 'content'] },
      maxRetries: 2,
      timeoutMs: 15000,
      parallel: false
    })
  }

  // Step 3: Multi-model consensus/validation if needed
  if (intent.capabilities.needsMultiModelConsensus) {
    steps.push({
      stepId: 'consensus',
      stepNumber: stepNumber++,
      purpose: 'validate',
      models: ['llama-3.3-70b-versatile', 'gemini-2.0-flash'],  // Multiple models
      dependsOn: intent.capabilities.needsResearch ? ['research'] : ['interpret'],
      successCriteria: { minimumConfidence: 0.7, requiredFields: ['consensusScore'] },
      maxRetries: 1,
      timeoutMs: 20000,
      parallel: false
    })
  }

  // Step 4: Optimization if needed
  if (intent.capabilities.needsOptimization) {
    const previousStep = steps[steps.length - 1].stepId
    steps.push({
      stepId: 'optimize',
      stepNumber: stepNumber++,
      purpose: 'optimize',
      models: ['llama-3.3-70b-versatile'],
      dependsOn: [previousStep],
      successCriteria: { minimumConfidence: 0.8, requiredFields: ['optimizedPrompt'] },
      maxRetries: 2,
      timeoutMs: 10000,
      parallel: false
    })
  }

  // Step 5: Generation/Execution (domain-specific)
  const generationStep = await buildGenerationStep(intent, steps)
  if (generationStep) {
    steps.push(generationStep)
    stepNumber++
  }

  // Step 6: Formatting (always)
  steps.push({
    stepId: 'format',
    stepNumber: stepNumber++,
    purpose: 'format',
    models: ['llama-3.1-8b-instant'],
    dependsOn: [steps[steps.length - 1].stepId],
    successCriteria: { minimumConfidence: 0.9, requiredFields: ['formattedContent'] },
    maxRetries: 1,
    timeoutMs: 5000,
    parallel: false
  })

  // Add quality gates
  const qualityGates: QualityGate[] = []

  if (intent.capabilities.needsValidation) {
    qualityGates.push({
      afterStep: 'research',
      validators: ['research_sufficiency', 'factual_accuracy'],
      threshold: intent.qualityThresholds.factualAccuracy,
      onFailure: 're_research'
    })
  }

  return {
    workflowId: `workflow_${Date.now()}`,
    intent,
    steps,
    estimatedTime: steps.reduce((acc, s) => acc + s.timeoutMs, 0),
    qualityGates
  }
}

async function buildGenerationStep(
  intent: UniversalIntent,
  previousSteps: WorkflowStep[]
): Promise<WorkflowStep | null> {
  const previousStep = previousSteps[previousSteps.length - 1].stepId

  // Map domain + task type to generation model
  const modelMapping = {
    'creative-visual': 'seedream-4',
    'creative-video': 'video-generator',  // Future
    'technical-code': 'llama-3.3-70b-versatile',
    'analytical-research': 'llama-3.3-70b-versatile',
    'learning-teaching': 'llama-3.3-70b-versatile'
  }

  const key = `${intent.domain}-${intent.deliveryFormat}` as keyof typeof modelMapping
  const model = modelMapping[key] || 'llama-3.3-70b-versatile'

  if (intent.taskType === 'generation') {
    return {
      stepId: 'generate',
      stepNumber: previousSteps.length + 1,
      purpose: 'generate',
      models: [model],
      dependsOn: [previousStep],
      successCriteria: { minimumConfidence: 0.7, requiredFields: ['output'] },
      maxRetries: 2,
      timeoutMs: intent.deliveryFormat === 'visual' ? 30000 : 15000,
      parallel: false
    }
  }

  return null
}
```

## Phase 3: Multi-Model Consensus (Week 3)

### Objective
Enable multiple models to validate and improve outputs collaboratively.

### Tasks

**Task 3.1: Consensus Algorithms**
- File: `/lib/forefront/consensus.ts`
- Implement parallel validation
- Build sequential refinement
- Add debate resolution
- **Acceptance**: 3 consensus strategies working

**Task 3.2: Model Coordinator**
- File: `/lib/forefront/model-coordinator.ts`
- Manage multi-model communication
- Aggregate responses
- Calculate agreement scores
- **Acceptance**: Coordinates 2-3 models in parallel

**Task 3.3: Integration with Workflow**
- Modify workflow builder to insert consensus steps
- Update execution engine to handle multi-model steps
- **Acceptance**: Consensus works in live workflows

### Code Examples

```typescript
// lib/forefront/consensus.ts
import { groqClient } from '@/lib/groq/client'

export interface ConsensusResult {
  agreement: number  // 0-1 score
  synthesizedOutput: string
  modelOutputs: Array<{
    model: string
    output: string
    confidence: number
  }>
  dissenting: string[]  // Points of disagreement
  confidence: number
}

export async function parallelConsensus(
  input: string,
  models: string[],
  evaluationQuestion: string
): Promise<ConsensusResult> {
  console.log(`[Consensus] Running parallel validation with ${models.length} models`)

  // Execute all models in parallel
  const modelPromises = models.map(async (model) => {
    const response = await groqClient.chat({
      model,
      messages: [
        { role: 'system', content: 'You are a validator. Answer the question thoughtfully and provide your confidence level.' },
        { role: 'user', content: `${evaluationQuestion}\n\nContent to evaluate:\n${input}` }
      ],
      temperature: 0.3,
      maxTokens: 500
    })

    return {
      model,
      output: response.choices[0].message.content,
      confidence: extractConfidence(response.choices[0].message.content)
    }
  })

  const modelOutputs = await Promise.all(modelPromises)

  // Calculate agreement
  const agreement = calculateAgreementScore(modelOutputs)

  // Synthesize best answer
  const synthesized = await synthesizeOutputs(modelOutputs, input)

  // Find dissenting points
  const dissenting = findDissentingPoints(modelOutputs)

  return {
    agreement,
    synthesizedOutput: synthesized,
    modelOutputs,
    dissenting,
    confidence: agreement * (modelOutputs.reduce((acc, m) => acc + m.confidence, 0) / modelOutputs.length)
  }
}

function calculateAgreementScore(outputs: Array<{ model: string; output: string; confidence: number }>): number {
  if (outputs.length < 2) return 1.0

  // Simple semantic similarity (in production, use embeddings)
  let totalSimilarity = 0
  let comparisons = 0

  for (let i = 0; i < outputs.length; i++) {
    for (let j = i + 1; j < outputs.length; j++) {
      const similarity = calculateTextSimilarity(outputs[i].output, outputs[j].output)
      totalSimilarity += similarity
      comparisons++
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0.5
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // Simple word overlap (in production, use embeddings or semantic similarity)
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

async function synthesizeOutputs(
  outputs: Array<{ model: string; output: string; confidence: number }>,
  originalInput: string
): Promise<string> {
  const synthesisPrompt = `You are a synthesis expert. Multiple AI models evaluated the same content and provided different perspectives.

Original content:
${originalInput}

Model outputs:
${outputs.map((o, i) => `Model ${i + 1} (${o.model}, confidence: ${o.confidence}):\n${o.output}`).join('\n\n')}

Your task: Synthesize the BEST elements from all models into a single coherent answer. Prioritize:
1. Points where models agree (high confidence)
2. Factually accurate information
3. Clear and concise language

Return only the synthesized answer, no meta-commentary.`

  const response = await groqClient.chat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an expert at synthesizing multiple perspectives into coherent answers.' },
      { role: 'user', content: synthesisPrompt }
    ],
    temperature: 0.2,
    maxTokens: 800
  })

  return response.choices[0].message.content
}

function findDissentingPoints(outputs: Array<{ model: string; output: string }>): string[] {
  // Simplified: Find sentences that appear in only one model's output
  const allSentences = outputs.flatMap(o =>
    o.output.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)
  )

  const sentenceCounts = new Map<string, number>()
  allSentences.forEach(s => {
    sentenceCounts.set(s, (sentenceCounts.get(s) || 0) + 1)
  })

  return Array.from(sentenceCounts.entries())
    .filter(([_, count]) => count === 1)
    .map(([sentence, _]) => sentence)
    .slice(0, 3)  // Top 3 dissenting points
}

function extractConfidence(text: string): number {
  // Look for explicit confidence statements
  const confidenceMatch = text.match(/confidence[:\s]+(\d+)%/i)
  if (confidenceMatch) {
    return parseInt(confidenceMatch[1]) / 100
  }

  // Default based on hedging language
  const hedgeWords = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'uncertain']
  const hasHedging = hedgeWords.some(w => text.toLowerCase().includes(w))

  return hasHedging ? 0.6 : 0.8
}
```

## Phase 4-7 Summary

### Phase 4: Quality Validation Layer (Week 4)
- Implement domain-specific validators
- Build automatic quality checking
- Create validation reporting
- Integrate with workflow execution

### Phase 5: Re-Research Loop System (Week 5)
- Build automatic re-research triggers
- Implement iterative improvement (max 3 iterations)
- Add convergence detection
- Create quality metrics tracking

### Phase 6: Cross-Domain Generalization (Week 6)
- Extend to video, code, writing, research domains
- Create domain-specific handlers
- Build universal orchestration entry point
- Test across all supported domains

### Phase 7: Self-Improvement & Feedback (Week 7)
- Implement execution logging
- Build quality trend analysis
- Add automatic model selection optimization
- Create A/B testing framework

## Success Criteria

### Phase 1 Success Metrics
- [ ] Intent classifier achieves >95% accuracy on test suite
- [ ] Classification latency <500ms
- [ ] Confidence scores correlate with actual performance
- [ ] Quality thresholds adjust appropriately per domain

### Phase 2 Success Metrics
- [ ] Workflow builder creates valid workflows for all test intents
- [ ] Workflows execute successfully end-to-end
- [ ] Dynamic workflows match or exceed fixed-chain performance
- [ ] Parallel execution works correctly

### Phase 3 Success Metrics
- [ ] Consensus system increases output quality by 15%+
- [ ] Agreement scores >0.7 for factual content
- [ ] Synthesis produces better output than any single model
- [ ] Execution time remains reasonable (<30s total)

### Overall System Success
- [ ] Works across 5+ domains (image, video, code, learning, research)
- [ ] Automatic quality validation passes 90%+ of outputs
- [ ] Re-research triggered <15% of the time
- [ ] User satisfaction >4.5/5.0
- [ ] System consistency >95% (same input → same workflow)

## Risk Mitigation

### Risk 1: Complexity Creep
**Mitigation**: Strict phase boundaries, no feature creep, focus on MVP per phase

### Risk 2: Performance Degradation
**Mitigation**: Set hard latency limits, optimize parallel execution, cache aggressively

### Risk 3: Quality vs Speed Tradeoff
**Mitigation**: Make quality thresholds configurable, allow "fast mode" with lower thresholds

### Risk 4: Model API Costs
**Mitigation**: Use fast models (8B) for simple tasks, batch requests, implement caching

### Risk 5: Integration Breakage
**Mitigation**: Comprehensive test suite, maintain backward compatibility, feature flags

## Next Steps

1. **Review this plan** and approve architecture direction
2. **Prioritize phases** - Can reorder based on business needs
3. **Allocate resources** - Assign developers to Phase 1
4. **Set up infrastructure** - Metrics collection, logging, testing framework
5. **Begin Phase 1 implementation** - Start with intent classifier core
6. **Weekly review meetings** - Track progress, adjust plan as needed

## Appendix: File Structure

```
/lib/forefront/
├── orchestrator.ts (MODIFY - main orchestration engine)
├── router.ts (MODIFY - becomes legacy, redirect to intent-classifier)
├── intent-classifier.ts (NEW - universal intent understanding)
├── semantic-analyzer.ts (NEW - deep semantic analysis)
├── workflow-builder.ts (NEW - dynamic workflow construction)
├── consensus.ts (NEW - multi-model consensus algorithms)
├── model-coordinator.ts (NEW - model communication layer)
├── validators.ts (NEW - quality validation system)
├── re-research.ts (NEW - automatic re-research loops)
├── feedback-loop.ts (NEW - self-improvement system)
├── domains/
│   ├── image-generation.ts (NEW - image gen domain handler)
│   ├── video-generation.ts (NEW - video gen domain handler)
│   ├── code-generation.ts (NEW - code gen domain handler)
│   ├── learning-content.ts (NEW - learning domain handler)
│   └── research-analysis.ts (NEW - research domain handler)
└── utils/
    ├── execution-engine.ts (NEW - parallel/sequential execution)
    ├── quality-metrics.ts (NEW - quality scoring)
    └── model-registry.ts (NEW - available models + capabilities)
```
