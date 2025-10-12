'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Learner {
  userId: string
  userName: string
  bio: string | null
  interests: string[]
  moduleTitle: string
  isConnected: boolean
}

interface FindLearnersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FindLearnersModal({ isOpen, onClose }: FindLearnersModalProps) {
  const { user } = useAuth()
  const [learners, setLearners] = useState<Learner[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      loadLearners()
    }
  }, [isOpen, user])

  const loadLearners = async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/learners?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setLearners(data)
      }
    } catch (error) {
      console.error('Error loading learners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (learnerId: string) => {
    if (!user || connecting) return

    setConnecting(learnerId)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: user.id,
          followingId: learnerId
        })
      })

      if (res.ok) {
        setLearners(prev => prev.map(l =>
          l.userId === learnerId ? { ...l, isConnected: true } : l
        ))
      }
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setConnecting(null)
    }
  }

  const filteredLearners = learners.filter(learner =>
    learner.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learner.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learner.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              textTransform: 'lowercase',
              letterSpacing: '-1px',
              marginBottom: '6px'
            }}>
              find learners
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#666'
            }}>
              discover and connect with other learners
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              color: '#000'
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search by name, bio, or topic..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              background: '#fafafa'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Learners List */}
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            loading learners...
          </div>
        ) : filteredLearners.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            {searchQuery ? 'no learners found' : 'no other learners yet'}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {filteredLearners.map((learner) => (
              <div
                key={learner.userId}
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
                  gap: '12px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {learner.userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}>
                      {learner.userName}
                    </div>
                    {learner.bio && (
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '8px',
                        lineHeight: 1.4
                      }}>
                        {learner.bio}
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      fontWeight: 600
                    }}>
                      learning: {learner.moduleTitle}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {learner.interests.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    {learner.interests.slice(0, 3).map((interest) => (
                      <div
                        key={interest}
                        style={{
                          padding: '4px 10px',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#666'
                        }}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                )}

                {/* Connect Button */}
                <button
                  onClick={() => handleConnect(learner.userId)}
                  disabled={learner.isConnected || connecting === learner.userId}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: learner.isConnected || connecting === learner.userId ? '#e0e0e0' : '#000',
                    color: learner.isConnected || connecting === learner.userId ? '#999' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: learner.isConnected || connecting === learner.userId ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {learner.isConnected ? 'connected' : connecting === learner.userId ? 'connecting...' : 'connect'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
