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
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(26, 26, 26, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid #333',
        borderRadius: '50px',
        padding: '12px 30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: 'calc(100vw - 40px)',
        width: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '40px'
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
            gap: '30px',
            alignItems: 'center'
          }} className="desktop-nav">
            <Link
              href="/modules"
              style={{
                fontSize: '0.95rem',
                color: '#e0e0e0',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0'
              }}
            >
              Modules
            </Link>
            <Link
              href="/network"
              style={{
                fontSize: '0.95rem',
                color: '#e0e0e0',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0'
              }}
            >
              Network
            </Link>
            <Link
              href="/about"
              style={{
                fontSize: '0.95rem',
                color: '#e0e0e0',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0'
              }}
            >
              About
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
                  fontSize: '0.9rem',
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Sign Up
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
        <div className={`mobile-menu ${showMobileMenu ? 'mobile-menu-active' : ''}`} style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '0',
            right: '0',
            background: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid #333',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <Link
                href="/modules"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  color: '#e0e0e0',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid #333',
                  transition: 'color 0.3s ease'
                }}
              >
                Modules
              </Link>
              <Link
                href="/network"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  color: '#e0e0e0',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid #333',
                  transition: 'color 0.3s ease'
                }}
              >
                Network
              </Link>
              <Link
                href="/about"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  fontSize: '16px',
                  color: '#e0e0e0',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '12px 0',
                  borderBottom: '1px solid #333',
                  transition: 'color 0.3s ease'
                }}
              >
                About
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid #333',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid #333',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/submit"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      fontSize: '16px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      padding: '12px 0',
                      borderBottom: '1px solid #333',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    Submit Course
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      style={{
                        fontSize: '16px',
                        color: '#e0e0e0',
                        textDecoration: 'none',
                        fontWeight: 500,
                        padding: '12px 0',
                        borderBottom: '1px solid #333',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      ⚙ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setShowMobileMenu(false)
                    }}
                    style={{
                      fontSize: '16px',
                      color: '#e0e0e0',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 500,
                      padding: '12px 0',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    Sign Out
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
                    color: '#000',
                    background: '#fff',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '25px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginTop: '8px',
                    width: '100%',
                    transition: 'background 0.3s ease'
                  }}
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
      </header>

      <style jsx>{`
        .mobile-menu {
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          visibility: hidden;
        }

        .mobile-menu-active {
          opacity: 1 !important;
          transform: translateY(0) !important;
          pointer-events: auto !important;
          visibility: visible !important;
        }

        @media (max-width: 768px) {
          header {
            top: 15px !important;
            padding: 10px 20px !important;
            width: calc(100% - 30px) !important;
            max-width: none !important;
          }
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .mobile-menu {
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
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
