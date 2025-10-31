import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/lib/db'
import { playgroundPrompts, playgroundSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function analyzePromptQuality(promptText: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const analysisPrompt = `Analyze the following AI prompt and provide:
1. A quality score from 0-100 based on:
   - Specificity (25 points)
   - Clarity (25 points)
   - Context provided (25 points)
   - Actionability (25 points)

2. Constructive feedback on how to improve the prompt

Prompt to analyze:
"${promptText}"

Response format (JSON):
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>"
}`

  const result = await model.generateContent(analysisPrompt)
  const response = result.response.text()

  // Extract JSON from response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    // Fallback parsing
  }

  return {
    score: 50,
    feedback: response
  }
}

async function generateWithModel(model: string, promptText: string) {
  // For now, only Gemini is implemented
  // In a full implementation, you'd integrate Claude, ChatGPT, DeepSeek APIs
  const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
  const result = await geminiModel.generateContent(promptText)
  return result.response.text()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, promptText, selectedModel } = body

    if (!promptText || !selectedModel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Analyze prompt quality
    const analysis = await analyzePromptQuality(promptText)

    // Generate result with selected model
    const result = await generateWithModel(selectedModel, promptText)

    // Save to database if session exists
    if (sessionId) {
      const userId = 'demo-user' // TODO: Get from auth

      await db.insert(playgroundPrompts).values({
        sessionId,
        userId,
        promptText,
        selectedModel,
        result,
        promptScore: analysis.score,
        aiFeedback: analysis.feedback
      })

      // Update session prompt count
      const [session] = await db
        .select()
        .from(playgroundSessions)
        .where(eq(playgroundSessions.id, sessionId))
        .limit(1)

      if (session) {
        await db
          .update(playgroundSessions)
          .set({
            totalPromptsCreated: (session.totalPromptsCreated ?? 0) + 1
          })
          .where(eq(playgroundSessions.id, sessionId))
      }
    }

    return NextResponse.json({
      result,
      promptScore: analysis.score,
      feedback: analysis.feedback
    })
  } catch (error) {
    console.error('Error processing prompt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
