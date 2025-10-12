'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FindLearnersModal } from './FindLearnersModal'
import { StudyGroupsModal } from './StudyGroupsModal'
import { NotificationsPanel } from './NotificationsPanel'

interface Stats {
  connections: number
  posts: number
  interactions: number
}

interface QuickActionsProps {
  onStartDiscussion?: () => void
}

export function QuickActions({ onStartDiscussion }: QuickActionsProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ connections: 0, posts: 0, interactions: 0 })
  const [loading, setLoading] = useState(true)
  const [showFindLearners, setShowFindLearners] = useState(false)
  const [showStudyGroups, setShowStudyGroups] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/stats?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    {
      icon: '↑',
      title: 'start discussion',
      description: 'share insights',
      action: 'post',
      onClick: () => onStartDiscussion?.()
    },
    {
      icon: '→',
      title: 'find learners',
      description: 'build connections',
      action: 'connect',
      onClick: () => setShowFindLearners(true)
    },
    {
      icon: '○',
      title: 'study groups',
      description: 'join or create',
      action: 'groups',
      onClick: () => setShowStudyGroups(true)
    },
    {
      icon: '●',
      title: 'notifications',
      description: 'stay updated',
      action: 'notifications',
      onClick: () => setShowNotifications(true)
    }
  ]

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
          quick actions
        </h3>
        <p style={{
          fontSize: '12px',
          color: '#666'
        }}>
          what would you like to do?
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={action.onClick}
            style={{
              position: 'relative',
              padding: '16px',
              background: '#fafafa',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000'
              e.currentTarget.style.borderColor = '#000'
              e.currentTarget.style.transform = 'scale(1.02)'
              const title = e.currentTarget.querySelector('[data-title]') as HTMLElement
              const desc = e.currentTarget.querySelector('[data-desc]') as HTMLElement
              if (title) title.style.color = '#fff'
              if (desc) desc.style.color = '#999'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fafafa'
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.transform = 'scale(1)'
              const title = e.currentTarget.querySelector('[data-title]') as HTMLElement
              const desc = e.currentTarget.querySelector('[data-desc]') as HTMLElement
              if (title) title.style.color = '#000'
              if (desc) desc.style.color = '#666'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
              fontWeight: 900
            }}>
              {action.icon}
            </div>
            <div
              data-title
              style={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'lowercase',
                marginBottom: '4px',
                color: '#000',
                transition: 'color 0.2s ease'
              }}
            >
              {action.title}
            </div>
            <div
              data-desc
              style={{
                fontSize: '11px',
                color: '#666',
                transition: 'color 0.2s ease'
              }}
            >
              {action.description}
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        padding: '16px',
        background: '#fafafa',
        border: '2px solid #e0e0e0',
        borderRadius: '12px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          your network stats
        </div>
        {loading ? (
          <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '8px' }}>
            loading...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 900,
                marginBottom: '4px'
              }}>
                {stats.connections}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}>
                connections
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 900,
                marginBottom: '4px'
              }}>
                {stats.posts}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}>
                posts
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 900,
                marginBottom: '4px'
              }}>
                {stats.interactions}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}>
                interactions
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FindLearnersModal isOpen={showFindLearners} onClose={() => setShowFindLearners(false)} />
      <StudyGroupsModal isOpen={showStudyGroups} onClose={() => setShowStudyGroups(false)} />
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  )
}
