'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile, Experience, Education, Certification, Project, Award } from '@/types/profile'
import { ExpandableSection } from './ExpandableSection'
import { motion, AnimatePresence } from 'framer-motion'

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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              overflowY: 'auto'
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="modal-content"
              style={{
                background: '#fff',
                maxWidth: '1000px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                border: '3px solid #000',
                borderRadius: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="close-button"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'transparent',
              color: '#000',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              zIndex: 100,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#666'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#000'
            }}
          >
            ×
          </button>

          <div style={{ maxHeight: '90vh', overflow: 'auto' }}>
            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                loading profile...
              </div>
            ) : profile ? (
              <div>
                {/* Header Section */}
                <div
                  className="modal-header"
                  style={{
                    background: '#fafafa',
                    padding: '40px',
                    color: '#000',
                    position: 'relative',
                    borderBottom: '2px solid #e0e0e0'
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                      <h2 style={{
                        fontSize: 'clamp(28px, 5vw, 36px)',
                        fontWeight: 900,
                        textTransform: 'lowercase',
                        letterSpacing: '-1px',
                        margin: 0,
                        color: '#000'
                      }}>
                        {profile.name}
                      </h2>
                      {user?.geminiApiKey && (
                        <button
                          onClick={handleAiSummarize}
                          disabled={summarizing}
                          style={{
                            padding: '10px 20px',
                            background: aiSummary ? '#000' : '#fff',
                            color: aiSummary ? '#fff' : '#000',
                            border: '2px solid #000',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'lowercase',
                            letterSpacing: '0.5px',
                            cursor: summarizing ? 'not-allowed' : 'pointer',
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
                          {summarizing ? 'scouting...' : 'ai scout'}
                        </button>
                      )}
                    </div>
                    {profile.headline && (
                      <p style={{
                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                        fontWeight: 400,
                        marginBottom: '20px',
                        lineHeight: 1.5,
                        color: '#666'
                      }}>
                        {profile.headline}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: 'clamp(12px, 2vw, 13px)', color: '#999' }}>
                      {profile.location && <p style={{ margin: 0 }}>{profile.location}</p>}
                      {profile.email && <p style={{ margin: 0 }}>{profile.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="modal-body" style={{ padding: '32px' }}>
                  {/* AI Summary */}
                  {aiSummary && (
                    <div style={{
                      background: '#f5f5f5',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 900,
                          textTransform: 'lowercase',
                          letterSpacing: '-0.5px',
                          color: '#000',
                          margin: 0,
                          marginBottom: '4px'
                        }}>
                          ai scout report
                        </h3>
                        <div style={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>
                          professional analysis
                        </div>
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        lineHeight: 1.6,
                        color: '#333',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {aiSummary}
                      </div>
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e0e0e0',
                        fontSize: '11px',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          background: '#000',
                          color: '#fff',
                          padding: '3px 6px',
                          fontSize: '9px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          gemini
                        </span>
                        <span>powered ai analysis</span>
                      </div>
                    </div>
                  )}

                  {/* Section: About */}
                  {profile.bio && (
                    <ExpandableSection title="about" defaultExpanded={true}>
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: '#333',
                        lineHeight: 1.6,
                        margin: 0
                      }}>
                        {profile.bio}
                      </p>
                    </ExpandableSection>
                  )}

                  {/* Section: Summary */}
                  {profile.summary && (
                    <ExpandableSection title="summary">
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: '#333',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        margin: 0
                      }}>
                        {profile.summary}
                      </p>
                    </ExpandableSection>
                  )}

                  {/* Section: Experience */}
                  {profile.experience && profile.experience.length > 0 && profile.profileVisibility?.experience !== false && (
                    <ExpandableSection
                      title={`experience (${profile.experience.length})`}
                      defaultExpanded={true}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {profile.experience.map((exp: Experience) => (
                          <div key={exp.id} style={{
                            background: '#fafafa',
                            padding: '18px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '10px'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 2.5vw, 15px)', marginBottom: '6px', color: '#000' }}>
                              {exp.title}
                            </div>
                            <div style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                              {exp.company} {exp.employmentType && `· ${exp.employmentType}`}
                            </div>
                            <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#999', marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span>{exp.startDate} - {exp.current ? 'present' : exp.endDate}</span>
                              {exp.location && <span>· {exp.location}</span>}
                            </div>
                            {exp.description && (
                              <p style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#333', lineHeight: 1.6, marginBottom: '12px' }}>
                                {exp.description}
                              </p>
                            )}
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                              <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                                {exp.responsibilities.map((resp, idx) => (
                                  <li key={idx} style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#333', marginBottom: '6px', lineHeight: 1.5 }}>
                                    {resp}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </ExpandableSection>
                  )}

                  {/* Section: Education */}
                  {profile.education && profile.education.length > 0 && profile.profileVisibility?.education !== false && (
                    <ExpandableSection title={`education (${profile.education.length})`}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {profile.education.map((edu: Education) => (
                          <div key={edu.id} style={{
                            background: '#fafafa',
                            padding: '18px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '10px'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 2.5vw, 15px)', marginBottom: '6px', color: '#000' }}>
                              {edu.school}
                            </div>
                            {edu.degree && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                                {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                              </div>
                            )}
                            <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#999', marginBottom: edu.grade || edu.activities ? '12px' : '0' }}>
                              {edu.startDate} - {edu.current ? 'present' : edu.endDate}
                            </div>
                            {edu.grade && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#333', marginTop: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#666' }}>grade:</span> {edu.grade}
                              </div>
                            )}
                            {edu.activities && (
                              <div style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#333', marginTop: '6px', lineHeight: 1.6 }}>
                                <span style={{ fontWeight: 600, color: '#666' }}>activities:</span> {edu.activities}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ExpandableSection>
                  )}

                  {/* Section: Skills */}
                  {profile.skills && profile.skills.length > 0 && profile.profileVisibility?.skills !== false && (
                    <ExpandableSection title={`skills (${profile.skills.length})`}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#000',
                              color: '#fff',
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              cursor: 'default'
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </ExpandableSection>
                  )}

                  {/* Two Column Grid for Certifications & Awards */}
                  <div className="grid-2col" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '32px',
                    marginBottom: '32px'
                  }}>
                    {/* Section: Certifications */}
                    {profile.certifications && profile.certifications.length > 0 && profile.profileVisibility?.certifications !== false && (
                      <ExpandableSection
                        title={`certifications (${profile.certifications.length})`}
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
                      </ExpandableSection>
                    )}

                    {/* Section: Awards */}
                    {profile.awards && profile.awards.length > 0 && profile.profileVisibility?.awards !== false && (
                      <ExpandableSection
                        title={`awards & honors (${profile.awards.length})`}
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
                      </ExpandableSection>
                    )}
                  </div>

                  {/* Section: Projects */}
                  {profile.projects && profile.projects.length > 0 && profile.profileVisibility?.projects !== false && (
                    <ExpandableSection
                      title={`projects (${profile.projects.length})`}
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
                    </ExpandableSection>
                  )}

                  {/* Section: Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <ExpandableSection
                      title={`interests (${profile.interests.length})`}
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
                    </ExpandableSection>
                  )}

                  {/* Section: Social Links */}
                  {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
                    <ExpandableSection title="connect">
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
                    </ExpandableSection>
                  )}

                  {/* Section: Availability */}
                  {profile.availability && (
                    <ExpandableSection title="availability">
                      <p style={{
                        fontSize: 'clamp(13px, 2vw, 15px)',
                        color: '#000',
                        lineHeight: 1.8,
                        margin: 0,
                        fontFamily: "'Courier New', Courier, monospace"
                      }}>
                        {profile.availability}
                      </p>
                    </ExpandableSection>
                  )}

                  {/* Meeting Room */}
                  <div style={{
                    background: '#fafafa',
                    padding: '24px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    marginTop: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      marginBottom: '12px',
                      color: '#000'
                    }}>
                      meeting room
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
                        padding: '12px 24px',
                        background: '#000',
                        color: '#fff',
                        border: '2px solid #000',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#333'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#000'
                      }}
                    >
                      join meeting room
                    </button>
                    <p style={{
                      fontSize: '11px',
                      color: '#999',
                      marginTop: '12px',
                      lineHeight: 1.5
                    }}>
                      opens in new window · camera & microphone required
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '80px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                profile not found
              </div>
            )}
          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
