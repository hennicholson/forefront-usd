import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatMessages, generationHistory } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/chat-messages/[messageId]/save
 * Save a chat message to AI portfolio
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { userId } = await request.json()
    const { messageId: messageIdStr } = await params
    const messageId = parseInt(messageIdStr)

    if (!userId || !messageId) {
      return NextResponse.json(
        { error: 'userId and messageId are required' },
        { status: 400 }
      )
    }

    // Get the message to save
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId))
      .limit(1)

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Only save assistant messages
    if (message.role !== 'assistant') {
      return NextResponse.json(
        { error: 'Can only save assistant messages' },
        { status: 400 }
      )
    }

    // Get user message for prompt context
    const allMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, message.sessionId))
      .orderBy(chatMessages.createdAt)

    const messageIndex = allMessages.findIndex(m => m.id === messageId)
    const userMessage = messageIndex > 0 ? allMessages[messageIndex - 1] : null
    let promptText = userMessage?.role === 'user' ? userMessage.content : 'Chat message'

    // Determine type (text or image)
    const metadata = message.metadata as any
    const isImage = metadata?.type === 'image' ||
                    (metadata?.isChained && metadata?.steps?.some((s: any) => s.type === 'image'))

    const type = isImage ? 'image' : 'text'

    // For images, extract the actual image URL and prompt from metadata
    let responseContent = message.content
    if (isImage && metadata) {
      // Check if prompt is directly in metadata (for single images)
      if (metadata.prompt) {
        promptText = metadata.prompt
      }
      // For chained responses, extract image URL and prompt
      else if (metadata.isChained && metadata.steps) {
        const imageStep = metadata.steps.find((step: any) => step.type === 'image')
        if (imageStep) {
          // Extract the actual image URL from the step content
          if (imageStep.content) {
            responseContent = imageStep.content
          }
          // Get the prompt used for generation
          if (imageStep.metadata?.prompt) {
            promptText = imageStep.metadata.prompt
          }
        }
      }
    }

    // Save to generation history
    await db.insert(generationHistory).values({
      userId,
      moduleId: null,
      slideId: null,
      type,
      model: metadata?.modelUsed || message.model || 'forefront-intelligence',
      prompt: promptText,
      response: responseContent,
      metadata: {
        ...metadata,
        source: 'chat',
        sessionId: message.sessionId,
        messageId: message.id,
      },
      saved: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Saved to AI portfolio!',
    })
  } catch (error: any) {
    console.error('Error saving message to portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to save to portfolio', details: error.message },
      { status: 500 }
    )
  }
}
