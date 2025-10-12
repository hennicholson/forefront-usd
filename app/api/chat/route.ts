import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const systemPrompt = `You are a helpful AI study assistant for a learning platform called "Four Phone USD".
Your role is to:
- Help users with questions about their courses and learning materials
- Suggest connections between learners with similar interests
- Provide study tips and learning strategies
- Encourage collaboration and knowledge sharing
- Keep responses concise, friendly, and encouraging

The platform has a network feature where learners can discover others studying similar topics.
Be supportive, knowledgeable, and conversational.`

    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
