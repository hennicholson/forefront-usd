import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notes, moduleTitle, slideTitle } = body

    if (!notes) {
      return NextResponse.json({ error: 'Missing notes' }, { status: 400 })
    }

    const prompt = `Review the following student notes for the educational content below and provide constructive feedback:

Module: ${moduleTitle}
Slide: ${slideTitle}

Student Notes:
${notes}

Provide feedback on:
1. Accuracy and completeness
2. Key concepts that are well-understood
3. Areas that might need more clarification
4. Suggestions for improving the notes

Be encouraging and helpful.`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const feedback = result.response.text()

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error reviewing notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
