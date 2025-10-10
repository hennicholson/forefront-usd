'use client'
import { useState } from 'react'
import { UserProfile, Experience, Education, Skill, Certification, Project, Award } from '@/types/profile'

interface QuestionnaireProps {
  userId: string
  onComplete: (profile: Partial<UserProfile>) => void
  onSkip: () => void
}

type Step = 'basic' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'awards' | 'review'

export function QuickFillQuestionnaire({ userId, onComplete, onSkip }: QuestionnaireProps) {
  const [step, setStep] = useState<Step>('basic')
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    awards: [],
    interests: []
  })

  // Basic Info State
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [summary, setSummary] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [github, setGithub] = useState('')
  const [availability, setAvailability] = useState('')

  // Current Experience State
  const [expCompany, setExpCompany] = useState('')
  const [expTitle, setExpTitle] = useState('')
  const [expLocation, setExpLocation] = useState('')
  const [expEmploymentType, setExpEmploymentType] = useState('')
  const [expStartDate, setExpStartDate] = useState('')
  const [expEndDate, setExpEndDate] = useState('')
  const [expCurrent, setExpCurrent] = useState(false)
  const [expDescription, setExpDescription] = useState('')
  const [expResponsibilities, setExpResponsibilities] = useState('')

  // Current Education State
  const [eduSchool, setEduSchool] = useState('')
  const [eduDegree, setEduDegree] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduStartDate, setEduStartDate] = useState('')
  const [eduEndDate, setEduEndDate] = useState('')
  const [eduCurrent, setEduCurrent] = useState(false)
  const [eduGrade, setEduGrade] = useState('')
  const [eduActivities, setEduActivities] = useState('')

  // Skills State
  const [skillName, setSkillName] = useState('')

  // Certifications State
  const [certName, setCertName] = useState('')
  const [certOrg, setCertOrg] = useState('')
  const [certIssueDate, setCertIssueDate] = useState('')
  const [certExpDate, setCertExpDate] = useState('')
  const [certCredentialId, setCertCredentialId] = useState('')
  const [certUrl, setCertUrl] = useState('')

  // Projects State
  const [projName, setProjName] = useState('')
  const [projDescription, setProjDescription] = useState('')
  const [projStartDate, setProjStartDate] = useState('')
  const [projEndDate, setProjEndDate] = useState('')
  const [projCurrent, setProjCurrent] = useState(false)
  const [projUrl, setProjUrl] = useState('')
  const [projSkills, setProjSkills] = useState('')

  // Awards State
  const [awardTitle, setAwardTitle] = useState('')
  const [awardIssuer, setAwardIssuer] = useState('')
  const [awardDate, setAwardDate] = useState('')
  const [awardDescription, setAwardDescription] = useState('')

  const saveBasicInfo = () => {
    setProfile(prev => ({
      ...prev,
      headline,
      bio,
      location,
      phone,
      website,
      summary,
      availability,
      socialLinks: {
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        github: github || undefined
      }
    }))
    setStep('experience')
  }

  const addExperience = () => {
    if (!expCompany || !expTitle) return

    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: expCompany,
      title: expTitle,
      location: expLocation,
      employmentType: expEmploymentType || undefined,
      startDate: expStartDate,
      endDate: expCurrent ? null : expEndDate,
      current: expCurrent,
      description: expDescription,
      responsibilities: expResponsibilities ? expResponsibilities.split('\n').filter(r => r.trim()) : undefined
    }

    setProfile(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExp]
    }))

    // Reset form
    setExpCompany('')
    setExpTitle('')
    setExpLocation('')
    setExpEmploymentType('')
    setExpStartDate('')
    setExpEndDate('')
    setExpCurrent(false)
    setExpDescription('')
    setExpResponsibilities('')
  }

  const addEducation = () => {
    if (!eduSchool) return

    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: eduSchool,
      degree: eduDegree || undefined,
      fieldOfStudy: eduField || undefined,
      startDate: eduStartDate,
      endDate: eduCurrent ? null : eduEndDate,
      current: eduCurrent,
      grade: eduGrade || undefined,
      activities: eduActivities || undefined
    }

    setProfile(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }))

    // Reset form
    setEduSchool('')
    setEduDegree('')
    setEduField('')
    setEduStartDate('')
    setEduEndDate('')
    setEduCurrent(false)
    setEduGrade('')
    setEduActivities('')
  }

  const addSkill = () => {
    if (!skillName) return

    const newSkill: Skill = {
      name: skillName,
      endorsements: 0
    }

    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill]
    }))

    setSkillName('')
  }

  const addCertification = () => {
    if (!certName || !certOrg) return

    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: certName,
      issuingOrganization: certOrg,
      issueDate: certIssueDate,
      expirationDate: certExpDate || null,
      credentialId: certCredentialId || undefined,
      credentialUrl: certUrl || undefined
    }

    setProfile(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert]
    }))

    // Reset form
    setCertName('')
    setCertOrg('')
    setCertIssueDate('')
    setCertExpDate('')
    setCertCredentialId('')
    setCertUrl('')
  }

  const addProject = () => {
    if (!projName) return

    const newProj: Project = {
      id: crypto.randomUUID(),
      name: projName,
      description: projDescription,
      startDate: projStartDate,
      endDate: projCurrent ? null : projEndDate,
      current: projCurrent,
      url: projUrl || undefined,
      skills: projSkills ? projSkills.split(',').map(s => s.trim()) : undefined
    }

    setProfile(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }))

    // Reset form
    setProjName('')
    setProjDescription('')
    setProjStartDate('')
    setProjEndDate('')
    setProjCurrent(false)
    setProjUrl('')
    setProjSkills('')
  }

  const addAward = () => {
    if (!awardTitle || !awardIssuer) return

    const newAward: Award = {
      id: crypto.randomUUID(),
      title: awardTitle,
      issuer: awardIssuer,
      issueDate: awardDate,
      description: awardDescription || undefined
    }

    setProfile(prev => ({
      ...prev,
      awards: [...(prev.awards || []), newAward]
    }))

    // Reset form
    setAwardTitle('')
    setAwardIssuer('')
    setAwardDate('')
    setAwardDescription('')
  }

  const finishQuestionnaire = async () => {
    await onComplete({ ...profile, profileComplete: true })
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#000',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none'
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: '1.5'
  }

  const buttonStyle = {
    padding: '12px 24px',
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

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#f5f5f5',
    color: '#666',
    border: '1px solid #ddd'
  }

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
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Progress Bar */}
        <div style={{
          background: '#f0f0f0',
          height: '3px',
          width: '100%',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{
            background: '#4a90e2',
            height: '100%',
            width: step === 'basic' ? '14%' :
                   step === 'experience' ? '28%' :
                   step === 'education' ? '42%' :
                   step === 'skills' ? '56%' :
                   step === 'projects' ? '70%' :
                   step === 'certifications' ? '84%' :
                   step === 'awards' ? '92%' : '100%',
            transition: 'width 0.4s ease',
            borderRadius: '12px 12px 0 0'
          }} />
        </div>

        <div style={{ padding: '32px' }}>
          {/* Skip Button */}
          <button
            onClick={onSkip}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'lowercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              color: '#999',
              fontFamily: 'inherit',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.color = '#666'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#999'
            }}
          >
            skip for now
          </button>

          {/* Basic Info Step */}
          {step === 'basic' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                Let's build your profile
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 1 of 7 · Basic information
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Software Engineer | AI Enthusiast"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself in a few sentences..."
                    style={textareaStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    professional summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Your professional summary or elevator pitch..."
                    style={textareaStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    linkedin url
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      twitter
                    </label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/yourusername"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      github
                    </label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g. Available for consulting, Open to opportunities"
                    style={inputStyle}
                  />
                </div>

                <button onClick={saveBasicInfo} style={buttonStyle}>
                  Continue to experience
                </button>
              </div>
            </div>
          )}

          {/* Experience Step */}
          {step === 'experience' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                work experience
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 2/7 · add your professional experience
              </p>

              {/* Existing Experience List */}
              {profile.experience && profile.experience.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {profile.experience.map((exp, idx) => (
                    <div key={exp.id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{exp.title}</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>{exp.company}</div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      company *
                    </label>
                    <input
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="Company name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      job title *
                    </label>
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="Your role"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      location
                    </label>
                    <input
                      type="text"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      placeholder="City, Country"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      employment type
                    </label>
                    <select
                      value={expEmploymentType}
                      onChange={(e) => setExpEmploymentType(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      start date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={expStartDate}
                      onChange={(e) => setExpStartDate(e.target.value)}
                      placeholder="2024-01"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      end date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={expEndDate}
                      onChange={(e) => setExpEndDate(e.target.value)}
                      placeholder="2024-12"
                      disabled={expCurrent}
                      style={{
                        ...inputStyle,
                        opacity: expCurrent ? 0.5 : 1
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={expCurrent}
                      onChange={(e) => setExpCurrent(e.target.checked)}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      i currently work here
                    </span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    description
                  </label>
                  <textarea
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    placeholder="Describe what you did in this role..."
                    style={textareaStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    key responsibilities (one per line)
                  </label>
                  <textarea
                    value={expResponsibilities}
                    onChange={(e) => setExpResponsibilities(e.target.value)}
                    placeholder="Led team of 5 engineers&#10;Increased revenue by 30%&#10;Implemented CI/CD pipeline"
                    style={textareaStyle}
                  />
                </div>

                <button
                  onClick={addExperience}
                  disabled={!expCompany || !expTitle}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: (!expCompany || !expTitle) ? 0.5 : 1,
                    cursor: (!expCompany || !expTitle) ? 'not-allowed' : 'pointer'
                  }}
                >
                  + add experience
                </button>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('basic')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('education')} style={{ ...buttonStyle, flex: 1 }}>
                    Continue to education
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Education Step */}
          {step === 'education' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                education
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 3/7 · add your educational background
              </p>

              {/* Existing Education List */}
              {profile.education && profile.education.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {profile.education.map((edu) => (
                    <div key={edu.id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{edu.school}</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    school *
                  </label>
                  <input
                    type="text"
                    value={eduSchool}
                    onChange={(e) => setEduSchool(e.target.value)}
                    placeholder="University or school name"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      degree
                    </label>
                    <input
                      type="text"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="e.g. Bachelor's, Master's, PhD"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      field of study
                    </label>
                    <input
                      type="text"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      placeholder="e.g. Computer Science"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      start date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={eduStartDate}
                      onChange={(e) => setEduStartDate(e.target.value)}
                      placeholder="2020-09"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      end date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={eduEndDate}
                      onChange={(e) => setEduEndDate(e.target.value)}
                      placeholder="2024-06"
                      disabled={eduCurrent}
                      style={{
                        ...inputStyle,
                        opacity: eduCurrent ? 0.5 : 1
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eduCurrent}
                      onChange={(e) => setEduCurrent(e.target.checked)}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      currently studying here
                    </span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      grade/gpa
                    </label>
                    <input
                      type="text"
                      value={eduGrade}
                      onChange={(e) => setEduGrade(e.target.value)}
                      placeholder="3.8 GPA"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      activities
                    </label>
                    <input
                      type="text"
                      value={eduActivities}
                      onChange={(e) => setEduActivities(e.target.value)}
                      placeholder="Clubs, sports, etc."
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={addEducation}
                  disabled={!eduSchool}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: !eduSchool ? 0.5 : 1,
                    cursor: !eduSchool ? 'not-allowed' : 'pointer'
                  }}
                >
                  + add education
                </button>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('experience')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('skills')} style={{ ...buttonStyle, flex: 1 }}>
                    Continue to skills
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Skills Step */}
          {step === 'skills' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                skills
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 4/7 · list your professional skills
              </p>

              {/* Existing Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      background: '#000',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && skillName) {
                        addSkill()
                      }
                    }}
                    placeholder="e.g. JavaScript, React, Python..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={addSkill}
                    disabled={!skillName}
                    style={{
                      ...buttonStyle,
                      opacity: !skillName ? 0.5 : 1,
                      cursor: !skillName ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + add
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setStep('education')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('projects')} style={{ ...buttonStyle, flex: 1 }}>
                    Continue to projects
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Step */}
          {step === 'projects' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                projects
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 5/7 · showcase your notable projects
              </p>

              {/* Existing Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {profile.projects.map((proj) => (
                    <div key={proj.id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{proj.name}</div>
                      <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
                        {proj.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    project name *
                  </label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="My Awesome Project"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    description *
                  </label>
                  <textarea
                    value={projDescription}
                    onChange={(e) => setProjDescription(e.target.value)}
                    placeholder="What did you build? What problem does it solve?"
                    style={textareaStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      start date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={projStartDate}
                      onChange={(e) => setProjStartDate(e.target.value)}
                      placeholder="2024-01"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      end date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={projEndDate}
                      onChange={(e) => setProjEndDate(e.target.value)}
                      placeholder="2024-12"
                      disabled={projCurrent}
                      style={{
                        ...inputStyle,
                        opacity: projCurrent ? 0.5 : 1
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={projCurrent}
                      onChange={(e) => setProjCurrent(e.target.checked)}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      ongoing project
                    </span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    project url
                  </label>
                  <input
                    type="url"
                    value={projUrl}
                    onChange={(e) => setProjUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    technologies used (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={projSkills}
                    onChange={(e) => setProjSkills(e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={addProject}
                  disabled={!projName}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: !projName ? 0.5 : 1,
                    cursor: !projName ? 'not-allowed' : 'pointer'
                  }}
                >
                  + add project
                </button>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('skills')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('certifications')} style={{ ...buttonStyle, flex: 1 }}>
                    Continue to certifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certifications Step */}
          {step === 'certifications' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                certifications
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 6/7 · add professional certifications
              </p>

              {/* Existing Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{cert.name}</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>{cert.issuingOrganization}</div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        Issued: {cert.issueDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      certification name *
                    </label>
                    <input
                      type="text"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="AWS Solutions Architect"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      issuing organization *
                    </label>
                    <input
                      type="text"
                      value={certOrg}
                      onChange={(e) => setCertOrg(e.target.value)}
                      placeholder="Amazon Web Services"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      issue date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={certIssueDate}
                      onChange={(e) => setCertIssueDate(e.target.value)}
                      placeholder="2024-06"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      expiration date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={certExpDate}
                      onChange={(e) => setCertExpDate(e.target.value)}
                      placeholder="2027-06 or leave blank"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      credential id
                    </label>
                    <input
                      type="text"
                      value={certCredentialId}
                      onChange={(e) => setCertCredentialId(e.target.value)}
                      placeholder="ABC123XYZ"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      credential url
                    </label>
                    <input
                      type="url"
                      value={certUrl}
                      onChange={(e) => setCertUrl(e.target.value)}
                      placeholder="https://..."
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={addCertification}
                  disabled={!certName || !certOrg}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: (!certName || !certOrg) ? 0.5 : 1,
                    cursor: (!certName || !certOrg) ? 'not-allowed' : 'pointer'
                  }}
                >
                  + add certification
                </button>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('projects')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('awards')} style={{ ...buttonStyle, flex: 1 }}>
                    Continue to awards
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Awards Step */}
          {step === 'awards' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                awards & honors
              </h2>
              <p style={{ color: '#999', marginBottom: '32px', fontSize: '13px' }}>
                Step 7/7 · highlight your achievements
              </p>

              {/* Existing Awards */}
              {profile.awards && profile.awards.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {profile.awards.map((award) => (
                    <div key={award.id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{award.title}</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>{award.issuer}</div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {award.issueDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      award title *
                    </label>
                    <input
                      type="text"
                      value={awardTitle}
                      onChange={(e) => setAwardTitle(e.target.value)}
                      placeholder="Employee of the Year"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                      issuer *
                    </label>
                    <input
                      type="text"
                      value={awardIssuer}
                      onChange={(e) => setAwardIssuer(e.target.value)}
                      placeholder="Organization name"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    date (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={awardDate}
                    onChange={(e) => setAwardDate(e.target.value)}
                    placeholder="2024-01"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    description
                  </label>
                  <textarea
                    value={awardDescription}
                    onChange={(e) => setAwardDescription(e.target.value)}
                    placeholder="What was this award for?"
                    style={textareaStyle}
                  />
                </div>

                <button
                  onClick={addAward}
                  disabled={!awardTitle || !awardIssuer}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: (!awardTitle || !awardIssuer) ? 0.5 : 1,
                    cursor: (!awardTitle || !awardIssuer) ? 'not-allowed' : 'pointer'
                  }}
                >
                  + add award
                </button>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('certifications')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={() => setStep('review')} style={{ ...buttonStyle, flex: 1 }}>
                    Review and finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
                letterSpacing: '-0.5px'
              }}>
                review your profile
              </h2>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
                looks good? let's save it!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {profile.headline && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      headline
                    </div>
                    <div>{profile.headline}</div>
                  </div>
                )}

                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      experience ({profile.experience.length})
                    </div>
                    {profile.experience.map(exp => (
                      <div key={exp.id} style={{ marginBottom: '12px' }}>
                        <strong>{exp.title}</strong> at {exp.company}
                      </div>
                    ))}
                  </div>
                )}

                {profile.education && profile.education.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      education ({profile.education.length})
                    </div>
                    {profile.education.map(edu => (
                      <div key={edu.id} style={{ marginBottom: '12px' }}>
                        <strong>{edu.school}</strong> - {edu.degree}
                      </div>
                    ))}
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      skills ({profile.skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profile.skills.map((skill, idx) => (
                        <span key={idx} style={{
                          background: '#f5f5f5',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.projects && profile.projects.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      projects ({profile.projects.length})
                    </div>
                  </div>
                )}

                {profile.certifications && profile.certifications.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      certifications ({profile.certifications.length})
                    </div>
                  </div>
                )}

                {profile.awards && profile.awards.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#999' }}>
                      awards ({profile.awards.length})
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={() => setStep('awards')} style={secondaryButtonStyle}>
                    ← back
                  </button>
                  <button onClick={finishQuestionnaire} style={{ ...buttonStyle, flex: 1 }}>
                    Save my profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
