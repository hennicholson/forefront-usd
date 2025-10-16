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

      {/* Questions Section */}
      <div className="section white">
        <div className="content">
          <div className="section-label">Questions?</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { q: 'Is it free?', a: 'Yes—100% free for students. No credit card required.' },
              { q: 'Who teaches?', a: 'Fellow students who have mastered AI skills and want to share.' },
              { q: 'How long are modules?', a: '10-30 minutes each. Learn at your own pace.' },
              { q: 'Can I create a module?', a: 'Absolutely! Apply to become an instructor and share your expertise.' }
            ].map((faq, i) => (
              <div key={i} style={{
                borderLeft: '3px solid #000',
                paddingLeft: '24px',
                paddingTop: '4px',
                paddingBottom: '4px'
              }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 2.5vw, 22px)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                  color: '#000'
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  lineHeight: 1.7,
                  color: '#666'
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            padding: '32px',
            background: '#fafafa',
            borderRadius: '12px',
            border: '2px solid #e0e0e0'
          }}>
            <div style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: '#666',
              marginBottom: '16px'
            }}>
              Ready to explore {modules.length} AI-powered learning modules?
            </div>
            <Link
              href="/modules"
              style={{
                fontSize: '15px',
                color: '#000',
                textDecoration: 'underline',
                fontWeight: 700,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#666'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#000'}
            >
              Browse all modules →
            </Link>
          </div>
        </div>
      </div>

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
