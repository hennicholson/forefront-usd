# Forefront Intelligence V2: True Meta-Orchestrator

## Overview

Forefront Intelligence is not just a router or fixed-chain orchestrator—it's a **meta-model orchestrator** that dynamically coordinates multiple AI models to produce higher-quality outputs than any single model could achieve. It transforms natural language requests into optimized, multi-step workflows with automatic quality validation and self-improvement.

**Core Philosophy**: One natural language input → intelligent research → multi-model consensus → optimized execution → formatted output

## System Architecture

```
User Input
    ↓
[Intent Understanding & Generalization]
    ↓
[Dynamic Workflow Builder]
    ↓
[Module Selection Engine]
    ↓
[Research Phase] ←──────────────┐
    ↓                            │
[Consensus & Validation] ───────┤ Quality Check Failed
    ↓                            │ → Re-research Loop
[Optimization Phase]             │
    ↓                            │
[Generation/Execution] ──────────┘
    ↓
[Formatting & Presentation]
    ↓
User Output
```

## Core Intelligence Components

### 1. Intent Understanding Engine

**Purpose**: Extract true user intent and classify request type beyond surface keywords.

**Capabilities**:
- Semantic understanding (not just keyword matching)
- Multi-dimensional classification (creative, analytical, learning, technical)
- Ambiguity detection and clarification
- Context awareness from conversation history

**Classification Dimensions**:
```typescript
interface UniversalIntent {
  // Primary classification
  domain: 'creative' | 'analytical' | 'learning' | 'technical' | 'hybrid'
  taskType: 'generation' | 'analysis' | 'research' | 'optimization' | 'teaching'

  // Complexity assessment
  complexity: 'trivial' | 'moderate' | 'complex' | 'expert'

  // Required capabilities
  capabilities: {
    needsResearch: boolean
    needsMultiModelConsensus: boolean
    needsOptimization: boolean
    needsValidation: boolean
    needsSpecializedTools: string[]
  }

  // Quality requirements
  qualityThresholds: {
    factualAccuracy: number  // 0-1
    creativityLevel: number  // 0-1
    technicalDepth: number   // 0-1
    educationalValue: number // 0-1
  }

  // Output format
  deliveryFormat: 'visual' | 'code' | 'text' | 'interactive' | 'multimedia'

  confidence: number  // Intent classification confidence
}
```

### 2. Dynamic Workflow Builder

**Purpose**: Construct optimal execution chains at runtime based on intent, not pre-defined templates.

**Capabilities**:
- Build workflows dynamically (not fixed templates)
- Select optimal models for each step
- Determine step dependencies
- Allocate execution resources
- Plan fallback strategies

**Workflow Structure**:
```typescript
interface DynamicWorkflow {
  workflowId: string
  steps: WorkflowStep[]
  parallelizable: boolean[]  // Which steps can run in parallel
  qualityGates: QualityGate[]  // Validation checkpoints
  fallbackStrategies: FallbackStrategy[]
}

interface WorkflowStep {
  stepId: string
  purpose: 'interpret' | 'research' | 'validate' | 'optimize' | 'generate' | 'format'
  models: string[]  // Multiple models for consensus
  dependencies: string[]  // Step IDs that must complete first
  successCriteria: {
    minimumConfidence: number
    requiredDataPoints: string[]
    validationChecks: ValidationRule[]
  }
  maxRetries: number
  timeoutMs: number
}

interface QualityGate {
  afterStep: string
  validations: {
    type: 'factual_accuracy' | 'consensus_threshold' | 'completeness' | 'relevance'
    threshold: number
    onFailure: 'retry_step' | 're_research' | 'escalate' | 'use_fallback'
  }[]
}
```

**Example Dynamic Chains**:

```typescript
// Image Generation Request
{
  domain: 'creative',
  workflow: [
    { step: 1, purpose: 'interpret', models: ['llama-3.1-8b-instant'], action: 'extract_visual_intent' },
    { step: 2, purpose: 'research', models: ['sonar-pro'], action: 'find_model_documentation', condition: 'if_specialized_model' },
    { step: 3, purpose: 'validate', models: ['llama-3.3-70b-versatile', 'gemini-2.0-flash'], action: 'research_consensus' },
    { step: 4, purpose: 'optimize', models: ['llama-3.3-70b-versatile'], action: 'craft_optimal_prompt' },
    { step: 5, purpose: 'generate', models: ['seedream-4'], action: 'create_image' },
    { step: 6, purpose: 'format', models: ['llama-3.1-8b-instant'], action: 'educational_presentation' }
  ]
}

// Code Analysis Request
{
  domain: 'technical',
  workflow: [
    { step: 1, purpose: 'interpret', models: ['llama-3.1-8b-instant'], action: 'extract_code_intent' },
    { step: 2, purpose: 'research', models: ['sonar-pro'], action: 'find_documentation', condition: 'if_needs_context' },
    { step: 3, purpose: 'analyze', models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b'], action: 'multi_model_analysis' },
    { step: 4, purpose: 'validate', models: ['llama-3.3-70b-versatile'], action: 'consensus_check' },
    { step: 5, purpose: 'format', models: ['llama-3.1-8b-instant'], action: 'structured_response' }
  ]
}

// Learning Content Request
{
  domain: 'learning',
  workflow: [
    { step: 1, purpose: 'interpret', models: ['llama-3.1-8b-instant'], action: 'extract_learning_goals' },
    { step: 2, purpose: 'research', models: ['sonar-pro'], action: 'gather_educational_resources' },
    { step: 3, purpose: 'synthesize', models: ['llama-3.3-70b-versatile', 'gemini-2.0-flash'], action: 'multi_perspective_synthesis' },
    { step: 4, purpose: 'validate', models: ['qwen/qwen3-32b'], action: 'factual_verification' },
    { step: 5, purpose: 'optimize', models: ['llama-3.3-70b-versatile'], action: 'pedagogical_structuring' },
    { step: 6, purpose: 'format', models: ['llama-3.1-8b-instant'], action: 'interactive_presentation' }
  ]
}
```

### 3. Multi-Model Consensus System

**Purpose**: Use multiple models to validate and improve outputs through collaborative intelligence.

**Consensus Strategies**:

```typescript
interface ConsensusStrategy {
  type: 'parallel_validation' | 'sequential_refinement' | 'debate_resolution'
  models: string[]
  votingMechanism: 'majority' | 'weighted' | 'unanimous'
  confidenceThreshold: number
}

// Parallel Validation: Multiple models evaluate the same input
async function parallelConsensus(
  input: string,
  models: string[],
  question: string
): Promise<ConsensusResult> {
  const responses = await Promise.all(
    models.map(model => evaluateWithModel(model, input, question))
  )

  return {
    agreement: calculateAgreementScore(responses),
    synthesizedAnswer: mergeResponses(responses),
    dissenting: findOutliers(responses),
    confidence: calculateConfidence(responses)
  }
}

// Sequential Refinement: Each model builds on previous model's output
async function sequentialRefinement(
  input: string,
  models: string[]
): Promise<RefinedOutput> {
  let output = input
  let confidence = 0.5

  for (const model of models) {
    const refinement = await refineWithModel(model, output)
    if (refinement.confidence > confidence) {
      output = refinement.output
      confidence = refinement.confidence
    }
  }

  return { output, confidence, refinementPasses: models.length }
}

// Debate Resolution: Models critique each other's outputs
async function debateResolution(
  input: string,
  models: string[]
): Promise<ResolvedOutput> {
  const initialOutputs = await generateInitialOutputs(models, input)

  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < models.length; i++) {
      const otherOutputs = initialOutputs.filter((_, idx) => idx !== i)
      const critique = await critiqueOutputs(models[i], otherOutputs)
      initialOutputs[i] = await improveBasedOnCritique(models[i], initialOutputs[i], critique)
    }
  }

  return synthesizeBestElements(initialOutputs)
}
```

### 4. Quality Validation Layer

**Purpose**: Automatically assess output quality and trigger re-research/refinement when needed.

**Validation Rules**:

```typescript
interface QualityValidator {
  name: string
  evaluator: (output: any, context: any) => Promise<ValidationResult>
  threshold: number
  onFailure: 'retry' | 're_research' | 'escalate_models' | 'human_review'
}

const QUALITY_VALIDATORS: QualityValidator[] = [
  {
    name: 'factual_accuracy',
    evaluator: async (output, context) => {
      // Use fact-checking model to verify claims
      const factCheck = await checkFactsWithModel('qwen/qwen3-32b', output)
      return {
        score: factCheck.accuracyScore,
        issues: factCheck.unverifiedClaims,
        passed: factCheck.accuracyScore > 0.8
      }
    },
    threshold: 0.8,
    onFailure: 're_research'
  },

  {
    name: 'research_sufficiency',
    evaluator: async (output, context) => {
      // Check if research step gathered enough information
      const sourcesCount = context.citations?.length || 0
      const coverageBreadth = await assessCoverageBreadth(output, context)

      return {
        score: Math.min(sourcesCount / 5, 1.0) * coverageBreadth,
        issues: sourcesCount < 3 ? ['Insufficient sources'] : [],
        passed: sourcesCount >= 3 && coverageBreadth > 0.7
      }
    },
    threshold: 0.7,
    onFailure: 're_research'
  },

  {
    name: 'consensus_threshold',
    evaluator: async (output, context) => {
      // Check if multiple models agree on the output
      if (context.consensusModels?.length < 2) return { score: 0.5, issues: [], passed: true }

      const agreement = await calculateModelAgreement(context.consensusModels, output)
      return {
        score: agreement,
        issues: agreement < 0.7 ? ['Low inter-model agreement'] : [],
        passed: agreement > 0.7
      }
    },
    threshold: 0.7,
    onFailure: 'escalate_models'
  },

  {
    name: 'prompt_optimization',
    evaluator: async (output, context) => {
      if (context.step !== 'prompt-enhancement') return { score: 1.0, issues: [], passed: true }

      // Validate prompt follows best practices for target model
      const checks = await validatePromptStructure(output, context.targetModel)
      return {
        score: checks.score,
        issues: checks.missingElements,
        passed: checks.score > 0.8
      }
    },
    threshold: 0.8,
    onFailure: 'retry'
  }
]

async function validateStep(
  stepOutput: any,
  stepContext: any,
  validators: QualityValidator[]
): Promise<ValidationReport> {
  const results = await Promise.all(
    validators.map(v => v.evaluator(stepOutput, stepContext))
  )

  const failedValidations = validators.filter((v, i) => !results[i].passed)

  return {
    passed: failedValidations.length === 0,
    overallScore: results.reduce((acc, r) => acc + r.score, 0) / results.length,
    failures: failedValidations.map((v, i) => ({
      validator: v.name,
      score: results[i].score,
      threshold: v.threshold,
      issues: results[i].issues,
      action: v.onFailure
    }))
  }
}
```

### 5. Automatic Re-Research System

**Purpose**: Intelligently trigger additional research when quality checks fail.

```typescript
interface ReResearchTrigger {
  reason: string
  additionalQueries: string[]
  searchStrategy: 'broader' | 'deeper' | 'alternative_sources'
  maxIterations: number
}

async function executeWithQualityLoop(
  workflow: DynamicWorkflow,
  initialInput: string
): Promise<ValidatedOutput> {
  let iterations = 0
  let currentOutput = null
  let validationReport = null

  while (iterations < 3) {
    // Execute workflow
    currentOutput = await executeWorkflow(workflow, initialInput)

    // Validate quality
    validationReport = await validateStep(
      currentOutput,
      { step: workflow.currentStep, ...currentOutput.metadata },
      QUALITY_VALIDATORS
    )

    if (validationReport.passed) {
      console.log(`[Quality] ✅ Validation passed (score: ${validationReport.overallScore.toFixed(2)})`)
      break
    }

    // Determine re-research strategy
    const reResearchNeeded = validationReport.failures.some(f => f.action === 're_research')

    if (reResearchNeeded) {
      console.log(`[Quality] ❌ Insufficient research quality - triggering re-research`)

      const additionalQueries = await generateAdditionalQueries(
        initialInput,
        currentOutput,
        validationReport.failures
      )

      // Re-execute research step with additional queries
      workflow.steps.find(s => s.purpose === 'research').additionalContext = {
        previousAttempt: currentOutput,
        issues: validationReport.failures,
        queries: additionalQueries
      }

      iterations++
    } else {
      // Handle other failure types (retry, escalate, etc.)
      await handleValidationFailure(workflow, validationReport.failures)
      iterations++
    }
  }

  return {
    output: currentOutput,
    validation: validationReport,
    iterations,
    qualityScore: validationReport.overallScore
  }
}

async function generateAdditionalQueries(
  originalInput: string,
  currentOutput: any,
  failures: ValidationFailure[]
): Promise<string[]> {
  const issuesSummary = failures.map(f => f.issues.join(', ')).join('; ')

  const queryGenerationPrompt = `
Original user request: "${originalInput}"

Current research output had these issues:
${issuesSummary}

Generate 2-3 additional search queries that would address these gaps and improve research quality.
Focus on finding authoritative sources, official documentation, and expert perspectives.

Return only the queries, one per line.
`

  const response = await groqClient.chat({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a research query generator. Generate focused, high-quality search queries.' },
      { role: 'user', content: queryGenerationPrompt }
    ],
    temperature: 0.3
  })

  return response.choices[0].message.content.split('\n').filter(q => q.trim())
}
```

### 6. Cross-Domain Orchestration

**Purpose**: Generalize the intelligence system to work across ALL creative and learning domains.

**Domain Handlers**:

```typescript
interface DomainHandler {
  domain: string
  intentClassifier: (input: string) => Promise<UniversalIntent>
  workflowBuilder: (intent: UniversalIntent) => Promise<DynamicWorkflow>
  validators: QualityValidator[]
  formatters: OutputFormatter[]
}

const DOMAIN_HANDLERS: Record<string, DomainHandler> = {
  'image-generation': {
    domain: 'creative-visual',
    intentClassifier: classifyImageGenerationIntent,
    workflowBuilder: buildImageGenerationWorkflow,
    validators: [
      QUALITY_VALIDATORS.find(v => v.name === 'research_sufficiency'),
      QUALITY_VALIDATORS.find(v => v.name === 'prompt_optimization'),
      {
        name: 'visual_coherence',
        evaluator: async (output, context) => {
          // Check if generated image matches intent
          const analysis = await analyzeImageWithModel('gemini-2.0-flash', output.content)
          return {
            score: analysis.coherenceScore,
            issues: analysis.mismatches,
            passed: analysis.coherenceScore > 0.75
          }
        },
        threshold: 0.75,
        onFailure: 'retry'
      }
    ],
    formatters: [educationalImageFormatter]
  },

  'video-generation': {
    domain: 'creative-video',
    intentClassifier: classifyVideoGenerationIntent,
    workflowBuilder: buildVideoGenerationWorkflow,
    validators: [
      QUALITY_VALIDATORS.find(v => v.name === 'research_sufficiency'),
      QUALITY_VALIDATORS.find(v => v.name === 'prompt_optimization')
    ],
    formatters: [videoTimelineFormatter]
  },

  'code-generation': {
    domain: 'technical-code',
    intentClassifier: classifyCodeGenerationIntent,
    workflowBuilder: buildCodeGenerationWorkflow,
    validators: [
      QUALITY_VALIDATORS.find(v => v.name === 'factual_accuracy'),
      {
        name: 'code_correctness',
        evaluator: async (output, context) => {
          // Static analysis and linting
          const analysis = await analyzeCodeQuality(output.content)
          return {
            score: analysis.qualityScore,
            issues: analysis.violations,
            passed: analysis.qualityScore > 0.8
          }
        },
        threshold: 0.8,
        onFailure: 'retry'
      }
    ],
    formatters: [codeExplanationFormatter]
  },

  'learning-content': {
    domain: 'educational',
    intentClassifier: classifyLearningIntent,
    workflowBuilder: buildLearningWorkflow,
    validators: [
      QUALITY_VALIDATORS.find(v => v.name === 'factual_accuracy'),
      QUALITY_VALIDATORS.find(v => v.name === 'research_sufficiency'),
      {
        name: 'pedagogical_quality',
        evaluator: async (output, context) => {
          // Check if content is structured for learning
          const analysis = await assessPedagogicalStructure(output.content)
          return {
            score: analysis.pedagogyScore,
            issues: analysis.improvements,
            passed: analysis.pedagogyScore > 0.75
          }
        },
        threshold: 0.75,
        onFailure: 'retry'
      }
    ],
    formatters: [interactiveLearningFormatter]
  },

  'research-analysis': {
    domain: 'analytical',
    intentClassifier: classifyResearchIntent,
    workflowBuilder: buildResearchWorkflow,
    validators: [
      QUALITY_VALIDATORS.find(v => v.name === 'factual_accuracy'),
      QUALITY_VALIDATORS.find(v => v.name === 'research_sufficiency'),
      QUALITY_VALIDATORS.find(v => v.name === 'consensus_threshold')
    ],
    formatters: [academicFormatter]
  }
}

async function universalOrchestration(input: string, context: any): Promise<OrchestratorResponse> {
  // Step 1: Classify domain and intent
  const intent = await classifyUniversalIntent(input, context)

  // Step 2: Select domain handler
  const handler = DOMAIN_HANDLERS[intent.domain] || DOMAIN_HANDLERS['learning-content']

  // Step 3: Build dynamic workflow
  const workflow = await handler.workflowBuilder(intent)

  // Step 4: Execute with quality validation loop
  const result = await executeWithQualityLoop(workflow, input)

  // Step 5: Format for educational presentation
  const formatted = await handler.formatters[0].format(result, intent)

  return {
    content: formatted.content,
    metadata: {
      intent,
      workflow: workflow.steps.map(s => s.purpose),
      qualityScore: result.qualityScore,
      iterations: result.iterations,
      modelsUsed: workflow.steps.flatMap(s => s.models),
      validationResults: result.validation
    }
  }
}
```

## Implementation Phases

### Phase 1: Enhanced Intent Classification (Week 1)
- Build universal intent classifier that goes beyond keywords
- Implement multi-dimensional classification (domain, task type, complexity)
- Add confidence scoring and ambiguity detection
- Create semantic understanding layer

**Deliverables**:
- `/lib/forefront/intent-classifier.ts` - Universal intent classification
- `/lib/forefront/semantic-analyzer.ts` - Deep semantic understanding
- Unit tests with 95% classification accuracy

### Phase 2: Dynamic Workflow Builder (Week 2)
- Replace fixed chain templates with runtime workflow construction
- Implement step dependency resolution
- Add parallel execution support
- Create fallback strategy system

**Deliverables**:
- `/lib/forefront/workflow-builder.ts` - Dynamic workflow construction
- `/lib/forefront/execution-engine.ts` - Parallel/sequential execution
- Workflow templates for 5 core domains

### Phase 3: Multi-Model Consensus (Week 3)
- Implement parallel validation system
- Build sequential refinement loops
- Create debate/critique mechanism
- Add weighted voting system

**Deliverables**:
- `/lib/forefront/consensus.ts` - Multi-model consensus algorithms
- `/lib/forefront/model-coordinator.ts` - Model communication layer
- Performance benchmarks showing quality improvements

### Phase 4: Quality Validation Layer (Week 4)
- Implement quality validators for each domain
- Build automatic validation reporting
- Create quality scoring system
- Add validation failure handlers

**Deliverables**:
- `/lib/forefront/validators.ts` - Domain-specific validators
- `/lib/forefront/quality-gate.ts` - Quality enforcement system
- Quality metrics dashboard

### Phase 5: Re-Research Loop System (Week 5)
- Build automatic re-research trigger logic
- Implement additional query generation
- Create iterative improvement loop
- Add max iteration safeguards

**Deliverables**:
- `/lib/forefront/re-research.ts` - Automatic re-research system
- Integration with existing research modules
- Quality improvement metrics

### Phase 6: Cross-Domain Generalization (Week 6)
- Extend system to handle video, code, writing, research
- Create domain-specific handlers
- Implement universal orchestration entry point
- Build domain detection system

**Deliverables**:
- Domain handlers for 5+ domains
- `/lib/forefront/universal-orchestrator.ts` - Unified entry point
- End-to-end tests for all domains

### Phase 7: Self-Improvement & Feedback (Week 7)
- Implement feedback collection system
- Build quality trend analysis
- Create automatic model selection optimization
- Add A/B testing framework

**Deliverables**:
- `/lib/forefront/feedback-loop.ts` - Self-improvement system
- Analytics dashboard showing quality trends
- Automated model performance comparisons

## Technical Specifications

### Data Flow

```typescript
// Entry Point
export async function intelligentOrchestration(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  const startTime = Date.now()

  // 1. Intent Understanding
  const intent = await intentClassifier.classify(request.message, request.context)

  if (intent.confidence < 0.6) {
    // Ambiguity detected - ask clarifying questions
    return await handleAmbiguousIntent(request, intent)
  }

  // 2. Dynamic Workflow Construction
  const workflow = await workflowBuilder.build(intent)

  // 3. Execution with Quality Loops
  const result = await executionEngine.executeWithValidation(workflow, request, {
    validators: selectValidatorsForIntent(intent),
    maxIterations: 3,
    qualityThreshold: intent.qualityThresholds
  })

  // 4. Format for Educational Presentation
  const formatted = await formatter.formatForEducation(result, intent, {
    showSteps: true,
    showCitations: true,
    showQualityMetrics: true,
    interactive: true
  })

  // 5. Record Feedback for Self-Improvement
  await feedbackLoop.recordExecution({
    intent,
    workflow,
    result,
    qualityScore: result.validation.overallScore,
    executionTime: Date.now() - startTime
  })

  return formatted
}
```

### Model Communication Protocol

```typescript
interface ModelMessage {
  from: string  // Model ID
  to: string | 'coordinator'  // Target model or coordinator
  messageType: 'output' | 'critique' | 'validation' | 'refinement'
  content: any
  metadata: {
    confidence: number
    executionTime: number
    tokensUsed: number
  }
}

interface ConsensusSession {
  sessionId: string
  participants: string[]  // Model IDs
  rounds: number
  messages: ModelMessage[]
  finalConsensus: {
    agreed: boolean
    output: any
    confidence: number
    dissenting: string[]  // Model IDs that disagreed
  }
}
```

### Error Handling & Recovery

```typescript
class IntelligenceError extends Error {
  type: 'intent_classification' | 'workflow_build' | 'execution' | 'validation' | 'formatting'
  recoverable: boolean
  suggestedAction: 'retry' | 'fallback_model' | 'simplify_workflow' | 'human_intervention'
}

async function executeWithRecovery(
  workflow: DynamicWorkflow,
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  try {
    return await executionEngine.execute(workflow, request)
  } catch (error) {
    if (error instanceof IntelligenceError && error.recoverable) {
      console.warn(`[Recovery] Handling ${error.type} error with ${error.suggestedAction}`)

      switch (error.suggestedAction) {
        case 'retry':
          return await executionEngine.execute(workflow, request)

        case 'fallback_model':
          workflow.steps = workflow.steps.map(step => ({
            ...step,
            models: [step.models[0], ...getFallbackModels(step.models[0])]
          }))
          return await executionEngine.execute(workflow, request)

        case 'simplify_workflow':
          workflow.steps = workflow.steps.filter(s => s.purpose !== 'validate')
          return await executionEngine.execute(workflow, request)

        case 'human_intervention':
          return await requestHumanReview(workflow, request, error)
      }
    }

    throw error  // Non-recoverable error
  }
}
```

## Success Metrics

### Quality Metrics
- **Factual Accuracy**: >90% verified claims across all outputs
- **Research Sufficiency**: Average 5+ authoritative sources per research step
- **Consensus Score**: >80% agreement between models in validation steps
- **User Satisfaction**: >4.5/5.0 rating on output quality

### Performance Metrics
- **Intent Classification**: <200ms latency
- **Workflow Construction**: <500ms latency
- **End-to-End Execution**: <30s for complex multi-step workflows
- **Re-Research Trigger Rate**: <15% of requests require additional research

### Educational Metrics
- **Step Visibility**: 100% of workflows show expandable steps
- **Citation Click-Through**: >30% of users click citations
- **Learning Insight**: Users report understanding of AI orchestration

### System Reliability
- **Success Rate**: >98% successful completions
- **Recovery Rate**: >90% of errors recovered automatically
- **Consistency**: <5% variation in outputs for identical requests

## Next Steps

1. **Review and approve this architecture document**
2. **Prioritize implementation phases** based on business needs
3. **Allocate development resources** for Phase 1 (Intent Classification)
4. **Set up metrics collection infrastructure** to measure improvements
5. **Create testing framework** for multi-model workflows
6. **Begin implementation** of Phase 1 components

## Appendix: System Prompts

### Universal Intent Classifier Prompt

```
You are a universal intent classifier for Forefront Intelligence, a meta-model orchestration system.

Your task: Analyze user requests and classify them across multiple dimensions to enable dynamic workflow construction.

Classification Schema:
1. DOMAIN: creative | analytical | learning | technical | hybrid
2. TASK TYPE: generation | analysis | research | optimization | teaching
3. COMPLEXITY: trivial | moderate | complex | expert
4. CAPABILITIES NEEDED: research, consensus, optimization, validation, specialized tools
5. QUALITY THRESHOLDS: factualAccuracy (0-1), creativityLevel (0-1), technicalDepth (0-1), educationalValue (0-1)
6. DELIVERY FORMAT: visual | code | text | interactive | multimedia

Return ONLY a JSON object:
{
  "domain": "...",
  "taskType": "...",
  "complexity": "...",
  "capabilities": {
    "needsResearch": boolean,
    "needsMultiModelConsensus": boolean,
    "needsOptimization": boolean,
    "needsValidation": boolean,
    "needsSpecializedTools": ["tool1", "tool2"]
  },
  "qualityThresholds": {
    "factualAccuracy": 0.0-1.0,
    "creativityLevel": 0.0-1.0,
    "technicalDepth": 0.0-1.0,
    "educationalValue": 0.0-1.0
  },
  "deliveryFormat": "...",
  "confidence": 0.0-1.0
}

Examples:

Input: "Generate an image of a cyberpunk cityscape"
Output: {
  "domain": "creative",
  "taskType": "generation",
  "complexity": "moderate",
  "capabilities": {
    "needsResearch": true,
    "needsMultiModelConsensus": false,
    "needsOptimization": true,
    "needsValidation": false,
    "needsSpecializedTools": ["image-generator"]
  },
  "qualityThresholds": {
    "factualAccuracy": 0.5,
    "creativityLevel": 0.9,
    "technicalDepth": 0.6,
    "educationalValue": 0.7
  },
  "deliveryFormat": "visual",
  "confidence": 0.95
}

Input: "Explain how neural networks learn with examples"
Output: {
  "domain": "learning",
  "taskType": "teaching",
  "complexity": "moderate",
  "capabilities": {
    "needsResearch": true,
    "needsMultiModelConsensus": true,
    "needsOptimization": false,
    "needsValidation": true,
    "needsSpecializedTools": []
  },
  "qualityThresholds": {
    "factualAccuracy": 0.95,
    "creativityLevel": 0.6,
    "technicalDepth": 0.8,
    "educationalValue": 0.95
  },
  "deliveryFormat": "interactive",
  "confidence": 0.9
}

Now classify the user's request with high accuracy and appropriate quality thresholds.
```

### Consensus Validator Prompt

```
You are a consensus validator in a multi-model AI system.

Your task: Evaluate whether multiple model outputs agree on key facts and conclusions.

You will receive:
1. Original user question
2. Outputs from 2-3 different AI models
3. Specific aspects to validate

Analyze:
- Factual agreement: Do all models agree on core facts?
- Reasoning alignment: Do models use similar logic?
- Conclusion consensus: Do models reach the same conclusion?
- Dissenting points: What do models disagree on?

Return JSON:
{
  "agreement": 0.0-1.0,
  "factualConsensus": true/false,
  "reasoningAlignment": true/false,
  "conclusionConsensus": true/false,
  "synthesizedAnswer": "merged best elements from all models",
  "dissenting": ["points where models disagreed"],
  "confidence": 0.0-1.0
}

If agreement < 0.7, recommend re-research or escalation.
```

### Re-Research Query Generator Prompt

```
You are a research query generator for a self-improving AI system.

Context:
- Original user request: [USER_INPUT]
- Previous research output: [RESEARCH_OUTPUT]
- Quality issues identified: [ISSUES]

Your task: Generate 2-3 additional search queries that will address the quality gaps.

Guidelines:
- Focus on authoritative sources (official docs, research papers, expert perspectives)
- Target specific gaps in previous research
- Use precise technical terminology
- Prioritize recent information (2024-2025)

Return only the queries, one per line, no numbering or formatting.

Example:

Original request: "Create an image of a futuristic car"
Previous research issues: Insufficient information on Seed Dream 4 best practices
Generated queries:
Seed Dream 4 official prompting guide 2025
vehicle design best practices for AI image generation
photorealistic car rendering prompts flux vs seed dream comparison
```
