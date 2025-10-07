'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SubmitPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    skillLevel: 'beginner',
    estimatedDuration: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Store submission in localStorage (in production this would go to a backend/database)
    const submissions = JSON.parse(localStorage.getItem('courseSubmissions') || '[]')
    const newSubmission = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: Date.now(),
      status: 'pending'
    }
    submissions.push(newSubmission)
    localStorage.setItem('courseSubmissions', JSON.stringify(submissions))

    setSubmitted(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  if (submitted) {
    return (
      <main className="bg-black text-white min-h-screen">
        <div className="section" style={{ paddingTop: '100px' }}>
          <div className="content center-text">
            <div style={{
              fontSize: 'clamp(48px, 10vw, 120px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-4px',
              lineHeight: 0.9,
              marginBottom: '30px'
            }}>
              submitted!
            </div>
            <p style={{
              fontSize: 'clamp(18px, 3vw, 28px)',
              color: '#999',
              marginBottom: '40px'
            }}>
              your course has been submitted for review. we&apos;ll get back to you soon!
            </p>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: '#666'
            }}>
              redirecting to dashboard...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <div className="content">
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '20px',
            fontWeight: 700
          }}>
            contribute to the community
          </div>
          <h1 className="title-large" style={{ textAlign: 'left', marginBottom: '20px' }}>
            submit a course
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#999',
            maxWidth: '800px'
          }}>
            share your ai knowledge with fellow students. submit your course content as raw text,
            and our team will transform it into a structured learning module.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="section white">
        <div className="content">
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
              {/* Course Title */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  fontWeight: 700,
                  color: '#333'
                }}>
                  course title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., prompt engineering for developers"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#000' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  fontWeight: 700,
                  color: '#333'
                }}>
                  short description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="a brief overview of what students will learn (1-2 sentences)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#000' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0' }}
                />
              </div>

              {/* Course Content */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '12px',
                  fontWeight: 700,
                  color: '#333'
                }}>
                  course content *
                </label>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                  lineHeight: 1.6
                }}>
                  write your course content in raw text. include all the ai knowledge, tips, tools,
                  examples, and insights you want to share. don&apos;t worry about formatting—we&apos;ll
                  structure it into slides and sections.
                </div>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={`example format:

introduction to ai tool x
→ what it does and why it matters
→ key features and capabilities

how to use it
→ step 1: sign up and get api key
→ step 2: install the package
→ code example: import tool...

best practices
→ tip 1: always test prompts
→ tip 2: iterate on results

real-world applications
→ use case 1: content generation
→ use case 2: data analysis`}
                  rows={20}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    lineHeight: 1.6
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#000' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0' }}
                />
              </div>

              {/* Meta Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Skill Level */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    fontWeight: 700,
                    color: '#333'
                  }}>
                    skill level *
                  </label>
                  <select
                    required
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#000' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0' }}
                  >
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </select>
                </div>

                {/* Estimated Duration */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    fontWeight: 700,
                    color: '#333'
                  }}>
                    estimated duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="e.g., 30 minutes"
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#000' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0' }}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div style={{
                padding: '24px',
                background: '#fafafa',
                borderRadius: '12px',
                marginBottom: '32px',
                borderLeft: '4px solid #000'
              }}>
                <div style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '8px',
                  fontWeight: 700,
                  color: '#000'
                }}>
                  what happens next?
                </div>
                <ul style={{
                  listStyle: 'none',
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: 1.8
                }}>
                  <li>→ we review your submission for quality and relevance</li>
                  <li>→ we transform your content into structured slides</li>
                  <li>→ we create a video introduction if needed</li>
                  <li>→ your module goes live and you get credited as the instructor</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  submit course →
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
