'use client'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'create your profile',
      description: 'sign up and tell us about your learning goals and interests'
    },
    {
      number: '02',
      title: 'explore ai modules',
      description: 'browse courses created by students who\'ve mastered the skills'
    },
    {
      number: '03',
      title: 'learn interactively',
      description: 'engage with slide-based content, take notes, and track progress'
    },
    {
      number: '04',
      title: 'connect & collaborate',
      description: 'network with peers, join study groups, and learn together'
    },
    {
      number: '05',
      title: 'build your portfolio',
      description: 'showcase achievements and skills on your professional profile'
    }
  ]

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
          how it works
        </div>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'lowercase',
          letterSpacing: '-2px',
          textAlign: 'center',
          marginBottom: '80px',
          color: '#fff'
        }}>
          your learning journey
        </h2>

        {/* Center the entire steps container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            position: 'relative',
            width: 'fit-content'
          }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              left: '31px',
              top: '40px',
              bottom: '40px',
              width: '2px',
              background: 'linear-gradient(180deg, #333 0%, #666 50%, #333 100%)',
              zIndex: 0
            }} />

            {steps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr',
                  gap: '32px',
                  padding: '32px 0',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Number circle */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  border: '3px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = '#000'
                  e.currentTarget.style.borderColor = '#fff'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a1a1a'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div style={{
                  paddingTop: '8px',
                  minWidth: '400px'
                }}>
                  <h3 style={{
                    fontSize: 'clamp(20px, 3vw, 28px)',
                    fontWeight: 700,
                    textTransform: 'lowercase',
                    letterSpacing: '-0.5px',
                    marginBottom: '12px',
                    color: '#fff'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#999'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
