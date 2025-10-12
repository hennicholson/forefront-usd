'use client'
import { useState, useEffect } from 'react'
import { modules as defaultModules, Module } from '@/lib/data/modules'

export function useModules() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Force refresh with comprehensive modules (version 2.0)
    const MODULES_VERSION = '2.0-comprehensive'
    const storedVersion = localStorage.getItem('modulesVersion')

    // If version doesn't match, clear old cache and load new modules
    if (storedVersion !== MODULES_VERSION) {
      console.log('🔄 Loading comprehensive modules v2.0...')
      localStorage.removeItem('customModules')
      localStorage.setItem('modulesVersion', MODULES_VERSION)
      setModules(defaultModules)
      localStorage.setItem('customModules', JSON.stringify(defaultModules))
    } else {
      // Load from localStorage if version matches
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
    }
    setLoading(false)
  }, [])

  return { modules, loading }
}
