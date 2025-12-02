'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        padding: '20px',
        background: 'rgba(39, 39, 42, 0.5)', // zinc-800/50
        borderTop: '1px solid rgb(63, 63, 70)', // zinc-700
      }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || 'Ask Forefront Intelligence anything...'}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#e4e4e7',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: '24px',
          maxHeight: '200px',
          lineHeight: '1.5',
        }}
        rows={1}
      />

      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          background: disabled || !input.trim() ? '#52525b' : '#fff',
          color: disabled || !input.trim() ? '#a1a1aa' : '#000',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'Core Sans A 65 Bold, sans-serif',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.background = '#f0f0f0'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.background = '#fff'
          }
        }}
      >
        {disabled ? '[THINKING...]' : '[SEND]'}
      </button>
    </div>
  )
}
