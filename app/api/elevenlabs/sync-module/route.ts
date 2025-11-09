import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { chunkModule, generateAgentPrompt } from '@/lib/elevenlabs/knowledge-base'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json(
        { error: 'Module slug is required' },
        { status: 400 }
      )
    }

    // Fetch module data from the modules API
    const moduleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/modules/${slug}`)

    if (!moduleResponse.ok) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    const module = await moduleResponse.json()

    // Generate chunks for the knowledge base
    const chunks = chunkModule(module)

    // Generate agent prompt
    const agentPrompt = generateAgentPrompt(module)

    // Create or get agent
    const agentName = `Module: ${module.title}`

    let agent: any
    try {
      // List all agents to find existing one
      const response = await elevenlabs.conversationalAi.agents.getAll()
      agent = response.agents?.find((a: any) => a.name === agentName)
    } catch (error) {
      console.log('No existing agents found')
    }

    if (!agent) {
      // Create new agent with conversation config
      const createResponse = await elevenlabs.conversationalAi.agents.create({
        conversationConfig: {
          agent: {
            prompt: {
              prompt: agentPrompt,
            },
            firstMessage: `Hi! I'm your AI mentor for the ${module.title} module. I'm here to help you understand the content and answer any questions you might have. How can I assist you today?`,
            language: 'en',
          },
        },
        platform: {
          name: agentName,
        },
      })
      agent = createResponse
    }

    if (!agent || !agent.agentId) {
      throw new Error('Failed to create or retrieve agent')
    }

    // Add knowledge base documents to the agent
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      try {
        // Upload each chunk as a text document to the knowledge base
        await elevenlabs.conversationalAi.knowledgeBase.documents.createFromText({
          text: chunk.text,
          name: `${chunk.metadata.slideTitle}`,
          agentIds: [agent.agentId],
        })
      } catch (error: any) {
        console.error(`Error adding chunk ${i}:`, error.message)
        // Continue with other chunks even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.agentId,
        name: agentName,
      },
      documentsCount: chunks.length,
    })

  } catch (error: any) {
    console.error('Error syncing module to ElevenLabs:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync module',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
