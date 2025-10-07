'use client'
import { useState, useEffect } from 'react'
import { modules as defaultModules, Module } from '@/lib/data/modules'

export function useModules() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load modules from localStorage or use defaults
    const stored = localStorage.getItem('customModules')
    if (stored) {
      try {
        setModules(JSON.parse(stored))
      } catch {
        setModules(defaultModules)
        localStorage.setItem('customModules', JSON.stringify(defaultModules))
      }
    } else {
      setModules(defaultModules)
      localStorage.setItem('customModules', JSON.stringify(defaultModules))
    }
    setLoading(false)
  }, [])

  return { modules, loading }
}
