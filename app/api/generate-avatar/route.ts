import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log('Processing image for chibi generation:', image.name, image.type, image.size)

    // Convert image to base64 data URL
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const dataUrl = `data:${image.type};base64,${base64Image}`

    console.log('Generating chibi avatar with Replicate nano-banana...')

    // Create the prompt for chibi character generation
    const prompt = `Transform this person into a cute chibi-style 3D cartoon character while maintaining their unique facial features and identity. The character is wearing a black t-shirt with "forefront" in white text on the chest. Use chibi proportions with an oversized head, large expressive eyes, and a small body. Keep their distinctive hairstyle, facial structure, and skin tone. Set against a clean studio background with professional lighting. Style: adorable 3D cartoon, high quality, vibrant colors.`

    const input = {
      prompt: prompt,
      image_input: [dataUrl]
    }

    const output = await replicate.run("google/nano-banana", { input }) as any

    console.log('Replicate output:', output)

    // Fetch the generated image from the URL
    const imageUrl = output.url ? output.url() : output
    console.log('Image URL:', imageUrl)

    if (imageUrl) {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const imageBase64 = Buffer.from(imageBuffer).toString('base64')

      console.log('Successfully generated chibi avatar!')

      return NextResponse.json({
        success: true,
        avatarUrl: `data:image/jpeg;base64,${imageBase64}`,
        message: 'Chibi avatar generated successfully'
      })
    }

    // If no image was generated, return error
    console.error('No image generated in response')
    return NextResponse.json({
      success: false,
      error: 'Failed to generate chibi avatar',
      message: 'No image was returned from the generation model'
    }, { status: 500 })

  } catch (error: any) {
    console.error('Error processing avatar:', error)
    console.error('Error details:', error.message)
    console.error('Error response:', error.response)
    return NextResponse.json(
      {
        error: 'Failed to process avatar',
        details: error.message,
        hint: 'If you see a 402 error, please wait a few minutes for Replicate billing to process, then try again.'
      },
      { status: 500 }
    )
  }
}
