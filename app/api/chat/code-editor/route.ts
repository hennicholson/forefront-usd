import { NextRequest } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!
})

export async function POST(request: NextRequest) {
  try {
    const { message, currentCode, conversationHistory, isMobile } = await request.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      )
    }

    const hasExistingCode = currentCode.html || currentCode.css || currentCode.javascript

    // Build system instruction with current code context
    const systemInstruction = `You are an expert web development assistant specialized in building modern, production-ready HTML/CSS/JavaScript applications.

${isMobile ? `
MOBILE-FIRST DEVELOPMENT - CRITICAL:
The user is building on a MOBILE DEVICE. You MUST:
- Use mobile-first responsive design (min-width media queries)
- Set viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Use touch-friendly tap targets (min 44px height/width for buttons)
- Use flexbox and CSS Grid for responsive layouts
- Avoid fixed widths - use percentages, vw, and clamp()
- Use responsive font sizes: clamp(14px, 4vw, 18px)
- Test layout at 375px width as the base
- Add touch-action CSS where needed
- Use rem/em units over px where appropriate
- Consider thumb-reachable zones for primary actions
` : ''}

${hasExistingCode ? `
CURRENT PROJECT CODE:
HTML:
\`\`\`html
${currentCode.html || '<!-- No HTML yet -->'}
\`\`\`

CSS:
\`\`\`css
${currentCode.css || '/* No CSS yet */'}
\`\`\`

JavaScript:
\`\`\`javascript
${currentCode.javascript || '// No JavaScript yet'}
\`\`\`

USER REQUEST: "${message}"

INLINE EDITING MODE - IMPORTANT:
- This is an EXISTING PROJECT with code already written
- Make MINIMAL, SURGICAL changes - only modify what's necessary
- When making small updates (like changing colors, adding a button, fixing a bug):
  * Explain what specific elements/lines you're updating
  * Output ONLY the files that need changes
  * Keep all existing functionality intact
- For major refactors or new features, output all relevant files
- Maintain consistency with existing code style and patterns
` : `
USER REQUEST: "${message}"

NEW PROJECT MODE:
- This is a brand new project with no existing code
- Create a complete, production-ready application from scratch
- Include all necessary HTML structure, CSS styling, and JavaScript functionality
- Follow modern best practices and clean code principles
`}

INSTRUCTIONS:
1. Analyze the user's request ${hasExistingCode ? 'and existing code' : ''}
2. Briefly explain what you'll create or change (1-2 sentences max)
3. Output COMPLETE, WORKING code for files that need ${hasExistingCode ? 'updating or creation' : 'to be created'}
4. Use markdown code fences: \`\`\`html, \`\`\`css, \`\`\`javascript
5. Ensure code is production-ready with proper error handling
6. Use semantic HTML, modern CSS (flexbox/grid), and vanilla JavaScript
7. If only one file needs ${hasExistingCode ? 'updating' : 'to be created'}, only output that file
8. Always output COMPLETE files, never snippets or partial code

RESPONSE FORMAT:
${hasExistingCode ? "I'll update the [specific part]..." : "I'll create a [description]..."}

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Title</title>
</head>
<body>
  <!-- complete HTML here -->
</body>
</html>
\`\`\`

\`\`\`css
/* complete CSS here */
\`\`\`

\`\`\`javascript
// complete JavaScript here
\`\`\`

CRITICAL: Return FULL, COMPLETE, WORKING files - never snippets or partial code.`

    // Stream from Gemini 3 Pro
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of replicate.stream("google/gemini-3-pro", {
            input: {
              prompt: message,
              system_instruction: systemInstruction,
              thinking_level: "high", // Use high for complex code reasoning
              temperature: 1.0, // Gemini 3 recommends default of 1.0
              max_output_tokens: 8192
            }
          })) {
            // Extract text content from event (Replicate returns string chunks)
            const content = typeof event === 'string' ? event : String(event)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('Replicate streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Code editor API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
}
