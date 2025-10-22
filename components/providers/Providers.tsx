'use client'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from './QueryProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
