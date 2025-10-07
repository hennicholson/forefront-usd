'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean
}

interface ModuleProgress {
  moduleId: string
  completedSlides: number[]
  lastViewed: number
  completed: boolean
}

interface ModuleNote {
  moduleId: string
  slideId: number
  content: string
  timestamp: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
  progress: ModuleProgress[]
  notes: ModuleNote[]
  updateProgress: (moduleId: string, slideId: number, completed?: boolean) => void
  addNote: (moduleId: string, slideId: number, content: string) => void
  getModuleProgress: (moduleId: string) => ModuleProgress | undefined
  getSlideNotes: (moduleId: string, slideId: number) => ModuleNote | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<ModuleProgress[]>([])
  const [notes, setNotes] = useState<ModuleNote[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedProgress = localStorage.getItem('progress')
    const storedNotes = localStorage.getItem('notes')

    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedProgress) setProgress(JSON.parse(storedProgress))
    if (storedNotes) setNotes(JSON.parse(storedNotes))
  }, [])

  const login = (email: string, password: string): boolean => {
    // Simple demo auth - in production this would call an API
    if (email && password.length >= 6) {
      // Check if admin credentials (you can change these)
      const isAdmin = email === 'admin@forefront.network' && password === 'admin123'

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        isAdmin
      }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateProgress = (moduleId: string, slideId: number, completed: boolean = false) => {
    setProgress(prev => {
      const existing = prev.find(p => p.moduleId === moduleId)
      let updated: ModuleProgress[]

      if (existing) {
        updated = prev.map(p => {
          if (p.moduleId === moduleId) {
            const completedSlides = p.completedSlides.includes(slideId)
              ? p.completedSlides
              : [...p.completedSlides, slideId]
            return {
              ...p,
              completedSlides,
              lastViewed: slideId,
              completed: completed || p.completed
            }
          }
          return p
        })
      } else {
        updated = [
          ...prev,
          {
            moduleId,
            completedSlides: [slideId],
            lastViewed: slideId,
            completed
          }
        ]
      }

      localStorage.setItem('progress', JSON.stringify(updated))
      return updated
    })
  }

  const addNote = (moduleId: string, slideId: number, content: string) => {
    setNotes(prev => {
      const existing = prev.find(n => n.moduleId === moduleId && n.slideId === slideId)
      let updated: ModuleNote[]

      if (existing) {
        updated = prev.map(n =>
          n.moduleId === moduleId && n.slideId === slideId
            ? { ...n, content, timestamp: Date.now() }
            : n
        )
      } else {
        updated = [
          ...prev,
          { moduleId, slideId, content, timestamp: Date.now() }
        ]
      }

      localStorage.setItem('notes', JSON.stringify(updated))
      return updated
    })
  }

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.moduleId === moduleId)
  }

  const getSlideNotes = (moduleId: string, slideId: number) => {
    return notes.find(n => n.moduleId === moduleId && n.slideId === slideId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        progress,
        notes,
        updateProgress,
        addNote,
        getModuleProgress,
        getSlideNotes
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
