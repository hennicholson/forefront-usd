'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      let success = false

      if (isSignup) {
        success = await signup(email, password, name || undefined)
      } else {
        success = await login(email, password)
      }

      if (success) {
        setEmail('')
        setPassword('')
        setName('')
        setError('')
        onSuccess?.()
        onClose()
      } else {
        setError(isSignup ? 'signup failed - user may already exist' : 'login failed')
      }
    } catch (err) {
      setError('an error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#000',
          color: '#fff',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 700,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            marginBottom: '8px'
          }}>
            [forefront]
          </div>
          <div style={{
            fontSize: '14px',
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {isSignup ? 'create account' : 'sign in'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
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
              email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                background: '#fff',
                color: '#000',
                WebkitTextFillColor: '#000'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000'
                e.target.style.background = '#fafafa'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.background = '#fff'
              }}
            />
          </div>

          {isSignup && (
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
                name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#000',
                  WebkitTextFillColor: '#000'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#000'
                  e.target.style.background = '#fafafa'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.background = '#fff'
                }}
              />
            </div>
          )}

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
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                background: '#fff',
                color: '#000',
                WebkitTextFillColor: '#000'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000'
                e.target.style.background = '#fafafa'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0'
                e.target.style.background = '#fff'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginBottom: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'loading...' : `${isSignup ? 'create account' : 'sign in'} →`}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          >
            cancel
          </button>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            {isSignup ? 'already have an account?' : "don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#000',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              {isSignup ? 'sign in' : 'sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
