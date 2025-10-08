'use client'
import { useEffect, useState, use } from 'react'
import { WherebyEmbed } from '@/components/meeting/WherebyEmbed'

interface UserData {
  name: string
  meetingLink: string
}

export default function MeetingPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch(`/api/users/${resolvedParams.userId}`)
        if (res.ok) {
          const data = await res.json()
          setUserData({
            name: data.name,
            meetingLink: data.meetingLink || 'https://skinny-studio.whereby.com/forefront54fe1520-5c6b-46bd-b624-31950bf609b9'
          })
        } else {
          setError('User not found')
        }
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Failed to load meeting room')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [resolvedParams.userId])

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 700,
        textTransform: 'lowercase',
        letterSpacing: '-0.5px'
      }}>
        loading meeting room...
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        gap: '20px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 900,
          textTransform: 'lowercase',
          letterSpacing: '-1px'
        }}>
          {error || 'meeting room not found'}
        </div>
        <button
          onClick={() => window.close()}
          style={{
            padding: '12px 24px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          close window
        </button>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#000'
    }}>
      {/* Custom Header */}
      <div style={{
        background: '#000',
        borderBottom: '2px solid #fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff',
          textTransform: 'lowercase',
          letterSpacing: '-0.5px'
        }}>
          [forefront] meeting with {userData.name}
        </div>
        <button
          onClick={() => window.close()}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#fff'
          }}
        >
          leave meeting
        </button>
      </div>

      {/* Whereby Embed */}
      <div style={{ flex: 1, position: 'relative' }}>
        <WherebyEmbed
          roomUrl={userData.meetingLink}
          displayName={userData.name}
        />
      </div>

      {/* Custom Footer */}
      <div style={{
        background: '#000',
        borderTop: '2px solid #fff',
        padding: '12px 24px',
        textAlign: 'center',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1.5px'
        }}>
          powered by whereby · forefront learning network
        </div>
      </div>
    </div>
  )
}
