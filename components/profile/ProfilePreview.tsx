'use client'
import { UserProfile } from '@/types/profile'
import { ExpandableSection } from './ExpandableSection'
import { Experience, Education, Certification, Project, Award } from '@/types/profile'

interface ProfilePreviewProps {
  profile: UserProfile
  isOpen: boolean
  onClose: () => void
}

export function ProfilePreview({ profile, isOpen, onClose }: ProfilePreviewProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          border: '3px solid #000',
          borderRadius: '16px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
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
            padding: 0,
            lineHeight: 1
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
          {/* Banner Image */}
          {profile.bannerImage && (
            <div style={{
              width: '100%',
              height: '250px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img
                src={profile.bannerImage}
                alt="Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          )}

          {/* Header Section */}
          <div style={{
            background: '#fafafa',
            padding: '40px',
            color: '#000',
            position: 'relative',
            borderBottom: '2px solid #e0e0e0',
            marginTop: profile.bannerImage ? '-60px' : '0'
          }}>
            {/* Profile Picture */}
            {profile.profileImage && (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 10
              }}>
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
            )}

            <div style={{
              padding: '8px 16px',
              background: '#000',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-block',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              live preview
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 900,
              textTransform: 'lowercase',
              letterSpacing: '-1px',
              margin: 0,
              marginBottom: '12px',
              color: '#000'
            }}>
              {profile.name}
            </h2>

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

            <div style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: 'clamp(12px, 2vw, 13px)',
              color: '#999'
            }}>
              {profile.location && <p style={{ margin: 0 }}>{profile.location}</p>}
              {profile.email && <p style={{ margin: 0 }}>{profile.email}</p>}
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: '32px' }}>
            {/* About */}
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

            {/* Summary */}
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

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && profile.profileVisibility?.experience !== false && (
              <ExpandableSection title={`experience (${profile.experience.length})`} defaultExpanded={true}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.experience.map((exp: Experience) => (
                    <div key={exp.id} style={{
                      background: '#fafafa',
                      padding: '18px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 'clamp(14px, 2.5vw, 15px)',
                        marginBottom: '6px',
                        color: '#000'
                      }}>
                        {exp.title}
                      </div>
                      <div style={{
                        fontSize: 'clamp(12px, 2vw, 13px)',
                        color: '#666',
                        marginBottom: '8px',
                        fontWeight: 600
                      }}>
                        {exp.company}
                      </div>
                      <div style={{
                        fontSize: 'clamp(11px, 2vw, 12px)',
                        color: '#999',
                        marginBottom: '12px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{exp.startDate} - {exp.current ? 'present' : exp.endDate}</span>
                        {exp.location && <span>· {exp.location}</span>}
                      </div>
                      {exp.description && (
                        <p style={{
                          fontSize: 'clamp(12px, 2vw, 13px)',
                          color: '#333',
                          lineHeight: 1.6,
                          marginBottom: 0
                        }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Education */}
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
                      <div style={{
                        fontWeight: 700,
                        fontSize: 'clamp(14px, 2.5vw, 15px)',
                        marginBottom: '6px',
                        color: '#000'
                      }}>
                        {edu.school}
                      </div>
                      {edu.degree && (
                        <div style={{
                          fontSize: 'clamp(12px, 2vw, 13px)',
                          color: '#666',
                          marginBottom: '8px',
                          fontWeight: 600
                        }}>
                          {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </div>
                      )}
                      <div style={{
                        fontSize: 'clamp(11px, 2vw, 12px)',
                        color: '#999'
                      }}>
                        {edu.startDate} - {edu.current ? 'present' : edu.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Skills */}
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
                        borderRadius: '6px'
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </ExpandableSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
