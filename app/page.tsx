'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useRouter } from 'next/navigation'
import { AnimatedHero } from '@/components/landing/AnimatedHero'
import { InteractiveValueProps } from '@/components/landing/InteractiveValueProps'
import { ModuleCarousel } from '@/components/landing/ModuleCarousel'
import { FAQRotator } from '@/components/landing/FAQRotator'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { StickyFooterCTA } from '@/components/landing/StickyFooterCTA'
import { ScrollProgress } from '@/components/landing/ScrollProgress'

export default function LandingPage() {
  const { isAuthenticated, signup } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [pendingModuleSlug, setPendingModuleSlug] = useState<string | null>(null)

  useEffect(() => {
    console.log('showOnboarding changed:', showOnboarding)
  }, [showOnboarding])
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setShowOnboarding(true)
    }
  }

  const handleModuleClick = (slug: string) => {
    setPendingModuleSlug(slug)
    setShowLoginModal(true)
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Animated Hero Section */}
      <AnimatedHero onGetStarted={handleGetStarted} />

      {/* Interactive Value Proposition */}
      <InteractiveValueProps />

      {/* Module Carousel with 3D Effects */}
      <ModuleCarousel
        isAuthenticated={isAuthenticated}
        onModuleClick={handleModuleClick}
      />

      {/* Interactive FAQ Section with Fading Text Rotator */}
      <FAQRotator onGetStarted={handleGetStarted} />

      {/* Final CTA */}
      <FinalCTA onGetStarted={handleGetStarted} />

      {/* Sticky Footer CTA (appears after 30% scroll) */}
      <StickyFooterCTA onGetStarted={handleGetStarted} />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false)
          setPendingModuleSlug(null)
        }}
        onSuccess={() => {
          if (pendingModuleSlug) {
            router.push(`/modules/${pendingModuleSlug}`)
          }
        }}
        onSignupClick={() => {
          console.log('Sign up clicked!')
          setShowLoginModal(false)
          setTimeout(() => {
            console.log('Opening onboarding modal')
            setShowOnboarding(true)
          }, 100)
        }}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async (userData) => {
          try {
            // Try to create the account with all onboarding data
            const success = await signup(userData.email, userData.password, userData.name)

            if (success) {
              // Update profile with additional data
              const userRes = await fetch(`/api/users?email=${encodeURIComponent(userData.email)}`)

              if (userRes.ok) {
                const { user } = await userRes.json()

                // Update user with onboarding data
                await fetch(`/api/users/${user.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bio: userData.bio,
                    headline: userData.headline,
                    interests: userData.interests,
                    onboardingComplete: true
                  })
                })
              }

              setShowOnboarding(false)

              // Redirect to pending module or stay on home
              if (pendingModuleSlug) {
                router.push(`/modules/${pendingModuleSlug}`)
                setPendingModuleSlug(null)
              }
            }
          } catch (err) {
            console.error('Error completing onboarding:', err)
          }
        }}
      />
    </main>
  )
}
