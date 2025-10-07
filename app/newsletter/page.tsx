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

export default function NewsletterPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)

    // Get current newsletter from localStorage
    const stored = localStorage.getItem('currentNewsletter')
    if (stored) {
      setNewsletter(JSON.parse(stored))
    } else {
      // Default newsletter if none exists
      setNewsletter({
        id: '1',
        week: 1,
        date: 'January 2025',
        title: 'Welcome to Forefront',
        content: {
          intro: 'Welcome to the first edition of the Forefront Newsletter. Every week, we\'ll share the latest AI breakthroughs, tools, and student discoveries from our network.',
          sections: [
            {
              title: 'This Week in AI',
              items: [
                'OpenAI released GPT-4 Turbo with improved reasoning and lower costs',
                'Anthropic launched Claude 3.5 Sonnet with industry-leading performance',
                'Midjourney v6 now supports better text rendering in images',
                'Google Gemini Pro API now available for developers'
              ]
            },
            {
              title: 'Student Discoveries',
              items: [
                'Maria discovered a workflow for creating marketing campaigns 10x faster using Claude',
                'Jake built an AI-powered study assistant that summarizes lecture notes',
                'The music production team found creative ways to use AI for beat generation',
                'Sarah created an automated social media content pipeline using ChatGPT'
              ]
            },
            {
              title: 'New Modules This Week',
              items: [
                'Vibe Coding with AI - Learn to build apps faster',
                'Marketing with AI - Master AI-powered campaigns',
                'Content Creation with AI - Create content in minutes'
              ]
            },
            {
              title: 'Tools to Explore',
              items: [
                'Cursor - AI-powered code editor',
                'Perplexity - AI search engine',
                'ElevenLabs - AI voice generation',
                'Runway - AI video editing'
              ]
            }
          ],
          closing: 'Stay curious. Keep building. Spread the sauce.'
        }
      })
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !newsletter) {
    return null
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '40px', minHeight: 'auto' }}>
        <div className="content">
          <Link
            href="/dashboard"
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
            ← back to dashboard
          </Link>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '12px',
            fontWeight: 700
          }}>
            week {newsletter.week} → {newsletter.date}
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-3px',
            marginBottom: '20px'
          }}>
            {newsletter.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content" style={{ maxWidth: '800px' }}>
          {/* Intro */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.7,
            color: '#333',
            marginBottom: '60px',
            fontWeight: 500
          }}>
            {newsletter.content.intro}
          </p>

          {/* Sections */}
          {newsletter.content.sections.map((section, index) => (
            <div key={index} style={{ marginBottom: '60px' }}>
              <h2 style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '24px',
                letterSpacing: '-1px',
                color: '#000'
              }}>
                {section.title}
              </h2>
              <ul style={{
                listStyle: 'none',
                display: 'grid',
                gap: '16px'
              }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    lineHeight: 1.7,
                    color: '#666',
                    paddingLeft: '28px',
                    borderLeft: '3px solid #000',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px'
                  }}>
                    <span style={{ flexShrink: 0, color: '#000', fontWeight: 700 }}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Closing */}
          <div style={{
            padding: '40px',
            background: '#000',
            color: '#fff',
            borderRadius: '12px',
            textAlign: 'center',
            marginTop: '80px'
          }}>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              fontStyle: 'italic',
              letterSpacing: '0.5px'
            }}>
              {newsletter.content.closing}
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link href="/dashboard" className="btn btn-primary">
              back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
