import React from 'react'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
}

const sizeMap = {
  sm: { width: 32, height: 32, fontSize: 12 },
  md: { width: 48, height: 48, fontSize: 16 },
  lg: { width: 64, height: 64, fontSize: 22 },
  xl: { width: 96, height: 96, fontSize: 32 }
}

export function Avatar({ src, name, size = 'md', className, style }: AvatarProps) {
  const dimensions = sizeMap[size]

  // Get initials from name (first letter of first and last name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(name)

  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 65%, 55%)`
  }

  const bgColor = getColorFromName(name)

  return (
    <div
      className={className}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: src ? '#f0f0f0' : bgColor,
        color: '#fff',
        fontSize: dimensions.fontSize,
        fontWeight: 700,
        ...style
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
