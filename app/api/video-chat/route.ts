import { NextRequest, NextResponse } from 'next/server'
import { ForefrontOrchestrator } from '@/lib/forefront/orchestrator'

/**
 * POST /api/video-chat
 * Video-aware chat endpoint that includes transcript context
 * Does NOT save to database - for ephemeral video interactions
 */
export async function POST(request: NextRequest) {
  try {
    const { message, userId, videoTranscript, model } = await request.json()

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'message and userId are required' },
        { status: 400 }
      )
    }

    // Use Forefront Intelligence orchestrator
    const orchestrator = new ForefrontOrchestrator()

    // Build conversation history with video context
    const conversationHistory = []

    // Add video transcript as system context if provided
    if (videoTranscript && videoTranscript.length > 0) {
      conversationHistory.push({
        role: 'system' as const,
        content: `You are analyzing a video. Here is the complete transcript with timestamps:

${videoTranscript}

Answer the user's questions based on this video content. Reference specific timestamps when relevant.`
      })
    }

    // Add user message
    conversationHistory.push({
      role: 'user' as const,
      content: message
    })

    const orchestratorResponse = await orchestrator.execute({
      message,
      model: model || undefined,
      context: {
        conversationHistory,
        userId,
      },
      userId,
    })

    // Handle different response types
    if ('isChained' in orchestratorResponse && orchestratorResponse.isChained) {
      const combinedContent = orchestratorResponse.steps
        .map((step: any) => step.content)
        .join('\n\n---\n\n')

      return NextResponse.json({
        response: combinedContent,
        model: orchestratorResponse.steps.map((s: any) => s.model).join(' + '),
        type: 'text',
        metadata: {
          isChained: true,
          steps: orchestratorResponse.steps,
        },
      })
    } else {
      const singleResponse = orchestratorResponse as any

      return NextResponse.json({
        response: singleResponse.content,
        model: 'forefront-intelligence',
        type: singleResponse.metadata.type || 'text',
        metadata: singleResponse.metadata,
      })
    }
  } catch (error: any) {
    console.error('Error in video chat:', error)
    return NextResponse.json(
      { error: 'Failed to process video chat message', details: error.message },
      { status: 500 }
    )
  }
}
