'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile, Experience, Education, Certification, Project, Award } from '@/types/profile'

interface UserProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: true,
    summary: false,
    experience: true,
    education: false,
    skills: false,
    certifications: false,
    awards: false,
    projects: false,
    interests: false,
    social: false,
    availability: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
    setAiSummary(null)
  }, [userId, isOpen])

  const handleAiSummarize = async () => {
    if (!profile || !user?.geminiApiKey) return

    setSummarizing(true)
    try {
      const response = await fetch('/api/profile/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileData: profile,
          geminiApiKey: user.geminiApiKey
        })
      })

      if (response.ok) {
        const { summary } = await response.json()
        setAiSummary(summary)
      } else {
        alert('Failed to generate summary. Please try again.')
      }
    } catch (error) {
      alert('Failed to generate summary. Please try again.')
    } finally {
      setSummarizing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .modal-content {
            padding: 20px !important;
            margin: 10px !important;
          }
          .modal-header {
            padding: 24px 20px !important;
          }
          .modal-body {
            padding: 24px 20px !important;
          }
          .grid-2col {
            grid-template-columns: 1fr !important;
          }
          .close-button {
            right: 10px !important;
          }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
          fontFamily: "'Courier New', Courier, monospace"
        }}
        onClick={onClose}
      >
        <div
          className="modal-content"
          style={{
            background: '#fff',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '95vh',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid #000',
            fontFamily: "'Courier New', Courier, monospace"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="close-button"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#fff',
              color: '#000',
              border: '2px solid #000',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: "'Courier New', Courier, monospace",
              zIndex: 100,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = '#000'
            }}
          >
            X
          </button>

          <div style={{ maxHeight: '95vh', overflow: 'auto' }}>
            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center', color: '#000', fontFamily: "'Courier New', Courier, monospace" }}>
                LOADING PROFILE...
              </div>
            ) : profile ? (
              <div>
                {/* Header Section */}
                <div
                  className="modal-header"
                  style={{
                    background: '#fff',
                    padding: '48px 60px',
                    color: '#000',
                    position: 'relative',
                    borderBottom: '2px solid #000'
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                      <h2 style={{
                        fontSize: 'clamp(28px, 5vw, 42px)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        margin: 0,
                        color: '#000',
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.name}
                      </h2>
                      {user?.geminiApiKey && (
                        <button
                          onClick={handleAiSummarize}
                          disabled={summarizing}
                          style={{
                            padding: '12px 24px',
                            background: aiSummary ? '#000' : '#fff',
                            color: aiSummary ? '#fff' : '#000',
                            border: '2px solid #000',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: summarizing ? 'not-allowed' : 'pointer',
                            fontFamily: "'Courier New', Courier, monospace",
                            transition: 'all 0.2s ease',
                            opacity: summarizing ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!summarizing) {
                              e.currentTarget.style.background = '#000'
                              e.currentTarget.style.color = '#fff'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!summarizing && !aiSummary) {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.color = '#000'
                            }
                          }}
                        >
                          {summarizing ? 'SCOUTING...' : 'AI SCOUT'}
                        </button>
                      )}
                    </div>
                    {profile.headline && (
                      <p style={{
                        fontSize: 'clamp(14px, 2.5vw, 18px)',
                        fontWeight: 'normal',
                        marginBottom: '20px',
                        lineHeight: 1.6,
                        color: '#000',
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.headline}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: 'clamp(12px, 2vw, 14px)', color: '#000' }}>
                      {profile.location && <p style={{ margin: 0, fontFamily: "'Courier New', Courier, monospace" }}>LOCATION: {profile.location}</p>}
                      {profile.email && <p style={{ margin: 0, fontFamily: "'Courier New', Courier, monospace" }}>EMAIL: {profile.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="modal-body" style={{ padding: '40px 60px 60px' }}>
                  {/* AI Summary */}
                  {aiSummary && (
                    <div style={{
                      background: '#fff',
                      border: '2px solid #000',
                      padding: '32px',
                      marginBottom: '40px'
                    }}>
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          color: '#000',
                          margin: 0,
                          marginBottom: '8px',
                          fontFamily: "'Courier New', Courier, monospace"
                        }}>
                          AI SCOUT REPORT
                        </h3>
                        <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', fontFamily: "'Courier New', Courier, monospace" }}>
                          PROFESSIONAL ANALYSIS
                        </div>
                      </div>
                      <ul style={{
                        fontSize: 'clamp(13px, 2vw, 15px)',
                        lineHeight: 1.8,
                        color: '#000',
                        margin: 0,
                        paddingLeft: '20px',
                        fontFamily: "'Courier New', Courier, monospace",
                        listStyle: 'none'
                      }}>
                        {aiSummary.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} style={{
                            marginBottom: '12px',
                            paddingLeft: '8px',
                            position: 'relative'
                          }}>
                            <span style={{ position: 'absolute', left: '-12px', color: '#000', fontWeight: 'bold' }}>•</span>
                            {line.trim()}
                          </li>
                        ))}
                      </ul>
                      <div style={{
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid #000',
                        fontSize: '11px',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        <span style={{
                          background: '#000',
                          color: '#fff',
                          padding: '4px 8px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          fontFamily: "'Courier New', Courier, monospace"
                        }}>
                          POWERED BY GEMINI
                        </span>
                        <span>|</span>
                        <span>REAL-TIME ANALYSIS</span>
                      </div>
                    </div>
                  )}

                  {/* Section: About */}
                  {profile.bio && (
                    <SectionCollapsible
                      title="ABOUT"
                      expanded={expandedSections.about}
                      onToggle={() => toggleSection('about')}
                    >
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 15px)',
                        color: '#000',
                        lineHeight: 1.8,
                        margin: 0,
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.bio}
                      </p>
                    </SectionCollapsible>
                  )}

                  {/* Section: Summary */}
                  {profile.summary && (
                    <SectionCollapsible
                      title="SUMMARY"
                      expanded={expandedSections.summary}
                      onToggle={() => toggleSection('summary')}
                    >
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 15px)',
                        color: '#000',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.summary}
                      </p>
                    </SectionCollapsible>
                  )}

                  {/* Section: Experience */}
                  {profile.experience && profile.experience.length > 0 && (
                    <SectionCollapsible
                      title={`EXPERIENCE (${profile.experience.length})`}
                      expanded={expandedSections.experience}
                      onToggle={() => toggleSection('experience')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {profile.experience.map((exp: Experience) => (
                          <div key={exp.id} style={{
                            background: '#fff',
                            padding: 'clamp(20px, 4vw, 24px)',
                            border: '1px solid #000',
                            borderLeft: '4px solid #000'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: '8px', color: '#000', fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase' }}>
                              {exp.title}
                            </div>
                            <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', marginBottom: '10px', fontWeight: 'bold', fontFamily: "'Courier New', Courier, monospace" }}>
                              {exp.company} {exp.employmentType && `| ${exp.employmentType}`}
                            </div>
                            <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontFamily: "'Courier New', Courier, monospace", borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
                              <span>{exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate}</span>
                              {exp.location && <span>| {exp.location}</span>}
                            </div>
                            {exp.description && (
                              <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', lineHeight: 1.7, marginBottom: '16px', fontFamily: "'Courier New', Courier, monospace" }}>
                                {exp.description}
                              </p>
                            )}
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                              <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                                {exp.responsibilities.map((resp, idx) => (
                                  <li key={idx} style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', marginBottom: '8px', paddingLeft: '8px', position: 'relative', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <span style={{ position: 'absolute', left: '-12px', color: '#000' }}>-</span>
                                    {resp}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Section: Education */}
                  {profile.education && profile.education.length > 0 && (
                    <SectionCollapsible
                      title={`EDUCATION (${profile.education.length})`}
                      expanded={expandedSections.education}
                      onToggle={() => toggleSection('education')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {profile.education.map((edu: Education) => (
                          <div key={edu.id} style={{
                            background: '#fff',
                            padding: 'clamp(20px, 4vw, 24px)',
                            border: '1px solid #000',
                            borderLeft: '4px solid #000'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: '8px', color: '#000', fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase' }}>
                              {edu.school}
                            </div>
                            {edu.degree && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Courier New', Courier, monospace" }}>
                                {edu.degree} {edu.fieldOfStudy && `IN ${edu.fieldOfStudy.toUpperCase()}`}
                              </div>
                            )}
                            <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginBottom: edu.grade || edu.activities ? '12px' : '0', fontFamily: "'Courier New', Courier, monospace", borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
                              {edu.startDate} - {edu.current ? 'PRESENT' : edu.endDate}
                            </div>
                            {edu.grade && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', marginTop: '8px', fontFamily: "'Courier New', Courier, monospace" }}>
                                <span style={{ fontWeight: 'bold' }}>GRADE:</span> {edu.grade}
                              </div>
                            )}
                            {edu.activities && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', marginTop: '6px', lineHeight: 1.6, fontFamily: "'Courier New', Courier, monospace" }}>
                                <span style={{ fontWeight: 'bold' }}>ACTIVITIES:</span> {edu.activities}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Section: Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <SectionCollapsible
                      title={`SKILLS (${profile.skills.length})`}
                      expanded={expandedSections.skills}
                      onToggle={() => toggleSection('skills')}
                    >
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#000',
                              color: '#fff',
                              padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 18px)',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontFamily: "'Courier New', Courier, monospace",
                              cursor: 'default',
                              border: '1px solid #000'
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Two Column Grid for Certifications & Awards */}
                  <div className="grid-2col" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '32px',
                    marginBottom: '32px'
                  }}>
                    {/* Section: Certifications */}
                    {profile.certifications && profile.certifications.length > 0 && (
                      <SectionCollapsible
                        title={`CERTIFICATIONS (${profile.certifications.length})`}
                        expanded={expandedSections.certifications}
                        onToggle={() => toggleSection('certifications')}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.certifications.map((cert: Certification) => (
                            <div key={cert.id} style={{
                              background: '#fff',
                              padding: 'clamp(16px, 3vw, 20px)',
                              border: '1px solid #000',
                              borderLeft: '3px solid #000'
                            }}>
                              <div style={{ fontWeight: 'bold', fontSize: 'clamp(12px, 2vw, 14px)', marginBottom: '6px', color: '#000', fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase' }}>
                                {cert.name}
                              </div>
                              <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Courier New', Courier, monospace" }}>
                                {cert.issuingOrganization}
                              </div>
                              <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#000', fontFamily: "'Courier New', Courier, monospace", borderTop: '1px solid #000', paddingTop: '4px' }}>
                                ISSUED: {cert.issueDate} {cert.expirationDate && `| EXPIRES: ${cert.expirationDate}`}
                              </div>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: 'clamp(11px, 2vw, 13px)',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    marginTop: '12px',
                                    display: 'inline-block',
                                    fontFamily: "'Courier New', Courier, monospace"
                                  }}
                                >
                                  VIEW CREDENTIAL
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCollapsible>
                    )}

                    {/* Section: Awards */}
                    {profile.awards && profile.awards.length > 0 && (
                      <SectionCollapsible
                        title={`AWARDS & HONORS (${profile.awards.length})`}
                        expanded={expandedSections.awards}
                        onToggle={() => toggleSection('awards')}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.awards.map((award: Award) => (
                            <div key={award.id} style={{
                              background: '#fff',
                              padding: 'clamp(16px, 3vw, 20px)',
                              border: '1px solid #000',
                              borderLeft: '3px solid #000'
                            }}>
                              <div style={{ fontWeight: 'bold', fontSize: 'clamp(12px, 2vw, 14px)', marginBottom: '6px', color: '#000', fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase' }}>
                                {award.title}
                              </div>
                              <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Courier New', Courier, monospace" }}>
                                {award.issuer}
                              </div>
                              <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#000', fontFamily: "'Courier New', Courier, monospace", borderTop: '1px solid #000', paddingTop: '4px' }}>
                                {award.issueDate}
                              </div>
                              {award.description && (
                                <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginTop: '12px', marginBottom: 0, lineHeight: 1.6, fontFamily: "'Courier New', Courier, monospace" }}>
                                  {award.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCollapsible>
                    )}
                  </div>

                  {/* Section: Projects */}
                  {profile.projects && profile.projects.length > 0 && (
                    <SectionCollapsible
                      title={`PROJECTS (${profile.projects.length})`}
                      expanded={expandedSections.projects}
                      onToggle={() => toggleSection('projects')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {profile.projects.map((proj: Project) => (
                          <div key={proj.id} style={{
                            background: '#fff',
                            padding: 'clamp(20px, 4vw, 24px)',
                            border: '1px solid #000',
                            borderLeft: '4px solid #000'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: '8px', color: '#000', fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase' }}>
                              {proj.name}
                            </div>
                            <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#000', marginBottom: '16px', fontFamily: "'Courier New', Courier, monospace", borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
                              {proj.startDate} - {proj.current ? 'ONGOING' : proj.endDate}
                            </div>
                            <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#000', lineHeight: 1.7, marginBottom: '16px', fontFamily: "'Courier New', Courier, monospace" }}>
                              {proj.description}
                            </p>
                            {proj.skills && proj.skills.length > 0 && (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {proj.skills.map((skill, idx) => (
                                  <span key={idx} style={{
                                    background: '#fff',
                                    color: '#000',
                                    padding: '6px 12px',
                                    fontSize: 'clamp(10px, 2vw, 12px)',
                                    fontWeight: 'bold',
                                    border: '1px solid #000',
                                    fontFamily: "'Courier New', Courier, monospace",
                                    textTransform: 'uppercase'
                                  }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {proj.url && (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 'clamp(11px, 2vw, 13px)',
                                  color: '#000',
                                  fontWeight: 'bold',
                                  textDecoration: 'underline',
                                  display: 'inline-block',
                                  fontFamily: "'Courier New', Courier, monospace"
                                }}
                              >
                                VIEW PROJECT
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Section: Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <SectionCollapsible
                      title={`INTERESTS (${profile.interests.length})`}
                      expanded={expandedSections.interests}
                      onToggle={() => toggleSection('interests')}
                    >
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {profile.interests.map((interest, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#fff',
                              color: '#000',
                              padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 18px)',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              border: '2px solid #000',
                              fontFamily: "'Courier New', Courier, monospace",
                              cursor: 'default',
                              textTransform: 'uppercase'
                            }}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Section: Social Links */}
                  {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
                    <SectionCollapsible
                      title="CONNECT"
                      expanded={expandedSections.social}
                      onToggle={() => toggleSection('social')}
                    >
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {profile.socialLinks.linkedin && (
                          <a
                            href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://${profile.socialLinks.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                              background: '#fff',
                              border: '2px solid #000',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              color: '#000',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: "'Courier New', Courier, monospace",
                              textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.color = '#000'
                            }}
                          >
                            LINKEDIN
                          </a>
                        )}
                        {profile.socialLinks.twitter && (
                          <a
                            href={profile.socialLinks.twitter.startsWith('http') ? profile.socialLinks.twitter : `https://${profile.socialLinks.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                              background: '#fff',
                              border: '2px solid #000',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              color: '#000',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: "'Courier New', Courier, monospace",
                              textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.color = '#000'
                            }}
                          >
                            TWITTER
                          </a>
                        )}
                        {profile.socialLinks.github && (
                          <a
                            href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://${profile.socialLinks.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                              background: '#fff',
                              border: '2px solid #000',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              color: '#000',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: "'Courier New', Courier, monospace",
                              textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.color = '#000'
                            }}
                          >
                            GITHUB
                          </a>
                        )}
                        {profile.socialLinks.portfolio && (
                          <a
                            href={profile.socialLinks.portfolio.startsWith('http') ? profile.socialLinks.portfolio : `https://${profile.socialLinks.portfolio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                              background: '#fff',
                              border: '2px solid #000',
                              fontSize: 'clamp(11px, 2vw, 13px)',
                              fontWeight: 'bold',
                              color: '#000',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: "'Courier New', Courier, monospace",
                              textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.color = '#000'
                            }}
                          >
                            PORTFOLIO
                          </a>
                        )}
                      </div>
                    </SectionCollapsible>
                  )}

                  {/* Section: Availability */}
                  {profile.availability && (
                    <SectionCollapsible
                      title="AVAILABILITY"
                      expanded={expandedSections.availability}
                      onToggle={() => toggleSection('availability')}
                    >
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 15px)',
                        color: '#000',
                        lineHeight: 1.8,
                        margin: 0,
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.availability}
                      </p>
                    </SectionCollapsible>
                  )}

                  {/* Meeting Room */}
                  <div style={{
                    background: '#fff',
                    padding: 'clamp(24px, 4vw, 32px)',
                    border: '2px solid #000',
                    marginTop: '32px'
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(12px, 2vw, 14px)',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '16px',
                      color: '#000',
                      fontFamily: "'Courier New', Courier, monospace",
                      borderBottom: '1px solid #000',
                      paddingBottom: '8px'
                    }}>
                      MEETING ROOM
                    </h3>
                    <button
                      onClick={() => {
                        window.open(
                          `/meeting/${profile.id}`,
                          'forefront-meeting',
                          'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no'
                        )
                      }}
                      style={{
                        padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
                        background: '#000',
                        color: '#fff',
                        border: '2px solid #000',
                        fontSize: 'clamp(12px, 2vw, 14px)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Courier New', Courier, monospace"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.color = '#000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#000'
                        e.currentTarget.style.color = '#fff'
                      }}
                    >
                      JOIN MEETING ROOM
                    </button>
                    <p style={{
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      color: '#000',
                      marginTop: '16px',
                      lineHeight: 1.5,
                      fontFamily: "'Courier New', Courier, monospace",
                      borderTop: '1px solid #000',
                      paddingTop: '12px'
                    }}>
                      OPENS IN NEW WINDOW | CAMERA & MICROPHONE REQUIRED
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '80px', textAlign: 'center', color: '#000', fontFamily: "'Courier New', Courier, monospace" }}>
                PROFILE NOT FOUND
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Collapsible Section Component
function SectionCollapsible({
  title,
  expanded,
  onToggle,
  children
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 20px)',
          background: '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '2px solid #000',
          marginBottom: expanded ? '8px' : '0',
          fontFamily: "'Courier New', Courier, monospace"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#000'
          const heading = e.currentTarget.querySelector('h3') as HTMLElement
          const arrow = e.currentTarget.querySelector('span') as HTMLElement
          if (heading) heading.style.color = '#fff'
          if (arrow) arrow.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff'
          const heading = e.currentTarget.querySelector('h3') as HTMLElement
          const arrow = e.currentTarget.querySelector('span') as HTMLElement
          if (heading) heading.style.color = '#000'
          if (arrow) arrow.style.color = '#000'
        }}
      >
        <h3 style={{
          fontSize: 'clamp(11px, 2vw, 13px)',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#000',
          margin: 0,
          fontFamily: "'Courier New', Courier, monospace",
          transition: 'color 0.2s ease'
        }}>
          {title}
        </h3>
        <span style={{
          fontSize: 'clamp(16px, 3vw, 18px)',
          fontWeight: 'bold',
          color: '#000',
          transition: 'transform 0.2s ease, color 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          fontFamily: "'Courier New', Courier, monospace"
        }}>
          v
        </span>
      </div>
      {expanded && (
        <div style={{
          background: '#fff',
          padding: 'clamp(20px, 3vw, 24px)',
          border: '1px solid #000',
          borderLeft: '4px solid #000'
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
