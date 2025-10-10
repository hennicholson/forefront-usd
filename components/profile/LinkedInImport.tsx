'use client'
import { useState } from 'react'
import { UserProfile } from '@/types/profile'

interface LinkedInImportProps {
  userId: string
  geminiApiKey: string
  onComplete: (profile: Partial<UserProfile>) => void
  onCancel: () => void
}

export function LinkedInImport({ userId, geminiApiKey, onComplete, onCancel }: LinkedInImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid PDF file')
      setFile(null)
    }
  }

  const handleImport = async () => {
    if (!file || !geminiApiKey) return

    setProcessing(true)
    setError(null)
    setProgress('Reading PDF...')

    try {
      // Convert PDF to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      setProgress('Sending to AI for analysis...')

      // Send PDF to API endpoint for processing
      const response = await fetch('/api/profile/linkedin-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfData: base64,
          geminiApiKey
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      setProgress('Analyzing with Gemini AI...')

      const profileData = await response.json()

      setProgress('Import successful!')

      // Pass the parsed data to the parent component
      setTimeout(() => {
        onComplete(profileData)
      }, 500)

    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message || 'Failed to import profile. Please try again.')
      setProcessing(false)
    }
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
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={processing}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f5f5f5',
            border: 'none',
            fontSize: '20px',
            cursor: processing ? 'not-allowed' : 'pointer',
            color: '#666',
            lineHeight: 1,
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: processing ? 0.5 : 1
          }}
        >
          ×
        </button>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#333',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          Import from LinkedIn
        </h2>
        <p style={{
          color: '#999',
          marginBottom: '32px',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          Upload your LinkedIn profile as a PDF and we'll automatically extract your information using AI.
        </p>

        {/* Instructions */}
        <div style={{
          background: '#f9f9f9',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#333' }}>
            How to download your LinkedIn profile:
          </div>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
            <li>Go to your LinkedIn profile</li>
            <li>Click "More" → "Save to PDF"</li>
            <li>Upload the PDF file below</li>
          </ol>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            padding: '40px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: processing ? 'not-allowed' : 'pointer',
            background: file ? '#f0f9ff' : '#fafafa',
            transition: 'all 0.2s ease'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#4a90e2'
            e.currentTarget.style.background = '#f0f9ff'
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = '#ddd'
            e.currentTarget.style.background = file ? '#f0f9ff' : '#fafafa'
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#ddd'
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile && droppedFile.type === 'application/pdf') {
              setFile(droppedFile)
              setError(null)
            } else {
              setError('Please drop a valid PDF file')
            }
          }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={processing}
              style={{ display: 'none' }}
              id="pdf-upload"
            />
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
              {file ? file.name : 'Click to upload or drag and drop'}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              PDF file only (max 10MB)
            </div>
          </label>
        </div>

        {/* Progress */}
        {processing && progress && (
          <div style={{
            background: '#f0f9ff',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #4a90e2',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '13px', color: '#4a90e2', fontWeight: 500 }}>
              {progress}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#856404'
          }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={processing}
            style={{
              padding: '12px 24px',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: processing ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: processing ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || processing}
            style={{
              padding: '12px 24px',
              background: file && !processing ? '#4a90e2' : '#e0e0e0',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: file && !processing ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit'
            }}
          >
            {processing ? 'Processing...' : 'Import Profile'}
          </button>
        </div>

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
