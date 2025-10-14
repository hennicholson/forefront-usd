'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'

interface Post {
  id: number
  userName: string
  userId: string
  userProfileImage?: string
  content: string
  type: 'text' | 'achievement' | 'link'
  topic?: string
  timestamp: string
  likes: number
  commentsCount: number
}

interface ActivityFeedProps {
  onUserClick?: (userId: string) => void
  selectedTopic?: string | null
  availableTopics?: string[]
}

export function ActivityFeed({ onUserClick, selectedTopic, availableTopics = [] }: ActivityFeedProps = {}) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedPostTopic, setSelectedPostTopic] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)

  useEffect(() => {
    loadPosts()
    loadUsers()
  }, [])

  useEffect(() => {
    loadPosts()
    // Auto-select the topic for new posts if a topic is selected
    if (selectedTopic) {
      setSelectedPostTopic(selectedTopic)
    } else {
      setSelectedPostTopic('')
    }
  }, [selectedTopic])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users/all')
      if (res.ok) {
        const users = await res.json()
        setAllUsers(users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const url = selectedTopic
        ? `/api/posts?limit=10&topic=${encodeURIComponent(selectedTopic)}`
        : '/api/posts?limit=10'
      const res = await fetch(url)
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
          type: 'text',
          topic: selectedPostTopic || null
        })
      })

      if (res.ok) {
        setNewPostContent('')
        setSelectedPostTopic('')
        setShowMentionSuggestions(false)
        loadPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart
    setNewPostContent(value)
    setCursorPosition(cursor)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursor)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const search = mentionMatch[1].toLowerCase()
      setMentionSearch(search)
      const filtered = allUsers.filter(u =>
        u.name.toLowerCase().includes(search)
      ).slice(0, 5)
      setMentionSuggestions(filtered)
      setShowMentionSuggestions(filtered.length > 0)
    } else {
      setShowMentionSuggestions(false)
    }
  }

  const insertMention = (userName: string) => {
    const textBeforeCursor = newPostContent.substring(0, cursorPosition)
    const textAfterCursor = newPostContent.substring(cursorPosition)
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '@')
    const newText = beforeMention + userName + ' ' + textAfterCursor
    setNewPostContent(newText)
    setShowMentionSuggestions(false)
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

  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      // Add clickable mention
      const username = match[1]
      parts.push(
        <span
          key={match.index}
          onClick={async (e) => {
            e.stopPropagation()
            // Find user by name and open their profile
            try {
              const res = await fetch(`/api/users/all`)
              if (res.ok) {
                const users = await res.json()
                const mentionedUser = users.find((u: any) =>
                  u.name.toLowerCase() === username.toLowerCase()
                )
                if (mentionedUser && onUserClick) {
                  onUserClick(mentionedUser.id)
                }
              }
            } catch (error) {
              console.error('Error finding user:', error)
            }
          }}
          style={{
            color: '#0066cc',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          @{username}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
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
          borderRadius: '12px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <Avatar
              src={user.profileImage}
              name={user.name}
              size="md"
            />
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={newPostContent}
                onChange={handleTextareaChange}
                placeholder="share your learning progress or ask a question... (type @ to mention someone)"
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
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  // Delay hiding suggestions to allow click
                  setTimeout(() => setShowMentionSuggestions(false), 200)
                }}
              />
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {mentionSuggestions.map((suggestedUser) => (
                    <div
                      key={suggestedUser.id}
                      onClick={() => insertMention(suggestedUser.name)}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <Avatar
                        src={suggestedUser.profileImage}
                        name={suggestedUser.name}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>
                          {suggestedUser.name}
                        </div>
                        {suggestedUser.headline && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {suggestedUser.headline}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {availableTopics.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#666'
              }}>
                post to topic (optional):
              </label>
              <select
                value={selectedPostTopic}
                onChange={(e) => setSelectedPostTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#000',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#000'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
              >
                <option value="">all topics</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{
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
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Avatar
                    src={post.userProfileImage}
                    name={post.userName}
                    size="sm"
                  />
                  <div>
                    <div
                      onClick={() => onUserClick?.(post.userId)}
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        marginBottom: '2px',
                        cursor: onUserClick ? 'pointer' : 'default',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (onUserClick) e.currentTarget.style.color = '#666'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#000'
                      }}
                    >
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {post.topic && (
                    <div style={{
                      padding: '4px 10px',
                      background: '#f0f0f0',
                      color: '#000',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'lowercase',
                      letterSpacing: '0.3px'
                    }}>
                      {post.topic}
                    </div>
                  )}
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
              </div>

              {/* Post Content */}
              <div style={{
                fontSize: '14px',
                lineHeight: 1.5,
                marginBottom: '12px',
                color: '#000'
              }}>
                {renderContentWithMentions(post.content)}
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
