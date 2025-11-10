'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function BracketAnimation() {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([])

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 0.2
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center overflow-hidden bg-black/40 rounded-lg border border-zinc-800/50">
      {/* Background gradient pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Particles flowing between brackets */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
          initial={{ x: -60, opacity: 0 }}
          animate={{
            x: [-60, 0, 60],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            top: `${45 + Math.sin(particle.id) * 20}%`,
          }}
        />
      ))}

      {/* Left Bracket */}
      <motion.div
        className="absolute left-1/2 -ml-24 text-6xl font-bold text-white/90"
        initial={{ x: -20, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          filter: [
            'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
            'drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))',
            'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))'
          ]
        }}
        transition={{
          x: { duration: 0.6 },
          opacity: { duration: 0.6 },
          filter: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        [
      </motion.div>

      {/* Right Bracket */}
      <motion.div
        className="absolute left-1/2 ml-16 text-6xl font-bold text-white/90"
        initial={{ x: 20, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          filter: [
            'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
            'drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))',
            'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))'
          ]
        }}
        transition={{
          x: { duration: 0.6 },
          opacity: { duration: 0.6 },
          filter: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        ]
      </motion.div>

      {/* Center dot pulse */}
      <motion.div
        className="absolute w-2 h-2 bg-purple-400 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
        animate={{
          y: [-100, 200]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}
