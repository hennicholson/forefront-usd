'use client'
import { useEffect, useState, useCallback } from 'react'
import { notFound, useParams } from 'next/navigation'
import { ModuleViewer } from '@/components/module/ModuleViewer'
import { ModuleOverlay } from '@/components/module/ModuleOverlay'

export default function ModulePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [moduleIndex, setModuleIndex] = useState(0)
  const [totalModules, setTotalModules] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)
  const [showPlayground, setShowPlayground] = useState(false)

  const loadModule = useCallback(async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const modules = await res.json()
        const foundModule = modules.find((m: any) => m.slug === slug)

        if (!foundModule) {
          setNotFoundFlag(true)
          return
        }

        const index = modules.findIndex((m: any) => m.moduleId === foundModule.moduleId)
        setCurrentModule(foundModule)
        setModuleIndex(index)
        setTotalModules(modules.length)
      }
    } catch (err) {
      console.error('Error loading module:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
    loadModule()
  }, [loadModule])

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div style={{ color: '#666' }}>Loading module...</div>
      </main>
    )
  }

  if (notFoundFlag || !currentModule) {
    notFound()
  }

  if (showPlayground) {
    return (
      <ModuleOverlay
        module={currentModule}
        moduleIndex={moduleIndex}
        totalModules={totalModules}
        onExit={() => setShowPlayground(false)}
      />
    )
  }

  return (
    <main className="bg-black text-white">
      {/* Floating Playground Button */}
      <button
        onClick={() => setShowPlayground(true)}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          padding: '16px 32px',
          background: '#fff',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          fontFamily: 'Core Sans A 65 Bold, -apple-system, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.2)'
        }}
      >
        ⚡ Start Interactive Learning
      </button>

      <ModuleViewer
        module={currentModule}
        moduleIndex={moduleIndex}
        totalModules={totalModules}
      />
    </main>
  )
}
