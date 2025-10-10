'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MODULE_TEMPLATES, ModuleTemplate, generateSlidesFromTemplate } from '@/lib/templates/modules'

interface WizardData {
  // Step 1: Basic Info
  title: string
  slug: string
  description: string
  instructor: string
  duration: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  coverImage: string

  // Step 2: Learning Setup
  learningObjectives: string[]
  keyTakeaways: string[]
  introVideo: string

  // Step 3: Template
  templateId: string

  // Step 4: Review (computed)
}

const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '1 hour', '2 hours', 'Custom']

export function ModuleWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [wizardData, setWizardData] = useState<WizardData>({
    title: '',
    slug: '',
    description: '',
    instructor: '',
    duration: '30 min',
    skillLevel: 'beginner',
    coverImage: '',
    learningObjectives: [''],
    keyTakeaways: [''],
    introVideo: '',
    templateId: 'quick-tutorial'
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setWizardData({ ...wizardData, title, slug })
  }

  // Learning objectives management
  const addLearningObjective = () => {
    setWizardData({ ...wizardData, learningObjectives: [...wizardData.learningObjectives, ''] })
  }

  const updateLearningObjective = (index: number, value: string) => {
    const updated = [...wizardData.learningObjectives]
    updated[index] = value
    setWizardData({ ...wizardData, learningObjectives: updated })
  }

  const removeLearningObjective = (index: number) => {
    const updated = wizardData.learningObjectives.filter((_, i) => i !== index)
    setWizardData({ ...wizardData, learningObjectives: updated })
  }

  // Key takeaways management
  const addKeyTakeaway = () => {
    setWizardData({ ...wizardData, keyTakeaways: [...wizardData.keyTakeaways, ''] })
  }

  const updateKeyTakeaway = (index: number, value: string) => {
    const updated = [...wizardData.keyTakeaways]
    updated[index] = value
    setWizardData({ ...wizardData, keyTakeaways: updated })
  }

  const removeKeyTakeaway = (index: number) => {
    const updated = wizardData.keyTakeaways.filter((_, i) => i !== index)
    setWizardData({ ...wizardData, keyTakeaways: updated })
  }

  // Validation
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return wizardData.title.trim() !== '' &&
               wizardData.description.trim() !== '' &&
               wizardData.instructor.trim() !== ''
      case 2:
        return wizardData.learningObjectives.some(obj => obj.trim() !== '')
      case 3:
        return wizardData.templateId !== ''
      default:
        return true
    }
  }

  // Navigation
  const nextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(currentStep + 1)
      setError('')
    } else {
      setError('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  // Create module
  const handleCreateModule = async (isDraft: boolean = false) => {
    setLoading(true)
    setError('')

    try {
      // Generate slides from template
      const slides = generateSlidesFromTemplate(wizardData.templateId)

      // Create module object (only fields that exist in database schema)
      const newModule = {
        title: wizardData.title,
        slug: wizardData.slug,
        description: wizardData.description,
        instructor: {
          name: wizardData.instructor,
          title: 'Instructor',
          bio: `${wizardData.instructor} is teaching this module.`
        },
        duration: wizardData.duration,
        skillLevel: wizardData.skillLevel,
        learningObjectives: wizardData.learningObjectives.filter(obj => obj.trim() !== '').length > 0
          ? wizardData.learningObjectives.filter(obj => obj.trim() !== '')
          : ['Complete this module'],
        keyTakeaways: wizardData.keyTakeaways.filter(kt => kt.trim() !== '').length > 0
          ? wizardData.keyTakeaways.filter(kt => kt.trim() !== '')
          : ['Key concepts from this module'],
        introVideo: wizardData.introVideo.trim() || 'https://www.youtube.com/watch?v=placeholder',
        slides: slides
      }

      console.log('📝 Creating module:', newModule)

      // Save to database
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule)
      })

      if (!response.ok) {
        throw new Error('Failed to create module')
      }

      const savedModule = await response.json()
      console.log('✅ Module created:', savedModule)

      // Redirect to edit page using moduleId
      router.push(`/admin/modules/edit/${savedModule.moduleId}`)
    } catch (err) {
      console.error('❌ Error creating module:', err)
      setError('Failed to create module. Please try again.')
      setLoading(false)
    }
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo wizardData={wizardData} setWizardData={setWizardData} handleTitleChange={handleTitleChange} />
      case 2:
        return <Step2LearningSetup
          wizardData={wizardData}
          setWizardData={setWizardData}
          addLearningObjective={addLearningObjective}
          updateLearningObjective={updateLearningObjective}
          removeLearningObjective={removeLearningObjective}
          addKeyTakeaway={addKeyTakeaway}
          updateKeyTakeaway={updateKeyTakeaway}
          removeKeyTakeaway={removeKeyTakeaway}
        />
      case 3:
        return <Step3ChooseTemplate wizardData={wizardData} setWizardData={setWizardData} />
      case 4:
        return <Step4Review wizardData={wizardData} />
      default:
        return null
    }
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '48px',
        position: 'relative'
      }}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} style={{
            flex: 1,
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: currentStep >= step ? '#0f0' : '#333',
              color: currentStep >= step ? '#000' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '18px',
              fontWeight: 700,
              border: currentStep === step ? '4px solid #fff' : 'none',
              boxShadow: currentStep === step ? '0 0 0 2px #0f0' : 'none'
            }}>
              {step}
            </div>
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentStep >= step ? '#fff' : '#666'
            }}>
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Learning Setup'}
              {step === 3 && 'Choose Template'}
              {step === 4 && 'Review & Create'}
            </div>
          </div>
        ))}
        {/* Connection line */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '10%',
          right: '10%',
          height: '4px',
          background: '#333',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            background: '#0f0',
            width: `${((currentStep - 1) / 3) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '16px',
          background: '#ff4444',
          color: '#fff',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {/* Step Content */}
      <div style={{
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '16px',
        padding: '48px',
        minHeight: '500px'
      }}>
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '32px',
        gap: '16px'
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            padding: '16px 32px',
            background: currentStep === 1 ? '#222' : '#333',
            color: currentStep === 1 ? '#555' : '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          {currentStep === 4 ? (
            <>
              <button
                onClick={() => handleCreateModule(true)}
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {loading ? 'Creating...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleCreateModule(false)}
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  background: loading ? '#666' : '#0f0',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {loading ? 'Creating...' : '🚀 Create Module'}
              </button>
            </>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              style={{
                padding: '16px 32px',
                background: canProceedToNextStep() ? '#0f0' : '#666',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: canProceedToNextStep() ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// STEP 1: Basic Info
function Step1BasicInfo({ wizardData, setWizardData, handleTitleChange }: any) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#0f0' }}>
        📝 Basic Information
      </h2>
      <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>
        Let's start with the fundamentals of your module
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            Module Title *
          </label>
          <input
            type="text"
            value={wizardData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Introduction to React Hooks"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#fff',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Slug (auto-generated) */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            URL Slug (auto-generated)
          </label>
          <input
            type="text"
            value={wizardData.slug}
            onChange={(e) => setWizardData({ ...wizardData, slug: e.target.value })}
            placeholder="introduction-to-react-hooks"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#0f0',
              fontFamily: 'monospace'
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            Description *
          </label>
          <textarea
            value={wizardData.description}
            onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
            rows={4}
            placeholder="Provide a clear description of what students will learn in this module..."
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#fff',
              fontFamily: 'inherit',
              lineHeight: 1.6
            }}
          />
        </div>

        {/* Instructor */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            Instructor Name *
          </label>
          <input
            type="text"
            value={wizardData.instructor}
            onChange={(e) => setWizardData({ ...wizardData, instructor: e.target.value })}
            placeholder="Your name or instructor name"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#fff',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Duration & Skill Level (side by side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
              Duration
            </label>
            <select
              value={wizardData.duration}
              onChange={(e) => setWizardData({ ...wizardData, duration: e.target.value })}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                border: '2px solid #333',
                borderRadius: '8px',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'inherit'
              }}
            >
              {DURATION_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
              Skill Level
            </label>
            <select
              value={wizardData.skillLevel}
              onChange={(e) => setWizardData({ ...wizardData, skillLevel: e.target.value as any })}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                border: '2px solid #333',
                borderRadius: '8px',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'inherit'
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Cover Image URL (optional) */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            Cover Image URL (optional)
          </label>
          <input
            type="text"
            value={wizardData.coverImage}
            onChange={(e) => setWizardData({ ...wizardData, coverImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#fff',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// STEP 2: Learning Setup
function Step2LearningSetup({
  wizardData,
  setWizardData,
  addLearningObjective,
  updateLearningObjective,
  removeLearningObjective,
  addKeyTakeaway,
  updateKeyTakeaway,
  removeKeyTakeaway
}: any) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#0f0' }}>
        🎯 Learning Setup
      </h2>
      <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>
        Define what students will learn and achieve
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Learning Objectives */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '16px', color: '#fff' }}>
            Learning Objectives *
          </label>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
            What will students be able to do after completing this module?
          </p>
          {wizardData.learningObjectives.map((objective: string, index: number) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={objective}
                onChange={(e) => updateLearningObjective(index, e.target.value)}
                placeholder={`Objective ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
              {wizardData.learningObjectives.length > 1 && (
                <button
                  onClick={() => removeLearningObjective(index)}
                  style={{
                    padding: '12px 16px',
                    background: '#ff4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addLearningObjective}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            + Add Objective
          </button>
        </div>

        {/* Key Takeaways */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '16px', color: '#fff' }}>
            Key Takeaways (optional)
          </label>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
            What are the most important points to remember?
          </p>
          {wizardData.keyTakeaways.map((takeaway: string, index: number) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={takeaway}
                onChange={(e) => updateKeyTakeaway(index, e.target.value)}
                placeholder={`Takeaway ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
              {wizardData.keyTakeaways.length > 1 && (
                <button
                  onClick={() => removeKeyTakeaway(index)}
                  style={{
                    padding: '12px 16px',
                    background: '#ff4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addKeyTakeaway}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            + Add Takeaway
          </button>
        </div>

        {/* Intro Video */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
            Intro Video URL (optional)
          </label>
          <input
            type="text"
            value={wizardData.introVideo}
            onChange={(e) => setWizardData({ ...wizardData, introVideo: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              border: '2px solid #333',
              borderRadius: '8px',
              background: '#0a0a0a',
              color: '#fff',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// STEP 3: Choose Template
function Step3ChooseTemplate({ wizardData, setWizardData }: any) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#0f0' }}>
        📋 Choose Template
      </h2>
      <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>
        Select a pre-built template to get started quickly
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {MODULE_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => setWizardData({ ...wizardData, templateId: template.id })}
            style={{
              padding: '24px',
              background: wizardData.templateId === template.id ? '#0f0' : '#222',
              border: wizardData.templateId === template.id ? '3px solid #0f0' : '2px solid #333',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {template.icon}
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px',
              color: wizardData.templateId === template.id ? '#000' : '#fff',
              textAlign: 'center'
            }}>
              {template.name}
            </h3>
            <p style={{
              fontSize: '13px',
              color: wizardData.templateId === template.id ? '#000' : '#999',
              marginBottom: '12px',
              lineHeight: 1.5,
              textAlign: 'center'
            }}>
              {template.description}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: wizardData.templateId === template.id ? '#000' : '#666',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: `1px solid ${wizardData.templateId === template.id ? '#000' : '#333'}`
            }}>
              <span>📊 {template.slideCount} slides</span>
              <span>⏱️ {template.estimatedDuration}</span>
            </div>
            {wizardData.templateId === template.id && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '24px'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// STEP 4: Review
function Step4Review({ wizardData }: any) {
  const selectedTemplate = MODULE_TEMPLATES.find(t => t.id === wizardData.templateId)

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#0f0' }}>
        ✅ Review & Create
      </h2>
      <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>
        Review your module details before creating
      </p>

      <div style={{
        background: '#0a0a0a',
        border: '2px solid #333',
        borderRadius: '12px',
        padding: '32px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f0', marginBottom: '16px' }}>
            📝 Basic Information
          </h3>
          <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
            <div><strong style={{ color: '#fff' }}>Title:</strong> <span style={{ color: '#999' }}>{wizardData.title}</span></div>
            <div><strong style={{ color: '#fff' }}>Slug:</strong> <span style={{ color: '#0f0', fontFamily: 'monospace' }}>{wizardData.slug}</span></div>
            <div><strong style={{ color: '#fff' }}>Description:</strong> <span style={{ color: '#999' }}>{wizardData.description}</span></div>
            <div><strong style={{ color: '#fff' }}>Instructor:</strong> <span style={{ color: '#999' }}>{wizardData.instructor}</span></div>
            <div><strong style={{ color: '#fff' }}>Duration:</strong> <span style={{ color: '#999' }}>{wizardData.duration}</span></div>
            <div><strong style={{ color: '#fff' }}>Skill Level:</strong> <span style={{ color: '#999', textTransform: 'capitalize' }}>{wizardData.skillLevel}</span></div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f0', marginBottom: '16px' }}>
            🎯 Learning Setup
          </h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>Learning Objectives:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#999' }}>
                {wizardData.learningObjectives.filter((obj: string) => obj.trim() !== '').map((obj: string, i: number) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
            {wizardData.keyTakeaways.some((kt: string) => kt.trim() !== '') && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#fff' }}>Key Takeaways:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#999' }}>
                  {wizardData.keyTakeaways.filter((kt: string) => kt.trim() !== '').map((kt: string, i: number) => (
                    <li key={i}>{kt}</li>
                  ))}
                </ul>
              </div>
            )}
            {wizardData.introVideo && (
              <div><strong style={{ color: '#fff' }}>Intro Video:</strong> <span style={{ color: '#999' }}>{wizardData.introVideo}</span></div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f0', marginBottom: '16px' }}>
            📋 Template
          </h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>{selectedTemplate?.icon}</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 600 }}>{selectedTemplate?.name}</div>
                <div style={{ color: '#999', fontSize: '13px' }}>{selectedTemplate?.slideCount} slides • {selectedTemplate?.estimatedDuration}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#333',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#999'
      }}>
        💡 <strong>Tip:</strong> After creating, you'll be able to edit slides, add content blocks, and customize everything in the module editor.
      </div>
    </div>
  )
}
