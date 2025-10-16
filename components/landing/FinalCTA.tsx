'use client'
import { useState } from 'react'

interface FinalCTAProps {
  onGetStarted: () => void
}

export function FinalCTA({ onGetStarted }: FinalCTAProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // TODO: Implement email capture
      console.log('Email captured:', email)
      setSubmitted(true)
      setTimeout(() => {
        setEmail('')
        setSubmitted(false)
      }, 3000)
    }
  }

  return (
    <div className="section" style={{
      paddingTop: '60px',
      paddingBottom: '60px',
      background: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="content" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-2px',
            marginBottom: '20px',
            color: '#fff',
            lineHeight: 1.1
          }}>
            Don't Get Left Behind
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            lineHeight: 1.6,
            color: '#999',
            marginBottom: '36px',
            maxWidth: '600px',
            margin: '0 auto 36px auto'
          }}>
            Every day you wait is another day the AI gap widens. Join 1,250+ students who are already ahead. Start learning now—it's completely free, forever.
          </p>

          {/* Main CTA */}
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              fontSize: '16px',
              padding: '20px 48px',
              background: '#fff',
              color: '#000',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            Start Learning Free →
          </button>

          {/* Trust signals */}
          <div style={{
            display: 'flex',
            gap: 'clamp(16px, 3vw, 24px)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>No credit card</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>100% free forever</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>Student-taught</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
