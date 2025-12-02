/**
 * Integration Test Suite for Forefront Intelligence V2
 *
 * Tests the complete V2 meta-orchestration system end-to-end
 */

import { ForefrontOrchestratorV2 } from '../orchestrator-v2'
import { classifyUniversalIntent } from '../intent-classifier'
import { analyzeSemantics } from '../semantic-analyzer'
import { buildDynamicWorkflow } from '../workflow-builder'
import { validateQuality } from '../quality-validator'
import { createExecutionEngine } from '../execution-engine'
import { ConsensusOrchestrator, ConsensusStrategy } from '../consensus'
import { createReResearchLoop } from '../re-research-loop'

/**
 * Test case definition
 */
interface V2TestCase {
  id: string
  name: string
  request: string
  expectedDomain: string
  expectedComplexity: 'trivial' | 'moderate' | 'complex' | 'expert'
  shouldUseConsensus: boolean
  shouldTriggerReResearch: boolean
  minQualityScore: number
  description: string
}

/**
 * Comprehensive test cases covering all V2 capabilities
 */
const testCases: V2TestCase[] = [
  // Simple cases to test basic functionality
  {
    id: 'simple-1',
    name: 'Basic greeting',
    request: 'Hello, how are you?',
    expectedDomain: 'technical',
    expectedComplexity: 'trivial',
    shouldUseConsensus: false,
    shouldTriggerReResearch: false,
    minQualityScore: 0.8,
    description: 'Tests trivial request handling'
  },
  {
    id: 'simple-2',
    name: 'Basic question',
    request: 'What is machine learning?',
    expectedDomain: 'learning',
    expectedComplexity: 'trivial',
    shouldUseConsensus: false,
    shouldTriggerReResearch: false,
    minQualityScore: 0.8,
    description: 'Tests simple educational query'
  },

  // Creative domain tests
  {
    id: 'creative-1',
    name: 'Image generation with research',
    request: 'Generate an image of a futuristic Tokyo with flying cars and neon signs',
    expectedDomain: 'creative',
    expectedComplexity: 'moderate',
    shouldUseConsensus: false,
    shouldTriggerReResearch: false,
    minQualityScore: 0.75,
    description: 'Tests creative generation with research phase'
  },
  {
    id: 'creative-2',
    name: 'Complex creative project',
    request: 'Create a comprehensive brand identity for a sustainable fashion startup',
    expectedDomain: 'creative',
    expectedComplexity: 'complex',
    shouldUseConsensus: true,
    shouldTriggerReResearch: false,
    minQualityScore: 0.8,
    description: 'Tests complex creative workflow with multiple outputs'
  },

  // Analytical domain tests
  {
    id: 'analytical-1',
    name: 'Data analysis request',
    request: 'Analyze the trends in AI adoption across different industries in 2024',
    expectedDomain: 'analytical',
    expectedComplexity: 'moderate',
    shouldUseConsensus: true,
    shouldTriggerReResearch: true,
    minQualityScore: 0.85,
    description: 'Tests research and analysis with consensus'
  },
  {
    id: 'analytical-2',
    name: 'Complex comparison',
    request: 'Compare React, Vue, and Angular for enterprise applications, considering performance, ecosystem, and maintainability',
    expectedDomain: 'analytical',
    expectedComplexity: 'complex',
    shouldUseConsensus: true,
    shouldTriggerReResearch: false,
    minQualityScore: 0.8,
    description: 'Tests multi-faceted analytical comparison'
  },

  // Technical domain tests
  {
    id: 'technical-1',
    name: 'Code optimization',
    request: 'Optimize this Python function for better performance: def find_primes(n): return [x for x in range(2, n) if all(x % i != 0 for i in range(2, x))]',
    expectedDomain: 'technical',
    expectedComplexity: 'moderate',
    shouldUseConsensus: false,
    shouldTriggerReResearch: false,
    minQualityScore: 0.85,
    description: 'Tests code optimization workflow'
  },
  {
    id: 'technical-2',
    name: 'Architecture design',
    request: 'Design a microservices architecture for a real-time collaborative document editor',
    expectedDomain: 'technical',
    expectedComplexity: 'expert',
    shouldUseConsensus: true,
    shouldTriggerReResearch: true,
    minQualityScore: 0.85,
    description: 'Tests complex technical design with validation'
  },

  // Learning domain tests
  {
    id: 'learning-1',
    name: 'Tutorial creation',
    request: 'Create a step-by-step tutorial for building a REST API with Node.js and Express',
    expectedDomain: 'learning',
    expectedComplexity: 'moderate',
    shouldUseConsensus: false,
    shouldTriggerReResearch: false,
    minQualityScore: 0.8,
    description: 'Tests educational content creation'
  },
  {
    id: 'learning-2',
    name: 'Complex concept explanation',
    request: 'Explain quantum computing to a high school student with interactive examples',
    expectedDomain: 'learning',
    expectedComplexity: 'complex',
    shouldUseConsensus: true,
    shouldTriggerReResearch: false,
    minQualityScore: 0.85,
    description: 'Tests adaptive educational content with clarity validation'
  },

  // Hybrid domain tests
  {
    id: 'hybrid-1',
    name: 'Research and visualization',
    request: 'Research climate change impacts and create an infographic with data visualizations',
    expectedDomain: 'hybrid',
    expectedComplexity: 'complex',
    shouldUseConsensus: true,
    shouldTriggerReResearch: true,
    minQualityScore: 0.85,
    description: 'Tests multi-domain workflow with research and creative output'
  },
  {
    id: 'hybrid-2',
    name: 'Full-stack project',
    request: 'Analyze user authentication best practices, implement a secure login system, and create documentation',
    expectedDomain: 'hybrid',
    expectedComplexity: 'expert',
    shouldUseConsensus: true,
    shouldTriggerReResearch: true,
    minQualityScore: 0.9,
    description: 'Tests complete project workflow across multiple domains'
  }
]

/**
 * Test result structure
 */
interface TestResult {
  testId: string
  testName: string
  passed: boolean
  executionTime: number
  actualDomain: string
  actualComplexity: string
  workflowSteps: number
  qualityScore: number
  consensusUsed: boolean
  reResearchTriggered: boolean
  errors: string[]
  details: any
}

/**
 * Run a single V2 test case
 */
async function runV2TestCase(testCase: V2TestCase): Promise<TestResult> {
  const startTime = Date.now()
  const errors: string[] = []

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Testing: ${testCase.name}`)
    console.log(`Request: "${testCase.request}"`)
    console.log(`Expected: Domain=${testCase.expectedDomain}, Complexity=${testCase.expectedComplexity}`)
    console.log(`${'='.repeat(60)}`)

    // Initialize V2 orchestrator
    const orchestrator = new ForefrontOrchestratorV2()

    // Execute V2 orchestration
    const response = await orchestrator.executeV2({
      message: testCase.request,
      userId: 'test-user',
      context: {
        conversationHistory: [],
        userId: 'test-user'
      },
      enableQualityValidation: true,
      enableReResearch: true,
      enableConsensus: true
    })

    // Validate intent classification
    if (response.intent.domain !== testCase.expectedDomain) {
      errors.push(`Domain mismatch: expected ${testCase.expectedDomain}, got ${response.intent.domain}`)
    }

    if (response.intent.complexity !== testCase.expectedComplexity) {
      errors.push(`Complexity mismatch: expected ${testCase.expectedComplexity}, got ${response.intent.complexity}`)
    }

    // Validate quality score
    if (response.qualityScore < testCase.minQualityScore) {
      errors.push(`Quality below threshold: ${response.qualityScore} < ${testCase.minQualityScore}`)
    }

    // Check consensus usage
    const consensusUsed = response.workflowExecution.steps.some(
      (step: any) => step.stepType === 'consensus'
    )
    if (testCase.shouldUseConsensus && !consensusUsed) {
      errors.push('Expected consensus to be used but it was not')
    }

    // Check re-research
    if (testCase.shouldTriggerReResearch && !response.reResearchPerformed) {
      errors.push('Expected re-research to be triggered but it was not')
    }

    const executionTime = Date.now() - startTime

    console.log(`\n📊 Results:`)
    console.log(`- Domain: ${response.intent.domain} ${response.intent.domain === testCase.expectedDomain ? '✅' : '❌'}`)
    console.log(`- Complexity: ${response.intent.complexity} ${response.intent.complexity === testCase.expectedComplexity ? '✅' : '❌'}`)
    console.log(`- Quality Score: ${(response.qualityScore * 100).toFixed(0)}% ${response.qualityScore >= testCase.minQualityScore ? '✅' : '❌'}`)
    console.log(`- Workflow Steps: ${response.workflow.steps.length}`)
    console.log(`- Consensus Used: ${consensusUsed ? 'Yes' : 'No'}`)
    console.log(`- Re-Research: ${response.reResearchPerformed ? `Yes (${response.reResearchIterations} iterations)` : 'No'}`)
    console.log(`- Execution Time: ${executionTime}ms`)

    if (errors.length > 0) {
      console.log(`\n❌ Errors:`)
      errors.forEach(error => console.log(`  - ${error}`))
    }

    return {
      testId: testCase.id,
      testName: testCase.name,
      passed: errors.length === 0,
      executionTime,
      actualDomain: response.intent.domain,
      actualComplexity: response.intent.complexity,
      workflowSteps: response.workflow.steps.length,
      qualityScore: response.qualityScore,
      consensusUsed,
      reResearchTriggered: response.reResearchPerformed,
      errors,
      details: {
        intent: response.intent,
        semantics: response.semantics,
        workflowType: response.workflow.workflowType,
        executionStatus: response.workflowExecution.status
      }
    }
  } catch (error) {
    console.error(`\n❌ Test failed with exception:`, error)
    errors.push(`Exception: ${error}`)

    return {
      testId: testCase.id,
      testName: testCase.name,
      passed: false,
      executionTime: Date.now() - startTime,
      actualDomain: 'unknown',
      actualComplexity: 'unknown',
      workflowSteps: 0,
      qualityScore: 0,
      consensusUsed: false,
      reResearchTriggered: false,
      errors,
      details: { error: error?.toString() }
    }
  }
}

/**
 * Run all V2 integration tests
 */
export async function runV2IntegrationTests(): Promise<{
  totalTests: number
  passed: number
  failed: number
  avgExecutionTime: number
  results: TestResult[]
}> {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     FOREFRONT INTELLIGENCE V2 - INTEGRATION TEST SUITE    ║
╚══════════════════════════════════════════════════════════╝
`)

  const results: TestResult[] = []
  let totalExecutionTime = 0

  // Run each test case
  for (const testCase of testCases) {
    const result = await runV2TestCase(testCase)
    results.push(result)
    totalExecutionTime += result.executionTime

    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Calculate summary statistics
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const avgExecutionTime = totalExecutionTime / results.length

  // Print summary
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                     TEST SUMMARY                          ║
╚══════════════════════════════════════════════════════════╝

Total Tests: ${testCases.length}
Passed: ${passed} (${(passed / testCases.length * 100).toFixed(0)}%)
Failed: ${failed} (${(failed / testCases.length * 100).toFixed(0)}%)
Average Execution Time: ${avgExecutionTime.toFixed(0)}ms

Domain Coverage:
${['creative', 'analytical', 'technical', 'learning', 'hybrid'].map(domain => {
  const domainTests = results.filter(r => r.actualDomain === domain)
  return `- ${domain}: ${domainTests.length} tests, ${domainTests.filter(r => r.passed).length} passed`
}).join('\n')}

Complexity Distribution:
${['trivial', 'moderate', 'complex', 'expert'].map(complexity => {
  const complexityTests = results.filter(r => r.actualComplexity === complexity)
  return `- ${complexity}: ${complexityTests.length} tests`
}).join('\n')}

Quality Scores:
- Average: ${(results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length * 100).toFixed(0)}%
- Min: ${(Math.min(...results.map(r => r.qualityScore)) * 100).toFixed(0)}%
- Max: ${(Math.max(...results.map(r => r.qualityScore)) * 100).toFixed(0)}%

Feature Usage:
- Consensus: ${results.filter(r => r.consensusUsed).length} tests
- Re-Research: ${results.filter(r => r.reResearchTriggered).length} tests
`)

  // Print failed tests details
  if (failed > 0) {
    console.log(`\n❌ FAILED TESTS:`)
    results.filter(r => !r.passed).forEach(result => {
      console.log(`\n${result.testName}:`)
      result.errors.forEach(error => console.log(`  - ${error}`))
    })
  }

  return {
    totalTests: testCases.length,
    passed,
    failed,
    avgExecutionTime,
    results
  }
}

/**
 * Run component tests
 */
export async function runComponentTests(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              V2 COMPONENT TESTS                           ║
╚══════════════════════════════════════════════════════════╝
`)

  // Test Intent Classifier
  console.log('\n📌 Testing Intent Classifier...')
  const intentTests = [
    'Generate an image of a sunset',
    'Analyze market trends',
    'Teach me Python',
    'Debug this code'
  ]

  for (const test of intentTests) {
    const intent = await classifyUniversalIntent(test)
    console.log(`"${test}" -> Domain: ${intent.domain}, Type: ${intent.taskType}`)
  }

  // Test Semantic Analyzer
  console.log('\n📌 Testing Semantic Analyzer...')
  const semanticTests = [
    'Create a red logo for TechCorp by tomorrow',
    'Compare AWS and Azure for machine learning workloads'
  ]

  for (const test of semanticTests) {
    const semantics = analyzeSemantics(test)
    console.log(`"${test.substring(0, 40)}..." ->`)
    console.log(`  Action: ${semantics.primaryAction}, Subject: ${semantics.primarySubject}`)
    console.log(`  Entities: ${semantics.entities.length}, Constraints: ${semantics.constraints.length}`)
  }

  // Test Workflow Builder
  console.log('\n📌 Testing Workflow Builder...')
  const workflowTest = 'Research quantum computing and create a presentation'
  const workflowIntent = await classifyUniversalIntent(workflowTest)
  const workflowSemantics = analyzeSemantics(workflowTest)
  const workflow = await buildDynamicWorkflow(workflowIntent, workflowSemantics)
  console.log(`"${workflowTest}" ->`)
  console.log(`  Workflow Type: ${workflow.workflowType}`)
  console.log(`  Steps: ${workflow.steps.map(s => s.type).join(' -> ')}`)
  console.log(`  Estimated Time: ${workflow.estimatedTime}ms`)

  // Test Quality Validator
  console.log('\n📌 Testing Quality Validator...')
  const qualityTest = 'The sky is green and water is dry.'
  const qualityIntent = await classifyUniversalIntent(qualityTest)
  const qualitySemantics = analyzeSemantics(qualityTest)
  const validation = await validateQuality(qualityTest, qualityIntent, qualitySemantics)
  console.log(`Quality validation for factually incorrect statement:`)
  console.log(`  Overall Score: ${(validation.overallScore * 100).toFixed(0)}%`)
  console.log(`  Needs Re-Research: ${validation.needsReResearch}`)
  console.log(`  Failed Validators: ${validation.validatorResults.filter(v => v.score < v.threshold).map(v => v.validator).join(', ')}`)
}

/**
 * Main test runner
 */
export async function runAllV2Tests(): Promise<void> {
  // Run component tests first
  await runComponentTests()

  // Add delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Run integration tests
  const integrationResults = await runV2IntegrationTests()

  // Final status
  if (integrationResults.failed === 0) {
    console.log(`
✅ ALL TESTS PASSED!
The Forefront Intelligence V2 system is working correctly.
`)
  } else {
    console.log(`
⚠️  SOME TESTS FAILED
Please review the failed tests and fix any issues.
`)
  }
}

// If running as script
if (require.main === module) {
  runAllV2Tests().catch(console.error)
}