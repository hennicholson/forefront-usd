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

    // The output is an array of file objects with .url() method
    const imageUrl = output && output[0] ? output[0].url() : null

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
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
