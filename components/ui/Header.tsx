'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, isAuthenticated, logout, signup } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link
            href="/"
            style={{
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: 600,
              color: '#fff',
              textDecoration: 'none',
              textTransform: 'lowercase',
              letterSpacing: '-0.5px',
              transition: 'opacity 0.3s ease'
            }}
            className="hover:opacity-70"
          >
            [forefront]
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center'
          }} className="desktop-nav">
            <Link
              href="/#modules"
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'opacity 0.3s ease'
              }}
              className="hover:opacity-70"
            >
              modules
            </Link>
            <Link
              href="/network"
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'opacity 0.3s ease'
              }}
              className="hover:opacity-70"
            >
              network
            </Link>
            <Link
              href="/about"
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'opacity 0.3s ease'
              }}
              className="hover:opacity-70"
            >
              about
            </Link>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: '#fff',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  [{user?.name}]
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '12px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    minWidth: '200px',
                    overflow: 'hidden'
                  }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'block',
                        padding: '16px 20px',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'block',
                        padding: '16px 20px',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      profile settings
                    </Link>
                    <Link
                      href="/submit"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'block',
                        padding: '16px 20px',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      submit course
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'block',
                          padding: '16px 20px',
                          fontSize: '14px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: '#000',
                          textDecoration: 'none',
                          fontWeight: 600,
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s ease',
                          background: '#fafafa'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f0f0'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fafafa'
                        }}
                      >
                        ⚙ admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                        router.push('/')
                      }}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fafafa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                sign in
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="mobile-menu-button"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {showMobileMenu ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            display: 'none'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <Link
                href="/#modules"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                modules
              </Link>
              <Link
                href="/network"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                network
              </Link>
              <Link
                href="/about"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                about
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    profile
                  </Link>
                  <Link
                    href="/submit"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    submit course
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      style={{
                        fontSize: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 500,
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      ⚙ admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setShowMobileMenu(false)
                    }}
                    style={{
                      fontSize: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#fff',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 500,
                      padding: '12px 0',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true)
                    setShowMobileMenu(false)
                  }}
                  style={{
                    fontSize: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: '#000',
                    background: '#fff',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginTop: '8px'
                  }}
                >
                  sign in
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignupClick={() => {
          setShowLoginModal(false)
          setTimeout(() => setShowOnboarding(true), 100)
        }}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async (userData) => {
          try {
            const success = await signup(userData.email, userData.password, userData.name)
            if (success) {
              const userRes = await fetch(`/api/users?email=${encodeURIComponent(userData.email)}`)
              if (userRes.ok) {
                const { user } = await userRes.json()
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
            }
          } catch (err) {
            console.error('Error completing onboarding:', err)
          }
        }}
      />
    </>
  )
}
