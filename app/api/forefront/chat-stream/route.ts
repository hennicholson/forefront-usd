import { NextRequest } from 'next/server'
import { ForefrontOrchestrator } from '@/lib/forefront/orchestrator'
import { db } from '@/lib/db'
import { chatMessages, chatSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/forefront/chat-stream
 * Server-Sent Events endpoint for real-time chain progress updates
 */
export async function POST(request: NextRequest) {
  const { sessionId, message, userId, model } = await request.json()

  if (!sessionId || !message || !userId) {
    return new Response(
      JSON.stringify({ error: 'sessionId, message, and userId are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Validate session
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1)

  if (!session || session.userId !== userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Fetch conversation history
  const conversationHistory = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)

  const historyForOrchestrator = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  // Save user message
  await db.insert(chatMessages).values({
    sessionId,
    userId,
    role: 'user',
    content: message,
    model: null,
    metadata: {},
  })

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Execute orchestrator with progress callbacks
        const orchestrator = new ForefrontOrchestrator()

        const orchestratorResponse = await orchestrator.execute({
          message,
          model: model || undefined,
          context: {
            conversationHistory: historyForOrchestrator,
            userId,
          },
          userId,
        }, {
          // Progress callback for chain steps
          onStepStart: (step: any) => {
            const event = `data: ${JSON.stringify({
              type: 'step-start',
              step: step.step,
              purpose: step.purpose,
              model: step.modelId,
              totalSteps: step.totalSteps
            })}\n\n`
            controller.enqueue(encoder.encode(event))
          },
          onStepComplete: (step: any) => {
            const event = `data: ${JSON.stringify({
              type: 'step-complete',
              step: step.step,
              purpose: step.purpose,
              model: step.model,
              content: step.content,
              executionTime: step.executionTime,
              metadata: step.metadata
            })}\n\n`
            controller.enqueue(encoder.encode(event))
          },
          onCoordinatorUpdate: (update: any) => {
            const event = `data: ${JSON.stringify({
              type: 'coordinator-update',
              notes: update.notes
            })}\n\n`
            controller.enqueue(encoder.encode(event))
          }
        })

        // Handle chained response
        if ('isChained' in orchestratorResponse && orchestratorResponse.isChained) {
          const imageStep = orchestratorResponse.steps.find((step: any) => step.type === 'image')

          // Build combined content for database
          const combinedContent = orchestratorResponse.steps
            .map((step: any, index: number) => {
              let stepTitle = ''
              if (step.purpose === 'web-search') {
                stepTitle = `**🔍 STEP ${index + 1}: RESEARCH (${step.model})**`
              } else if (step.purpose === 'prompt-enhancement') {
                stepTitle = `**✨ STEP ${index + 1}: PROMPT OPTIMIZATION (${step.model})**`
              } else if (step.purpose === 'image-generation') {
                stepTitle = `**🎨 STEP ${index + 1}: IMAGE GENERATION (${step.model})**`
              } else {
                stepTitle = `**STEP ${index + 1}: ${step.purpose.toUpperCase()} (${step.model})**`
              }
              return `${stepTitle}\n\n${step.content}`
            })
            .join('\n\n---\n\n')

          // Save to database
          await db.insert(chatMessages).values({
            sessionId,
            userId,
            role: 'assistant',
            content: combinedContent,
            model: 'forefront-intelligence',
            metadata: {
              isChained: true,
              steps: orchestratorResponse.steps,
              intent: orchestratorResponse.intent,
              totalExecutionTime: orchestratorResponse.totalExecutionTime,
            },
          })

          // Send completion event
          const event = `data: ${JSON.stringify({
            type: 'chain-complete',
            steps: orchestratorResponse.steps,
            totalExecutionTime: orchestratorResponse.totalExecutionTime,
            hasImage: !!imageStep
          })}\n\n`
          controller.enqueue(encoder.encode(event))
        } else {
          // Non-chained response
          const singleResponse = orchestratorResponse as any
          await db.insert(chatMessages).values({
            sessionId,
            userId,
            role: 'assistant',
            content: singleResponse.content,
            model: singleResponse.model,
            metadata: singleResponse.metadata || {},
          })

          const event = `data: ${JSON.stringify({
            type: 'complete',
            content: singleResponse.content,
            model: singleResponse.model
          })}\n\n`
          controller.enqueue(encoder.encode(event))
        }

        // Update session
        await db
          .update(chatSessions)
          .set({
            lastMessageAt: new Date(),
            messageCount: (session.messageCount || 0) + 2,
            updatedAt: new Date(),
          })
          .where(eq(chatSessions.id, sessionId))

        controller.close()
      } catch (error) {
        console.error('[Chat Stream] Error:', error)
        const event = `data: ${JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`
        controller.enqueue(encoder.encode(event))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
