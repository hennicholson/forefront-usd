'use client'
import { useState, useEffect } from 'react'

interface ProfileStepProps {
  data: {
    bio: string
    headline: string
    interests: string[]
  }
  onUpdate: (data: Partial<ProfileStepProps['data']>) => void
  onNext: () => void
  onSkip: () => void
}

const AVAILABLE_INTERESTS = [
  'AI & Machine Learning',
  'Content Creation',
  'Video Production',
  'Workflow Automation',
  'Data Analysis',
  'Creative Design',
  'Web Development',
  'Social Media',
  'Marketing',
  'Business Strategy'
]

export function ProfileStep({ data, onUpdate, onNext, onSkip }: ProfileStepProps) {
  const [error, setError] = useState('')

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest]
    onUpdate({ interests: newInterests })
  }

  const handleContinue = () => {
    if (!data.headline && !data.bio && data.interests.length === 0) {
      setError('please add at least a headline, bio, or select some interests')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 800,
          textTransform: 'lowercase',
          letterSpacing: '-1px',
          marginBottom: '12px',
          color: '#000'
        }}>
          tell us about yourself
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: 1.6
        }}>
          help others understand who you are
        </p>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '8px',
          fontWeight: 600,
          color: '#333'
        }}>
          headline
        </label>
        <input
          type="text"
          value={data.headline}
          onChange={(e) => onUpdate({ headline: e.target.value })}
          placeholder="e.g., student at usd | ai enthusiast"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            background: '#fff',
            color: '#000'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Bio */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '8px',
          fontWeight: 600,
          color: '#333'
        }}>
          bio
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="tell us a bit about yourself..."
          rows={4}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            resize: 'vertical',
            background: '#fff',
            color: '#000'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Interests */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
          fontWeight: 600,
          color: '#333'
        }}>
          select your interests
        </label>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = data.interests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={{
                  padding: '12px 20px',
                  background: isSelected ? '#000' : '#fff',
                  color: isSelected ? '#fff' : '#000',
                  border: '2px solid ' + (isSelected ? '#000' : '#e0e0e0'),
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'lowercase'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#000'
                    e.currentTarget.style.background = '#fafafa'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.background = '#fff'
                  }
                }}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '14px',
          background: '#000',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '24px',
          textAlign: 'center',
          textTransform: 'lowercase'
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={onSkip}
          style={{
            flex: 1,
            padding: '16px',
            background: '#fff',
            color: '#666',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
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
          skip for now
        </button>
        <button
          onClick={handleContinue}
          style={{
            flex: 2,
            padding: '16px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          continue →
        </button>
      </div>
    </div>
  )
}
