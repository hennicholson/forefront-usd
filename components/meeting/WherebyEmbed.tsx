'use client'
import { useEffect, useState } from 'react'

interface WherebyEmbedProps {
  roomUrl: string
  displayName: string
}

export function WherebyEmbed({ roomUrl, displayName }: WherebyEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only load on client-side
    if (typeof window === 'undefined') return

    // Dynamically import the Whereby SDK
    import('@whereby.com/browser-sdk/embed')
      .then(() => {
        console.log('Whereby SDK loaded successfully')
        setIsLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load Whereby SDK:', err)
        setError('Failed to load meeting SDK')
      })
  }, [])

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600
      }}>
        {error}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600
      }}>
        loading video room...
      </div>
    )
  }

  return (
    <whereby-embed
      room={roomUrl}
      displayName={displayName}
      minimal="off"
      background="off"
      chat="on"
      people="on"
      screenshare="on"
      leaveButton="on"
      style={{
        width: '100%',
        height: '100%',
        border: 'none'
      }}
    />
  )
}
