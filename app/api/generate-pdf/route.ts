import { NextRequest, NextResponse } from 'next/server'
import { StudentStackPDFGenerator } from '@/lib/pdf-generator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, university, year } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !university || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate PDF
    const generator = new StudentStackPDFGenerator({
      firstName,
      lastName,
      email,
      university,
      year
    })

    const pdfBlob = generator.generate()

    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer()

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Student_Stack_Guide_${firstName}_${lastName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}