import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { profileData, geminiApiKey } = await request.json()

    if (!profileData) {
      return NextResponse.json(
        { error: 'No profile data provided' },
        { status: 400 }
      )
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'No Gemini API key provided' },
        { status: 400 }
      )
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Create the prompt for profile summarization
    const prompt = `You are a professional career advisor analyzing a person's profile. Create a concise, engaging summary of this professional in 3-4 sentences that highlights their key strengths, experience, and unique value proposition.

Profile Data:
${JSON.stringify(profileData, null, 2)}

The summary should be:
- Professional but friendly in tone
- Highlight their most impressive achievements
- Mention their areas of expertise
- Be concise (3-4 sentences max)

Return ONLY the summary text, no additional formatting or preamble.`

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text().trim()

    return NextResponse.json({ summary })

  } catch (error: any) {
    console.error('Profile summarization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to summarize profile' },
      { status: 500 }
    )
  }
}
