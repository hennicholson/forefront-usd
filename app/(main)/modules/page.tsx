'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Clock,
  User,
  BarChart,
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Layers
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
  const { user, isAuthenticated, progress } = useAuth()
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
      <div className="section" style={{ paddingTop: 'clamp(80px, 15vw, 120px)', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
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
            // Loading skeleton grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg" />
                    <div className="w-16 h-5 bg-zinc-800 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-zinc-800 rounded mb-4" />
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-zinc-800/70 rounded" />
                    <div className="h-3 bg-zinc-800/70 rounded w-5/6" />
                    <div className="h-3 bg-zinc-800/70 rounded w-4/6" />
                  </div>
                  <div className="pt-4 border-t border-zinc-800 space-y-2">
                    <div className="h-3 w-24 bg-zinc-800/50 rounded" />
                    <div className="flex gap-4">
                      <div className="h-3 w-16 bg-zinc-800/50 rounded" />
                      <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : modules.length === 0 ? (
            // Empty state with animation
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Layers className="w-12 h-12 text-zinc-600" />
              </motion.div>
              <h3
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
              >
                no modules available yet
              </h3>
              <p className="text-zinc-500 max-w-sm">
                new learning content is on the way. check back soon for exciting modules!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => {
                // Check if this is the onboarding module
                const isOnboarding = module.slug === 'getting-started'

                // Check if user has completed onboarding
                const onboardingProgress = progress.find(p => p.moduleId === module.moduleId)
                const hasCompletedOnboarding = onboardingProgress?.completed || false

                return (
                  <Link
                    key={module.id}
                    href={`/modules/${module.slug}`}
                    className="group relative block"
                  >
                    {/* Special glow for uncompleted onboarding */}
                    {isOnboarding && !hasCompletedOnboarding && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-75 blur animate-pulse" />
                    )}

                    {/* White Corner Squares */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    <Card className={`h-full relative backdrop-blur-sm transition-all duration-300 ${
                      isOnboarding
                        ? 'bg-gradient-to-br from-purple-950/40 via-zinc-950/60 to-blue-950/40 border-purple-500/50 group-hover:border-purple-400'
                        : 'bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border-zinc-800 group-hover:border-zinc-600'
                    }`}>
                      <CardHeader className="space-y-4">
                        {/* Icon and Badge Row */}
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg border ${
                            isOnboarding
                              ? 'border-purple-500/50 bg-purple-900/30'
                              : 'border-zinc-700 bg-zinc-900/50'
                          }`}>
                            <GraduationCap className={`h-6 w-6 ${
                              isOnboarding ? 'text-purple-400' : 'text-zinc-400'
                            }`} />
                          </div>
                          {isOnboarding ? (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                              {hasCompletedOnboarding ? '✓ Tutorial' : '🎓 Start Here'}
                            </Badge>
                          ) : index === 0 ? (
                            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                              New
                            </Badge>
                          ) : null}
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
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}