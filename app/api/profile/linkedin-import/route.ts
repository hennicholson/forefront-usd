import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { pdfData, geminiApiKey } = await request.json()

    if (!pdfData) {
      return NextResponse.json(
        { error: 'No PDF data provided' },
        { status: 400 }
      )
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'No Gemini API key provided' },
        { status: 400 }
      )
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Create the prompt for profile extraction
    const prompt = `You are analyzing a LinkedIn profile PDF export. Extract all relevant professional information and return it in the following JSON format:

{
  "name": "Full name",
  "headline": "Professional headline/title",
  "location": "City, Country",
  "bio": "About/summary section",
  "summary": "Professional summary",
  "experience": [
    {
      "id": "unique-id",
      "company": "Company name",
      "title": "Job title",
      "employmentType": "Full-time/Part-time/Contract/etc",
      "location": "Location",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null if current",
      "current": true/false,
      "description": "Job description",
      "responsibilities": ["responsibility 1", "responsibility 2"]
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "school": "School name",
      "degree": "Degree type",
      "fieldOfStudy": "Field",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null if current",
      "current": true/false,
      "grade": "GPA/Grade",
      "activities": "Activities and societies"
    }
  ],
  "skills": [
    {
      "name": "Skill name",
      "endorsements": 0
    }
  ],
  "certifications": [
    {
      "id": "unique-id",
      "name": "Certification name",
      "issuingOrganization": "Organization",
      "issueDate": "YYYY-MM",
      "expirationDate": "YYYY-MM or null",
      "credentialId": "ID if available",
      "credentialUrl": "URL if available"
    }
  ],
  "projects": [
    {
      "id": "unique-id",
      "name": "Project name",
      "description": "Description",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null",
      "current": true/false,
      "url": "URL if available",
      "skills": ["skill1", "skill2"]
    }
  ],
  "awards": [
    {
      "id": "unique-id",
      "title": "Award title",
      "issuer": "Issuing organization",
      "issueDate": "YYYY-MM",
      "description": "Description if available"
    }
  ],
  "interests": ["interest1", "interest2"],
  "socialLinks": {
    "linkedin": "URL",
    "twitter": "URL",
    "github": "URL",
    "portfolio": "URL"
  }
}

Extract as much information as possible from the PDF. For dates, use YYYY-MM format. For current positions/education, set endDate to null and current to true. Generate unique IDs for each item using a simple counter or UUID format.

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`

    // Call Gemini API with PDF
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: pdfData,
          mimeType: 'application/pdf'
        }
      }
    ])
    const response = await result.response
    let responseText = response.text()

    // Clean up response (remove markdown code blocks if present)
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Parse the JSON response
    const profileData = JSON.parse(responseText)

    return NextResponse.json(profileData)

  } catch (error: any) {
    console.error('LinkedIn import error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process LinkedIn profile' },
      { status: 500 }
    )
  }
}

