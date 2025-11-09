import { NextRequest } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')

  if (!agentId) {
    return new Response('Agent ID is required', { status: 400 })
  }

  try {
    // Get a signed URL for WebSocket connection
    const response = await elevenlabs.conversationalAi.conversations.getSignedUrl({
      agentId,
    })

    // Return the signed URL for WebSocket connection
    return new Response(
      JSON.stringify({
        signedUrl: response.signedUrl,
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error: any) {
    console.error('Error creating voice session:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to create voice session',
        details: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
