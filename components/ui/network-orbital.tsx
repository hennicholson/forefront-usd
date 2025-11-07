'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface Member {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  aiProficiency?: number
  isPlaceholder?: boolean
}

interface NetworkOrbitalProps {
  members: Member[]
  onUploadClick: () => void
  className?: string
}

export function NetworkOrbital({ members, onUploadClick, className = '' }: NetworkOrbitalProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [networkRadius, setNetworkRadius] = useState(180)

  // Auto-rotation
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [isPaused])

  // Responsive radius
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setNetworkRadius(120)
      } else if (window.innerWidth < 768) {
        setNetworkRadius(150)
      } else {
        setNetworkRadius(200)
      }
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  // Use placeholder nodes if no real members
  const displayMembers = members.length > 0
    ? members.slice(0, 8)
    : Array.from({ length: 6 }, (_, i) => ({
        id: `placeholder-${i}`,
        firstName: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank'][i],
        lastName: ['A', 'B', 'C', 'D', 'E', 'F'][i],
        avatarUrl: null,
        aiProficiency: Math.floor(Math.random() * 100),
        isPlaceholder: true
      }))

  const getNodePosition = (index: number, total: number) => {
    const baseAngle = (index * 360) / total
    const angleInRadians = ((baseAngle + rotation) * Math.PI) / 180
    const x = Math.cos(angleInRadians) * networkRadius
    const y = Math.sin(angleInRadians) * networkRadius
    return { x, y, angle: baseAngle + rotation }
  }

  return (
    <div className={`relative w-full min-h-[450px] sm:min-h-[500px] md:min-h-[600px] ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">

        {/* Central upload node */}
        <motion.div
          className="absolute z-20"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          whileHover={{ scale: 1.05 }}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => setIsPaused(false)}
        >
          <div className="relative">
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-black/10 -inset-8"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-black/10 -inset-8"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            />

            {/* Upload button */}
            <button
              onClick={onUploadClick}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white hover:shadow-black/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-1 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold relative z-10">UPLOAD</span>
            </button>
          </div>
        </motion.div>

        {/* SVG for connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
              <stop offset="50%" stopColor="rgba(100,100,100,0.4)" />
              <stop offset="100%" stopColor="rgba(200,200,200,0.2)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {displayMembers.map((member, index) => {
            const { x, y } = getNodePosition(index, displayMembers.length)
            const isSelected = selectedNode === member.id

            return (
              <motion.line
                key={`line-${member.id}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${x}px)`}
                y2={`calc(50% + ${y}px)`}
                stroke={isSelected ? "url(#orbitalGradient)" : "rgba(0,0,0,0.2)"}
                strokeWidth={isSelected ? "3" : "1.5"}
                filter={isSelected ? "url(#glow)" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: member.isPlaceholder ? 0.3 : (isSelected ? 0.8 : 0.5),
                  strokeWidth: isSelected ? 3 : 1.5
                }}
                transition={{
                  pathLength: { duration: 1, delay: index * 0.1 },
                  opacity: { duration: 0.3 },
                  strokeWidth: { duration: 0.3 }
                }}
              />
            )
          })}
        </svg>

        {/* Orbital nodes */}
        <AnimatePresence>
          {displayMembers.map((member, index) => {
            const { x, y } = getNodePosition(index, displayMembers.length)
            const isSelected = selectedNode === member.id
            const initials = `${member.firstName[0]}${member.lastName[0]}`

            return (
              <motion.div
                key={member.id}
                className="absolute z-10 cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1.2 : 1,
                  opacity: member.isPlaceholder ? 0.6 : 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  scale: { duration: 0.3, type: "spring", stiffness: 300 },
                  opacity: { duration: 0.5, delay: index * 0.05 }
                }}
                onClick={() => setSelectedNode(isSelected ? null : member.id)}
                onHoverStart={() => setIsPaused(true)}
                onHoverEnd={() => setIsPaused(false)}
              >
                <div className="relative">
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-black -inset-3"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />

                  {/* Node ring for selected state */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-black -inset-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    />
                  )}

                  {/* Avatar */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 ${isSelected ? 'border-black' : 'border-white'} bg-white shadow-xl relative transition-all duration-300`}>
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl ${member.isPlaceholder ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Name badge */}
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: isSelected ? 1 : 0.8, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Badge
                      variant="secondary"
                      className={`text-xs ${isSelected ? 'bg-black text-white' : 'bg-white/90 text-black'} shadow-lg`}
                    >
                      {member.firstName}
                    </Badge>
                  </motion.div>

                  {/* Energy level indicator */}
                  {member.aiProficiency !== undefined && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-white shadow-lg flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: isSelected ? 1.2 : 1 }}
                      transition={{ delay: index * 0.1 + 0.7 }}
                    >
                      <span className="text-white text-xs font-bold">{Math.floor(member.aiProficiency / 25)}</span>
                    </motion.div>
                  )}
                </div>

                {/* Expanded card for selected node */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl p-4 min-w-[200px] border border-gray-200 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-1">
                          {member.firstName} {member.lastName}
                        </h3>
                        {member.aiProficiency !== undefined && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">AI Proficiency</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${member.aiProficiency}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                              />
                            </div>
                            <p className="text-xs font-semibold mt-1">{member.aiProficiency}%</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
