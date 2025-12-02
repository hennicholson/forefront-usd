import { NextRequest, NextResponse } from 'next/server'
import { ForefrontOrchestrator } from '@/lib/forefront/orchestrator'
// import { ForefrontOrchestratorV2 } from '@/lib/forefront/orchestrator-v2'  // Disabled - has type errors
import { db } from '@/lib/db'
import { chatMessages, chatSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/forefront/chat
 * Send a message to Forefront Intelligence and save to chat session
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, userId, model, useV2 } = await request.json()

    if (!sessionId || !message || !userId) {
      return NextResponse.json(
        { error: 'sessionId, message, and userId are required' },
        { status: 400 }
      )
    }

    // Validate session exists and belongs to user
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch conversation history for context
    const conversationHistory = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)

    // Convert to orchestrator format
    const historyForOrchestrator = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Save user message to database
    await db.insert(chatMessages).values({
      sessionId,
      userId,
      role: 'user',
      content: message,
      model: null,
      metadata: {},
    })

    // Call Forefront Intelligence orchestrator (V2 or V1)
    let orchestratorResponse: any

    if (useV2) {
      // V2 orchestrator temporarily disabled due to type errors - using V1 instead
      // const orchestratorV2 = new ForefrontOrchestratorV2()
      // orchestratorResponse = await orchestratorV2.executeV2({ ... })
      const orchestrator = new ForefrontOrchestrator()
      orchestratorResponse = await orchestrator.execute({
        message,
        model: model || undefined,
        context: {
          conversationHistory: historyForOrchestrator,
          userId,
        },
        userId,
      })
    } else {
      // Use V1 orchestrator (current production)
      const orchestrator = new ForefrontOrchestrator()

      orchestratorResponse = await orchestrator.execute({
        message,
        model: model || undefined,
        context: {
          conversationHistory: historyForOrchestrator,
          userId,
        },
        userId,
      })
    }

    // Handle V2 response
    if (useV2 && 'workflow' in orchestratorResponse) {
      console.log(`[Forefront Chat V2] Workflow response with ${orchestratorResponse.workflow.steps.length} steps`)

      // Build educational display of workflow execution
      const workflowDisplay = `**🧠 FOREFRONT INTELLIGENCE V2 - META-ORCHESTRATION**\n\n` +
        `**Intent Classification:**\n` +
        `- Domain: ${orchestratorResponse.intent.domain}\n` +
        `- Task Type: ${orchestratorResponse.intent.taskType}\n` +
        `- Complexity: ${orchestratorResponse.intent.complexity}\n` +
        `- Delivery Format: ${orchestratorResponse.intent.deliveryFormat}\n\n` +
        `**Workflow Execution:**\n\n` +
        orchestratorResponse.workflowExecution.steps.map((step: any, index: number) => {
          const icon = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏭️'
          return `${icon} **Step ${index + 1}: ${step.stepType.toUpperCase()}**\n` +
            `Model: ${step.metadata.model || 'N/A'}\n` +
            `Duration: ${step.metadata.duration}ms\n` +
            `Quality Score: ${step.metadata.qualityScore ? (step.metadata.qualityScore * 100).toFixed(0) + '%' : 'N/A'}\n`
        }).join('\n') +
        `\n**Final Quality Score:** ${(orchestratorResponse.qualityScore * 100).toFixed(0)}%\n` +
        `${orchestratorResponse.reResearchPerformed ? `**Re-Research Iterations:** ${orchestratorResponse.reResearchIterations}\n` : ''}` +
        `**Total Execution Time:** ${orchestratorResponse.executionTime}ms\n\n` +
        `---\n\n` +
        `**Final Output:**\n\n${orchestratorResponse.response}`

      // Save V2 response
      await db.insert(chatMessages).values({
        sessionId,
        userId,
        role: 'assistant',
        content: workflowDisplay,
        model: 'forefront-intelligence-v2',
        metadata: {
          isV2: true,
          intent: orchestratorResponse.intent,
          semantics: orchestratorResponse.semantics,
          workflow: {
            id: orchestratorResponse.workflow.workflowId,
            type: orchestratorResponse.workflow.workflowType,
            steps: orchestratorResponse.workflow.steps.length
          },
          execution: {
            status: orchestratorResponse.workflowExecution.status,
            qualityScore: orchestratorResponse.qualityScore,
            totalDuration: orchestratorResponse.executionTime,
            reResearchPerformed: orchestratorResponse.reResearchPerformed,
            reResearchIterations: orchestratorResponse.reResearchIterations
          }
        },
      })

      // Update session
      await db
        .update(chatSessions)
        .set({
          lastMessageAt: new Date(),
          messageCount: (session.messageCount || 0) + 2,
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.id, sessionId))

      return NextResponse.json({
        response: workflowDisplay,
        model: 'forefront-intelligence-v2',
        type: orchestratorResponse.intent.deliveryFormat || 'text',
        metadata: {
          isV2: true,
          intent: orchestratorResponse.intent,
          workflow: orchestratorResponse.workflow,
          execution: orchestratorResponse.workflowExecution,
          qualityScore: orchestratorResponse.qualityScore,
        },
      })
    }

    // Handle chained response (V1)
    else if ('isChained' in orchestratorResponse && orchestratorResponse.isChained) {
      console.log(`[Forefront Chat] Chained response with ${orchestratorResponse.steps.length} steps`)

      // Find image generation step if present
      const imageStep = orchestratorResponse.steps.find((step: any) => step.type === 'image')

      // Build educational step-by-step display
      const combinedContent = orchestratorResponse.steps
        .map((step: any, index: number) => {
          let stepTitle = ''
          let stepExplanation = ''

          // Customize display based on step purpose
          if (step.purpose === 'web-search') {
            stepTitle = `**🔍 STEP ${index + 1}: RESEARCH (${step.model})**`
            stepExplanation = `\n*Gathering real-world information about the subject to ensure accuracy and detail...*\n`
          } else if (step.purpose === 'prompt-enhancement') {
            stepTitle = `**✨ STEP ${index + 1}: PROMPT OPTIMIZATION (${step.model})**`
            stepExplanation = `\n*Transforming research insights into a detailed image generation prompt optimized for Seed Dream 4...*\n`
          } else if (step.purpose === 'image-generation') {
            stepTitle = `**🎨 STEP ${index + 1}: IMAGE GENERATION (${step.model})**`
            stepExplanation = `\n*Using the optimized prompt to generate the final image...*\n`
          } else {
            stepTitle = `**STEP ${index + 1}: ${step.purpose.toUpperCase()} (${step.model})**`
          }

          return `${stepTitle}${stepExplanation}\n${step.content}`
        })
        .join('\n\n---\n\n')

      // Save assistant response
      await db.insert(chatMessages).values({
        sessionId,
        userId,
        role: 'assistant',
        content: combinedContent,
        model: 'forefront-intelligence',
        metadata: {
          isChained: true,
          steps: orchestratorResponse.steps.map((s: any) => ({
            step: s.step,
            purpose: s.purpose,
            model: s.model,
            type: s.type,
            metadata: {
              ...s.metadata,
              executionTime: s.executionTime, // Ensure executionTime is at metadata level for UI
            },
          })),
          intent: orchestratorResponse.intent,
          totalExecutionTime: orchestratorResponse.totalExecutionTime,
          modelsUsed: orchestratorResponse.steps.map((s: any) => s.model).join(' + '),
        },
      })

      // Update session metadata
      await db
        .update(chatSessions)
        .set({
          lastMessageAt: new Date(),
          messageCount: (session.messageCount || 0) + 2, // user + assistant
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.id, sessionId))

      // Save image generations to portfolio
      if (imageStep) {
        try {
          // Find the prompt enhancement step to get the actual prompt used
          const promptStep = orchestratorResponse.steps.find((s: any) => s.purpose === 'prompt-enhancement')
          const actualPrompt = promptStep ? promptStep.content : message

          const { generationHistory } = await import('@/lib/db/schema')
          await db.insert(generationHistory).values({
            userId,
            moduleId: null,
            slideId: null,
            type: 'image',
            model: imageStep.model,
            prompt: actualPrompt, // Use the enhanced prompt, not the user's original message
            response: imageStep.content,
            metadata: {
              executionTime: orchestratorResponse.totalExecutionTime,
              source: 'chat',
              sessionId,
              isChained: true,
              chainSteps: orchestratorResponse.steps.map((s: any) => ({
                step: s.step,
                purpose: s.purpose,
                model: s.model
              })),
              originalUserMessage: message, // Keep the original for reference
            },
          })
          console.log('[Chat] Chained image generation saved to portfolio')
        } catch (error) {
          console.error('[Chat] Failed to save chained image to portfolio:', error)
        }
      }

      // Build model list for display
      const modelsUsed = orchestratorResponse.steps.map((s: any) => s.model).join(' + ')

      return NextResponse.json({
        response: combinedContent,
        model: modelsUsed, // Show all models used in the chain
        type: 'text',
        metadata: {
          isChained: true,
          steps: orchestratorResponse.steps,
          intent: orchestratorResponse.intent,
          totalExecutionTime: orchestratorResponse.totalExecutionTime,
          modelsUsed: modelsUsed,
        },
      })
    } else {
      // Handle single response
      const singleResponse = orchestratorResponse as any

      // Save assistant response
      await db.insert(chatMessages).values({
        sessionId,
        userId,
        role: 'assistant',
        content: singleResponse.content,
        model: 'forefront-intelligence',
        metadata: {
          intent: singleResponse.intent,
          type: singleResponse.metadata.type,
          modelUsed: singleResponse.metadata.modelUsed,
          executionTime: singleResponse.metadata.executionTime,
          citations: singleResponse.metadata.citations || [],
          aspectRatio: singleResponse.metadata.aspectRatio,
        },
      })

      // Update session metadata
      await db
        .update(chatSessions)
        .set({
          lastMessageAt: new Date(),
          messageCount: (session.messageCount || 0) + 2, // user + assistant
          updatedAt: new Date(),
        })
        .where(eq(chatSessions.id, sessionId))

      // Save image generations to portfolio
      if (singleResponse.metadata.type === 'image') {
        try {
          const { generationHistory } = await import('@/lib/db/schema')
          await db.insert(generationHistory).values({
            userId,
            moduleId: null,
            slideId: null,
            type: 'image',
            model: singleResponse.metadata.modelUsed || singleResponse.model,
            prompt: message,
            response: singleResponse.content,
            metadata: {
              aspectRatio: singleResponse.metadata.aspectRatio,
              executionTime: singleResponse.metadata.executionTime,
              source: 'chat',
              sessionId,
            },
          })
          console.log('[Chat] Image generation saved to portfolio')
        } catch (error) {
          console.error('[Chat] Failed to save image to portfolio:', error)
        }
      }

      return NextResponse.json({
        response: singleResponse.content,
        model: 'forefront-intelligence',
        type: singleResponse.metadata.type || 'text',
        metadata: singleResponse.metadata,
      })
    }
  } catch (error: any) {
    console.error('Error in Forefront chat:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    )
  }
}
