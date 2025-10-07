import { Code2 } from 'lucide-react'
import type { Slide as SlideType } from '@/lib/data/modules'

interface SlideProps {
  slide: SlideType
}

export function Slide({ slide }: SlideProps) {
  return (
    <div className="p-8 md:p-12">
      {/* Heading */}
      {slide.content.heading && (
        <h2 className="text-3xl font-bold text-white mb-6">
          {slide.content.heading}
        </h2>
      )}

      {/* Body text */}
      {slide.content.body && (
        <p className="text-lg text-gray-300 mb-6">
          {slide.content.body}
        </p>
      )}

      {/* Bullet points */}
      {slide.content.bulletPoints && (
        <ul className="space-y-3 mb-6">
          {slide.content.bulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <span className="text-forefront-cyan mt-1 flex-shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Code block */}
      {slide.content.code && (
        <div className="bg-dark rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={20} className="text-forefront-cyan" />
            <span className="text-sm text-gray-400 font-mono">
              {slide.content.code.language}
            </span>
          </div>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{slide.content.code.snippet}</code>
          </pre>
        </div>
      )}

      {/* Note */}
      {slide.content.note && (
        <div className="mt-6 p-4 bg-forefront-blue/10 border border-forefront-blue/30 rounded-lg">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-forefront-cyan">Note:</span> {slide.content.note}
          </p>
        </div>
      )}
    </div>
  )
}
