'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CourseSubmission {
  id: number
  userId: string
  title: string
  description: string
  content: string
  skillLevel: string
  estimatedDuration: string
  submittedAt: string
  status: string
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<CourseSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<CourseSubmission | null>(null)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showGeneratedModule, setShowGeneratedModule] = useState(false)
  const [generatedModule, setGeneratedModule] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)
    loadSubmissions()
  }, [isAuthenticated, user, router])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const handleGeneratePrompt = (submission: CourseSubmission) => {
    setSelectedSubmission(submission)
    setShowPromptModal(true)
  }

  const generateClaudePrompt = (submission: CourseSubmission) => {
    return `Transform this student course submission into a structured learning module for our AI education platform.

═══════════════════════════════════════════════════════════════════════════════
SUBMISSION DETAILS
═══════════════════════════════════════════════════════════════════════════════

📚 Title: ${submission.title}

📝 Description:
${submission.description}

🎯 Target Audience: ${submission.skillLevel}
⏱️  Estimated Duration: ${submission.estimatedDuration}

📖 FULL COURSE CONTENT:
${submission.content}

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

Transform the above submission into a structured learning module. Analyze the content carefully and create 3-5 focused slides that teach the core concepts progressively.

CRITICAL REQUIREMENTS:
1. Break down content into logical, sequential slides
2. Each slide should teach ONE key concept
3. Include practical examples and code snippets where applicable
4. Write in a casual, student-friendly tone
5. Make content actionable and engaging

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT (COPY THIS JSON STRUCTURE EXACTLY)
═══════════════════════════════════════════════════════════════════════════════

{
  "title": "${submission.title}",
  "slug": "${submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}",
  "description": "${submission.description.substring(0, 150)}...",
  "instructor": {
    "name": "Student Contributor",
    "title": "Student at USD",
    "bio": "Created this course to share knowledge with the forefront community"
  },
  "duration": "${submission.estimatedDuration}",
  "skillLevel": "${submission.skillLevel}",
  "introVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "learningObjectives": [
    "Write 3-4 specific, measurable learning objectives here",
    "Each should start with an action verb (understand, build, implement, etc.)",
    "Focus on what students will be able to DO after completing this module"
  ],
  "slides": [
    {
      "id": 1,
      "title": "Introduction & Overview",
      "content": {
        "heading": "Clear, engaging heading",
        "body": "2-3 paragraphs explaining the main concept. Keep it conversational and clear.",
        "bulletPoints": [
          "Key point 1 - keep these actionable",
          "Key point 2 - use specific examples",
          "Key point 3 - make them scannable"
        ],
        "code": {
          "language": "python",
          "snippet": "# Include code examples when relevant\\nprint('Hello World')"
        },
        "note": "💡 Pro tip or important callout that helps students understand better"
      }
    }
  ],
  "keyTakeaways": [
    "Main takeaway 1 - what's the most important thing to remember?",
    "Main takeaway 2 - how will students use this knowledge?",
    "Main takeaway 3 - what should they do next?"
  ]
}

═══════════════════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════════════════════

✓ Return ONLY valid JSON (no markdown, no explanation)
✓ Create ${submission.skillLevel} appropriate content
✓ Use the actual submission content above to create slides
✓ Generate a URL-friendly slug from the title
✓ Include code snippets only when they add value
✓ Make each slide self-contained and focused

START YOUR RESPONSE WITH THE JSON OPENING BRACE { and END WITH THE CLOSING BRACE }`
  }

  const copyPromptToClipboard = (prompt: string, submissionId: number) => {
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

      // Update submission status in database
      if (selectedSubmission) {
        const statusRes = await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedSubmission.id, status: 'approved' })
        })

        if (statusRes.ok) {
          await loadSubmissions()
        }
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

  const handleApproveSubmission = async (submissionId: number) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submissionId, status: 'approved' })
      })

      if (res.ok) {
        await loadSubmissions()
        alert('Submission approved!')
      }
    } catch (err) {
      console.error('Error approving submission:', err)
      alert('Failed to approve submission')
    }
  }

  const handleRejectSubmission = async (submissionId: number) => {
    if (!confirm('Are you sure you want to reject this submission?')) return

    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submissionId, status: 'rejected' })
      })

      if (res.ok) {
        await loadSubmissions()
        alert('Submission rejected')
      }
    } catch (err) {
      console.error('Error rejecting submission:', err)
      alert('Failed to reject submission')
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

          {loading ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666',
              fontSize: '16px'
            }}>
              Loading submissions...
            </div>
          ) : submissions.filter(s => s.status === 'pending').length === 0 ? (
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
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleApproveSubmission(submission.id)}
                      style={{
                        padding: '12px 24px',
                        background: '#00ff00',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        flex: 1,
                        minWidth: '150px'
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectSubmission(submission.id)}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        color: '#ff0000',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        flex: 1,
                        minWidth: '150px'
                      }}
                    >
                      ✗ Reject
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
