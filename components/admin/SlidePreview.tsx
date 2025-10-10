'use client'
import { ContentBlockViewer } from '../module/ContentBlockViewer'

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'codePreview' | 'image' | 'video' | 'note' | 'chart' | 'quiz' | 'audio' | 'file' | 'embed' | 'accordion' | 'callout' | 'columns' | 'separator' | 'button'
  data: any
}

interface Slide {
  id: number
  title: string
  description?: string
  blocks?: ContentBlock[]
}

interface SlidePreviewProps {
  slide: Slide | null
  slideNumber: number
}

export function SlidePreview({ slide, slideNumber }: SlidePreviewProps) {
  if (!slide) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '16px'
      }}>
        No slide selected
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      background: '#000',
      padding: '40px'
    }}>
      {/* Preview Header */}
      <div style={{
        background: '#0a0a0a',
        border: '2px solid #333',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#0f0',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
          fontWeight: 700
        }}>
          Slide {slideNumber}
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 48px)',
          fontWeight: 800,
          color: '#fff',
          marginBottom: slide.description ? '16px' : 0,
          lineHeight: 1.2
        }}>
          {slide.title || 'Untitled Slide'}
        </h1>
        {slide.description && (
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            lineHeight: 1.6,
            margin: 0
          }}>
            {slide.description}
          </p>
        )}
      </div>

      {/* Preview Content Blocks */}
      {slide.blocks && slide.blocks.length > 0 ? (
        <ContentBlockViewer blocks={slide.blocks} />
      ) : (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          border: '2px dashed #333',
          borderRadius: '12px'
        }}>
          No content blocks added yet. Add blocks from the editor to see them here.
        </div>
      )}

      {/* Preview Watermark */}
      <div style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '2px solid #333',
        textAlign: 'center',
        color: '#333',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontWeight: 700
      }}>
        Live Preview
      </div>
    </div>
  )
}
