'use client'
import { useState, useEffect } from 'react'

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'sarah chen',
      role: 'cs student, stanford',
      quote: 'forefront helped me learn AI tools that are actually used in the real world. the student-taught modules feel more relatable than traditional courses.',
      achievement: 'completed 5 modules'
    },
    {
      name: 'marcus thompson',
      role: 'business major, nyu',
      quote: 'i had zero coding experience, but the beginner modules made ai accessible. now i\'m building my own automation workflows.',
      achievement: 'landed AI internship'
    },
    {
      name: 'priya patel',
      role: 'design student, risd',
      quote: 'the global network feature connected me with designers using ai tools worldwide. we started a collaborative project together.',
      achievement: '50+ connections made'
    },
    {
      name: 'alex rivera',
      role: 'engineering, mit',
      quote: 'best platform for practical ai skills. the interactive slides and hands-on approach beat lecture videos any day.',
      achievement: 'created 2 modules'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [testimonials.length])

  const testimonial = testimonials[currentIndex]

  return (
    <div className="section white" style={{
      paddingTop: '120px',
      paddingBottom: '60px'
    }}>
      <div className="content">
        <div className="section-label" style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          student success
        </div>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          textTransform: 'lowercase',
          letterSpacing: '-2px',
          textAlign: 'center',
          marginBottom: '64px',
          color: '#000'
        }}>
          hear from learners
        </h2>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Quote */}
          <div style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            lineHeight: 1.6,
            color: '#000',
            marginBottom: '32px',
            fontWeight: 500,
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            "{testimonial.quote}"
          </div>

          {/* Avatar placeholder */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #000 0%, #333 100%)',
            margin: '0 auto 24px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: '#fff'
          }}>
            {testimonial.name.charAt(0).toUpperCase()}
          </div>

          {/* Name and role */}
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#000',
            textTransform: 'lowercase',
            marginBottom: '8px'
          }}>
            {testimonial.name}
          </div>

          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '16px'
          }}>
            {testimonial.role}
          </div>

          {/* Achievement badge */}
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: '#000',
            color: '#fff',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {testimonial.achievement}
          </div>

          {/* Navigation dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '48px'
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: currentIndex === index ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: currentIndex === index ? '#000' : '#e0e0e0',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== index) {
                    e.currentTarget.style.background = '#999'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== index) {
                    e.currentTarget.style.background = '#e0e0e0'
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
