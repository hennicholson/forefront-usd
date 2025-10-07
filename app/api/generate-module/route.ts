import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { title, description, content, skillLevel, estimatedDuration } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Transform this student course submission into a structured learning module for our AI education platform.

STUDENT SUBMISSION:
Title: ${title}
Description: ${description}
Skill Level: ${skillLevel}
Duration: ${estimatedDuration}

Content:
${content}

---

INSTRUCTIONS:
Transform the above content into a structured module following this exact JSON format. Create 3-5 slides that break down the content into digestible sections.

Required JSON structure:
{
  "title": "Course Title",
  "slug": "course-title-slug",
  "description": "Brief description",
  "instructor": {
    "name": "Instructor Name",
    "title": "Student at USD",
    "bio": "Brief bio"
  },
  "duration": "30 minutes",
  "skillLevel": "beginner",
  "introVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "learningObjectives": [
    "Objective 1",
    "Objective 2",
    "Objective 3"
  ],
  "slides": [
    {
      "id": 1,
      "title": "Slide Title",
      "content": {
        "heading": "Main Heading",
        "body": "Main content paragraph",
        "bulletPoints": ["Point 1", "Point 2"],
        "code": {
          "language": "python",
          "snippet": "code here"
        },
        "note": "Additional note or tip"
      }
    }
  ],
  "keyTakeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ]
}

Guidelines:
- Extract the most important concepts into 3-5 clear slides
- Make each slide focused on one key idea
- Include practical examples and code snippets where relevant
- Write in a casual, student-friendly tone
- Keep bullets concise and actionable
- Generate a realistic YouTube video ID for introVideo (or use a placeholder)
- Create a URL-friendly slug from the title
- For the instructor, extract the submitter's name from context or use "ForeFront Student"

Please return ONLY the valid JSON, no additional explanation.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Parse JSON
    const moduleData = JSON.parse(text)

    return NextResponse.json(moduleData)
  } catch (error: any) {
    console.error('Error generating module:', error)
    return NextResponse.json(
      { error: 'Failed to generate module', details: error.message },
      { status: 500 }
    )
  }
}
