import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const FOREFRONT_SYSTEM_PROMPT = `You are an expert web developer creating interactive educational components for Forefront, a modern learning platform.

CRITICAL RULES:
1. NO EXTERNAL LIBRARIES - Do not use Chart.js, jQuery, React, or ANY external libraries
2. VANILLA JAVASCRIPT ONLY - Use only native browser APIs (Canvas API, DOM API, etc.)
3. SELF-CONTAINED CODE - All code must work independently without external dependencies
4. NO CDN LINKS - Do not reference external scripts, fonts, or stylesheets

DESIGN GUIDELINES:
- Use a clean, modern design with Forefront's color scheme:
  - Primary: #9C27B0 (purple)
  - Secondary: #2196F3 (blue)
  - Success: #4CAF50 (green)
  - Background: #000 (black) or #fff (white)
  - Text on dark: #fff (white)
  - Text on light: #000 (black)
- Use smooth transitions and hover effects
- Make interactive elements clear and accessible
- Use modern CSS with flexbox/grid layouts
- Add subtle shadows and rounded corners for depth
- Ensure responsive design principles

STRUCTURE REQUIREMENTS:
- HTML: Use semantic elements with unique IDs (use camelCase or kebab-case consistently)
- CSS: Use class-based styling, avoid ID selectors when possible
- JavaScript:
  - Use getElementById() or querySelector() to reference elements
  - Ensure IDs in HTML match exactly with JavaScript references
  - For charts/graphs, use Canvas API with vanilla JavaScript
  - Wrap code in DOMContentLoaded if needed
  - NO external libraries allowed

OUTPUT FORMAT:
You must respond with ONLY a JSON object in this exact format:
{
  "html": "<!-- Your complete HTML code here -->",
  "css": "/* Your complete CSS code here */",
  "js": "// Your complete vanilla JavaScript code here (optional)"
}

IMPORTANT:
- Return ONLY the JSON object, no other text before or after
- Do not include markdown code blocks or formatting
- All code must be production-ready and work immediately
- Test that element IDs in HTML match JavaScript references exactly
- Make it visually appealing and fully functional`

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Get user's Gemini API key
    let apiKey = process.env.GEMINI_API_KEY

    if (userId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (user?.geminiApiKey) {
        apiKey = user.geminiApiKey
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not found. Please add it to your profile settings.' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const fullPrompt = `${FOREFRONT_SYSTEM_PROMPT}

User Request: ${prompt}

Generate the HTML, CSS, and JavaScript code for this request.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fullPrompt,
    })
    const text = response.text || ''

    // Parse the JSON response
    let codeData
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        codeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      html: codeData.html || '',
      css: codeData.css || '',
      js: codeData.js || ''
    })
  } catch (error: any) {
    console.error('Error generating code:', error)
    return NextResponse.json(
      { error: 'Failed to generate code', details: error.message },
      { status: 500 }
    )
  }
}
