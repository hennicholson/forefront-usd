'use client'

export function ValueProposition() {
  const features = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      title: 'Learn Practically',
      description: 'Interactive slide-based modules designed by students, for students. No fluff, just actionable AI skills you can apply immediately.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      title: 'Connect Globally',
      description: 'Join a network of learners across the world. Find study partners, collaborate on projects, and grow together.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: 'Build Your Future',
      description: 'Showcase your skills with a professional profile. Track achievements, build your resume, and stand out to opportunities.'
    }
  ]

  return (
    <div className="section white" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <div className="content">
        <div className="section-label" style={{ textAlign: 'center', marginBottom: '32px' }}>
          Why Forefront?
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                border: '2px solid #f0f0f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = '#000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#f0f0f0'
              }}
            >
              <div style={{
                color: '#000',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {feature.icon}
              </div>

              <h3 style={{
                fontSize: 'clamp(20px, 3vw, 24px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
                marginBottom: '16px',
                color: '#000'
              }}>
                {feature.title}
              </h3>

              <p style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: '#666'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
