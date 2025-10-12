'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Post {
  id: number
  userName: string
  userId: string
  content: string
  type: 'text' | 'achievement' | 'link'
  timestamp: string
  likes: number
  commentsCount: number
}

export function ActivityFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts?limit=10')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async () => {
    if (!newPostContent.trim() || !user || posting) return

    setPosting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: newPostContent,
          type: 'text'
        })
      })

      if (res.ok) {
        setNewPostContent('')
        loadPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId: number) => {
    if (!user) return

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          postId,
          type: 'like'
        })
      })

      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        border: '3px solid #000',
        borderRadius: '16px',
        padding: '32px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>Loading activity...</div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      border: '3px solid #000',
      borderRadius: '16px',
      padding: '32px',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 900,
          textTransform: 'lowercase',
          letterSpacing: '-1px',
          marginBottom: '6px'
        }}>
          activity feed
        </h2>
        <p style={{
          fontSize: '13px',
          color: '#666'
        }}>
          see what learners are sharing
        </p>
      </div>

      {/* New Post Input */}
      {user && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#fafafa',
          border: '2px solid #e0e0e0',
          borderRadius: '12px'
        }}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="share your learning progress or ask a question..."
            style={{
              width: '100%',
              minHeight: '70px',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: '#fff',
              color: '#000',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
          <div style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handlePost}
              disabled={!newPostContent.trim() || posting}
              style={{
                padding: '10px 20px',
                background: newPostContent.trim() && !posting ? '#000' : '#e0e0e0',
                color: newPostContent.trim() && !posting ? '#fff' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: newPostContent.trim() && !posting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {posting ? 'posting...' : 'post'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {posts.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            no posts yet. be the first to share something!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                padding: '20px',
                background: '#fafafa',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Post Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {post.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}>
                      {post.userName}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999'
                    }}>
                      {post.timestamp}
                    </div>
                  </div>
                </div>
                {post.type === 'achievement' && (
                  <div style={{
                    padding: '4px 10px',
                    background: '#000',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    achievement
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div style={{
                fontSize: '14px',
                lineHeight: 1.5,
                marginBottom: '12px',
                color: '#000'
              }}>
                {post.content}
              </div>

              {/* Post Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000'
                    e.currentTarget.style.background = '#fafafa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>↑</span> {post.likes}
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000'
                    e.currentTarget.style.background = '#fafafa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>○</span> {post.commentsCount}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <button
          onClick={loadPosts}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            background: '#fafafa',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#666',
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
            e.currentTarget.style.color = '#666'
            e.currentTarget.style.borderColor = '#e0e0e0'
          }}
        >
          load more posts
        </button>
      )}
    </div>
  )
}
