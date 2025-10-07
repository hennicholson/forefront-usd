'use client'
import { useState } from 'react'
import ReactPlayer from 'react-player'
import Image from 'next/image'

interface VideoIntroProps {
  videoUrl: string
  instructor: {
    name: string
    photo: string
  }
}

export function VideoIntro({ videoUrl, instructor }: VideoIntroProps) {
  const [hasPlayed, setHasPlayed] = useState(false)

  return (
    <section className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={instructor.photo}
            alt={instructor.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="text-sm text-gray-400">Taught by</p>
            <p className="font-semibold text-white">{instructor.name}</p>
          </div>
        </div>

        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            onPlay={() => setHasPlayed(true)}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload'
                }
              }
            }}
          />
        </div>

        {!hasPlayed && (
          <p className="text-center text-gray-400 mt-4 text-sm">
            ▶ Watch the 30-second intro to get started
          </p>
        )}
      </div>
    </section>
  )
}
