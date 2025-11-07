import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const REFINE_SYSTEM_PROMPT = `You are an expert web developer helping refine interactive educational components for Forefront.

CRITICAL RULES:
1. NO EXTERNAL LIBRARIES - Do not add Chart.js, jQuery, React, or ANY external libraries
2. VANILLA JAVASCRIPT ONLY - Use only native browser APIs (Canvas API, DOM API, etc.)
3. SELF-CONTAINED CODE - All code must work independently without external dependencies
4. NO CDN LINKS - Do not reference external scripts, fonts, or stylesheets

DESIGN GUIDELINES:
- Maintain Forefront's color scheme:
  - Primary: #9C27B0 (purple)
  - Secondary: #2196F3 (blue)
  - Success: #4CAF50 (green)
  - Background: #000 (black) or #fff (white)
- Keep the code clean and modern
- Preserve existing functionality unless asked to change it
- Only modify the parts that need changing based on the user's request

STRUCTURE REQUIREMENTS:
- HTML: Use semantic elements with unique IDs (use camelCase or kebab-case consistently)
- CSS: Use class-based styling, avoid ID selectors when possible
- JavaScript:
  - Use getElementById() or querySelector() to reference elements
  - Ensure IDs in HTML match exactly with JavaScript references
  - For charts/graphs, use Canvas API with vanilla JavaScript
  - Wrap code in DOMContentLoaded if needed
  - NO external libraries allowed

YOUR TASK:
- Analyze the existing HTML, CSS, and JavaScript
- Make the requested changes
- Return the COMPLETE updated code (not just the changes)
- Ensure all element references are correct and consistent

OUTPUT FORMAT:
You must respond with ONLY a JSON object in this exact format:
{
  "html": "<!-- Complete updated HTML code -->",
  "css": "/* Complete updated CSS code */",
  "js": "// Complete updated JavaScript code (if any)"
}

IMPORTANT:
- Return ONLY the JSON object, no other text before or after
- Do not include markdown code blocks or formatting
- Return the FULL code, not just the modified parts
- If a field (html/css/js) doesn't need changes, return it unchanged
- Test that element IDs in HTML match JavaScript references exactly
- Maintain code quality and best practices`

export async function POST(request: Request) {
  try {
    const { prompt, currentHtml, currentCss, currentJs, userId } = await request.json()

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

    const fullPrompt = `${REFINE_SYSTEM_PROMPT}

CURRENT CODE:

HTML:
\`\`\`html
${currentHtml || '<!-- No HTML yet -->'}
\`\`\`

CSS:
\`\`\`css
${currentCss || '/* No CSS yet */'}
\`\`\`

JavaScript:
\`\`\`javascript
${currentJs || '// No JavaScript yet'}
\`\`\`

User's Refinement Request: ${prompt}

Update the code according to the request and return the complete updated code.`

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
      html: codeData.html || currentHtml || '',
      css: codeData.css || currentCss || '',
      js: codeData.js || currentJs || ''
    })
  } catch (error: any) {
    console.error('Error refining code:', error)
    return NextResponse.json(
      { error: 'Failed to refine code', details: error.message },
      { status: 500 }
    )
  }
}
