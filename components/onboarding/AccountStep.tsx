'use client'
import { useState, useEffect } from 'react'

interface AccountStepProps {
  data: {
    email: string
    password: string
    name: string
  }
  onUpdate: (data: Partial<AccountStepProps['data']>) => void
  onNext: () => void
}

export function AccountStep({ data, onUpdate, onNext }: AccountStepProps) {
  const [activeField, setActiveField] = useState<'email' | 'password' | 'name' | null>('email')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleEmailComplete = () => {
    if (!data.email) {
      setError('please enter your email')
      return
    }
    if (!validateEmail(data.email)) {
      setError('please enter a valid email')
      return
    }
    setError('')
    setActiveField('password')
  }

  const handlePasswordComplete = () => {
    if (!data.password) {
      setError('please enter a password')
      return
    }
    if (data.password.length < 6) {
      setError('password must be at least 6 characters')
      return
    }
    setError('')
    setActiveField('name')
  }

  const handleSubmit = async () => {
    if (!data.name) {
      setError('please enter your name')
      return
    }

    setError('')
    setIsSubmitting(true)

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false)
      onNext()
    }, 500)
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 800,
          textTransform: 'lowercase',
          letterSpacing: '-1px',
          marginBottom: '12px',
          color: '#000'
        }}>
          create your account
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: 1.6
        }}>
          join the learning community
        </p>
      </div>

      {/* Email Field */}
      <div style={{
        marginBottom: '20px',
        opacity: activeField === 'email' || data.email ? 1 : 0.4,
        transition: 'all 0.3s ease',
        transform: activeField === 'email' ? 'scale(1)' : 'scale(0.98)'
      }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '8px',
          fontWeight: 600,
          color: '#333'
        }}>
          email address
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && activeField === 'email') {
              handleEmailComplete()
            }
          }}
          placeholder="your@email.com"
          disabled={activeField !== 'email' && !!data.email}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            border: activeField === 'email' ? '3px solid #000' : '2px solid #e0e0e0',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            background: activeField === 'email' || !data.email ? '#fff' : '#fafafa',
            color: '#000'
          }}
        />
        {activeField === 'email' && (
          <button
            onClick={handleEmailComplete}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              background: data.email ? '#000' : '#e0e0e0',
              color: data.email ? '#fff' : '#999',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: data.email ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            continue
          </button>
        )}
      </div>

      {/* Password Field */}
      {(activeField === 'password' || data.password) && (
        <div style={{
          marginBottom: '20px',
          opacity: activeField === 'password' || data.password ? 1 : 0.4,
          transition: 'all 0.3s ease',
          transform: activeField === 'password' ? 'scale(1)' : 'scale(0.98)',
          animation: activeField === 'password' ? 'slideDown 0.3s ease' : 'none'
        }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
            fontWeight: 600,
            color: '#333'
          }}>
            password
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onUpdate({ password: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && activeField === 'password') {
                handlePasswordComplete()
              }
            }}
            placeholder="at least 6 characters"
            disabled={activeField !== 'password' && !!data.password}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              border: activeField === 'password' ? '3px solid #000' : '2px solid #e0e0e0',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              background: activeField === 'password' || !data.password ? '#fff' : '#fafafa',
              color: '#000'
            }}
          />
          {activeField === 'password' && (
            <button
              onClick={handlePasswordComplete}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '14px',
                background: data.password && data.password.length >= 6 ? '#000' : '#e0e0e0',
                color: data.password && data.password.length >= 6 ? '#fff' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: data.password && data.password.length >= 6 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              continue
            </button>
          )}
        </div>
      )}

      {/* Name Field */}
      {(activeField === 'name' || data.name) && (
        <div style={{
          marginBottom: '20px',
          opacity: activeField === 'name' ? 1 : 0.4,
          transition: 'all 0.3s ease',
          transform: activeField === 'name' ? 'scale(1)' : 'scale(0.98)',
          animation: activeField === 'name' ? 'slideDown 0.3s ease' : 'none'
        }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
            fontWeight: 600,
            color: '#333'
          }}>
            your name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && activeField === 'name') {
                handleSubmit()
              }
            }}
            placeholder="what should we call you?"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              border: activeField === 'name' ? '3px solid #000' : '2px solid #e0e0e0',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              background: '#fff',
              color: '#000'
            }}
            autoFocus
          />
          {activeField === 'name' && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '14px',
                background: data.name && !isSubmitting ? '#000' : '#e0e0e0',
                color: data.name && !isSubmitting ? '#fff' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: data.name && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? 'creating account...' : 'create account →'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px',
          background: '#000',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          marginTop: '16px',
          textAlign: 'center',
          textTransform: 'lowercase'
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
