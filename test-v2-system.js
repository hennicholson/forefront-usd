#!/usr/bin/env node

/**
 * Simple test runner for V2 system components
 */

const { classifyUniversalIntent } = require('./lib/forefront/intent-classifier')
const { analyzeSemantics } = require('./lib/forefront/semantic-analyzer')
const { buildDynamicWorkflow } = require('./lib/forefront/workflow-builder')
const { validateQuality } = require('./lib/forefront/quality-validator')
const { ForefrontOrchestratorV2 } = require('./lib/forefront/orchestrator-v2')

async function testIntentClassifier() {
  console.log('\n=== TESTING INTENT CLASSIFIER ===\n')

  const testCases = [
    'Generate an image of a futuristic city',
    'Research quantum computing',
    'Teach me Python programming',
    'Debug this code',
    'Analyze market trends for AI'
  ]

  for (const test of testCases) {
    try {
      const intent = await classifyUniversalIntent(test)
      console.log(`✅ "${test.substring(0, 40)}..."`)
      console.log(`   Domain: ${intent.domain}, Type: ${intent.taskType}, Complexity: ${intent.complexity}`)
    } catch (error) {
      console.log(`❌ Failed: ${test}`)
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function testSemanticAnalyzer() {
  console.log('\n=== TESTING SEMANTIC ANALYZER ===\n')

  const testCases = [
    'Create a red logo for TechCorp by tomorrow',
    'Compare AWS and Azure for machine learning',
    'Build a REST API with authentication'
  ]

  for (const test of testCases) {
    try {
      const semantics = analyzeSemantics(test)
      console.log(`✅ "${test.substring(0, 40)}..."`)
      console.log(`   Action: ${semantics.primaryAction}, Subject: ${semantics.primarySubject}`)
      console.log(`   Entities: ${semantics.entities.length}, Specificity: ${semantics.specificity}`)
    } catch (error) {
      console.log(`❌ Failed: ${test}`)
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function testWorkflowBuilder() {
  console.log('\n=== TESTING WORKFLOW BUILDER ===\n')

  try {
    const query = 'Research climate change and create an infographic'
    const intent = await classifyUniversalIntent(query)
    const semantics = analyzeSemantics(query)
    const workflow = await buildDynamicWorkflow(intent, semantics)

    console.log(`✅ Workflow built for: "${query}"`)
    console.log(`   Type: ${workflow.workflowType}`)
    console.log(`   Steps: ${workflow.steps.map(s => s.type).join(' -> ')}`)
    console.log(`   Quality Gates: ${workflow.qualityGates.length}`)
    console.log(`   Estimated Time: ${workflow.estimatedTime}ms`)
  } catch (error) {
    console.log(`❌ Workflow building failed`)
    console.log(`   Error: ${error.message}`)
  }
}

async function testQualityValidator() {
  console.log('\n=== TESTING QUALITY VALIDATOR ===\n')

  try {
    const content = 'The sky is green and water flows upward due to gravity.'
    const intent = await classifyUniversalIntent('Tell me about physics')
    const semantics = analyzeSemantics('Tell me about physics')
    const validation = await validateQuality(content, intent, semantics)

    console.log(`✅ Quality validation completed`)
    console.log(`   Overall Score: ${(validation.overallScore * 100).toFixed(0)}%`)
    console.log(`   Needs Re-Research: ${validation.needsReResearch}`)
    console.log(`   Failed Validators: ${validation.validatorResults
      .filter(v => v.score < v.threshold)
      .map(v => v.validator)
      .join(', ') || 'none'}`)
  } catch (error) {
    console.log(`❌ Quality validation failed`)
    console.log(`   Error: ${error.message}`)
  }
}

async function testV2Orchestrator() {
  console.log('\n=== TESTING V2 ORCHESTRATOR ===\n')

  try {
    const orchestrator = new ForefrontOrchestratorV2()
    const request = {
      message: 'What is machine learning?',
      userId: 'test-user',
      context: {
        conversationHistory: [],
        userId: 'test-user'
      },
      enableQualityValidation: true,
      enableReResearch: false,
      enableConsensus: false
    }

    console.log(`🚀 Testing orchestrator with: "${request.message}"`)
    console.log(`   This may take a moment...`)

    const response = await orchestrator.executeV2(request)

    console.log(`\n✅ V2 Orchestration completed!`)
    console.log(`   Domain: ${response.intent.domain}`)
    console.log(`   Task Type: ${response.intent.taskType}`)
    console.log(`   Complexity: ${response.intent.complexity}`)
    console.log(`   Workflow Type: ${response.workflow.workflowType}`)
    console.log(`   Workflow Steps: ${response.workflow.steps.length}`)
    console.log(`   Quality Score: ${(response.qualityScore * 100).toFixed(0)}%`)
    console.log(`   Execution Time: ${response.executionTime}ms`)
    console.log(`   Response Length: ${response.response.length} chars`)
  } catch (error) {
    console.log(`❌ V2 Orchestration failed`)
    console.log(`   Error: ${error.message}`)
    console.log(`   Stack: ${error.stack}`)
  }
}

async function runAllTests() {
  console.log('========================================')
  console.log('   FOREFRONT INTELLIGENCE V2 TESTS')
  console.log('========================================')

  try {
    await testIntentClassifier()
    await testSemanticAnalyzer()
    await testWorkflowBuilder()
    await testQualityValidator()
    await testV2Orchestrator()

    console.log('\n========================================')
    console.log('        ALL TESTS COMPLETED')
    console.log('========================================')
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  }
}

// Run tests
runAllTests()