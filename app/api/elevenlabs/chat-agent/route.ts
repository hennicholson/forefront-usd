import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!
})

/**
 * POST /api/elevenlabs/chat-agent
 * Create a conversational agent for general chat
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, conversationHistory } = await request.json()

    // Create agent prompt based on conversation history
    const agentPrompt = `You are an AI assistant in the Forefront LLM Playground chat interface. You are helpful, knowledgeable, and engaging.

Your role is to:
- Have natural, flowing conversations with users
- Answer questions across a wide range of topics
- Provide thoughtful and accurate responses
- Be concise but thorough in your explanations
- Maintain context from the conversation history

${conversationHistory && conversationHistory.length > 0 ? `
Recent conversation context:
${conversationHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

Remember to be friendly, helpful, and maintain a natural conversational tone.`

    // Create new agent with conversation config
    const agent = await elevenlabs.conversationalAi.agents.create({
      conversationConfig: {
        agent: {
          prompt: {
            prompt: agentPrompt,
          },
          firstMessage: "Hi! I'm your AI assistant. How can I help you today?",
          language: 'en',
        },
      },
      name: `Chat Session ${sessionId || 'General'}`,
    })

    if (!agent || !agent.agentId) {
      throw new Error('Failed to create agent')
    }

    // Get signed URL for WebSocket connection
    const response = await elevenlabs.conversationalAi.conversations.getSignedUrl({
      agentId: agent.agentId,
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.agentId,
      },
      signedUrl: response.signedUrl,
    })

  } catch (error: any) {
    console.error('Error creating chat agent:', error)
    return NextResponse.json(
      {
        error: 'Failed to create chat agent',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
