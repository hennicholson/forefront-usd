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
    modules: string[]
  }[]
}

export default function NetworkPage() {
  const { isAuthenticated } = useAuth()
  const [learningData, setLearningData] = useState<LearningNode[]>([])
  const [clusters, setClusters] = useState<TopicCluster[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [viewMode, setViewMode] = useState<'mindmap' | 'grid' | 'social'>('social')
  const [activityFeedRef, setActivityFeedRef] = useState<any>(null)

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
      <div className="section white" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
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
                  alignItems: 'start'
                }}>
                  <div data-activity-feed>
                    <ActivityFeed />
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
                <NetworkMindmap
                  clusters={clusters}
                  onUserClick={(userId) => {
                    setSelectedUserId(userId)
                    setShowProfileModal(true)
                  }}
                  selectedTopic={selectedTopic}
                />
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '32px'
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
    </main>
  )
}
