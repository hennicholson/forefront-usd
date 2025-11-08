'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Avatar } from '@/components/common/Avatar'
import { GenerationPortfolioModal } from './components/GenerationPortfolioModal'
import { SubmissionsModal } from './components/SubmissionsModal'
import { BentoDashboardGrid } from '@/components/ui/bento-dashboard-grid'
import {
  ProgressStatsCard,
  ActiveModulesListCard,
  GenerationPortfolioCard,
  LearningAnalyticsCard,
  RecentActivityCard,
  MySubmissionsCard,
  AllModulesGridCard,
  StudentNetworkCard,
  AIWorkflowsCard,
  SubmitCourseCard,
  LatestNewsCard
} from './components/BentoDashboardCards'

export default function DashboardPage() {
  const { user, isAuthenticated, progress } = useAuth()
  const router = useRouter()
  const [modules, setModules] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false)
  const [generationStats, setGenerationStats] = useState({ saved: 0, total: 0 })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    window.scrollTo(0, 0)
    loadModules()
    loadSubmissions()
    loadGenerationStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

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

  const loadSubmissions = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/submissions?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
    }
  }

  const loadGenerationStats = async () => {
    if (!user?.id) return
    try {
      // Fetch saved generations count
      const savedRes = await fetch(`/api/generation-history?userId=${user.id}&saved=true&limit=1000`)
      if (savedRes.ok) {
        const savedData = await savedRes.json()
        const savedCount = savedData.history?.length || 0

        // Fetch total generations count
        const totalRes = await fetch(`/api/generation-history?userId=${user.id}&limit=1000`)
        if (totalRes.ok) {
          const totalData = await totalRes.json()
          const totalCount = totalData.history?.length || 0
          setGenerationStats({ saved: savedCount, total: totalCount })
        }
      }
    } catch (err) {
      console.error('Error loading generation stats:', err)
    }
  }

  const clearRejectedSubmissions = async () => {
    if (!user?.id) return
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected')

    try {
      // Delete each rejected submission
      await Promise.all(rejectedSubmissions.map(submission =>
        fetch(`/api/submissions?id=${submission.id}&userId=${user.id}`, {
          method: 'DELETE'
        })
      ))
      // Reload submissions
      loadSubmissions()
    } catch (err) {
      console.error('Error clearing rejected submissions:', err)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const totalModules = modules.length
  const startedModules = progress.length
  const completedModules = progress.filter(p => p.completed).length
  const totalSlides = modules.reduce((acc, m) => acc + m.slides.length, 0)
  const completedSlides = progress.reduce((acc, p) => acc + p.completedSlides.length, 0)

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero with Banner */}
      <div className="section" style={{
        paddingTop: '100px',
        paddingBottom: '40px',
        minHeight: 'auto',
        position: 'relative'
      }}>
        {/* Banner Background */}
        {user?.bannerImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            backgroundImage: `url(${user.bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: 0
          }} />
        )}

        <div className="content" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <Avatar
              src={user?.profileImage}
              name={user?.name || 'User'}
              size="xl"
              style={{
                border: '4px solid #000',
                boxShadow: '0 4px 16px rgba(255,255,255,0.1)'
              }}
            />
            <div>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 700
              }}>
                dashboard
              </div>
              <h1 style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 900,
                textTransform: 'lowercase',
                letterSpacing: '-2px',
                marginBottom: '8px'
              }}>
                welcome back, {user?.name}
              </h1>
              <p style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: '#999'
              }}>
                your learning hub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Dashboard Grid */}
      <div className="section" style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: 'auto' }}>
        <div className="content">
          <BentoDashboardGrid
            progressStats={
              <ProgressStatsCard
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
            activeModules={
              <ActiveModulesListCard
                modules={modules}
                progress={progress}
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
            latestNews={<LatestNewsCard />}
            mySubmissions={
              <MySubmissionsCard
                submissions={submissions}
                onClick={() => setSubmissionsModalOpen(true)}
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
            aiPortfolio={
              <GenerationPortfolioCard
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
                savedGenerations={generationStats.saved}
                totalGenerations={generationStats.total}
                onClick={() => setPortfolioModalOpen(true)}
              />
            }
            studentNetwork={<StudentNetworkCard />}
            submitCourse={<SubmitCourseCard />}
            allModules={
              <AllModulesGridCard
                modules={modules}
                progress={progress}
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
            aiWorkflows={<AIWorkflowsCard />}
            learningAnalytics={
              <LearningAnalyticsCard
                completedModules={completedModules}
                totalModules={totalModules}
                startedModules={startedModules}
                completedSlides={completedSlides}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
            recentActivity={
              <RecentActivityCard
                completedModules={completedModules}
                completedSlides={completedSlides}
                totalModules={totalModules}
                startedModules={startedModules}
                totalSlides={totalSlides}
                userId={user?.id || ''}
              />
            }
          />
        </div>
      </div>

      {/* Submissions Modal */}
      <SubmissionsModal
        submissions={submissions}
        isOpen={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        onClearRejected={clearRejectedSubmissions}
      />

      {/* Generation Portfolio Modal */}
      {user && (
        <GenerationPortfolioModal
          userId={user.id}
          isOpen={portfolioModalOpen}
          onClose={() => setPortfolioModalOpen(false)}
        />
      )}
    </main>
  )
}
