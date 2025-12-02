import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = '4:3', userId, moduleId, slideId } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Run Seed Dream 4 model
    const output = await replicate.run(
      "bytedance/seedream-4",
      {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio
        }
      }
    ) as any

    // Output is an array of URLs (strings)
    const replicateUrl = output && output[0] ? String(output[0]) : null

    if (!replicateUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    // Download and save image to local storage
    const { downloadAndSaveImage } = await import('@/lib/image-storage')
    const userIdForStorage = userId || 'anonymous'
    const localImageUrl = await downloadAndSaveImage(replicateUrl, userIdForStorage)

    return NextResponse.json({
      success: true,
      imageUrl: localImageUrl,  // Return local path instead of Replicate URL
      model: 'seedream-4',
      prompt: prompt,
      metadata: {
        aspectRatio: aspectRatio
      }
    })

  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    )
  }
}
