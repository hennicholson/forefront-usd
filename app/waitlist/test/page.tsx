'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DownloadButton } from '@/components/ui/download-button'

export default function WaitlistTestPage() {
  // Pre-filled test data
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@ucsd.edu',
    phone: '(555) 123-4567',
    university: 'UC San Diego',
    year: 'Junior',
    aiProficiency: 75,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  }

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Generate personalized PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          university: testUser.university,
          year: testUser.year
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Student_Stack_Guide_${testUser.firstName}_${testUser.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Main Card */}
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Badge */}
          <div className="flex justify-center pt-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-2 rounded-full font-bold text-base"
            >
              <span>$500+ FREE VALUE</span>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="px-8 pb-12 pt-8">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
            >
              Get Your Free Student Stack Guide
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-center text-base mb-8 max-w-xl mx-auto"
            >
              The ultimate collection of AI tools curated specifically for students.
              Save hours on assignments and boost your academic performance.
            </motion.p>

            {/* Tools List - Simple text version */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-10 text-center"
            >
              <p className="text-gray-500 text-sm mb-3">Your complete student AI toolkit includes:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {[
                  'AI Writing Assistants', 'Research Tools', 'Code Companions',
                  'Study Aids', 'Note-Taking Apps', 'Citation Generators',
                  'Productivity Boosters', 'Learning Platforms'
                ].map(tool => (
                  <span key={tool} className="text-gray-400 text-sm">
                    {tool}
                    {tool !== 'Learning Platforms' && <span className="mx-1">•</span>}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Download Button */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center"
            >
              <DownloadButton
                onClick={handleDownload}
                isDownloading={isDownloading}
              />

              {/* Trust Indicators */}
              <div className="mt-6 flex flex-col items-center gap-1">
                <p className="text-gray-500 text-xs">Instant download • No spam • Setup in 5 minutes</p>
                <p className="text-gray-400 text-xs">
                  8 students already downloaded today
                </p>
              </div>
            </motion.div>

            {/* Personalized Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-500 text-sm">
                Hey {testUser.firstName}, as a {testUser.year} at {testUser.university},
                this guide is specifically curated for your academic journey.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Test Data Display */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">Test User Data:</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(testUser, null, 2)}
          </pre>
        </div>
      </motion.div>
    </div>
  )
}