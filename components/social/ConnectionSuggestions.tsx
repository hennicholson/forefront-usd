'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'

interface Suggestion {
  userId: string
  userName: string
  userProfileImage?: string
  bio: string
  sharedTopics: string[]
  mutualConnections: number
}

export function ConnectionSuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSuggestions()
    }
  }, [user])

  const loadSuggestions = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/connections/suggestions?userId=${user.id}&limit=3`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId: string) => {
    if (!user || connecting) return

    setConnecting(userId)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: user.id,
          followingId: userId
        })
      })

      if (res.ok) {
        // Remove from suggestions
        setSuggestions(prev => prev.filter(s => s.userId !== userId))
      }
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        border: '3px solid #000',
        borderRadius: '16px',
        padding: '24px',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#666', fontSize: '13px' }}>loading suggestions...</div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      border: '3px solid #000',
      borderRadius: '16px',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 900,
          textTransform: 'lowercase',
          letterSpacing: '-1px',
          marginBottom: '6px'
        }}>
          connect with learners
        </h3>
        <p style={{
          fontSize: '12px',
          color: '#666'
        }}>
          learning similar topics
        </p>
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: '#999',
          fontSize: '13px'
        }}>
          no suggestions at the moment
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.userId}
              style={{
                padding: '16px',
                background: '#fafafa',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <Avatar
                  src={suggestion.userProfileImage}
                  name={suggestion.userName}
                  size="md"
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}>
                    {suggestion.userName}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '6px'
                  }}>
                    {suggestion.bio}
                  </div>
                  {suggestion.mutualConnections > 0 && (
                    <div style={{
                      fontSize: '10px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600
                    }}>
                      {suggestion.mutualConnections} mutual
                    </div>
                  )}
                </div>
              </div>

              {/* Shared Topics */}
              {suggestion.sharedTopics.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '10px'
                }}>
                  {suggestion.sharedTopics.slice(0, 2).map((topic) => (
                    <div
                      key={topic}
                      style={{
                        padding: '4px 10px',
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#666'
                      }}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <button
                onClick={() => handleConnect(suggestion.userId)}
                disabled={connecting === suggestion.userId}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: connecting === suggestion.userId ? '#e0e0e0' : '#000',
                  color: connecting === suggestion.userId ? '#999' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: connecting === suggestion.userId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {connecting === suggestion.userId ? 'connecting...' : 'connect'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
