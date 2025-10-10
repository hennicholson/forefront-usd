'use client'
import { useState } from 'react'
import { UserProfile, Experience, Education, Skill, Certification, Project, Award } from '@/types/profile'

interface ProfileEditorProps {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel: () => void
}

export function ProfileEditor({ profile: initialProfile, onSave, onCancel }: ProfileEditorProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [activeSection, setActiveSection] = useState<'basic' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'awards'>('basic')

  const updateBasic = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const updateSocialLinks = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value || undefined
      }
    }))
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: null,
      current: false,
      description: ''
    }
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      startDate: '',
      endDate: null,
      current: false
    }
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addSkill = (name: string) => {
    if (!name) return
    const newSkill: Skill = { name, endorsements: 0 }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuingOrganization: '',
      issueDate: ''
    }
    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }))
  }

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const removeCertification = (id: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }))
  }

  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      startDate: '',
      endDate: null,
      current: false
    }
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }))
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const removeProject = (id: string) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }))
  }

  const addAward = () => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      title: '',
      issuer: '',
      issueDate: ''
    }
    setProfile(prev => ({
      ...prev,
      awards: [...prev.awards, newAward]
    }))
  }

  const updateAward = (id: string, field: keyof Award, value: any) => {
    setProfile(prev => ({
      ...prev,
      awards: prev.awards.map(award =>
        award.id === id ? { ...award, [field]: value } : award
      )
    }))
  }

  const removeAward = (id: string) => {
    setProfile(prev => ({
      ...prev,
      awards: prev.awards.filter(award => award.id !== id)
    }))
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#000',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: '1.5'
  }

  const buttonStyle = {
    padding: '10px 20px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'lowercase' as const,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  }

  const sectionButtonStyle = (active: boolean) => ({
    padding: '10px 16px',
    background: active ? '#4a90e2' : '#f5f5f5',
    color: active ? '#fff' : '#666',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'lowercase' as const,
    letterSpacing: '0.3px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  })

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#333',
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
            Edit profile
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: '#f5f5f5',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
            }}
          >
            ×
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{
          padding: '16px 32px',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => setActiveSection('basic')} style={sectionButtonStyle(activeSection === 'basic')}>
            basic
          </button>
          <button onClick={() => setActiveSection('experience')} style={sectionButtonStyle(activeSection === 'experience')}>
            experience ({profile.experience.length})
          </button>
          <button onClick={() => setActiveSection('education')} style={sectionButtonStyle(activeSection === 'education')}>
            education ({profile.education.length})
          </button>
          <button onClick={() => setActiveSection('skills')} style={sectionButtonStyle(activeSection === 'skills')}>
            skills ({profile.skills.length})
          </button>
          <button onClick={() => setActiveSection('certifications')} style={sectionButtonStyle(activeSection === 'certifications')}>
            certs ({profile.certifications.length})
          </button>
          <button onClick={() => setActiveSection('projects')} style={sectionButtonStyle(activeSection === 'projects')}>
            projects ({profile.projects.length})
          </button>
          <button onClick={() => setActiveSection('awards')} style={sectionButtonStyle(activeSection === 'awards')}>
            awards ({profile.awards.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {/* Basic Section */}
          {activeSection === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  headline
                </label>
                <input
                  type="text"
                  value={profile.headline || ''}
                  onChange={(e) => updateBasic('headline', e.target.value)}
                  placeholder="Your professional headline"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => updateBasic('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    location
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => updateBasic('location', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateBasic('phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  website
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => updateBasic('website', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  professional summary
                </label>
                <textarea
                  value={profile.summary || ''}
                  onChange={(e) => updateBasic('summary', e.target.value)}
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  availability
                </label>
                <input
                  type="text"
                  value={profile.availability || ''}
                  onChange={(e) => updateBasic('availability', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  social links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="url"
                    value={profile.socialLinks.linkedin || ''}
                    onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                    style={inputStyle}
                  />
                  <input
                    type="url"
                    value={profile.socialLinks.twitter || ''}
                    onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                    placeholder="Twitter URL"
                    style={inputStyle}
                  />
                  <input
                    type="url"
                    value={profile.socialLinks.github || ''}
                    onChange={(e) => updateSocialLinks('github', e.target.value)}
                    placeholder="GitHub URL"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {profile.experience.map((exp) => (
                <div key={exp.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    remove
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="Company"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        placeholder="Job Title"
                        style={inputStyle}
                      />
                    </div>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      placeholder="Location"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="Start (YYYY-MM)"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value || null)}
                        placeholder="End (YYYY-MM)"
                        disabled={exp.current}
                        style={{ ...inputStyle, opacity: exp.current ? 0.5 : 1 }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>current position</span>
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Description"
                      style={textareaStyle}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addExperience} style={buttonStyle}>
                + add experience
              </button>
            </div>
          )}

          {/* Education Section */}
          {activeSection === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {profile.education.map((edu) => (
                <div key={edu.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeEducation(edu.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    remove
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      placeholder="School"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Degree"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        placeholder="Field of Study"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        placeholder="Start (YYYY-MM)"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value || null)}
                        placeholder="End (YYYY-MM)"
                        disabled={edu.current}
                        style={{ ...inputStyle, opacity: edu.current ? 0.5 : 1 }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>currently studying</span>
                    </label>
                  </div>
                </div>
              ))}
              <button onClick={addEducation} style={buttonStyle}>
                + add education
              </button>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skills.map((skill, idx) => (
                  <div key={idx} style={{
                    background: '#000',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {skill.name}
                    <button
                      onClick={() => removeSkill(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: 1,
                        padding: 0
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  id="skill-input"
                  placeholder="Add a skill..."
                  style={{ ...inputStyle, flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget as HTMLInputElement
                      addSkill(input.value)
                      input.value = ''
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('skill-input') as HTMLInputElement
                    if (input.value) {
                      addSkill(input.value)
                      input.value = ''
                    }
                  }}
                  style={buttonStyle}
                >
                  + add
                </button>
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {activeSection === 'certifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {profile.certifications.map((cert) => (
                <div key={cert.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeCertification(cert.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    remove
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        placeholder="Certification Name"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={cert.issuingOrganization}
                        onChange={(e) => updateCertification(cert.id, 'issuingOrganization', e.target.value)}
                        placeholder="Issuing Organization"
                        style={inputStyle}
                      />
                    </div>
                    <input
                      type="text"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                      placeholder="Issue Date (YYYY-MM)"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addCertification} style={buttonStyle}>
                + add certification
              </button>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {profile.projects.map((proj) => (
                <div key={proj.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeProject(proj.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    remove
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                      placeholder="Project Name"
                      style={inputStyle}
                    />
                    <textarea
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      placeholder="Description"
                      style={textareaStyle}
                    />
                    <input
                      type="url"
                      value={proj.url || ''}
                      onChange={(e) => updateProject(proj.id, 'url', e.target.value)}
                      placeholder="Project URL"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addProject} style={buttonStyle}>
                + add project
              </button>
            </div>
          )}

          {/* Awards Section */}
          {activeSection === 'awards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {profile.awards.map((award) => (
                <div key={award.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeAward(award.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    remove
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={award.title}
                        onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                        placeholder="Award Title"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={award.issuer}
                        onChange={(e) => updateAward(award.id, 'issuer', e.target.value)}
                        placeholder="Issuer"
                        style={inputStyle}
                      />
                    </div>
                    <input
                      type="text"
                      value={award.issueDate}
                      onChange={(e) => updateAward(award.id, 'issueDate', e.target.value)}
                      placeholder="Date (YYYY-MM)"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addAward} style={buttonStyle}>
                + add award
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '2px solid #f0f0f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              ...buttonStyle,
              background: '#fff',
              color: '#000',
              border: '2px solid #e0e0e0'
            }}
          >
            cancel
          </button>
          <button onClick={() => onSave(profile)} style={buttonStyle}>
            save changes
          </button>
        </div>
      </div>
    </div>
  )
}
