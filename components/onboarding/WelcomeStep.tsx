'use client'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: '500px'
    }}>
      {/* Logo */}
      <div style={{
        fontSize: 'clamp(40px, 6vw, 56px)',
        fontWeight: 900,
        textTransform: 'lowercase',
        letterSpacing: '-2px',
        marginBottom: '24px',
        color: '#000'
      }}>
        [forefront]
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 'clamp(18px, 3vw, 24px)',
        fontWeight: 600,
        color: '#333',
        marginBottom: '40px',
        textTransform: 'lowercase',
        letterSpacing: '-0.5px'
      }}>
        students teaching students
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '700px',
        marginBottom: '48px'
      }}>
        {[
          { icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          ), title: 'learn', desc: 'practical ai modules' },
          { icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ), title: 'connect', desc: 'learning network' },
          { icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ), title: 'build', desc: 'professional profile' }
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              padding: '32px 24px',
              background: 'rgba(250, 250, 250, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '2px solid rgba(224, 224, 224, 0.5)',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.borderColor = 'rgba(224, 224, 224, 0.5)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.background = 'rgba(250, 250, 250, 0.5)'
            }}
          >
            <div style={{
              marginBottom: '16px',
              color: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {feature.icon}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'lowercase',
              marginBottom: '8px',
              color: '#000',
              textAlign: 'center'
            }}>
              {feature.title}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: 1.5,
              textAlign: 'center'
            }}>
              {feature.desc}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="btn btn-primary"
        style={{
          fontSize: '16px',
          padding: '16px 48px',
          cursor: 'pointer'
        }}
      >
        get started →
      </button>

      <div style={{
        marginTop: '24px',
        fontSize: '13px',
        color: '#999'
      }}>
        takes less than 2 minutes
      </div>
    </div>
  )
}
