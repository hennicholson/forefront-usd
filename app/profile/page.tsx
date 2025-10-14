'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/profile'
import { QuickFillQuestionnaire } from '@/components/profile/QuickFillQuestionnaire'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { LinkedInImport } from '@/components/profile/LinkedInImport'
import { Avatar } from '@/components/common/Avatar'
import { ImageCropper } from '@/components/profile/ImageCropper'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [showLinkedInImport, setShowLinkedInImport] = useState(false)

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
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 })
  const [profilePosition, setProfilePosition] = useState({ x: 50, y: 50 })
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

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

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
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

  const saveComprehensiveProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setShowQuestionnaire(false)
        setShowEditor(false)
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        // Open cropper instead of directly setting the image
        setCropperData({ imageUrl: base64, type })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      setUploadingImage(false)
    }

    // Reset input
    event.target.value = ''
  }

  const handleCropComplete = (position: { x: number; y: number }) => {
    if (!cropperData) return

    // Set the image and position
    if (cropperData.type === 'profile') {
      setFormData({ ...formData, profileImage: cropperData.imageUrl })
      setProfilePosition(position)
    } else {
      setFormData({ ...formData, bannerImage: cropperData.imageUrl })
      setBannerPosition(position)
    }

    // Close cropper
    setCropperData(null)
  }

  const handleCropCancel = () => {
    setCropperData(null)
  }

  const removeImage = (type: 'profile' | 'banner') => {
    if (type === 'profile') {
      setFormData({ ...formData, profileImage: '' })
      setProfilePosition({ x: 50, y: 50 })
    } else {
      setFormData({ ...formData, bannerImage: '' })
      setBannerPosition({ x: 50, y: 50 })
    }
  }


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
            customize your profile and set up your meeting room
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
            <div style={{ maxWidth: '800px' }}>
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
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${formData.bannerImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: `${bannerPosition.x}% ${bannerPosition.y}%`
                      }} />
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
                        <div style={{
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          backgroundImage: `url(${formData.profileImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: `${profilePosition.x}% ${profilePosition.y}%`
                        }} />
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

              {/* Name */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#000'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#000',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Interests */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  interests
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    placeholder="Add an interest..."
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff',
                      color: '#000'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <button
                    onClick={addInterest}
                    style={{
                      padding: '14px 24px',
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    add
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {formData.interests.map((interest, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#000',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: 0,
                          fontFamily: 'inherit'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Meeting Link */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  meeting room link (whereby)
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://whereby.com/your-room"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#000'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginTop: '8px',
                  lineHeight: 1.4
                }}>
                  default: https://skinny-studio.whereby.com/forefront54fe1520-5c6b-46bd-b624-31950bf609b9
                </p>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  availability
                </label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g., Weekdays 3-5pm PST"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#000'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Social Links */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  social links
                </label>

                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="LinkedIn URL"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff',
                      color: '#000'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="Twitter URL"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff',
                      color: '#000'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                    placeholder="GitHub URL"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff',
                      color: '#000'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              </div>

              {/* AI Integration Settings */}
              <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  color: '#000'
                }}>
                  AI Integration Settings
                </label>
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '16px',
                  lineHeight: 1.4
                }}>
                  Add your Gemini API key to enable AI-powered features like LinkedIn profile import
                </p>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="Gemini API Key (sk-...)"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#000'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '8px',
                  lineHeight: 1.4
                }}>
                  Get your free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2', textDecoration: 'underline' }}>Google AI Studio</a>. Your key is stored securely and only used for your requests.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
                <button
                  onClick={() => setShowQuestionnaire(true)}
                  style={{
                    padding: '14px 24px',
                    background: '#fff',
                    color: '#000',
                    border: '2px solid #000',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  📝 quick fill questionnaire
                </button>
                <button
                  onClick={() => profile && setShowEditor(true)}
                  disabled={!profile}
                  style={{
                    padding: '14px 24px',
                    background: '#fff',
                    color: '#000',
                    border: '2px solid #000',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: profile ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    opacity: profile ? 1 : 0.5
                  }}
                >
                  ✏️ comprehensive editor
                </button>
                <button
                  onClick={() => setShowLinkedInImport(true)}
                  disabled={!formData.geminiApiKey}
                  style={{
                    padding: '14px 24px',
                    background: formData.geminiApiKey ? '#4a90e2' : '#f5f5f5',
                    color: formData.geminiApiKey ? '#fff' : '#999',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: formData.geminiApiKey ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit'
                  }}
                  title={!formData.geminiApiKey ? 'Add Gemini API key to enable' : ''}
                >
                  🔗 import from linkedin
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '16px 32px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  opacity: saving ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {saving ? 'saving...' : 'save basic profile'}
              </button>
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

      {/* Comprehensive Editor Modal */}
      {showEditor && profile && (
        <ProfileEditor
          profile={profile}
          onSave={saveComprehensiveProfile}
          onCancel={() => setShowEditor(false)}
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
