// Ably Token Authentication for secure real-time connections
// This endpoint generates short-lived tokens for Ably connections

import { NextRequest, NextResponse } from 'next/server'
import * as Ably from 'ably'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Initialize Ably with your API key
    const apiKey = process.env.ABLY_API_KEY
    if (!apiKey) {
      throw new Error('ABLY_API_KEY is not configured')
    }

    const client = new Ably.Rest(apiKey)

    // Generate a token request with the client ID
    const tokenRequest = await client.auth.createTokenRequest({
      clientId,
      // Add all required capabilities for Ably Chat SDK including message reactions
      capability: {
        '*': ['*'] as any // Use wildcard for all capabilities including annotations
      }
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error('Ably auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Ably token' },
      { status: 500 }
    )
  }
}
