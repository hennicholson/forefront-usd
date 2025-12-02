'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { user, isAuthenticated, logout, signup } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 998
            }}
          />
        )}
      </AnimatePresence>

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
              href="/chat"
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
              Chat
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
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button
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
                    e.currentTarget.style.background = showUserMenu ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  [{user?.name}]
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'rgba(26, 26, 26, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        minWidth: '220px',
                        overflow: 'hidden'
                      }}
                    >
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#e0e0e0'
                    }}
                  >
                    dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#e0e0e0'
                    }}
                  >
                    profile settings
                  </Link>
                  <Link
                    href="/submit"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#e0e0e0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#e0e0e0'
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
                        padding: '14px 20px',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#e0e0e0',
                        textDecoration: 'none',
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease',
                        background: 'rgba(255, 255, 255, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = '#e0e0e0'
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
                      padding: '14px 20px',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#e0e0e0',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#e0e0e0'
                    }}
                  >
                    sign out
                  </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            borderRadius: '20px',
            padding: '20px',
            opacity: showMobileMenu ? 1 : 0,
            transform: showMobileMenu ? 'translateY(0)' : 'translateY(-10px)',
            pointerEvents: showMobileMenu ? 'auto' : 'none',
            visibility: showMobileMenu ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            overflow: 'hidden',
            zIndex: 1000
          }}>
            {/* Liquid Glass Layers for Mobile Menu */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              backdropFilter: 'blur(20px) saturate(120%) brightness(1.15)',
              WebkitBackdropFilter: 'blur(20px) saturate(120%) brightness(1.15)',
              borderRadius: 'inherit'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 'inherit'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              boxShadow: 'inset 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
              borderRadius: 'inherit',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }} />
            <div style={{
              position: 'relative',
              zIndex: 3,
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
                href="/chat"
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
                Chat
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
        @media (max-width: 1024px) {
          header {
            padding: 12px 24px !important;
          }
          .desktop-nav {
            gap: 20px !important;
          }
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
