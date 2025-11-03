'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GridBackground } from '@/components/ui/grid-background'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Step = 'name' | 'email' | 'phone' | 'proficiency' | 'upload' | 'generating' | 'complete'

export default function WaitlistPage() {
  const [currentStep, setCurrentStep] = useState<Step>('name')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    aiProficiency: 50,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [allMembers, setAllMembers] = useState<any[]>([])
  const [showSlamAnimation, setShowSlamAnimation] = useState(true)
  const [showRattle, setShowRattle] = useState(false)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        setWaitlistCount(data.entries?.length || 0)
        setAllMembers(data.entries || [])
      })
      .catch(() => {})
  }, [currentStep])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleNext = (nextStep: Step) => {
    // Validate email before proceeding
    if (currentStep === 'email' && nextStep === 'phone') {
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address')
        return
      }
    }
    setError('')
    setCurrentStep(nextStep)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateAvatar = async () => {
    if (!imageFile) return

    setCurrentStep('generating')
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', imageFile)

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedAvatar(data.avatarUrl)

        // Submit to waitlist with avatar
        const waitlistResponse = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            avatarUrl: data.avatarUrl,
          }),
        })

        if (waitlistResponse.ok) {
          const newCount = waitlistCount + 1
          setWaitlistCount(newCount)
          setCurrentStep('complete')
        } else {
          const errorData = await waitlistResponse.json()
          setError(errorData.error || 'Failed to join waitlist')
          setCurrentStep('upload')
        }
      } else {
        setError(data.error || 'Failed to generate avatar')
        setCurrentStep('upload')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setCurrentStep('upload')
    } finally {
      setIsLoading(false)
    }
  }

  const getProficiencyLabel = (value: number) => {
    if (value < 25) return 'Beginner'
    if (value < 50) return 'Learning'
    if (value < 75) return 'Intermediate'
    if (value < 90) return 'Advanced'
    return 'Expert'
  }

  const stepConfig = {
    name: { title: "What's your name?", subtitle: 'Let us know who you are' },
    email: { title: 'Your email address', subtitle: 'Where can we reach you?' },
    phone: { title: 'Phone number', subtitle: 'Optional but helps us connect' },
    proficiency: { title: 'AI experience level', subtitle: 'Tell us where you are on your AI journey' },
    upload: { title: 'Generate your avatar', subtitle: "Upload a photo and we'll create your unique avatar" },
    generating: { title: 'Generating your avatar...', subtitle: 'Creating your personalized avatar' },
    complete: { title: 'You\'re in!', subtitle: 'Welcome to forefront' },
  }

  return (
    <main className="relative min-h-screen bg-white">
      <GridBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Step {currentStep === 'name' ? 1 : currentStep === 'email' ? 2 : currentStep === 'phone' ? 3 : currentStep === 'proficiency' ? 4 : currentStep === 'upload' ? 5 : currentStep === 'generating' ? 5 : 6} of 6
              </span>
              <span className="text-xs font-medium text-gray-500">
                {waitlistCount > 0 && `${waitlistCount}+ joined`}
              </span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: 0 }}
                animate={{
                  width: currentStep === 'name' ? '16%' :
                         currentStep === 'email' ? '33%' :
                         currentStep === 'phone' ? '50%' :
                         currentStep === 'proficiency' ? '66%' :
                         currentStep === 'upload' ? '83%' :
                         '100%'
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Logo with Slam Animation */}
          <motion.div
            className="text-center mb-12"
            initial={showSlamAnimation ? { scale: 10, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            onAnimationComplete={() => {
              if (showSlamAnimation) {
                setShowRattle(true)
                setTimeout(() => {
                  setShowSlamAnimation(false)
                  setShowRattle(false)
                }, 200)
              }
            }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl font-black text-black mb-2"
              style={{ letterSpacing: '-2px' }}
              animate={showRattle ? {
                x: [0, -5, 5, -3, 3, -1, 1, 0],
                y: [0, -5, 5, -3, 3, -1, 1, 0],
              } : {}}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              [forefront]
            </motion.h1>
            <motion.p
              className="text-sm text-gray-500"
              initial={showSlamAnimation ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              Join the future of AI learning
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step: Name */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.name.title}</h2>
                  <p className="text-gray-600">{stepConfig.name.subtitle}</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && formData.firstName && handleNext('email')}
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                    placeholder="First name"
                    autoFocus
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && formData.lastName && handleNext('email')}
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                    placeholder="Last name"
                  />
                </div>

                <button
                  onClick={() => handleNext('email')}
                  disabled={!formData.firstName || !formData.lastName}
                  className="w-full py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black text-lg"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {/* Step: Email */}
            {currentStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.email.title}</h2>
                  <p className="text-gray-600">{stepConfig.email.subtitle}</p>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && formData.email && handleNext('phone')}
                    className={`w-full px-6 py-4 pr-12 text-lg bg-white border-2 rounded-xl focus:outline-none transition-all text-black placeholder-gray-400 ${
                      formData.email && !validateEmail(formData.email)
                        ? 'border-red-400 focus:border-red-500'
                        : formData.email && validateEmail(formData.email)
                        ? 'border-green-400 focus:border-green-500'
                        : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="your@email.com"
                    autoFocus
                  />
                  {formData.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {validateEmail(formData.email) ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('name')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('phone')}
                    disabled={!formData.email}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Phone */}
            {currentStep === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.phone.title}</h2>
                  <p className="text-gray-600">{stepConfig.phone.subtitle}</p>
                </div>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && formData.phone && handleNext('proficiency')}
                  className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-all text-black placeholder-gray-400"
                  placeholder="+1 (555) 000-0000"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('email')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('proficiency')}
                    disabled={!formData.phone}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: AI Proficiency */}
            {currentStep === 'proficiency' && (
              <motion.div
                key="proficiency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.proficiency.title}</h2>
                  <p className="text-gray-600">{stepConfig.proficiency.subtitle}</p>
                </div>

                <div className="space-y-6 bg-gray-50 p-8 rounded-2xl">
                  <div className="text-center">
                    <div className="inline-block bg-black text-white px-6 py-3 rounded-full text-2xl font-bold mb-6">
                      {getProficiencyLabel(formData.aiProficiency)}
                    </div>
                  </div>

                  <input
                    type="range"
                    name="aiProficiency"
                    min="0"
                    max="100"
                    value={formData.aiProficiency}
                    onChange={handleInputChange}
                    className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer slider"
                  />

                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('phone')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleNext('upload')}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-lg"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Upload Photo */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.upload.title}</h2>
                  <p className="text-gray-600">{stepConfig.upload.subtitle}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-300 hover:border-black transition-colors">
                  {imagePreview ? (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-black">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="text-sm text-gray-600 hover:text-black font-medium"
                      >
                        Change photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-black mb-2">Upload your photo</p>
                      <p className="text-sm text-gray-600">Click to browse or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleNext('proficiency')}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerateAvatar}
                    disabled={!imageFile}
                    className="flex-1 py-4 px-8 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    Generate My Avatar →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Generating */}
            {currentStep === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="w-24 h-24 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-black">{stepConfig.generating.title}</h2>
                  <p className="text-gray-600">{stepConfig.generating.subtitle}</p>
                </div>
              </motion.div>
            )}

            {/* Step: Complete */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-8"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="relative"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center shadow-xl">
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-5xl font-bold text-black">You're in!</h2>
                  <p className="text-xl text-gray-600">Welcome to the forefront</p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block bg-gradient-to-r from-black to-gray-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
                  >
                    You're #{waitlistCount} on the waitlist
                  </motion.div>
                </motion.div>

                {/* Enhanced Profile Preview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 border-2 border-gray-200 shadow-xl overflow-hidden"
                >
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-50" />

                  <div className="relative space-y-6">
                    <div className="flex flex-col items-center gap-6">
                      {/* Large Avatar Display */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-600 rounded-full blur-xl opacity-20" />
                        <Avatar className="relative w-32 h-32 border-4 border-white shadow-2xl ring-2 ring-black/10">
                          {generatedAvatar ? (
                            <AvatarImage src={generatedAvatar} alt="Generated avatar" className="object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-black to-gray-700 text-white text-4xl font-bold">
                              {formData.firstName[0]}{formData.lastName[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </motion.div>

                      {/* User Info */}
                      <div className="text-center space-y-3">
                        <h3 className="text-3xl font-bold text-black tracking-tight">
                          {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-gray-600 font-medium">{formData.email}</p>
                        <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {getProficiencyLabel(formData.aiProficiency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-2xl p-8 sm:p-10 overflow-hidden shadow-2xl"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="text-3xl"
                      >
                        🎉
                      </motion.div>
                      <p className="text-xl sm:text-2xl font-bold">
                        You're officially on the list!
                      </p>
                    </div>
                    <p className="text-gray-300 text-base">
                      We'll notify you the moment we launch
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(5, waitlistCount))].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-black" />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-300">
                        {waitlistCount}+ people waiting
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Network Grid of All Members */}
                {allMembers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-black mb-2">The Forefront Community</h3>
                      <p className="text-gray-600">Join {waitlistCount} pioneers shaping the future</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {allMembers.map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02, duration: 0.3 }}
                            className="group relative"
                          >
                            <div className="aspect-square rounded-full overflow-hidden border-2 border-gray-200 hover:border-black transition-all hover:scale-110 cursor-pointer">
                              {member.avatarUrl ? (
                                <img
                                  src={member.avatarUrl}
                                  alt={`${member.firstName} ${member.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-black text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                                {member.firstName} {member.lastName}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </main>
  )
}
