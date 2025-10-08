'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CourseSubmission {
  id: string
  title: string
  description: string
  content: string
  skillLevel: string
  estimatedDuration: string
  submittedAt: number
  status: string
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<CourseSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<CourseSubmission | null>(null)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showGeneratedModule, setShowGeneratedModule] = useState(false)
  const [generatedModule, setGeneratedModule] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)

    // Load submissions
    const stored = localStorage.getItem('courseSubmissions')
    if (stored) {
      setSubmissions(JSON.parse(stored))
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const handleGeneratePrompt = (submission: CourseSubmission) => {
    setSelectedSubmission(submission)
    setShowPromptModal(true)
  }

  const generateClaudePrompt = (submission: CourseSubmission) => {
    return `I need you to transform this student course submission into a structured learning module for our AI education platform.

STUDENT SUBMISSION:
Title: ${submission.title}
Description: ${submission.description}
Skill Level: ${submission.skillLevel}
Duration: ${submission.estimatedDuration}

Content:
${submission.content}

---

INSTRUCTIONS:
Transform the above content into a structured module following this exact JSON format. Create 3-5 slides that break down the content into digestible sections.

Required JSON structure:
{
  "title": "Course Title",
  "slug": "course-title-slug",
  "description": "Brief description",
  "instructor": {
    "name": "Instructor Name",
    "title": "Student at USD",
    "bio": "Brief bio"
  },
  "duration": "30 minutes",
  "skillLevel": "beginner",
  "introVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "learningObjectives": [
    "Objective 1",
    "Objective 2",
    "Objective 3"
  ],
  "slides": [
    {
      "id": 1,
      "title": "Slide Title",
      "content": {
        "heading": "Main Heading",
        "body": "Main content paragraph",
        "bulletPoints": ["Point 1", "Point 2"],
        "code": {
          "language": "python",
          "snippet": "code here"
        },
        "note": "Additional note or tip"
      }
    }
  ],
  "keyTakeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ]
}

Guidelines:
- Extract the most important concepts into 3-5 clear slides
- Make each slide focused on one key idea
- Include practical examples and code snippets where relevant
- Write in a casual, student-friendly tone
- Keep bullets concise and actionable
- Generate a realistic YouTube video ID for introVideo (or use a placeholder)
- Create a URL-friendly slug from the title

Please return ONLY the valid JSON, no additional explanation.`
  }

  const copyPromptToClipboard = (prompt: string, submissionId: string) => {
    navigator.clipboard.writeText(prompt)
    setCopiedId(submissionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAutoGenerate = async (submission: CourseSubmission) => {
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/generate-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: submission.title,
          description: submission.description,
          content: submission.content,
          skillLevel: submission.skillLevel,
          estimatedDuration: submission.estimatedDuration
        })
      })

      if (!res.ok) throw new Error('Failed to generate module')

      const moduleData = await res.json()
      setGeneratedModule(moduleData)
      setSelectedSubmission(submission)
      setShowGeneratedModule(true)
    } catch (err: any) {
      console.error('Error generating module:', err)
      setError('Failed to generate module with AI. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveGeneratedModule = async () => {
    if (!generatedModule) return

    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedModule)
      })

      if (!res.ok) throw new Error('Failed to save module')

      // Update submission status
      if (selectedSubmission) {
        const updatedSubmissions = submissions.map(s =>
          s.id === selectedSubmission.id ? { ...s, status: 'completed' } : s
        )
        setSubmissions(updatedSubmissions)
        localStorage.setItem('courseSubmissions', JSON.stringify(updatedSubmissions))
      }

      setShowGeneratedModule(false)
      setGeneratedModule(null)
      setSelectedSubmission(null)
      alert('Module saved successfully!')
    } catch (err) {
      console.error('Error saving module:', err)
      setError('Failed to save module to database')
    }
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            admin dashboard
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '12px'
          }}>
            manage content
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999'
          }}>
            review submissions and generate modules
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section white" style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <Link href="/admin/dashboard">
              <div className="card" style={{ padding: '28px', cursor: 'pointer', height: '100%' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  Dashboard
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Manage modules, users & more
                </div>
              </div>
            </Link>
            <Link href="/admin/newsletter">
              <div className="card" style={{ padding: '28px', cursor: 'pointer', height: '100%' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  Newsletter
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Edit this week's newsletter
                </div>
              </div>
            </Link>
            <Link href="/admin/modules">
              <div className="card" style={{ padding: '28px', cursor: 'pointer', height: '100%' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  Add Module
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Add new module via JSON
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Course Submissions */}
      <div className="section" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content">
          <div className="section-label">
            pending submissions ({submissions.filter(s => s.status === 'pending').length})
          </div>

          {submissions.filter(s => s.status === 'pending').length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666',
              fontSize: '16px'
            }}>
              No pending submissions
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px', marginTop: '40px' }}>
              {submissions.filter(s => s.status === 'pending').map((submission) => (
                <div key={submission.id} className="card-dark" style={{ padding: '32px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        fontWeight: 700,
                        marginBottom: '8px',
                        color: '#fff',
                        textTransform: 'lowercase'
                      }}>
                        {submission.title}
                      </h3>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{submission.skillLevel}</span>
                        <span>•</span>
                        <span>{submission.estimatedDuration}</span>
                        <span>•</span>
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '16px',
                    color: '#ccc',
                    marginBottom: '20px',
                    lineHeight: 1.6
                  }}>
                    {submission.description}
                  </p>

                  <details style={{ marginBottom: '20px' }}>
                    <summary style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#999',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}>
                      view full content
                    </summary>
                    <div style={{
                      marginTop: '16px',
                      padding: '20px',
                      background: '#000',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#ccc',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      border: '1px solid #333'
                    }}>
                      {submission.content}
                    </div>
                  </details>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleAutoGenerate(submission)}
                      className="btn btn-primary"
                      style={{ cursor: 'pointer', flex: 1, minWidth: '200px' }}
                      disabled={generating}
                    >
                      {generating ? 'Generating...' : 'Auto-Generate with AI →'}
                    </button>
                    <button
                      onClick={() => handleGeneratePrompt(submission)}
                      className="btn btn-secondary"
                      style={{ cursor: 'pointer', minWidth: '200px' }}
                    >
                      Generate Claude Prompt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prompt Modal */}
      {showPromptModal && selectedSubmission && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPromptModal(false)
              setSelectedSubmission(null)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '900px',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: '#000',
              color: '#fff',
              padding: '32px',
              borderBottom: '1px solid #333'
            }}>
              <h3 style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 700,
                textTransform: 'lowercase',
                marginBottom: '8px'
              }}>
                Claude Prompt Ready
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#999'
              }}>
                Copy this prompt and paste it into Claude to generate a structured module
              </p>
            </div>

            {/* Content */}
            <div style={{
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                background: '#fafafa',
                padding: '24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                color: '#333',
                border: '2px solid #e0e0e0'
              }}>
                {generateClaudePrompt(selectedSubmission)}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  copyPromptToClipboard(
                    generateClaudePrompt(selectedSubmission),
                    selectedSubmission.id
                  )
                }}
                className="btn btn-primary"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                {copiedId === selectedSubmission.id ? '✓ Copied!' : 'Copy Prompt'}
              </button>
              <button
                onClick={() => {
                  setShowPromptModal(false)
                  setSelectedSubmission(null)
                }}
                className="btn btn-secondary"
                style={{ cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Module Preview Modal */}
      {showGeneratedModule && generatedModule && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGeneratedModule(false)
              setGeneratedModule(null)
              setSelectedSubmission(null)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '900px',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: '#000',
              color: '#fff',
              padding: '32px',
              borderBottom: '1px solid #333'
            }}>
              <h3 style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 700,
                textTransform: 'lowercase',
                marginBottom: '8px'
              }}>
                Generated Module Preview
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#999'
              }}>
                Review the AI-generated module before saving
              </p>
            </div>

            <div style={{
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                background: '#fafafa',
                padding: '24px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.8,
                color: '#333',
                border: '2px solid #e0e0e0'
              }}>
                <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
                  {generatedModule.title}
                </h4>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  {generatedModule.description}
                </p>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '20px' }}>
                  {generatedModule.duration} • {generatedModule.skillLevel} • {generatedModule.slides?.length || 0} slides
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Learning Objectives:</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                    {generatedModule.learningObjectives?.map((obj: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{obj}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Key Takeaways:</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                    {generatedModule.keyTakeaways?.map((takeaway: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{takeaway}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: '#fff0f0',
                  border: '1px solid #f00',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#f00'
                }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={handleSaveGeneratedModule}
                className="btn btn-primary"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                Save Module to Database
              </button>
              <button
                onClick={() => {
                  setShowGeneratedModule(false)
                  setGeneratedModule(null)
                  setSelectedSubmission(null)
                }}
                className="btn btn-secondary"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
