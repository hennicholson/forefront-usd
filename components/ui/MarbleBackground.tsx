"use client"

import React from 'react'

interface MarbleBackgroundProps {
  children?: React.ReactNode
  className?: string
}

export function MarbleBackground({ children, className = '' }: MarbleBackgroundProps) {
  // Always render as an absolute positioned background overlay
  return <div className={`absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-black/40 to-zinc-900/20 pointer-events-none ${className}`} />
}
