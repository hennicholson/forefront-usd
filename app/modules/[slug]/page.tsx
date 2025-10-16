'use client'
import { useEffect, useState, useCallback } from 'react'
import { notFound, useParams } from 'next/navigation'
import { ModuleViewer } from '@/components/module/ModuleViewer'

export default function ModulePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [moduleIndex, setModuleIndex] = useState(0)
  const [totalModules, setTotalModules] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

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

  return (
    <main className="bg-black text-white">
      <ModuleViewer
        module={currentModule}
        moduleIndex={moduleIndex}
        totalModules={totalModules}
      />
    </main>
  )
}
