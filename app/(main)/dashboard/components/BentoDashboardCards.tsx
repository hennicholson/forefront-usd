'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Module {
  id: string
  title: string
  description: string
  slug: string
  slides: any[]
}

interface ModuleProgress {
  moduleId: string
  completed: boolean
  completedSlides: any[]
  lastViewed: number
}

interface Submission {
  id: string
  status: 'approved' | 'pending' | 'rejected'
  title: string
  description: string
}

interface BentoCardProps {
  completedModules: number
  totalModules: number
  startedModules: number
  completedSlides: number
  totalSlides: number
  userId: string
  savedGenerations?: number
  totalGenerations?: number
  modules?: Module[]
  progress?: ModuleProgress[]
  submissions?: Submission[]
  knowledgeCheckAvg?: number
}

// Card 1: Overall Progress Stats (Tall - Left)
export const ProgressStatsCard = ({ completedModules, totalModules, completedSlides, totalSlides }: BentoCardProps) => {
  const progressPercent = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-8 hover:border-white transition-all duration-300 cursor-pointer group">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-bold">
          learning stats
        </div>
        <div className="text-6xl font-black text-white mb-2">
          {progressPercent}%
        </div>
        <div className="text-sm text-zinc-400">overall progress</div>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{completedModules}</span>
            <span className="text-xl text-zinc-600">/{totalModules}</span>
          </div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">modules completed</div>
          <div className="mt-2 h-2 bg-black rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{completedSlides}</span>
            <span className="text-xl text-zinc-600">/{totalSlides}</span>
          </div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">sections learned</div>
          <div className="mt-2 h-2 bg-black rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="text-xs uppercase tracking-wider text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          view details →
        </div>
      </div>
    </div>
  )
}

// Card 2: Active Learning
export const ActiveLearningCard = ({ startedModules }: BentoCardProps) => {
  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-white transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          active now
        </div>
        <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
          in progress
        </Badge>
      </div>
      <div className="text-5xl font-black text-white mb-2">{startedModules}</div>
      <div className="text-sm text-zinc-400">modules in progress</div>
    </div>
  )
}

// Card 3: Generation Portfolio Summary
export const GenerationPortfolioCard = ({ savedGenerations = 0, totalGenerations = 0, onClick }: BentoCardProps & { onClick?: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      {/* Dotted background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative z-10">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
          ai portfolio
        </div>
        <div className="text-5xl font-black text-white mb-2">
          {savedGenerations}
        </div>
        <div className="text-sm text-zinc-400">saved creations</div>
        <div className="mt-4 text-xs text-zinc-600">
          {totalGenerations} total generations
        </div>
        <div className="mt-4 text-xs uppercase tracking-wider text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          view portfolio →
        </div>
      </div>
    </div>
  )
}

// Card 4: Learning Analytics
export const LearningAnalyticsCard = ({ userId }: BentoCardProps) => {
  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300">
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
        performance
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-white">A+</span>
          </div>
          <div className="text-xs text-zinc-500">knowledge check avg</div>
        </div>
        <div className="h-1 bg-black rounded-full overflow-hidden">
          <div className="h-full w-[85%] bg-blue-500" />
        </div>
      </div>
    </div>
  )
}

// Card 5: Quick Actions
export const QuickActionsCard = () => {
  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-orange-500 transition-all duration-300">
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
        quick actions
      </div>
      <div className="space-y-3">
        <Link href="/submit">
          <div className="text-sm text-white hover:text-orange-400 transition-colors flex items-center gap-2">
            <span>→</span>
            <span>submit course</span>
          </div>
        </Link>
        <Link href="/network">
          <div className="text-sm text-white hover:text-orange-400 transition-colors flex items-center gap-2">
            <span>→</span>
            <span>join network</span>
          </div>
        </Link>
        <Link href="/workflows">
          <div className="text-sm text-white hover:text-orange-400 transition-colors flex items-center gap-2">
            <span>→</span>
            <span>ai workflows</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

// Card 6: Recent Activity (Wide)
export const RecentActivityCard = ({ completedModules, completedSlides }: BentoCardProps) => {
  const hasActivity = completedModules > 0 || completedSlides > 0

  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-white transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          recent activity
        </div>
        <div className="text-xs text-zinc-600">all time</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white mb-1">
            {hasActivity ? 'keep it up!' : 'start learning!'}
          </div>
          <div className="text-sm text-zinc-400">
            {hasActivity
              ? `${completedSlides} sections completed across ${completedModules} modules`
              : 'begin your ai journey today'}
          </div>
        </div>
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 border-2 border-zinc-900"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Card 7: Active Modules List
export const ActiveModulesListCard = ({ modules = [], progress = [] }: BentoCardProps) => {
  const inProgressModules = modules
    .map(module => {
      const moduleProgress = progress.find(p => p.moduleId === module.id)
      if (!moduleProgress || moduleProgress.completed) return null

      const progressPercent = Math.round((moduleProgress.completedSlides.length / module.slides.length) * 100)
      return {
        ...module,
        progressPercent,
        currentSlide: moduleProgress.lastViewed + 1
      }
    })
    .filter(Boolean)
    .slice(0, 4)

  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-green-500 transition-all duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          active modules
        </div>
        <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
          {inProgressModules.length} in progress
        </Badge>
      </div>

      {inProgressModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="text-sm text-zinc-500">no modules in progress</div>
          <div className="text-xs text-zinc-600 mt-2">start a course to begin learning</div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-64">
          {inProgressModules.map((module: any) => (
            <Link key={module.id} href={`/modules/${module.slug}`}>
              <div className="p-3 bg-black rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
                <div className="text-sm font-semibold text-white mb-2 line-clamp-1">
                  {module.title}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${module.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{module.progressPercent}%</span>
                </div>
                <div className="text-xs text-zinc-600">
                  section {module.currentSlide}/{module.slides.length}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Card 8: My Submissions Summary
export const MySubmissionsCard = ({ submissions = [], onClick }: BentoCardProps & { onClick?: () => void }) => {
  const approved = submissions.filter(s => s.status === 'approved').length
  const pending = submissions.filter(s => s.status === 'pending').length
  const rejected = submissions.filter(s => s.status === 'rejected').length
  const total = submissions.length

  return (
    <div
      onClick={onClick}
      className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-yellow-500 transition-all duration-300 cursor-pointer group"
    >
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
        my submissions
      </div>

      <div className="text-5xl font-black text-white mb-4">{total}</div>

      {total > 0 ? (
        <div className="space-y-2">
          {approved > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">✓ approved</span>
              <span className="text-white font-semibold">{approved}</span>
            </div>
          )}
          {pending > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-400">⏳ pending</span>
              <span className="text-white font-semibold">{pending}</span>
            </div>
          )}
          {rejected > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-400">✗ rejected</span>
              <span className="text-white font-semibold">{rejected}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-500">no submissions yet</div>
      )}

      <div className="mt-4 text-xs uppercase tracking-wider text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        {total > 0 ? 'view all →' : 'submit course →'}
      </div>
    </div>
  )
}

// Card 9: All Modules Grid (Wide 2x2)
export const AllModulesGridCard = ({ modules = [], progress = [] }: BentoCardProps) => {
  const modulesWithProgress = modules.slice(0, 6).map((module, index) => {
    const moduleProgress = progress.find(p => p.moduleId === module.id)
    const progressPercent = moduleProgress
      ? Math.round((moduleProgress.completedSlides.length / module.slides.length) * 100)
      : 0
    const isCompleted = moduleProgress?.completed

    return {
      ...module,
      progressPercent,
      isCompleted,
      number: String(index + 1).padStart(2, '0')
    }
  })

  return (
    <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          all modules
        </div>
        <div className="text-xs text-zinc-600">{modules.length} available</div>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-80">
        {modulesWithProgress.map((module: any) => (
          <Link key={module.id} href={`/modules/${module.slug}`}>
            <div className="p-4 bg-black rounded-lg hover:bg-zinc-800 transition-all duration-300 cursor-pointer border border-zinc-800 hover:border-zinc-600">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl font-bold text-zinc-700">{module.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white mb-1 line-clamp-2 leading-tight">
                    {module.title}
                  </div>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${module.progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-zinc-600">
                {module.isCompleted ? '✓ completed' : module.progressPercent > 0 ? `${module.progressPercent}%` : 'start'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {modules.length > 6 && (
        <div className="mt-3 text-center text-xs text-zinc-600">
          +{modules.length - 6} more modules
        </div>
      )}
    </div>
  )
}

// Card 10: Student Network
export const StudentNetworkCard = () => {
  return (
    <Link href="/network">
      <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 cursor-pointer group">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
          connect & learn
        </div>
        <div className="text-3xl font-bold text-white mb-2">student network</div>
        <div className="text-sm text-zinc-400 mb-4">discover learners and join discussions</div>
        <div className="text-xs uppercase tracking-wider text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          explore →
        </div>
      </div>
    </Link>
  )
}

// Card 11: AI Workflows
export const AIWorkflowsCard = () => {
  return (
    <Link href="/workflows">
      <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-indigo-500 transition-all duration-300 cursor-pointer group">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
          visual guides
        </div>
        <div className="text-3xl font-bold text-white mb-2">ai workflows</div>
        <div className="text-sm text-zinc-400 mb-4">step-by-step visual workflows for ai tools</div>
        <div className="text-xs uppercase tracking-wider text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          explore →
        </div>
      </div>
    </Link>
  )
}

// Card 12: Submit Course
export const SubmitCourseCard = () => {
  return (
    <Link href="/submit">
      <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-pink-500 transition-all duration-300 cursor-pointer group">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
          share knowledge
        </div>
        <div className="text-3xl font-bold text-white mb-2">submit a course</div>
        <div className="text-sm text-zinc-400 mb-4">contribute your expertise to the community</div>
        <div className="text-xs uppercase tracking-wider text-pink-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          submit →
        </div>
      </div>
    </Link>
  )
}

// Card 13: Latest News/Updates
export const LatestNewsCard = () => {
  return (
    <Link href="/modules">
      <div className="h-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition-all duration-300 cursor-pointer group">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
          stay updated
        </div>
        <div className="text-3xl font-bold text-white mb-2">latest news</div>
        <div className="text-sm text-zinc-400 mb-4">latest ai breakthroughs, tools, and discoveries</div>
        <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          read now →
        </div>
      </div>
    </Link>
  )
}
