import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moduleTitle, slideTitle, slideDescription } = body

    if (!moduleTitle || !slideTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `Generate a quiz with 4 multiple-choice questions for the following educational content:

Module: ${moduleTitle}
Slide: ${slideTitle}
${slideDescription ? `Description: ${slideDescription}` : ''}

For each question, provide:
1. A clear, specific question
2. 4 answer options (A, B, C, D)
3. The index of the correct answer (0-3)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        return NextResponse.json(data)
      }
    } catch (e) {
      console.error('Failed to parse quiz JSON:', e)
    }

    // Fallback quiz
    return NextResponse.json({
      questions: [
        {
          question: `What is the main topic of ${slideTitle}?`,
          options: [
            slideTitle,
            'Something else',
            'Another option',
            'Final option'
          ],
          correctAnswer: 0
        }
      ]
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
