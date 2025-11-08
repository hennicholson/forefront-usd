'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  Clock,
  User,
  BarChart,
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Module {
  id: number
  moduleId: string
  slug: string
  title: string
  description: string
  instructor: {
    name: string
    photo?: string
    year?: string
    major?: string
  }
  duration: string
  skillLevel: string
  learningObjectives?: string[]
  slides: any[]
}

export default function ModulesPage() {
  const { user, isAuthenticated } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <div className="section" style={{ paddingTop: '120px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(8px)',
            opacity: 0.4,
            zIndex: 0,
            transform: 'scale(1.1)'
          }}
        >
          <source src="https://hmn.digital/modules_bg_video.mp4" type="video/mp4" />
        </video>

        {/* Overlay gradient for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1
        }} />

        <div className="content" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666',
            marginBottom: '16px',
            fontWeight: 700
          }}>
            forefront learning modules
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            textTransform: 'lowercase',
            letterSpacing: '-2px',
            marginBottom: '24px'
          }}>
            learn by doing
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#999',
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            Interactive modules designed by students who actually build with AI.
            No fluff, just practical skills you can use immediately.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="section" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
        <div className="content">
          {/* Section Label */}
          <div className="mb-8">
            <p className="text-xs tracking-widest text-zinc-500 uppercase mb-2">
              Available Modules
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>
                No modules available yet
              </h3>
              <p style={{ color: '#666' }}>Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <Link
                  key={module.id}
                  href={`/modules/${module.slug}`}
                  className="group relative block"
                >
                  {/* White Corner Squares */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  <Card className="h-full bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-600">
                    <CardHeader className="space-y-4">
                      {/* Icon and Badge Row */}
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-900/50">
                          <GraduationCap className="h-6 w-6 text-zinc-400" />
                        </div>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            New
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl font-semibold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                        {module.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                        {module.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <User className="h-3.5 w-3.5" />
                          <span>{module.instructor.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{module.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{module.slides?.length || 0} lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <BarChart className="h-3.5 w-3.5 text-zinc-500" />
                          <span className={
                            module.skillLevel === 'Beginner' ? 'text-green-400' :
                            module.skillLevel === 'Intermediate' ? 'text-yellow-400' :
                            'text-red-400'
                          }>
                            {module.skillLevel}
                          </span>
                        </div>
                      </div>

                      {/* Start Button */}
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors pt-2">
                        <Play className="h-4 w-4" />
                        <span>Start Learning</span>
                        <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}