'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Newsletter {
  id: string
  week: number
  date: string
  title: string
  content: {
    intro: string
    sections: {
      title: string
      items: string[]
    }[]
    closing: string
  }
}

export default function AdminNewsletterPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)

    // Load current newsletter
    const stored = localStorage.getItem('currentNewsletter')
    if (stored) {
      setNewsletter(JSON.parse(stored))
    } else {
      // Create default
      setNewsletter({
        id: '1',
        week: 1,
        date: 'January 2025',
        title: 'Welcome to Forefront',
        content: {
          intro: 'Welcome to the first edition of the Forefront Newsletter.',
          sections: [
            {
              title: 'This Week in AI',
              items: ['Item 1', 'Item 2']
            }
          ],
          closing: 'Stay curious. Keep building. Spread the sauce.'
        }
      })
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user?.isAdmin || !newsletter) {
    return null
  }

  const handleSave = () => {
    localStorage.setItem('currentNewsletter', JSON.stringify(newsletter))
    setSuccess('Newsletter saved successfully!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const addSection = () => {
    setNewsletter({
      ...newsletter,
      content: {
        ...newsletter.content,
        sections: [
          ...newsletter.content.sections,
          { title: 'New Section', items: ['Item 1'] }
        ]
      }
    })
  }

  const updateSection = (index: number, field: 'title' | 'items', value: string | string[]) => {
    const newSections = [...newsletter.content.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setNewsletter({
      ...newsletter,
      content: { ...newsletter.content, sections: newSections }
    })
  }

  const deleteSection = (index: number) => {
    const newSections = newsletter.content.sections.filter((_, i) => i !== index)
    setNewsletter({
      ...newsletter,
      content: { ...newsletter.content, sections: newSections }
    })
  }

  const addItemToSection = (sectionIndex: number) => {
    const newSections = [...newsletter.content.sections]
    newSections[sectionIndex].items.push('New item')
    setNewsletter({
      ...newsletter,
      content: { ...newsletter.content, sections: newSections }
    })
  }

  const updateSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...newsletter.content.sections]
    newSections[sectionIndex].items[itemIndex] = value
    setNewsletter({
      ...newsletter,
      content: { ...newsletter.content, sections: newSections }
    })
  }

  const deleteItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...newsletter.content.sections]
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex)
    setNewsletter({
      ...newsletter,
      content: { ...newsletter.content, sections: newSections }
    })
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <Link
            href="/admin"
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#666',
              textDecoration: 'none',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'inline-block'
            }}
            className="hover:opacity-70"
          >
            ← back to admin
          </Link>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            edit newsletter
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '20px'
          }}>
            week {newsletter.week}
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ cursor: 'pointer' }}
            >
              Save Newsletter
            </button>
            {success && (
              <div style={{ color: '#0f0', fontSize: '14px', fontWeight: 600 }}>
                {success}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content" style={{ maxWidth: '900px' }}>
          {/* Week & Date */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#666'
            }}>
              Week Number
            </label>
            <input
              type="number"
              value={newsletter.week}
              onChange={(e) => setNewsletter({ ...newsletter, week: parseInt(e.target.value) })}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '200px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#666'
            }}>
              Date
            </label>
            <input
              type="text"
              value={newsletter.date}
              onChange={(e) => setNewsletter({ ...newsletter, date: e.target.value })}
              placeholder="January 2025"
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#666'
            }}>
              Title
            </label>
            <input
              type="text"
              value={newsletter.title}
              onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}
              style={{
                padding: '12px 16px',
                fontSize: '20px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                fontWeight: 700,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Intro */}
          <div style={{ marginBottom: '48px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#666'
            }}>
              Intro
            </label>
            <textarea
              value={newsletter.content.intro}
              onChange={(e) => setNewsletter({
                ...newsletter,
                content: { ...newsletter.content, intro: e.target.value }
              })}
              rows={4}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Sections */}
          {newsletter.content.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{
              marginBottom: '40px',
              padding: '24px',
              background: '#fafafa',
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '18px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    flex: 1,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={() => deleteSection(sectionIndex)}
                  style={{
                    marginLeft: '12px',
                    padding: '8px 16px',
                    background: '#fff',
                    border: '1px solid #f00',
                    borderRadius: '6px',
                    color: '#f00',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'inherit'
                  }}
                >
                  Delete Section
                </button>
              </div>

              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateSectionItem(sectionIndex, itemIndex, e.target.value)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      flex: 1,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onClick={() => deleteItem(sectionIndex, itemIndex)}
                    style={{
                      padding: '8px 12px',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      color: '#999',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => addItemToSection(sectionIndex)}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: 'inherit'
                }}
              >
                + Add Item
              </button>
            </div>
          ))}

          <button
            onClick={addSection}
            className="btn btn-secondary"
            style={{ cursor: 'pointer', marginBottom: '48px' }}
          >
            + Add Section
          </button>

          {/* Closing */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#666'
            }}>
              Closing
            </label>
            <input
              type="text"
              value={newsletter.content.closing}
              onChange={(e) => setNewsletter({
                ...newsletter,
                content: { ...newsletter.content, closing: e.target.value }
              })}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                fontStyle: 'italic',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Preview Link */}
          <Link
            href="/newsletter"
            target="_blank"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#000',
              textDecoration: 'underline',
              fontWeight: 600
              }}
            >
              Preview Newsletter →
            </Link>
          </div>
        </div>
      </main>
    )
  }
