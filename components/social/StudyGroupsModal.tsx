'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface StudyGroup {
  id: number
  name: string
  description: string | null
  topic: string
  createdBy: string
  createdAt: string
  memberCount: number
  isMember: boolean
  isCreator: boolean
}

interface StudyGroupsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StudyGroupsModal({ isOpen, onClose }: StudyGroupsModalProps) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joining, setJoining] = useState<number | null>(null)

  // Create form state
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupTopic, setNewGroupTopic] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadGroups()
    }
  }, [isOpen, user])

  const loadGroups = async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/study-groups?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (groupId: number) => {
    if (!user || joining) return

    setJoining(groupId)
    try {
      const res = await fetch('/api/study-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          userId: user.id
        })
      })

      if (res.ok) {
        setGroups(prev => prev.map(g =>
          g.id === groupId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g
        ))
      }
    } catch (error) {
      console.error('Error joining group:', error)
    } finally {
      setJoining(null)
    }
  }

  const handleCreate = async () => {
    if (!user || !newGroupName.trim() || !newGroupTopic.trim() || creating) return

    setCreating(true)
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          topic: newGroupTopic,
          createdBy: user.id
        })
      })

      if (res.ok) {
        setNewGroupName('')
        setNewGroupDescription('')
        setNewGroupTopic('')
        setShowCreateForm(false)
        loadGroups()
      }
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setCreating(false)
    }
  }

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
          maxWidth: '700px',
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
              study groups
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#666'
            }}>
              collaborate and learn together
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

        {/* Create Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            create new group
          </button>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div style={{
            padding: '20px',
            background: '#fafafa',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'lowercase'
            }}>
              create study group
            </div>

            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="group name"
              style={{
                width: '100%',
                padding: '10px 12px',
                marginBottom: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#fff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            />

            <input
              type="text"
              value={newGroupTopic}
              onChange={(e) => setNewGroupTopic(e.target.value)}
              placeholder="topic (e.g., machine learning)"
              style={{
                width: '100%',
                padding: '10px 12px',
                marginBottom: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#fff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            />

            <textarea
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="description (optional)"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px 12px',
                marginBottom: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                background: '#fff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCreate}
                disabled={!newGroupName.trim() || !newGroupTopic.trim() || creating}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: newGroupName.trim() && newGroupTopic.trim() && !creating ? '#000' : '#e0e0e0',
                  color: newGroupName.trim() && newGroupTopic.trim() && !creating ? '#fff' : '#999',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: newGroupName.trim() && newGroupTopic.trim() && !creating ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                {creating ? 'creating...' : 'create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewGroupName('')
                  setNewGroupDescription('')
                  setNewGroupTopic('')
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {/* Groups List */}
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            no study groups yet. create the first one!
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {groups.map((group) => (
              <div
                key={group.id}
                style={{
                  padding: '18px',
                  background: '#fafafa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      marginBottom: '4px',
                      textTransform: 'lowercase'
                    }}>
                      {group.name}
                    </div>
                    <div style={{
                      padding: '3px 8px',
                      background: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#666',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {group.topic}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                  }}>
                    {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {group.description && (
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '12px',
                    lineHeight: 1.4
                  }}>
                    {group.description}
                  </div>
                )}

                {/* Join Button */}
                {!group.isMember ? (
                  <button
                    onClick={() => handleJoin(group.id)}
                    disabled={joining === group.id}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: joining === group.id ? '#e0e0e0' : '#000',
                      color: joining === group.id ? '#999' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: joining === group.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {joining === group.id ? 'joining...' : 'join group'}
                  </button>
                ) : (
                  <div style={{
                    width: '100%',
                    padding: '10px',
                    background: '#e0e0e0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}>
                    {group.isCreator ? 'creator' : 'member'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
