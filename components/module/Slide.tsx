import { Code2 } from 'lucide-react'
import type { Slide as SlideType } from '@/lib/data/modules'
import { ContentBlockViewer } from './ContentBlockViewer'

interface SlideProps {
  slide: SlideType
}

export function Slide({ slide }: SlideProps) {
  return (
    <div className="p-8 md:p-12">
      {/* Title */}
      {slide.title && (
        <h2 className="text-3xl font-bold text-white mb-6">
          {slide.title}
        </h2>
      )}

      {/* Description */}
      {slide.description && (
        <p className="text-lg text-gray-300 mb-6">
          {slide.description}
        </p>
      )}

      {/* Content Blocks */}
      {slide.blocks && slide.blocks.length > 0 && (
        <ContentBlockViewer blocks={slide.blocks} />
      )}
    </div>
  )
}
