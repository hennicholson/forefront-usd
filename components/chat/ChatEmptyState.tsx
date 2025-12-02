'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  description: string
  color: string
}

interface ChatEmptyStateProps {
  userName?: string
  isDarkMode?: boolean
  onQuickAction?: (label: string) => void
}

export function ChatEmptyState({
  userName = 'User',
  isDarkMode = true,
  onQuickAction
}: ChatEmptyStateProps) {
  const quickActions: QuickAction[] = [
    {
      label: 'Content Help',
      description: 'Help with me create a Presentation',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    },
    {
      label: 'Suggestions',
      description: 'Help with me ideas',
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30'
    },
    {
      label: 'Job Application',
      description: 'Help with me apply for job application',
      color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
    }
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Sphere Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl"
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center max-w-3xl w-full space-y-12"
      >
        {/* Greeting */}
        <div className="text-center space-y-3">
          <motion.h1
            className={cn(
              "text-5xl font-bold",
              isDarkMode ? "text-white" : "text-black"
            )}
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
            }}
          >
            Hey! {userName}
          </motion.h1>
          <motion.p
            className={cn(
              "text-2xl",
              isDarkMode ? "text-zinc-400" : "text-zinc-600"
            )}
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
            }}
          >
            What can I help with?
          </motion.p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => onQuickAction?.(action.label)}
              className={cn(
                "group relative overflow-hidden rounded-xl px-5 py-4 text-left transition-all duration-200",
                "border",
                isDarkMode
                  ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700"
                  : "bg-zinc-100/50 border-zinc-200 hover:bg-zinc-200/50 hover:border-zinc-300"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "text-sm font-medium mb-1.5",
                    isDarkMode ? "text-white" : "text-black"
                  )}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  }}
                >
                  {action.label}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    isDarkMode ? "text-zinc-500" : "text-zinc-600"
                  )}
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  }}
                >
                  {action.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
