import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      moduleTitle,
      moduleCategory,
      slideTitle,
      slideDescription,
      userMessage,
      conversationHistory
    } = body

    if (!userMessage) {
      return NextResponse.json({ error: 'Missing user message' }, { status: 400 })
    }

    // Build context-aware system prompt
    const systemContext = `You are a helpful AI tutor for a ${moduleCategory} module titled "${moduleTitle}".
The student is currently on the slide titled "${slideTitle}".
${slideDescription ? `Slide description: ${slideDescription}` : ''}

Provide helpful, encouraging, and educational responses. Focus on helping the student understand the concepts.`

    // Build conversation context
    let conversationContext = systemContext + '\n\n'
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext += 'Previous conversation:\n'
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}\n`
      })
    }
    conversationContext += `\nStudent: ${userMessage}\nAI:`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(conversationContext)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in playground chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
