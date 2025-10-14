'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: number
  type: string
  content: string
  metadata: any
  read: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications()
    }
  }, [isOpen, user])

  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user) return

    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId
        })
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id
        })
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection': return '→'
      case 'like': return '↑'
      case 'comment': return '○'
      case 'mention': return '@'
      case 'group': return '●'
      default: return '•'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

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
          maxWidth: '600px',
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
              notifications
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#666'
            }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'all caught up'}
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

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '16px',
              background: '#fafafa',
              color: '#000',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fafafa'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.borderColor = '#e0e0e0'
            }}
          >
            mark all as read
          </button>
        )}

        {/* Notifications List */}
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            no notifications yet
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                style={{
                  padding: '14px 16px',
                  background: notification.read ? '#fafafa' : '#fff',
                  border: notification.read ? '2px solid #e0e0e0' : '2px solid #000',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  cursor: notification.read ? 'default' : 'pointer'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: notification.read ? '#e0e0e0' : '#000',
                    color: notification.read ? '#999' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: 1.4,
                      marginBottom: '4px',
                      color: notification.read ? '#666' : '#000',
                      fontWeight: notification.read ? 400 : 600
                    }}>
                      {notification.content}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      fontWeight: 600
                    }}>
                      {formatTimestamp(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#000',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
