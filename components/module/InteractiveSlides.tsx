'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slide } from './Slide'
import { SlideNavigation } from './SlideNavigation'
import type { Slide as SlideType } from '@/lib/data/modules'

interface InteractiveSlidesProps {
  slides: SlideType[]
}

export function InteractiveSlides({ slides }: InteractiveSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        Slide {currentSlide + 1} of {slides.length}
      </div>

      {/* Slide container */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Slide slide={slides[currentSlide]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrev={prevSlide}
        onNext={nextSlide}
        onGoTo={goToSlide}
      />
    </div>
  )
}
