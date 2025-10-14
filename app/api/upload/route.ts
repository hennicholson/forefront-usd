import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, type } = body

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate image format (should be base64)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    // Extract mime type and validate
    const mimeMatch = image.match(/data:(image\/[a-z]+);/)
    if (!mimeMatch || !ALLOWED_TYPES.includes(mimeMatch[1])) {
      return NextResponse.json({
        error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed'
      }, { status: 400 })
    }

    // Check file size (approximate from base64 length)
    const base64Length = image.split(',')[1]?.length || 0
    const fileSizeBytes = (base64Length * 3) / 4

    if (fileSizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'Image too large. Maximum size is 2MB'
      }, { status: 400 })
    }

    // Return the validated image
    return NextResponse.json({
      image,
      type: type || 'profile',
      size: fileSizeBytes
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
