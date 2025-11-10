'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  const scrollToModules = () => {
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden py-24 px-6">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-forefront-blue/20 via-dark to-forefront-cyan/10" />

      <motion.div
        className="relative max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Master AI, One Module at a Time
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Learn from USD students who are at the forefront of AI.
          Hands-on courses covering coding, marketing, content creation, and more.
        </p>
        <Button onClick={scrollToModules} size="lg">
          Browse Modules
        </Button>
      </motion.div>
    </section>
  )
}
