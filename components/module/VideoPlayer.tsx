'use client'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
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
