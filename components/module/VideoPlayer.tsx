'use client'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  if (!url) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#666',
        fontSize: '14px'
      }}>
        No video URL provided
      </div>
    )
  }

  return (
    <ReactPlayer
      url={url}
      width="100%"
      height="100%"
      controls
      style={{
        position: 'absolute',
        top: 0,
        left: 0
      }}
      config={{
        file: {
          attributes: {
            controlsList: 'nodownload'
          }
        }
      }}
    />
  )
}
