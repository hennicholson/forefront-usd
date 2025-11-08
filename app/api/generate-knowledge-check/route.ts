import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { userId, previousSlides } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!previousSlides || previousSlides.length === 0) {
      return NextResponse.json({ error: 'No previous slides to analyze' }, { status: 400 })
    }

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Build comprehensive context from previous slides
    const slidesContext = previousSlides.map((slide: any, index: number) => {
      let slideContent = `Slide ${index + 1}: ${slide.title}\n`

      if (slide.description) {
        slideContent += `Description: ${slide.description}\n`
      }

      if (slide.blocks && slide.blocks.length > 0) {
        slideContent += `Content:\n`
        slide.blocks.forEach((block: any) => {
          if (block.type === 'text' && block.data?.content) {
            slideContent += `- ${block.data.content.substring(0, 300)}...\n`
          } else if (block.type === 'heading' && block.data?.text) {
            slideContent += `- Heading: ${block.data.text}\n`
          } else if (block.type === 'code' && block.data?.code) {
            slideContent += `- Code example: ${block.data.language || 'code'}\n`
          } else if (block.type === 'list' && block.data?.items) {
            slideContent += `- List: ${block.data.items.join(', ')}\n`
          }
        })
      }

      return slideContent
    }).join('\n\n')

    // Create prompt for knowledge check generation
    const prompt = `You are an expert educational content creator. Analyze the following slide content from a learning module and generate a single, high-quality knowledge check question.

SLIDE CONTENT:
${slidesContext}

TASK:
Generate a multiple-choice knowledge check question that:
1. Tests understanding of a KEY CONCEPT from the previous slides
2. Has exactly 4 answer options (A, B, C, D)
3. Has ONE clearly correct answer
4. Has 3 plausible but incorrect distractors
5. Includes a brief explanation (2-3 sentences) of why the correct answer is right

IMPORTANT GUIDELINES:
- Focus on conceptual understanding, not memorization
- Make the question clear and unambiguous
- Ensure all options are similar in length and structure
- The explanation should reinforce learning, not just state the answer
- Question should be at an appropriate difficulty level (not too easy, not too hard)

Respond with ONLY a valid JSON object in this exact format (no markdown, no additional text):
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Your explanation here."
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    })

    const responseText = response.text || ''

    // Parse the JSON response
    let knowledgeCheck
    try {
      // Try to extract JSON from the response (in case there's markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        knowledgeCheck = JSON.parse(jsonMatch[0])
      } else {
        knowledgeCheck = JSON.parse(responseText)
      }

      // Validate the structure
      if (!knowledgeCheck.question || !knowledgeCheck.options ||
          knowledgeCheck.correctIndex === undefined || !knowledgeCheck.explanation) {
        throw new Error('Invalid knowledge check structure')
      }

      if (knowledgeCheck.options.length !== 4) {
        throw new Error('Must have exactly 4 options')
      }

      if (knowledgeCheck.correctIndex < 0 || knowledgeCheck.correctIndex > 3) {
        throw new Error('correctIndex must be between 0 and 3')
      }

    } catch (parseError: any) {
      console.error('Error parsing AI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: parseError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      knowledgeCheck,
      success: true
    })

  } catch (error: any) {
    console.error('Error generating knowledge check:', error)
    return NextResponse.json(
      { error: 'Failed to generate knowledge check', details: error.message },
      { status: 500 }
    )
  }
}
