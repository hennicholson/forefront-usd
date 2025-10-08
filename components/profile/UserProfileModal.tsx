'use client'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string | null
  interests: string[]
  meetingLink: string | null
  profileImage: string | null
  socialLinks: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  availability: string | null
}

interface UserProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            fontWeight: 700,
            fontFamily: 'inherit',
            zIndex: 10
          }}
        >
          ×
        </button>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            loading profile...
          </div>
        ) : profile ? (
          <div style={{ padding: '40px' }}>
            {/* Profile Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 900,
                textTransform: 'lowercase',
                letterSpacing: '-1px',
                marginBottom: '12px',
                color: '#000'
              }}>
                {profile.name}
              </h2>
              {profile.bio && (
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}>
                  {profile.bio}
                </p>
              )}
              {profile.interests && profile.interests.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {profile.interests.map((interest, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#000',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  connect
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 16px',
                        background: '#fafafa',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000'
                        e.currentTarget.style.background = '#000'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.background = '#fafafa'
                        e.currentTarget.style.color = '#000'
                      }}
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 16px',
                        background: '#fafafa',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000'
                        e.currentTarget.style.background = '#000'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.background = '#fafafa'
                        e.currentTarget.style.color = '#000'
                      }}
                    >
                      Twitter
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 16px',
                        background: '#fafafa',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000'
                        e.currentTarget.style.background = '#000'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.background = '#fafafa'
                        e.currentTarget.style.color = '#000'
                      }}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            {profile.availability && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  availability
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: 1.6
                }}>
                  {profile.availability}
                </p>
              </div>
            )}

            {/* Meeting Room */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '12px',
                color: '#000'
              }}>
                meeting room
              </h3>
              <button
                onClick={() => {
                  window.open(
                    `/meeting/${profile.id}`,
                    'forefront-meeting',
                    'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no'
                  )
                }}
                style={{
                  padding: '14px 24px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                join meeting room →
              </button>
              <p style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '12px',
                lineHeight: 1.4
              }}>
                opens in new window with forefront branding · camera & microphone required
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            profile not found
          </div>
        )}
      </div>
    </div>
  )
}
