import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SlideNavigationProps {
  currentSlide: number
  totalSlides: number
  onPrev: () => void
  onNext: () => void
  onGoTo: (index: number) => void
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoTo
}: SlideNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={onPrev}
        disabled={currentSlide === 0}
        variant="ghost"
        className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <ChevronLeft size={20} />
        Previous
      </Button>

      {/* Slide dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentSlide
                ? 'bg-forefront-cyan w-8'
                : 'bg-gray-600 hover:bg-gray-500 w-2'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={currentSlide === totalSlides - 1}
        variant="ghost"
        className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        Next
        <ChevronRight size={20} />
      </Button>
    </div>
  )
}
