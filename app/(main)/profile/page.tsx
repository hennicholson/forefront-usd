'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { UserProfile, Experience, Education, Skill, Certification, Project, Award } from '@/types/profile'
import { QuickFillQuestionnaire } from '@/components/profile/QuickFillQuestionnaire'
import { LinkedInImport } from '@/components/profile/LinkedInImport'
import { ProfilePreview } from '@/components/profile/ProfilePreview'
import { Avatar } from '@/components/common/Avatar'
import { ImageCropper } from '@/components/profile/ImageCropper'
import { ExpandableSection } from '@/components/profile/ExpandableSection'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [showLinkedInImport, setShowLinkedInImport] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Active section for main tabs
  const [activeTab, setActiveTab] = useState<'basic' | 'comprehensive' | 'preview'>('basic')

  // Active subsection within comprehensive tab
  const [activeSubSection, setActiveSubSection] = useState<'display' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'awards'>('experience')

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    interests: [] as string[],
    meetingLink: '',
    availability: '',
    geminiApiKey: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    },
    profileImage: '',
    bannerImage: ''
  })

  const [interestInput, setInterestInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cropperData, setCropperData] = useState<{
    imageUrl: string
    type: 'profile' | 'banner'
  } | null>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

  // Refs for segmented control buttons
  const basicButtonRef = useRef<HTMLButtonElement>(null)
  const comprehensiveButtonRef = useRef<HTMLButtonElement>(null)
  const previewButtonRef = useRef<HTMLButtonElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: '4px', width: '0px' })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    const loadProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        const res = await fetch(`/api/users/${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setFormData({
            name: data.name || '',
            bio: data.bio || '',
            interests: data.interests || [],
            meetingLink: data.meetingLink || 'https://skinny-studio.whereby.com/forefront54fe1520-5c6b-46bd-b624-31950bf609b9',
            availability: data.availability || '',
            geminiApiKey: data.geminiApiKey || '',
            socialLinks: data.socialLinks || { linkedin: '', twitter: '', github: '' },
            profileImage: data.profileImage || '',
            bannerImage: data.bannerImage || ''
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, isAuthenticated, router])

  // Update indicator position when active tab changes
  useEffect(() => {
    const updateIndicator = () => {
      let buttonRef
      if (activeTab === 'basic') buttonRef = basicButtonRef
      else if (activeTab === 'comprehensive') buttonRef = comprehensiveButtonRef
      else buttonRef = previewButtonRef

      if (buttonRef.current) {
        const left = buttonRef.current.offsetLeft
        const width = buttonRef.current.offsetWidth
        setIndicatorStyle({ left: `${left}px`, width: `${width}px` })
      }
    }

    updateIndicator()
    // Also update on window resize
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTab])

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        ...formData
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)

        // Update localStorage to sync across app
        localStorage.setItem('user', JSON.stringify(updated))

        // Force re-render by updating window
        window.dispatchEvent(new Event('storage'))

        alert('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const saveComprehensiveProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setShowQuestionnaire(false)
        alert('Profile updated successfully!')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
    }
  }

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      })
      setInterestInput('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setCropperData({ imageUrl: base64, type })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      setUploadingImage(false)
    }

    event.target.value = ''
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!cropperData || !user || !profile) return

    const field = cropperData.type === 'profile' ? 'profileImage' : 'bannerImage'

    // Update local state
    setFormData({ ...formData, [field]: croppedImage })

    // Immediately save to database
    setSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        [field]: croppedImage
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)

        // Update localStorage to sync across app
        localStorage.setItem('user', JSON.stringify(updated))

        // Force re-render by updating window
        window.dispatchEvent(new Event('storage'))

        alert(`${cropperData.type === 'profile' ? 'Profile picture' : 'Banner'} saved successfully!`)
      } else {
        throw new Error('Failed to save image')
      }
    } catch (err) {
      console.error('Error saving image:', err)
      alert('Failed to save image. Please try again.')
    } finally {
      setSaving(false)
      setCropperData(null)
    }
  }

  const handleCropCancel = () => {
    setCropperData(null)
  }

  const removeImage = (type: 'profile' | 'banner') => {
    if (type === 'profile') {
      setFormData({ ...formData, profileImage: '' })
    } else {
      setFormData({ ...formData, bannerImage: '' })
    }
  }

  // Profile editing functions
  const updateProfile = (field: keyof UserProfile, value: any) => {
    if (!profile) return
    setProfile(prev => ({ ...prev!, [field]: value }))
  }

  const toggleVisibility = (section: keyof NonNullable<typeof profile>['profileVisibility']) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      profileVisibility: {
        ...prev!.profileVisibility!,
        [section]: !prev!.profileVisibility![section]
      }
    }))
  }

  const addExperience = () => {
    if (!profile) return
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
      ...prev!,
      experience: [...prev!.experience, newExp]
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      experience: prev!.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      experience: prev!.experience.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    if (!profile) return
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      startDate: '',
      endDate: null,
      current: false
    }
    setProfile(prev => ({
      ...prev!,
      education: [...prev!.education, newEdu]
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      education: prev!.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      education: prev!.education.filter(edu => edu.id !== id)
    }))
  }

  const addSkill = (name: string) => {
    if (!name || !profile) return
    const newSkill: Skill = { name, endorsements: 0 }
    setProfile(prev => ({
      ...prev!,
      skills: [...prev!.skills, newSkill]
    }))
  }

  const removeSkill = (index: number) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      skills: prev!.skills.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    if (!profile) return
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuingOrganization: '',
      issueDate: ''
    }
    setProfile(prev => ({
      ...prev!,
      certifications: [...prev!.certifications, newCert]
    }))
  }

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      certifications: prev!.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const removeCertification = (id: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      certifications: prev!.certifications.filter(cert => cert.id !== id)
    }))
  }

  const addProject = () => {
    if (!profile) return
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      startDate: '',
      endDate: null,
      current: false
    }
    setProfile(prev => ({
      ...prev!,
      projects: [...prev!.projects, newProj]
    }))
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      projects: prev!.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const removeProject = (id: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      projects: prev!.projects.filter(proj => proj.id !== id)
    }))
  }

  const addAward = () => {
    if (!profile) return
    const newAward: Award = {
      id: crypto.randomUUID(),
      title: '',
      issuer: '',
      issueDate: ''
    }
    setProfile(prev => ({
      ...prev!,
      awards: [...prev!.awards, newAward]
    }))
  }

  const updateAward = (id: string, field: keyof Award, value: any) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      awards: prev!.awards.map(award =>
        award.id === id ? { ...award, [field]: value } : award
      )
    }))
  }

  const removeAward = (id: string) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      awards: prev!.awards.filter(award => award.id !== id)
    }))
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#000',
    outline: 'none',
    transition: 'all 0.2s ease'
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: '1.6'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#000',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
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
    padding: '12px 20px',
    background: active ? 'linear-gradient(135deg, #444 0%, #666 100%)' : '#f5f5f5',
    color: active ? '#fff' : '#666',
    border: active ? '2px solid #000' : '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'lowercase' as const,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
  })

  if (!isAuthenticated) return null

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="section" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'auto' }}>
        <div className="content">
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            your profile
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '20px'
          }}>
            edit profile
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            maxWidth: '600px'
          }}>
            customize your profile and professional information
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="section white" style={{ paddingTop: '60px', paddingBottom: '120px' }}>
        <div className="content">
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
              loading profile...
            </div>
          ) : (
            <div style={{ maxWidth: '1000px' }}>
              {/* Profile Preview & Image Uploads */}
              <div style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: '2px solid #e0e0e0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: '#000'
                  }}>
                    Profile Customization
                  </label>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    Upload images and crop them to your preference
                  </p>
                </div>

                {/* Banner Image */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    border: '2px solid #e0e0e0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.bannerImage ? (
                      <img
                        src={formData.bannerImage}
                        alt="Banner"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, textAlign: 'center', zIndex: 2, position: 'relative' }}>
                          Banner Image
                        </div>
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={() => bannerImageInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: '8px 16px',
                          background: '#fff',
                          border: '2px solid #000',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: uploadingImage ? 'not-allowed' : 'pointer',
                          opacity: uploadingImage ? 0.6 : 1
                        }}
                      >
                        {formData.bannerImage ? 'Change' : 'Upload'} Banner
                      </button>
                      {formData.bannerImage && (
                        <button
                          type="button"
                          onClick={() => removeImage('banner')}
                          style={{
                            padding: '8px 16px',
                            background: '#ff4444',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={bannerImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    style={{ display: 'none' }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    Recommended: 1200x300px, max 2MB (JPG, PNG, WebP)
                  </p>
                </div>

                {/* Profile Picture */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'relative',
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Avatar
                          src={null}
                          name={formData.name || user?.name || 'User'}
                          size="xl"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => profileImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#000',
                        border: '3px solid #fff',
                        color: '#fff',
                        fontSize: '16px',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: uploadingImage ? 0.6 : 1
                      }}
                      title="Change profile picture"
                    >
                      📷
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>
                      Profile Picture
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                      This will be displayed across the app. Recommended: Square image, max 2MB.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => profileImageInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: '8px 16px',
                          background: '#fff',
                          border: '2px solid #000',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: uploadingImage ? 'not-allowed' : 'pointer',
                          opacity: uploadingImage ? 0.6 : 1
                        }}
                      >
                        {formData.profileImage ? 'Change' : 'Upload'} Photo
                      </button>
                      {formData.profileImage && (
                        <button
                          type="button"
                          onClick={() => removeImage('profile')}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '2px solid #ff4444',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#ff4444',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Main Tab Navigation - Segmented Control */}
              <div style={{
                padding: '16px 0',
                marginBottom: '32px',
                position: 'sticky',
                top: 0,
                background: '#fafafa',
                zIndex: 10
              }}>
                <div style={{
                  display: 'inline-flex',
                  position: 'relative',
                  background: '#f5f5f5',
                  border: '2px solid #000',
                  borderRadius: '12px',
                  padding: '4px',
                  gap: '4px'
                }}>
                  {/* Animated sliding indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    height: 'calc(100% - 8px)',
                    background: '#000',
                    borderRadius: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none'
                  }} />

                  <button
                    ref={basicButtonRef}
                    onClick={() => setActiveTab('basic')}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: activeTab === 'basic' ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    basic
                  </button>
                  <button
                    ref={comprehensiveButtonRef}
                    onClick={() => setActiveTab('comprehensive')}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: activeTab === 'comprehensive' ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    comprehensive
                  </button>
                  <button
                    ref={previewButtonRef}
                    onClick={() => setActiveTab('preview')}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: activeTab === 'preview' ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    preview
                  </button>
                </div>
              </div>

              {/* Comprehensive Sub-Navigation */}
              {activeTab === 'comprehensive' && (
                <div style={{
                  padding: '12px 0',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button onClick={() => setActiveSubSection('display')} style={sectionButtonStyle(activeSubSection === 'display')}>
                    display settings
                  </button>
                  <button onClick={() => setActiveSubSection('experience')} style={sectionButtonStyle(activeSubSection === 'experience')}>
                    experience ({profile?.experience.length || 0})
                  </button>
                  <button onClick={() => setActiveSubSection('education')} style={sectionButtonStyle(activeSubSection === 'education')}>
                    education ({profile?.education.length || 0})
                  </button>
                  <button onClick={() => setActiveSubSection('skills')} style={sectionButtonStyle(activeSubSection === 'skills')}>
                    skills ({profile?.skills.length || 0})
                  </button>
                  <button onClick={() => setActiveSubSection('certifications')} style={sectionButtonStyle(activeSubSection === 'certifications')}>
                    certs ({profile?.certifications.length || 0})
                  </button>
                  <button onClick={() => setActiveSubSection('projects')} style={sectionButtonStyle(activeSubSection === 'projects')}>
                    projects ({profile?.projects.length || 0})
                  </button>
                  <button onClick={() => setActiveSubSection('awards')} style={sectionButtonStyle(activeSubSection === 'awards')}>
                    awards ({profile?.awards.length || 0})
                  </button>
                </div>
              )}

              {/* Section Content - Basic */}
              {activeTab === 'basic' && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    color: '#000',
                    textTransform: 'lowercase'
                  }}>
                    Basic Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        color: '#000',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{...inputStyle, border: '2px solid #e0e0e0', borderRadius: '8px', padding: '14px'}}
                      />
                    </div>

                  {/* Bio */}
                  <div>
                    <label style={labelStyle}>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      style={textareaStyle}
                    />
                  </div>

                  {/* Headline */}
                  {profile && (
                    <div>
                      <label style={labelStyle}>Headline</label>
                      <input
                        type="text"
                        value={profile.headline || ''}
                        onChange={(e) => updateProfile('headline', e.target.value)}
                        placeholder="Your professional headline"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {/* Location & Phone */}
                  {profile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Location</label>
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  {/* Website & Availability */}
                  {profile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Website</label>
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => updateProfile('website', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Availability</label>
                        <input
                          type="text"
                          value={profile.availability || ''}
                          onChange={(e) => updateProfile('availability', e.target.value)}
                          placeholder="e.g., Weekdays 3-5pm PST"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  {/* Professional Summary */}
                  {profile && (
                    <div>
                      <label style={labelStyle}>Professional Summary</label>
                      <textarea
                        value={profile.summary || ''}
                        onChange={(e) => updateProfile('summary', e.target.value)}
                        style={textareaStyle}
                      />
                    </div>
                  )}

                  {/* Social Links */}
                  <div>
                    <label style={{...labelStyle, marginBottom: '12px'}}>Social Links</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="url"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                        })}
                        placeholder="LinkedIn URL"
                        style={inputStyle}
                      />
                      <input
                        type="url"
                        value={formData.socialLinks.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                        })}
                        placeholder="Twitter URL"
                        style={inputStyle}
                      />
                      <input
                        type="url"
                        value={formData.socialLinks.github}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, github: e.target.value }
                        })}
                        placeholder="GitHub URL"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <label style={labelStyle}>Meeting Room Link (Whereby)</label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="https://whereby.com/your-room"
                      style={inputStyle}
                    />
                  </div>

                  {/* Gemini API Key */}
                  <div style={{ paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
                    <label style={labelStyle}>Gemini API Key</label>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                      Required for LinkedIn import and AI features
                    </p>
                    <input
                      type="password"
                      value={formData.geminiApiKey}
                      onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                      placeholder="sk-..."
                      style={inputStyle}
                    />
                  </div>
                  </div>
                </div>
              )}

              {/* Comprehensive Tab Content */}
              {activeTab === 'comprehensive' && (
                <div>
                  {/* LinkedIn PDF Upload Section */}
                  <div className="card" style={{
                    marginBottom: '32px',
                    padding: '32px',
                    background: '#fff',
                    border: '2px solid #000',
                    borderRadius: '16px'
                  }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#000', textTransform: 'lowercase' }}>
                      Import from LinkedIn
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
                      Upload your LinkedIn profile PDF or use the quick fill questionnaire to auto-populate your professional information
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setShowQuestionnaire(true)}
                        style={{
                          padding: '14px 24px',
                          background: '#fff',
                          color: '#000',
                          border: '2px solid #000',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          textTransform: 'lowercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
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
                        quick fill questionnaire
                      </button>
                      <button
                        onClick={() => setShowLinkedInImport(true)}
                        disabled={!formData.geminiApiKey}
                        style={{
                          padding: '14px 24px',
                          background: formData.geminiApiKey ? 'linear-gradient(135deg, #444 0%, #666 100%)' : '#f5f5f5',
                          color: formData.geminiApiKey ? '#fff' : '#999',
                          border: formData.geminiApiKey ? '2px solid #000' : '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          textTransform: 'lowercase',
                          cursor: formData.geminiApiKey ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          boxShadow: formData.geminiApiKey ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                        }}
                        title={!formData.geminiApiKey ? 'Add Gemini API key in Basic tab to enable' : ''}
                      >
                        import linkedin pdf
                      </button>
                    </div>
                  </div>

                  {/* Display Settings Section */}
                  {activeSubSection === 'display' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#000', textTransform: 'lowercase' }}>
                      Profile Section Visibility
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                      Toggle which sections appear on your public profile. Hidden sections won't be visible to other users.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {[
                    { key: 'experience', label: 'Experience', count: profile.experience.length },
                    { key: 'education', label: 'Education', count: profile.education.length },
                    { key: 'skills', label: 'Skills', count: profile.skills.length },
                    { key: 'certifications', label: 'Certifications', count: profile.certifications.length },
                    { key: 'projects', label: 'Projects', count: profile.projects.length },
                    { key: 'awards', label: 'Awards & Honors', count: profile.awards.length }
                  ].map(({ key, label, count }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                          {label} ({count})
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {profile.profileVisibility?.[key as keyof typeof profile.profileVisibility]
                            ? 'Visible on profile'
                            : 'Hidden from profile'}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleVisibility(key as keyof typeof profile.profileVisibility)}
                        style={{
                          padding: '8px 16px',
                          background: profile.profileVisibility?.[key as keyof typeof profile.profileVisibility]
                            ? '#4a90e2'
                            : '#ccc',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {profile.profileVisibility?.[key as keyof typeof profile.profileVisibility] ? (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          ) : (
                            <>
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                          )}
                        </svg>
                        {profile.profileVisibility?.[key as keyof typeof profile.profileVisibility] ? 'visible' : 'hidden'}
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSubSection === 'experience' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Experience
                    </h3>
                  </div>
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
                          cursor: 'pointer'
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
                          value={exp.location || ''}
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
                </div>
              )}

              {/* Education Section */}
              {activeSubSection === 'education' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Education
                    </h3>
                  </div>
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
                          cursor: 'pointer'
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
                </div>
              )}

              {/* Skills Section */}
              {activeSubSection === 'skills' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Skills
                    </h3>
                  </div>
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
                </div>
              )}

              {/* Certifications Section */}
              {activeSubSection === 'certifications' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Certifications
                    </h3>
                  </div>
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
                          cursor: 'pointer'
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
                </div>
              )}

              {/* Projects Section */}
              {activeSubSection === 'projects' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Projects
                    </h3>
                  </div>
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
                          cursor: 'pointer'
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
                </div>
              )}

              {/* Awards Section */}
              {activeSubSection === 'awards' && profile && (
                <div className="card" style={{ padding: '40px', background: '#fff', border: '2px solid #000', borderRadius: '16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', textTransform: 'lowercase' }}>
                      Awards
                    </h3>
                  </div>
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
                          cursor: 'pointer'
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
                </div>
              )}
                </div>
              )}

              {/* Preview Tab Content */}
              {activeTab === 'preview' && profile && (
                <div style={{
                  background: '#fafafa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '32px',
                  minHeight: '400px'
                }}>
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
                    marginBottom: '24px'
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
                    color: '#999',
                    paddingBottom: '24px',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    {profile.location && <p style={{ margin: 0 }}>{profile.location}</p>}
                    {profile.email && <p style={{ margin: 0 }}>{profile.email}</p>}
                  </div>

                  <div style={{ marginTop: '32px' }}>
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

                    {profile.experience && profile.experience.length > 0 && profile.profileVisibility?.experience !== false && (
                      <ExpandableSection title={`experience (${profile.experience.length})`}>
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
                                marginBottom: exp.description ? '12px' : 0,
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

                    {profile.education && profile.education.length > 0 && profile.profileVisibility?.education !== false && (
                      <ExpandableSection title={`education (${profile.education.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.education.map((edu) => (
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

                    {profile.certifications && profile.certifications.length > 0 && profile.profileVisibility?.certifications !== false && (
                      <ExpandableSection title={`certifications (${profile.certifications.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.certifications.map((cert) => (
                            <div key={cert.id} style={{
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
                                {cert.name}
                              </div>
                              <div style={{
                                fontSize: 'clamp(12px, 2vw, 13px)',
                                color: '#666',
                                marginBottom: '8px',
                                fontWeight: 600
                              }}>
                                {cert.issuingOrganization}
                              </div>
                              <div style={{
                                fontSize: 'clamp(11px, 2vw, 12px)',
                                color: '#999'
                              }}>
                                {cert.issueDate}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ExpandableSection>
                    )}

                    {profile.projects && profile.projects.length > 0 && profile.profileVisibility?.projects !== false && (
                      <ExpandableSection title={`projects (${profile.projects.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.projects.map((proj) => (
                            <div key={proj.id} style={{
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
                                {proj.name}
                              </div>
                              {proj.description && (
                                <p style={{
                                  fontSize: 'clamp(12px, 2vw, 13px)',
                                  color: '#333',
                                  lineHeight: 1.6,
                                  marginBottom: proj.url ? '12px' : 0
                                }}>
                                  {proj.description}
                                </p>
                              )}
                              {proj.url && (
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    color: '#4a90e2',
                                    textDecoration: 'underline'
                                  }}
                                >
                                  View Project
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </ExpandableSection>
                    )}

                    {profile.awards && profile.awards.length > 0 && profile.profileVisibility?.awards !== false && (
                      <ExpandableSection title={`awards (${profile.awards.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {profile.awards.map((award) => (
                            <div key={award.id} style={{
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
                                {award.title}
                              </div>
                              <div style={{
                                fontSize: 'clamp(12px, 2vw, 13px)',
                                color: '#666',
                                marginBottom: '8px',
                                fontWeight: 600
                              }}>
                                {award.issuer}
                              </div>
                              <div style={{
                                fontSize: 'clamp(11px, 2vw, 12px)',
                                color: '#999'
                              }}>
                                {award.issueDate}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ExpandableSection>
                    )}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              {activeTab !== 'preview' && (
                <div style={{
                  marginTop: '48px',
                  paddingTop: '32px',
                  borderTop: '2px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '14px 32px',
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? 'saving...' : 'save changes'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && user && (
        <QuickFillQuestionnaire
          userId={user.id}
          onComplete={saveComprehensiveProfile}
          onSkip={() => setShowQuestionnaire(false)}
        />
      )}

      {/* LinkedIn Import Modal */}
      {showLinkedInImport && user && formData.geminiApiKey && (
        <LinkedInImport
          userId={user.id}
          geminiApiKey={formData.geminiApiKey}
          onComplete={(importedData) => {
            saveComprehensiveProfile(importedData)
            setShowLinkedInImport(false)
          }}
          onCancel={() => setShowLinkedInImport(false)}
        />
      )}

      {/* Image Cropper Modal */}
      {cropperData && (
        <ImageCropper
          imageUrl={cropperData.imageUrl}
          type={cropperData.type}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </main>
  )
}
