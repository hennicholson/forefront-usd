'use client'

import { useState } from 'react'

interface Session {
  id: number
  title: string
  lastMessageAt: Date | string
  messageCount: number
  isPinned: boolean
}

interface SessionCardProps {
  session: Session
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (newTitle: string) => void
}

export function SessionCard({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(session.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== session.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete()
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  return (
    <div
      onClick={() => !isEditing && onSelect()}
      style={{
        padding: '12px',
        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(39, 39, 42, 0.3)',
        border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(63, 63, 70, 0.5)'}`,
        borderRadius: '10px',
        cursor: isEditing ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isEditing) {
          e.currentTarget.style.background = 'rgba(39, 39, 42, 0.5)'
          e.currentTarget.style.borderColor = 'rgba(63, 63, 70, 0.8)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isEditing) {
          e.currentTarget.style.background = 'rgba(39, 39, 42, 0.3)'
          e.currentTarget.style.borderColor = 'rgba(63, 63, 70, 0.5)'
        }
      }}
    >
      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') {
              setEditTitle(session.title)
              setIsEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          autoFocus
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '6px 8px',
            color: '#e4e4e7',
            fontSize: '14px',
            fontWeight: 600,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#e4e4e7',
            marginBottom: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Core Sans A 65 Bold, sans-serif',
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          {session.title}
        </div>
      )}

      {/* Metadata */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#a1a1aa',
        }}
      >
        <span>
          {session.messageCount || 0} message{session.messageCount === 1 ? '' : 's'}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: showDeleteConfirm ? '#ef4444' : '#71717a',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '2px',
              lineHeight: 1,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = showDeleteConfirm ? '#ef4444' : '#71717a'
            }}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete session'}
          >
            {showDeleteConfirm ? '⚠️' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  )
}
