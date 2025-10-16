'use client'
import { useState } from 'react'

export function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState('learning')

  const tabs = [
    {
      id: 'learning',
      label: 'interactive learning',
      title: 'slide-based modules',
      description: 'engage with interactive slides, take notes, and track your progress as you learn',
      features: [
        'rich multimedia content',
        'real-time note taking',
        'progress tracking',
        'achievement system'
      ]
    },
    {
      id: 'network',
      label: 'global network',
      title: 'connect worldwide',
      description: 'visualize your learning network and discover students studying the same topics',
      features: [
        'interactive mindmap',
        'find study partners',
        'join communities',
        'collaborate on projects'
      ]
    },
    {
      id: 'profile',
      label: 'professional profile',
      title: 'build your resume',
      description: 'showcase your skills, experience, and achievements in a stunning portfolio',
      features: [
        'comprehensive resume',
        'project showcase',
        'skill endorsements',
        'achievement badges'
      ]
    },
    {
      id: 'community',
      label: 'active community',
      title: 'social learning',
      description: 'share your journey, ask questions, and engage with learners around the world',
      features: [
        'activity feeds',
        'discussion forums',
        'topic communities',
        'peer support'
      ]
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0]

  return (
    <div className="section" style={{
      paddingTop: '120px',
      paddingBottom: '120px',
      background: '#000'
    }}>
      <div className="content">
        <div className="section-label" style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: '#666'
        }}>
          platform features
        </div>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'lowercase',
          letterSpacing: '-2px',
          textAlign: 'center',
          marginBottom: '64px',
          color: '#fff'
        }}>
          everything you need
        </h2>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '48px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 28px',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#000' : '#999',
                border: `2px solid ${activeTab === tab.id ? '#fff' : '#333'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'lowercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.borderColor = '#666'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.color = '#999'
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#1a1a1a',
          borderRadius: '16px',
          border: '2px solid #2a2a2a',
          padding: '48px',
          minHeight: '400px'
        }}>
          <h3 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textTransform: 'lowercase',
            letterSpacing: '-1px',
            marginBottom: '16px',
            color: '#fff'
          }}>
            {activeTabData.title}
          </h3>

          <p style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#999',
            marginBottom: '32px'
          }}>
            {activeTabData.description}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {activeTabData.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 20px',
                  background: '#000',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#666'
                  e.currentTarget.style.background = '#1a1a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.background = '#000'
                }}
              >
                <span style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>

          {/* Placeholder for visual preview */}
          <div style={{
            marginTop: '32px',
            padding: '64px 32px',
            background: '#000',
            borderRadius: '12px',
            border: '1px dashed #333',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            visual preview coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
