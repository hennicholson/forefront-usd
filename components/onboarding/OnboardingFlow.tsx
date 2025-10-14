'use client'
import { useState } from 'react'
import { WelcomeStep } from './WelcomeStep'
import { AccountStep } from './AccountStep'
import { ProfileStep } from './ProfileStep'
import { TourStep } from './TourStep'
import { FirstActionStep } from './FirstActionStep'

interface OnboardingFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (userData: any) => void
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '',
    bio: '',
    headline: '',
    interests: [] as string[]
  })

  console.log('OnboardingFlow render, isOpen:', isOpen)

  if (!isOpen) return null

  const totalSteps = 5
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleUpdateData = (data: Partial<typeof userData>) => {
    setUserData(prev => ({ ...prev, ...data }))
  }

  const handleComplete = () => {
    onComplete(userData)
  }

  const handleSkip = () => {
    // Allow users to skip optional steps
    handleNext()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        width: '100%',
        maxWidth: '900px',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Progress Bar */}
        <div style={{
          height: '12px',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #000 0%, #333 100%)',
            width: `${progress}%`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite'
            }} />
          </div>
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        {/* Step Counter */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            step {currentStep + 1} of {totalSteps}
          </div>
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#000'
                e.currentTarget.style.color = '#000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.color = '#666'
              }}
            >
              ← back
            </button>
          )}
        </div>

        {/* Step Content */}
        <div style={{
          padding: '48px',
          minHeight: '500px'
        }}>
          {currentStep === 0 && (
            <WelcomeStep
              onNext={handleNext}
            />
          )}
          {currentStep === 1 && (
            <AccountStep
              data={userData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <ProfileStep
              data={userData}
              onUpdate={handleUpdateData}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && (
            <TourStep
              onNext={handleNext}
            />
          )}
          {currentStep === 4 && (
            <FirstActionStep
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
