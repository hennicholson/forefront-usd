'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { UserProfileModal } from '@/components/profile/UserProfileModal'
import { NetworkMindmap } from '@/components/network/NetworkMindmap'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { ActivityFeed } from '@/components/social/ActivityFeed'
import { ConnectionSuggestions } from '@/components/social/ConnectionSuggestions'
import { QuickActions } from '@/components/social/QuickActions'
import { Avatar } from '@/components/common/Avatar'
import { LoginModal } from '@/components/auth/LoginModal'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useRouter } from 'next/navigation'

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(10px, -20px) scale(1.05); }
      50% { transform: translate(-5px, -10px) scale(0.95); }
      75% { transform: translate(-15px, 5px) scale(1.02); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `
  if (!document.querySelector('style[data-network-animations]')) {
    style.setAttribute('data-network-animations', 'true')
    document.head.appendChild(style)
  }
}

interface LearningNode {
  id: number
  userId: string
  userName: string
  userBio: string | null
  userInterests: string[]
  userProfileImage?: string | null
  moduleId: string
  moduleTitle: string
  moduleSlug: string
  skillLevel: string
  status: string
  startedAt: string
}

interface TopicCluster {
  topic: string
  users: {
    userId: string
    userName: string
    userBio: string | null
    userProfileImage?: string | null
    modules: string[]
  }[]
}

export default function NetworkPage() {
  const { isAuthenticated, signup } = useAuth()
  const router = useRouter()
  const [learningData, setLearningData] = useState<LearningNode[]>([])
  const [clusters, setClusters] = useState<TopicCluster[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [viewMode, setViewMode] = useState<'mindmap' | 'grid' | 'social'>('social')
  const [activityFeedRef, setActivityFeedRef] = useState<any>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleStartDiscussion = () => {
    if (viewMode !== 'social') {
      setViewMode('social')
    }
    // Scroll to activity feed
    setTimeout(() => {
      const feedElement = document.querySelector('[data-activity-feed]')
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Focus the textarea
        const textarea = feedElement.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }
    }, 100)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    loadNetwork()
  }, [])

  const loadNetwork = async () => {
    try {
      const res = await fetch('/api/learning')
      if (res.ok) {
        const data: LearningNode[] = await res.json()
        setLearningData(data)

        // Group by module/topic
        const topicMap = new Map<string, TopicCluster>()

        data.forEach(node => {
          if (!topicMap.has(node.moduleTitle)) {
            topicMap.set(node.moduleTitle, {
              topic: node.moduleTitle,
              users: []
            })
          }

          const cluster = topicMap.get(node.moduleTitle)!
          const existingUser = cluster.users.find(u => u.userId === node.userId)

          if (existingUser) {
            if (!existingUser.modules.includes(node.moduleTitle)) {
              existingUser.modules.push(node.moduleTitle)
            }
          } else {
            cluster.users.push({
              userId: node.userId,
              userName: node.userName,
              userBio: node.userBio,
              userProfileImage: node.userProfileImage,
              modules: [node.moduleTitle]
            })
          }
        })

        setClusters(Array.from(topicMap.values()))
      }
    } catch (err) {
      console.error('Error loading network:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTopicColor = (index: number) => {
    const colors = ['#000', '#333', '#666', '#999']
    return colors[index % colors.length]
  }

  // If not authenticated, show blurred page with login prompt
  if (!isAuthenticated) {
    return (
      <main className="bg-black text-white min-h-screen" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Blurred background content */}
        <div style={{
          filter: 'blur(10px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div className="section" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'auto' }}>
            <div className="content">
              <div style={{ marginBottom: '40px' }}>
                <div className="title-large" style={{ marginBottom: '16px' }}>discover learners</div>
                <div className="subtitle" style={{ color: '#666' }}>
                  connect with students learning ai
                </div>
              </div>
            </div>
          </div>
          <div className="section white" style={{ paddingTop: '24px', paddingBottom: '60px', minHeight: '500px' }}>
            <div className="content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card" style={{ padding: '24px', minHeight: '200px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e0e0', marginBottom: '16px' }} />
                    <div style={{ width: '80%', height: '16px', background: '#e0e0e0', marginBottom: '8px', borderRadius: '4px' }} />
                    <div style={{ width: '60%', height: '12px', background: '#f0f0f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Login/Signup overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maxWidth: '500px',
            width: '100%',
            padding: '48px',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              textTransform: 'lowercase',
              letterSpacing: '-1px',
              marginBottom: '16px',
              color: '#000'
            }}>
              join the network
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              sign in or create an account to connect with other learners, explore the community, and join discussions
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  cursor: 'pointer'
                }}
              >
                sign in
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  cursor: 'pointer'
                }}
              >
                sign up
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            learning network
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '20px'
          }}>
            discover learners
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            maxWidth: '600px'
          }}>
            find others learning the same topics as you → connect through shared knowledge
          </p>
        </div>
      </div>

      {/* Interactive Mindmap */}
      <div className="section white" style={{ paddingTop: '24px', paddingBottom: '60px', minHeight: 'auto' }}>
        <div className="content">
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
              Loading network...
            </div>
          ) : clusters.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                No learners yet
              </div>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: '32px' }}>
                Start learning a module to join the network
              </p>
              <Link href="/#modules">
                <button className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  explore modules →
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* View Toggle & Topic Filter */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e0e0e0',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {/* Topic Filter */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    style={{
                      padding: '12px 24px',
                      background: selectedTopic === null ? '#000' : '#fff',
                      color: selectedTopic === null ? '#fff' : '#000',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    all topics ({learningData.length})
                  </button>
                  {clusters.map((cluster) => (
                    <button
                      key={cluster.topic}
                      onClick={() => setSelectedTopic(cluster.topic)}
                      style={{
                        padding: '12px 24px',
                        background: selectedTopic === cluster.topic ? '#000' : '#fff',
                        color: selectedTopic === cluster.topic ? '#fff' : '#666',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        textTransform: 'lowercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                    >
                      {cluster.topic} ({cluster.users.length})
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  background: '#f5f5f5',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0'
                }}>
                  <button
                    onClick={() => setViewMode('social')}
                    style={{
                      padding: '10px 20px',
                      background: viewMode === 'social' ? '#000' : 'transparent',
                      color: viewMode === 'social' ? '#fff' : '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    social
                  </button>
                  <button
                    onClick={() => setViewMode('mindmap')}
                    style={{
                      padding: '10px 20px',
                      background: viewMode === 'mindmap' ? '#000' : 'transparent',
                      color: viewMode === 'mindmap' ? '#fff' : '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    mindmap
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '10px 20px',
                      background: viewMode === 'grid' ? '#000' : 'transparent',
                      color: viewMode === 'grid' ? '#fff' : '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    grid
                  </button>
                </div>
              </div>

              {/* Social View */}
              {viewMode === 'social' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
                  gap: '24px',
                  alignItems: 'start',
                  marginTop: '24px'
                }}>
                  <div data-activity-feed>
                    <ActivityFeed
                      onUserClick={(userId) => {
                        setSelectedUserId(userId)
                        setShowProfileModal(true)
                      }}
                      selectedTopic={selectedTopic}
                      availableTopics={clusters.map(c => c.topic)}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'sticky',
                    top: '24px'
                  }}>
                    <QuickActions onStartDiscussion={handleStartDiscussion} />
                    <ConnectionSuggestions />
                  </div>
                </div>
              )}

              {/* Mindmap View */}
              {viewMode === 'mindmap' && (
                <div style={{ marginTop: '24px' }}>
                  <NetworkMindmap
                    clusters={clusters}
                    onUserClick={(userId) => {
                      setSelectedUserId(userId)
                      setShowProfileModal(true)
                    }}
                    selectedTopic={selectedTopic}
                  />
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '32px',
                  marginTop: '24px'
                }}>
                  {(selectedTopic
                    ? clusters.filter(c => c.topic === selectedTopic)
                    : clusters
                  ).map((cluster, clusterIndex) => (
                    <div
                      key={cluster.topic}
                      style={{
                        background: '#fafafa',
                        border: '3px solid #000',
                        borderRadius: '16px',
                        padding: '24px',
                        position: 'relative'
                      }}
                    >
                      {/* Topic Header */}
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        marginBottom: '20px',
                        textTransform: 'lowercase',
                        color: '#000',
                        letterSpacing: '-0.5px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid #e0e0e0'
                      }}>
                        {cluster.topic}
                      </div>

                      {/* User Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cluster.users.map((user) => (
                          <div
                            key={user.userId}
                            onClick={() => {
                              setSelectedUserId(user.userId)
                              setShowProfileModal(true)
                            }}
                            style={{
                              background: '#fff',
                              border: '2px solid #e0e0e0',
                              borderRadius: '12px',
                              padding: '16px',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#000'
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e0e0e0'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <Avatar
                                src={user.userProfileImage}
                                name={user.userName}
                                size="md"
                                style={{ flexShrink: 0 }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  marginBottom: '4px',
                                  color: '#000'
                                }}>
                                  {user.userName}
                                </div>
                                {user.userBio && (
                                  <div style={{
                                    fontSize: '13px',
                                    color: '#666',
                                    marginBottom: '8px',
                                    lineHeight: 1.4
                                  }}>
                                    {user.userBio}
                                  </div>
                                )}
                                {user.modules.length > 1 && (
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600
                                  }}>
                                    +{user.modules.length - 1} more topic{user.modules.length > 2 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cluster Stats */}
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '2px solid #e0e0e0',
                        fontSize: '12px',
                        color: '#999',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 600
                      }}>
                        {cluster.users.length} learner{cluster.users.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false)
            setSelectedUserId(null)
          }}
        />
      )}

      {/* AI Chat Widget */}
      <ChatWidget />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignupClick={() => {
          setShowLoginModal(false)
          setTimeout(() => setShowOnboarding(true), 100)
        }}
      />

      {/* Onboarding Flow */}
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
    </main>
  )
}
