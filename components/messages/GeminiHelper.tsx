'use client'
import { useState } from 'react'

interface GeminiHelperProps {
  onInsertText: (text: string) => void
  onClose: () => void
  geminiApiKey?: string
}

export function GeminiHelper({ onInsertText, onClose, geminiApiKey }: GeminiHelperProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim() || !geminiApiKey) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful AI assistant that helps users write professional, clear, and friendly messages. Based on the following prompt, generate a well-written message:\n\n${prompt}\n\nProvide only the message text without any additional formatting or explanation.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate message')
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (generatedText) {
        onInsertText(generatedText)
        onClose()
      } else {
        setError('No response generated')
      }
    } catch (err) {
      console.error('Error generating message:', err)
      setError('Failed to generate message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '24px',
          padding: '32px',
          width: '90%',
          maxWidth: '600px',
          boxShadow: `
            inset 0 1px 0 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 0 rgba(0,0,0,0.05),
            0 20px 60px rgba(0,0,0,0.2)
          `,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#000' }}>
            ✨ AI Message Helper
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '8px',
            }}
          >
            What would you like to say?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Ask about project collaboration, schedule a meeting, thank them for their help..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#5865F2'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(220, 53, 69, 0.1)',
              borderRadius: '8px',
              color: '#dc3545',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              padding: '12px 24px',
              background: loading || !prompt.trim() ? 'rgba(88, 101, 242, 0.5)' : '#5865F2',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && prompt.trim()) {
                e.currentTarget.style.background = '#4752C4'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && prompt.trim()) {
                e.currentTarget.style.background = '#5865F2'
              }
            }}
          >
            {loading ? 'Generating...' : 'Generate Message'}
          </button>
        </div>
      </div>
    </div>
  )
}
