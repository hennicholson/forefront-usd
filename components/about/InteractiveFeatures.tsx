'use client'
import { useState } from 'react'

const features = [
  {
    number: 1,
    title: 'Interactive Learning Modules',
    subtitle: 'Student-taught courses covering:',
    items: [
      'Vibe Coding with AI - Build apps 10x faster',
      'Marketing with AI - Strategies that convert',
      'Content Creation with AI - Create in minutes',
      'Music Production with AI - Compose with AI tools',
      'AI Automation - Automate anything'
    ]
  },
  {
    number: 2,
    title: 'Weekly AI Newsletter',
    subtitle: 'Stay updated with the latest AI breakthroughs, tools, and industry trends through our curated newsletter.',
    items: []
  },
  {
    number: 3,
    title: 'Deep Dive Case Studies',
    subtitle: 'We analyze how real brands and companies are implementing AI, then figure out how we can do it better.',
    items: []
  },
  {
    number: 4,
    title: 'Real-World Projects',
    subtitle: 'We don\'t just talk about AI—we build AI solutions for the USD community and beyond.',
    items: []
  }
]

export function InteractiveFeatures() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <div style={{ display: 'grid', gap: '16px', marginTop: '48px' }}>
      {features.map((feature) => {
        const isActive = activeFeature === feature.number

        return (
          <div
            key={feature.number}
            onClick={() => setActiveFeature(isActive ? null : feature.number)}
            className="card"
            style={{
              padding: isActive ? '48px' : '40px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Number Badge */}
            <div style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              width: '64px',
              height: '64px',
              border: '2px solid #e0e0e0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              color: '#000',
              opacity: 0.4
            }}>
              {feature.number}
            </div>

            {/* Title */}
            <div style={{
              fontSize: isActive ? 'clamp(26px, 5vw, 40px)' : 'clamp(22px, 4vw, 32px)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '16px',
              letterSpacing: '-0.5px',
              paddingRight: '100px',
              transition: 'all 0.3s ease',
              color: '#000'
            }}>
              {feature.title}
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: feature.items.length > 0 ? '20px' : '0',
              maxWidth: '800px',
              transition: 'all 0.3s ease'
            }}>
              {feature.subtitle}
            </div>

            {/* Expandable Items */}
            {feature.items.length > 0 && (
              <div style={{
                maxHeight: isActive ? '500px' : '0',
                opacity: isActive ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                marginTop: isActive ? '24px' : '0'
              }}>
                <ul style={{
                  listStyle: 'none',
                  display: 'grid',
                  gap: '12px',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  color: '#333'
                }}>
                  {feature.items.map((item, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'start',
                      paddingLeft: '20px',
                      borderLeft: '2px solid #e0e0e0',
                      transition: 'all 0.2s ease'
                    }}>
                      <span style={{ flexShrink: 0, opacity: 0.5 }}>→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expand Indicator */}
            {feature.items.length > 0 && (
              <div style={{
                marginTop: '24px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#999',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}>
                {isActive ? '↑ click to collapse' : '↓ click to expand'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
