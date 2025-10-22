"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Feature {
  step: string
  title?: string
  content: string
  image: string
}

interface FeatureStepsProps {
  features: Feature[]
  className?: string
  title?: string
  scrollBased?: boolean
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  scrollBased = true,
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!scrollBased) return

    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerTop = container.offsetTop
      const containerHeight = container.offsetHeight
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Calculate which feature should be active based on scroll position
      const relativeScroll = scrollPosition - containerTop
      const sectionHeight = containerHeight / (features.length + 1)
      const activeIndex = Math.floor(relativeScroll / sectionHeight)

      const clampedIndex = Math.max(0, Math.min(features.length - 1, activeIndex))
      setCurrentFeature(clampedIndex)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollBased, features.length])

  return (
    <div
      ref={containerRef}
      className={cn("py-16 md:py-24", className)}
      style={{ minHeight: '120vh' }}
    >
      <div className="sticky top-20 px-8 md:px-12">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center">
            {title}
          </h2>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
            <div className="order-2 md:order-1 space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  ref={(el) => {
                    if (el) sectionsRef.current[index] = el
                  }}
                  className="flex items-center gap-6 md:gap-8 cursor-pointer"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setCurrentFeature(index)}
                >
                  <motion.div
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                      index === currentFeature
                        ? "bg-white border-white text-black scale-110"
                        : "bg-transparent border-gray-500 text-gray-500",
                    )}
                    animate={{
                      scale: index === currentFeature ? 1.1 : 1,
                    }}
                  >
                    {index <= currentFeature ? (
                      <span className="text-lg font-bold">✓</span>
                    ) : (
                      <span className="text-lg font-semibold">{index + 1}</span>
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {feature.title || feature.step}
                    </h3>
                    <p className="text-sm md:text-lg text-gray-400">
                      {feature.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="order-1 md:order-2 relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg">
              <AnimatePresence mode="wait">
                {features.map(
                  (feature, index) =>
                    index === currentFeature && (
                      <motion.div
                        key={index}
                        className="absolute inset-0 rounded-lg overflow-hidden"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <img
                          src={feature.image}
                          alt={feature.step}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </motion.div>
                    ),
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
