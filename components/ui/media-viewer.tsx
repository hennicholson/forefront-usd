'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ExternalLink, Play, Image as ImageIcon } from 'lucide-react'
import type { PerplexityVideo, PerplexityImage } from '@/lib/perplexity/types'

interface MediaViewerProps {
  videos?: PerplexityVideo[]
  images?: PerplexityImage[]
  isDarkMode?: boolean
}

// Extract YouTube video ID from URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)

    // Handle different YouTube URL formats
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } else if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1)
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    return null
  } catch {
    return null
  }
}

// Get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    let videoId = null

    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v')
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1)
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    return null
  } catch {
    return null
  }
}

export function MediaViewer({ videos = [], images = [], isDarkMode = true }: MediaViewerProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'video' | 'image', url: string, embedUrl?: string } | null>(null)

  if (videos.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-4 space-y-3">
        {/* Videos */}
        {videos.length > 0 && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Related Videos
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {videos.slice(0, 4).map((video, index) => {
                const ytThumbnail = getYouTubeThumbnail(video.url)
                const ytEmbedUrl = getYouTubeEmbedUrl(video.url)
                const thumbnailUrl = ytThumbnail || video.thumbnail_url

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia({
                      type: 'video',
                      url: video.url,
                      embedUrl: ytEmbedUrl || undefined
                    })}
                    className={`relative aspect-video rounded-lg overflow-hidden group border ${
                      isDarkMode ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300'
                    } transition-colors`}
                  >
                    {thumbnailUrl ? (
                      <>
                        <img
                          src={thumbnailUrl}
                          alt="Video thumbnail"
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if thumbnail fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <div className={`hidden absolute inset-0 items-center justify-center ${
                          isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
                        }`}>
                          <Play size={24} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-400'} />
                        </div>
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
                      }`}>
                        <Play size={24} className={isDarkMode ? 'text-zinc-600' : 'text-zinc-400'} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            <div
              className="max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'video' ? (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={selectedMedia.embedUrl || selectedMedia.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <img
                  src={selectedMedia.url}
                  alt="Full size"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}

              <a
                href={selectedMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
              >
                <ExternalLink size={16} />
                Open in new tab
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
