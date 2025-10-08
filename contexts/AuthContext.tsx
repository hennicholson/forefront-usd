'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  bio?: string
  interests?: string[]
  meetingLink?: string
  profileImage?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  availability?: string
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
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name?: string) => Promise<boolean>
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if admin credentials
      const isAdmin = email === 'admin@forefront.network' && password === '123456'

      // Try to get existing user from database
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`)

      if (res.ok) {
        const { user: existingUser } = await res.json()
        setUser(existingUser)
        localStorage.setItem('user', JSON.stringify(existingUser))
        return true
      }

      // If user doesn't exist, create new user (auto-signup on first login)
      if (res.status === 404 && password.length >= 6) {
        return await signup(email, password)
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0]
        })
      })

      if (!res.ok) {
        const error = await res.json()
        console.error('Signup error:', error)
        return false
      }

      const { user: newUser } = await res.json()
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
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
        signup,
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
