'use client'

import { X } from 'lucide-react'

interface Submission {
  id: string
  status: 'approved' | 'pending' | 'rejected'
  title: string
  description: string
  createdAt?: string
}

interface SubmissionsModalProps {
  submissions: Submission[]
  isOpen: boolean
  onClose: () => void
  onClearRejected?: () => void
}

export function SubmissionsModal({ submissions, isOpen, onClose, onClearRejected }: SubmissionsModalProps) {
  if (!isOpen) return null

  const approved = submissions.filter(s => s.status === 'approved')
  const pending = submissions.filter(s => s.status === 'pending')
  const rejected = submissions.filter(s => s.status === 'rejected')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#000',
          borderRadius: '16px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          padding: '40px',
          border: '2px solid #333'
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
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#fff',
            marginBottom: '8px'
          }}>
            my course submissions
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Clear Rejected Button */}
        {rejected.length > 0 && onClearRejected && (
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={onClearRejected}
              style={{
                padding: '12px 24px',
                background: '#ff0000',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#cc0000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff0000'
              }}
            >
              clear {rejected.length} rejected submission{rejected.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* Approved Submissions */}
        {approved.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#00ff00',
              marginBottom: '16px'
            }}>
              ✓ approved ({approved.length})
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {approved.map((submission) => (
                <div key={submission.id} style={{
                  padding: '32px',
                  background: '#111',
                  borderRadius: '12px',
                  border: '2px solid #00ff00',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: '#fff'
                  }}>
                    {submission.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    lineHeight: 1.6
                  }}>
                    {submission.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Submissions */}
        {pending.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#ffff00',
              marginBottom: '16px'
            }}>
              ⏳ pending review ({pending.length})
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {pending.map((submission) => (
                <div key={submission.id} style={{
                  padding: '32px',
                  background: '#111',
                  borderRadius: '12px',
                  border: '2px solid #ffff00'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: '#fff'
                      }}>
                        {submission.title}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 0, 0.1)',
                      border: '1px solid #ffff00',
                      borderRadius: '6px',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      color: '#ffff00'
                    }}>
                      under review
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    lineHeight: 1.6
                  }}>
                    {submission.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Submissions */}
        {rejected.length > 0 && (
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#ff0000',
              marginBottom: '16px'
            }}>
              ✗ rejected ({rejected.length})
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {rejected.map((submission) => (
                <div key={submission.id} style={{
                  padding: '32px',
                  background: '#111',
                  borderRadius: '12px',
                  border: '2px solid #ff0000',
                  opacity: 0.7
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: '#fff'
                      }}>
                        {submission.title}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: '1px solid #ff0000',
                      borderRadius: '6px',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      color: '#ff0000'
                    }}>
                      not approved
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    lineHeight: 1.6
                  }}>
                    {submission.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {submissions.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: '#111',
            borderRadius: '12px',
            border: '2px dashed #333'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              no submissions yet
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              share your knowledge by submitting a course
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
