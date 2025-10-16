'use client'

export function InstructorSpotlight() {
  const instructors = [
    {
      name: 'emma rodriguez',
      expertise: 'ai prompt engineering',
      modules: 3,
      students: 450
    },
    {
      name: 'james kim',
      expertise: 'machine learning basics',
      modules: 2,
      students: 380
    },
    {
      name: 'sophia patel',
      expertise: 'ai automation workflows',
      modules: 4,
      students: 520
    },
    {
      name: 'david chen',
      expertise: 'ai content creation',
      modules: 2,
      students: 310
    }
  ]

  return (
    <div className="section white" style={{
      paddingTop: '100px',
      paddingBottom: '100px'
    }}>
      <div className="content">
        <div className="section-label" style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          meet the instructors
        </div>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'lowercase',
          letterSpacing: '-2px',
          textAlign: 'center',
          marginBottom: '48px',
          color: '#000'
        }}>
          taught by students
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="card"
              style={{
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
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
              {/* Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                margin: '0 auto 20px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
                color: '#fff'
              }}>
                {instructor.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                textTransform: 'lowercase',
                letterSpacing: '-0.5px',
                marginBottom: '8px',
                color: '#000'
              }}>
                {instructor.name}
              </h3>

              {/* Expertise */}
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '20px',
                lineHeight: 1.5
              }}>
                {instructor.expertise}
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#000'
                  }}>
                    {instructor.modules}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#999',
                    fontWeight: 600
                  }}>
                    modules
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#000'
                  }}>
                    {instructor.students}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#999',
                    fontWeight: 600
                  }}>
                    students
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{
              fontSize: '14px',
              padding: '16px 32px'
            }}
            onClick={() => {
              // TODO: Link to instructor application page
              alert('Instructor application coming soon!')
            }}
          >
            become an instructor →
          </button>
        </div>
      </div>
    </div>
  )
}
