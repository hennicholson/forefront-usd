import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Downloads an image from a URL and saves it to the public/generations folder
 * Returns the public URL path to access the saved image
 */
export async function downloadAndSaveImage(imageUrl: string, userId: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Get image buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'png'
    const filename = `${userId}-${timestamp}-${randomStr}.${extension}`

    // Ensure generations directory exists
    const generationsDir = join(process.cwd(), 'public', 'generations')
    if (!existsSync(generationsDir)) {
      await mkdir(generationsDir, { recursive: true })
    }

    // Save the file
    const filepath = join(generationsDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    return `/generations/${filename}`
  } catch (error) {
    console.error('Error downloading and saving image:', error)
    // Fall back to original URL if download fails
    return imageUrl
  }
}

/**
 * Downloads a video from a URL and saves it to the public/generations folder
 * Returns the public URL path to access the saved video
 */
export async function downloadAndSaveVideo(videoUrl: string, userId: string): Promise<string> {
  try {
    // Fetch the video
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`)
    }

    // Get video buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = videoUrl.match(/\.(mp4|webm|mov|avi)$/i)?.[1] || 'mp4'
    const filename = `${userId}-${timestamp}-${randomStr}.${extension}`

    // Ensure generations directory exists
    const generationsDir = join(process.cwd(), 'public', 'generations')
    if (!existsSync(generationsDir)) {
      await mkdir(generationsDir, { recursive: true })
    }

    // Save the file
    const filepath = join(generationsDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    return `/generations/${filename}`
  } catch (error) {
    console.error('Error downloading and saving video:', error)
    // Fall back to original URL if download fails
    return videoUrl
  }
}
