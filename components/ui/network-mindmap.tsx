'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Member {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  aiProficiency?: number
  isPlaceholder?: boolean
}

interface NetworkMindmapProps {
  members: Member[]
  imagePreview?: string
  onUploadClick: () => void
}

export function NetworkMindmap({ members, imagePreview, onUploadClick }: NetworkMindmapProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Create placeholder members if none exist - fewer on mobile for better spacing
  const displayMembers = members.length > 0
    ? members.slice(0, isMobile ? 5 : 8)
    : Array.from({ length: isMobile ? 5 : 8 }, (_, i) => ({
        id: `placeholder-${i}`,
        firstName: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finley', 'Gray', 'Harper'][i],
        lastName: ['Smith', 'Johnson', 'Davis', 'Wilson', 'Brown', 'Jones', 'Garcia', 'Miller'][i],
        avatarUrl: null,
        aiProficiency: 25 + Math.floor(Math.random() * 75),
        isPlaceholder: true
      }))

  // Calculate floating positions for nodes - optimized for mobile
  const getFloatingPosition = (index: number, total: number) => {
    const angle = (index * 360 / total) * (Math.PI / 180)

    // Adjust radius based on screen size
    const minRadius = isMobile ? 90 : 140   // Closer minimum on mobile
    const maxRadius = isMobile ? 120 : 200  // Smaller maximum on mobile

    // Less variation on mobile for predictable spacing
    const radiusVariation = isMobile ? Math.sin(index * 1.5) * 10 : Math.sin(index * 1.5) * 20
    const radius = (minRadius + maxRadius) / 2 + radiusVariation

    const baseX = Math.cos(angle) * radius
    const baseY = Math.sin(angle) * radius

    // Smaller float range on mobile to prevent going off-screen
    const floatRange = isMobile ? 8 : 15

    return {
      x: baseX,
      y: baseY,
      floatX: Math.sin(index * 2) * floatRange,
      floatY: Math.cos(index * 3) * floatRange
    }
  }

  return (
    <div className="relative w-full h-[400px] md:h-[550px] flex items-center justify-center overflow-hidden">
      {/* Member nodes floating around */}
      {displayMembers.map((member, i) => {
        const { x, y, floatX, floatY } = getFloatingPosition(i, displayMembers.length)
        const initials = `${member.firstName[0]}${member.lastName[0]}`
        const isHovered = hoveredNode === member.id

        return (
          <motion.div
            key={member.id}
            className="absolute"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 20 : 5
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isHovered ? (isMobile ? 1.1 : 1.15) : 1,
              opacity: member.isPlaceholder ? 0.4 : 0.9,
              x: [0, floatX, 0, -floatX, 0],
              y: [0, -floatY, 0, floatY, 0]
            }}
            transition={{
              scale: { duration: 0.4, delay: i * 0.08 },
              opacity: { duration: 0.5, delay: i * 0.08 },
              x: {
                duration: isMobile ? 10 + i * 0.5 : 8 + i * 0.5, // Slower on mobile
                repeat: Infinity,
                ease: "easeInOut"
              },
              y: {
                duration: isMobile ? 8 + i * 0.3 : 6 + i * 0.3, // Slower on mobile
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onMouseEnter={() => !isMobile && setHoveredNode(member.id)}
            onMouseLeave={() => !isMobile && setHoveredNode(null)}
            onTouchStart={() => isMobile && setHoveredNode(member.id)}
            onTouchEnd={() => isMobile && setTimeout(() => setHoveredNode(null), 2000)}
          >
            <div className="relative group cursor-pointer">
              {/* Glow effect on hover - smaller on mobile */}
              {isHovered && (
                <motion.div
                  className={`absolute rounded-full bg-black/10 ${isMobile ? '-inset-3 blur-lg' : '-inset-6 blur-2xl'}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: isMobile ? 1.1 : 1.3, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Subtle pulse ring - smaller on mobile */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, isMobile ? 1.3 : 1.5, isMobile ? 1.3 : 1.5],
                  opacity: [0, 0.15, 0]
                }}
                transition={{
                  duration: isMobile ? 4 : 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                  width: isMobile ? '120%' : '150%',
                  height: isMobile ? '120%' : '150%',
                  background: member.isPlaceholder
                    ? 'radial-gradient(circle, rgba(156, 163, 175, 0.3) 0%, transparent 60%)'
                    : 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 60%)'
                }}
              />

              {/* Avatar container - smaller on mobile */}
              <motion.div
                className="relative"
                whileHover={!isMobile ? { scale: 1.1, rotate: 5 } : {}}
                whileTap={isMobile ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className={`
                  ${isMobile ? 'w-12 h-12' : 'w-14 h-14 md:w-18 md:h-18'} rounded-full overflow-hidden
                  ${member.isPlaceholder ? 'ring-1 ring-gray-300/50' : 'ring-2 ring-black/20'}
                  ${isMobile ? 'shadow-md' : 'shadow-lg'} bg-white/90 backdrop-blur-sm relative
                `}>
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`
                      w-full h-full flex items-center justify-center
                      ${member.isPlaceholder
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
                        : 'bg-gradient-to-br from-gray-800 to-black text-white'}
                      font-bold ${isMobile ? 'text-xs' : 'text-sm md:text-base'}
                    `}>
                      {initials}
                    </div>
                  )}
                </div>

                {/* Status dot for real members - smaller on mobile */}
                {!member.isPlaceholder && (
                  <div className={`absolute ${isMobile ? '-bottom-0 -right-0 w-2.5 h-2.5' : '-bottom-0.5 -right-0.5 w-3 h-3'} bg-green-500 rounded-full border-2 border-white shadow-sm`} />
                )}
              </motion.div>

              {/* Name label - adjusted for mobile */}
              <motion.div
                className={`
                  absolute ${isMobile ? '-bottom-5' : '-bottom-6'} left-1/2 transform -translate-x-1/2
                  ${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-0.5'} rounded-full ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium whitespace-nowrap
                  ${isHovered ? 'bg-black/90 text-white shadow-lg' : 'bg-white/80 backdrop-blur-sm text-gray-700 shadow-sm'}
                  transition-all duration-200
                `}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
              >
                {member.firstName}
              </motion.div>
            </div>
          </motion.div>
        )
      })}

      {/* Central upload node - optimized for mobile */}
      <motion.div
        className="relative z-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      >
        {imagePreview ? (
          <div className="text-center">
            <motion.div
              className={`${isMobile ? 'w-28 h-28' : 'w-32 h-32 md:w-40 md:h-40'} rounded-full overflow-hidden ring-4 ring-black/90 shadow-2xl relative group cursor-pointer bg-white`}
              whileHover={{ scale: isMobile ? 1.03 : 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={onUploadClick}
            >
              <img
                src={imagePreview}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <svg className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-white opacity-0 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </motion.div>
            <p className={`${isMobile ? 'mt-2 text-xs' : 'mt-3 text-sm'} text-gray-600 font-medium`}>Click to change</p>
          </div>
        ) : (
          <motion.button
            onClick={onUploadClick}
            className="relative group"
            whileHover={{ scale: isMobile ? 1.03 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Subtle animated rings - smaller on mobile */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, isMobile ? 1.2 : 1.3, isMobile ? 1.2 : 1.3],
                opacity: [0.3, 0, 0]
              }}
              transition={{
                duration: isMobile ? 3 : 2.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                width: isMobile ? '110%' : '120%',
                height: isMobile ? '110%' : '120%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)'
              }}
            />

            {/* Main upload button - smaller on mobile */}
            <div className={`${isMobile ? 'w-28 h-28' : 'w-32 h-32 md:w-40 md:h-40'} rounded-full bg-black hover:bg-gray-900 transition-all duration-300 flex flex-col items-center justify-center shadow-2xl ring-4 ring-white/90 backdrop-blur-sm relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} text-white mb-1 relative z-10`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-sm md:text-base'} relative z-10`}>Upload</span>
            </div>
            <p className={`${isMobile ? 'mt-2 text-xs' : 'mt-3 text-sm'} text-gray-600 font-medium`}>Join the network</p>
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}