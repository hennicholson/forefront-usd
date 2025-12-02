import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_TRANSCRIPT_API_KEY = '69240ffea839f53ecc137871'

interface TranscriptEntry {
  text: string
  start: number
  duration: number
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * POST /api/youtube-transcript
 * Fetch transcript for a YouTube video
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Extract video ID
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or video ID' },
        { status: 400 }
      )
    }

    // Fetch transcript from youtube-transcript.io
    const response = await fetch('https://www.youtube-transcript.io/api/transcripts', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${YOUTUBE_TRANSCRIPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: [videoId]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube transcript API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch transcript from YouTube', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Log the full API response for debugging
    console.log('YouTube Transcript API Response:', JSON.stringify(data, null, 2))
    console.log('Looking for videoId:', videoId)

    // The API returns an array with a single object
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Unexpected API response format:', data)
      return NextResponse.json(
        { error: 'Unexpected response format from transcript API' },
        { status: 500 }
      )
    }

    const transcriptData = data[0]

    console.log('Transcript data for video:', transcriptData)

    // Check if we have tracks (transcripts in multiple languages)
    if (!transcriptData || !transcriptData.tracks || transcriptData.tracks.length === 0) {
      console.error('No transcript found in response')
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 404 }
      )
    }

    // Use English transcript by default, or first available
    const englishTrack = transcriptData.tracks.find((track: any) => track.language === 'English')
    const track = englishTrack || transcriptData.tracks[0]

    // Convert the transcript format to our expected format
    const transcript = track.transcript.map((entry: any) => ({
      text: entry.text,
      start: parseFloat(entry.start),
      duration: parseFloat(entry.dur)
    }))

    return NextResponse.json({
      videoId,
      transcript,
      metadata: {
        title: transcriptData.title || 'Unknown Title',
        duration: transcriptData.microformat?.playerMicroformatRenderer?.lengthSeconds,
        channelName: transcriptData.author || 'Unknown Channel'
      }
    })
  } catch (error: any) {
    console.error('Error fetching YouTube transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript', details: error.message },
      { status: 500 }
    )
  }
}
