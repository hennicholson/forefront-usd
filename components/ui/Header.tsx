'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
        padding: '20px 40px'
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

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link
              href="/#modules"
              style={{
                fontSize: 'clamp(13px, 2vw, 14px)',
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
                fontSize: 'clamp(13px, 2vw, 14px)',
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
                fontSize: 'clamp(13px, 2vw, 14px)',
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
                    fontSize: 'clamp(13px, 2vw, 14px)',
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
                  fontSize: 'clamp(13px, 2vw, 14px)',
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
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}
