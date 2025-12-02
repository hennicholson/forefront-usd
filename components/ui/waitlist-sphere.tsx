'use client'

import React, { useState, useEffect } from 'react'
import SphereImageGrid, { ImageData } from '@/components/ui/img-sphere'

interface WaitlistMember {
  id: number
  firstName: string
  lastName: string
  avatarUrl: string | null
  aiProficiency: number
  university: string | null
}

interface WaitlistSphereProps {
  currentUser?: {
    firstName: string
    avatarUrl?: string
  }
  className?: string
  containerSize?: number
}

export function WaitlistSphere({
  currentUser,
  className = '',
  containerSize = 600
}: WaitlistSphereProps) {
  const [members, setMembers] = useState<WaitlistMember[]>([])
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<ImageData[]>([])

  // Fetch waitlist members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/waitlist')
        if (response.ok) {
          const data = await response.json()
          // The API returns { entries: [...] }, so we need to extract the entries array
          if (data.entries && Array.isArray(data.entries)) {
            console.log(`Fetched ${data.entries.length} waitlist members`)
            // Log how many have avatars
            const withAvatars = data.entries.filter((m: WaitlistMember) => m.avatarUrl).length
            console.log(`${withAvatars} members have avatars`)
            setMembers(data.entries)
          } else if (Array.isArray(data)) {
            // Fallback for if API changes to return array directly
            setMembers(data)
          } else {
            console.warn('Waitlist API did not return expected format:', data)
            setMembers([])
          }
        } else {
          console.error('Failed to fetch waitlist members:', response.status)
          setMembers([])
        }
      } catch (err) {
        console.error('Error fetching waitlist members:', err)
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  // Convert members to sphere images
  useEffect(() => {
    const sphereImages: ImageData[] = []

    // Add current user if provided
    if (currentUser?.avatarUrl) {
      sphereImages.push({
        id: 'current-user',
        src: currentUser.avatarUrl,
        alt: `${currentUser.firstName}'s avatar`,
        title: `${currentUser.firstName} (You)`,
        description: 'Welcome to the forefront community!'
      })
    }

    // Add real members - ensure members is an array
    if (Array.isArray(members)) {
      members.forEach(member => {
        if (member.avatarUrl) {
          // Log to debug avatar URLs
          console.log(`Adding member ${member.firstName} with avatar:`,
            member.avatarUrl.substring(0, 50) + '...')

          sphereImages.push({
            id: `member-${member.id}`,
            src: member.avatarUrl, // This should be a base64 data URL
            alt: `${member.firstName} ${member.lastName}`,
            title: `${member.firstName} ${member.lastName}`,
            description: member.university || 'Student'
          })
        } else {
          console.log(`Member ${member.firstName} has no avatar`)
        }
      })
    }

    // NO PLACEHOLDERS - Only show real waitlist members
    const currentCount = sphereImages.length

    console.log(`Sphere composition:`)
    console.log(`- Current user avatar: ${currentUser?.avatarUrl ? 'Yes' : 'No'}`)
    console.log(`- Real members with avatars: ${sphereImages.length - (currentUser?.avatarUrl ? 1 : 0)}`)
    console.log(`- Total real avatars: ${currentCount}`)
    console.log(`- Showing only real members, no placeholders`)

    setImages(sphereImages)
  }, [members, currentUser])

  // Responsive container size
  const getContainerSize = () => {
    if (typeof window === 'undefined') return containerSize
    return window.innerWidth < 768 ? Math.min(400, window.innerWidth - 40) : containerSize
  }

  const [responsiveSize, setResponsiveSize] = useState(containerSize)

  useEffect(() => {
    const updateSize = () => {
      setResponsiveSize(getContainerSize())
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [containerSize])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: responsiveSize }}>
        <div className="text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading community...</p>
        </div>
      </div>
    )
  }

  // Configuration for the sphere
  const sphereConfig = {
    containerSize: responsiveSize,
    sphereRadius: responsiveSize * 0.35,  // Slightly smaller radius for better fit
    dragSensitivity: 0.8,
    momentumDecay: 0.96,
    maxRotationSpeed: 6,
    baseImageScale: 0.12,  // Smaller images to fit more
    hoverScale: 1.3,
    perspective: 1000,
    autoRotate: true,
    autoRotateSpeed: 0.2
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <SphereImageGrid
          images={images}
          {...sphereConfig}
        />
      </div>
    </div>
  )
}

export default WaitlistSphere