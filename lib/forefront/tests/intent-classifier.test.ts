/**
 * Test Suite for Universal Intent Classifier
 *
 * Validates intent classification across diverse query types
 */

import { classifyUniversalIntent, type UniversalIntent } from '../intent-classifier'
import { analyzeSemantics, enhanceIntentWithSemantics } from '../semantic-analyzer'
import { buildDynamicWorkflow } from '../workflow-builder'

/**
 * Test case definition
 */
interface TestCase {
  id: string
  query: string
  expectedDomain: UniversalIntent['domain']
  expectedTaskType: UniversalIntent['taskType']
  expectedComplexity: UniversalIntent['complexity']
  expectedDeliveryFormat: UniversalIntent['deliveryFormat']
  shouldNeedResearch?: boolean
  shouldNeedConsensus?: boolean
  shouldNeedOptimization?: boolean
  description: string
}

/**
 * Comprehensive test cases across all domains
 */
const testCases: TestCase[] = [
  // Creative Domain
  {
    id: 'creative-1',
    query: 'Generate an image of a cyberpunk city at night with neon lights',
    expectedDomain: 'creative',
    expectedTaskType: 'generation',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'visual',
    shouldNeedOptimization: true,
    description: 'Image generation with specific style'
  },
  {
    id: 'creative-2',
    query: 'Create a video showing the evolution of technology over the last century',
    expectedDomain: 'creative',
    expectedTaskType: 'generation',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'multimedia',
    shouldNeedResearch: true,
    shouldNeedConsensus: true,
    description: 'Video generation requiring research'
  },
  {
    id: 'creative-3',
    query: 'Write a short story about AI becoming conscious',
    expectedDomain: 'creative',
    expectedTaskType: 'generation',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'text',
    shouldNeedOptimization: true,
    description: 'Creative writing task'
  },

  // Analytical Domain
  {
    id: 'analytical-1',
    query: 'Research the latest developments in quantum computing and analyze their potential impact',
    expectedDomain: 'analytical',
    expectedTaskType: 'research',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'text',
    shouldNeedResearch: true,
    shouldNeedConsensus: true,
    description: 'Research and analysis task'
  },
  {
    id: 'analytical-2',
    query: 'Compare the performance of React vs Vue for large-scale applications',
    expectedDomain: 'analytical',
    expectedTaskType: 'analysis',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'text',
    shouldNeedResearch: true,
    description: 'Comparative analysis'
  },
  {
    id: 'analytical-3',
    query: 'Analyze this dataset for patterns and anomalies',
    expectedDomain: 'analytical',
    expectedTaskType: 'analysis',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'text',
    shouldNeedConsensus: true,
    description: 'Data analysis task'
  },

  // Learning Domain
  {
    id: 'learning-1',
    query: 'Explain how neural networks work with simple examples',
    expectedDomain: 'learning',
    expectedTaskType: 'teaching',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'interactive',
    description: 'Educational explanation'
  },
  {
    id: 'learning-2',
    query: 'Create a step-by-step tutorial for building a REST API',
    expectedDomain: 'learning',
    expectedTaskType: 'teaching',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'interactive',
    shouldNeedOptimization: true,
    description: 'Tutorial creation'
  },
  {
    id: 'learning-3',
    query: 'Teach me quantum physics starting from the basics',
    expectedDomain: 'learning',
    expectedTaskType: 'teaching',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'interactive',
    shouldNeedResearch: true,
    description: 'Comprehensive teaching task'
  },

  // Technical Domain
  {
    id: 'technical-1',
    query: 'Debug this Python function that\'s throwing an IndexError',
    expectedDomain: 'technical',
    expectedTaskType: 'optimization',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'code',
    shouldNeedConsensus: true,
    description: 'Code debugging'
  },
  {
    id: 'technical-2',
    query: 'Optimize this SQL query for better performance',
    expectedDomain: 'technical',
    expectedTaskType: 'optimization',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'code',
    shouldNeedOptimization: true,
    description: 'Performance optimization'
  },
  {
    id: 'technical-3',
    query: 'Build a microservices architecture for an e-commerce platform',
    expectedDomain: 'technical',
    expectedTaskType: 'generation',
    expectedComplexity: 'expert',
    expectedDeliveryFormat: 'code',
    shouldNeedConsensus: true,
    shouldNeedResearch: true,
    description: 'Architecture design'
  },

  // Hybrid Domain
  {
    id: 'hybrid-1',
    query: 'Research climate change data and create an infographic presentation',
    expectedDomain: 'hybrid',
    expectedTaskType: 'research',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'multimedia',
    shouldNeedResearch: true,
    shouldNeedOptimization: true,
    shouldNeedConsensus: true,
    description: 'Research + creative visualization'
  },
  {
    id: 'hybrid-2',
    query: 'Analyze this code, explain how it works, and suggest improvements',
    expectedDomain: 'hybrid',
    expectedTaskType: 'analysis',
    expectedComplexity: 'moderate',
    expectedDeliveryFormat: 'text',
    shouldNeedConsensus: true,
    description: 'Technical analysis + teaching'
  },
  {
    id: 'hybrid-3',
    query: 'Study machine learning algorithms and create interactive visualizations',
    expectedDomain: 'hybrid',
    expectedTaskType: 'research',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'interactive',
    shouldNeedResearch: true,
    shouldNeedOptimization: true,
    description: 'Learning + creative + technical'
  },

  // Simple/Trivial Queries
  {
    id: 'simple-1',
    query: 'Hello',
    expectedDomain: 'technical',
    expectedTaskType: 'analysis',
    expectedComplexity: 'trivial',
    expectedDeliveryFormat: 'text',
    description: 'Simple greeting'
  },
  {
    id: 'simple-2',
    query: 'What is AI?',
    expectedDomain: 'learning',
    expectedTaskType: 'teaching',
    expectedComplexity: 'trivial',
    expectedDeliveryFormat: 'text',
    description: 'Basic question'
  },

  // Edge Cases
  {
    id: 'edge-1',
    query: 'Do research and create an optimized prompt then generate an image of a futuristic city',
    expectedDomain: 'hybrid',
    expectedTaskType: 'research',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'visual',
    shouldNeedResearch: true,
    shouldNeedOptimization: true,
    shouldNeedConsensus: true,
    description: 'Multi-step chained request'
  },
  {
    id: 'edge-2',
    query: '',
    expectedDomain: 'technical',
    expectedTaskType: 'analysis',
    expectedComplexity: 'trivial',
    expectedDeliveryFormat: 'text',
    description: 'Empty query'
  },
  {
    id: 'edge-3',
    query: 'Can you help me understand how to use machine learning to analyze customer data and then create a dashboard to visualize the insights?',
    expectedDomain: 'hybrid',
    expectedTaskType: 'teaching',
    expectedComplexity: 'complex',
    expectedDeliveryFormat: 'interactive',
    shouldNeedResearch: true,
    shouldNeedConsensus: true,
    description: 'Very complex multi-domain request'
  }
]

/**
 * Run single test case
 */
async function runTestCase(testCase: TestCase): Promise<{
  passed: boolean
  details: any
  errors: string[]
}> {
  const errors: string[] = []

  try {
    // Classify intent
    const intent = await classifyUniversalIntent(testCase.query)

    // Check domain
    if (intent.domain !== testCase.expectedDomain) {
      errors.push(`Domain mismatch: expected ${testCase.expectedDomain}, got ${intent.domain}`)
    }

    // Check task type
    if (intent.taskType !== testCase.expectedTaskType) {
      errors.push(`Task type mismatch: expected ${testCase.expectedTaskType}, got ${intent.taskType}`)
    }

    // Check complexity
    if (intent.complexity !== testCase.expectedComplexity) {
      errors.push(`Complexity mismatch: expected ${testCase.expectedComplexity}, got ${intent.complexity}`)
    }

    // Check delivery format
    if (intent.deliveryFormat !== testCase.expectedDeliveryFormat) {
      errors.push(`Delivery format mismatch: expected ${testCase.expectedDeliveryFormat}, got ${intent.deliveryFormat}`)
    }

    // Check capabilities if specified
    if (testCase.shouldNeedResearch !== undefined) {
      if (intent.capabilities.needsResearch !== testCase.shouldNeedResearch) {
        errors.push(`Research need mismatch: expected ${testCase.shouldNeedResearch}, got ${intent.capabilities.needsResearch}`)
      }
    }

    if (testCase.shouldNeedConsensus !== undefined) {
      if (intent.capabilities.needsMultiModelConsensus !== testCase.shouldNeedConsensus) {
        errors.push(`Consensus need mismatch: expected ${testCase.shouldNeedConsensus}, got ${intent.capabilities.needsMultiModelConsensus}`)
      }
    }

    if (testCase.shouldNeedOptimization !== undefined) {
      if (intent.capabilities.needsOptimization !== testCase.shouldNeedOptimization) {
        errors.push(`Optimization need mismatch: expected ${testCase.shouldNeedOptimization}, got ${intent.capabilities.needsOptimization}`)
      }
    }

    // Test semantic analysis
    const semantics = analyzeSemantics(testCase.query)
    const enhancedIntent = enhanceIntentWithSemantics(intent, semantics)

    // Test workflow building
    const workflow = await buildDynamicWorkflow(enhancedIntent, semantics)

    return {
      passed: errors.length === 0,
      details: {
        intent,
        semantics: {
          primaryAction: semantics.primaryAction,
          primarySubject: semantics.primarySubject,
          entities: semantics.entities.length,
          specificity: semantics.specificity
        },
        workflow: {
          steps: workflow.steps.length,
          estimatedTime: workflow.estimatedTime,
          workflowType: workflow.workflowType
        }
      },
      errors
    }

  } catch (error) {
    errors.push(`Exception: ${error}`)
    return {
      passed: false,
      details: null,
      errors
    }
  }
}

/**
 * Run all test cases
 */
export async function runAllTests(): Promise<{
  totalTests: number
  passed: number
  failed: number
  results: any[]
}> {
  const results = []
  let passed = 0
  let failed = 0

  console.log('='.repeat(60))
  console.log('Universal Intent Classifier Test Suite')
  console.log('='.repeat(60))

  for (const testCase of testCases) {
    console.log(`\nRunning test ${testCase.id}: ${testCase.description}`)
    console.log(`Query: "${testCase.query}"`)

    const result = await runTestCase(testCase)

    if (result.passed) {
      console.log(`✅ PASSED`)
      passed++
    } else {
      console.log(`❌ FAILED`)
      console.log('Errors:', result.errors.join('\n  '))
      failed++
    }

    if (result.details) {
      console.log('Intent:', {
        domain: result.details.intent.domain,
        taskType: result.details.intent.taskType,
        complexity: result.details.intent.complexity,
        confidence: result.details.intent.confidence
      })
      console.log('Workflow:', result.details.workflow)
    }

    results.push({
      testId: testCase.id,
      description: testCase.description,
      ...result
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('Test Summary')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${testCases.length}`)
  console.log(`Passed: ${passed} (${(passed / testCases.length * 100).toFixed(1)}%)`)
  console.log(`Failed: ${failed} (${(failed / testCases.length * 100).toFixed(1)}%)`)

  return {
    totalTests: testCases.length,
    passed,
    failed,
    results
  }
}

/**
 * Run performance benchmarks
 */
export async function runPerformanceBenchmark(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('Performance Benchmark')
  console.log('='.repeat(60))

  const queries = [
    'Generate an image',
    'Research quantum computing and explain it simply',
    'Debug this Python code and optimize it for performance',
    'Create a comprehensive tutorial about machine learning'
  ]

  for (const query of queries) {
    const times: number[] = []

    // Run 5 times for average
    for (let i = 0; i < 5; i++) {
      const start = Date.now()
      const intent = await classifyUniversalIntent(query)
      const semantics = analyzeSemantics(query)
      const workflow = await buildDynamicWorkflow(intent, semantics)
      const end = Date.now()

      times.push(end - start)
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)

    console.log(`\nQuery: "${query.substring(0, 50)}..."`)
    console.log(`Average: ${avgTime.toFixed(0)}ms`)
    console.log(`Min: ${minTime}ms, Max: ${maxTime}ms`)
  }
}

// If running as script
if (require.main === module) {
  (async () => {
    await runAllTests()
    await runPerformanceBenchmark()
  })()
}