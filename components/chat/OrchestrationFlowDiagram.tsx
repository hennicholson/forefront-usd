'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Image as ImageIcon, ArrowRight, Clock } from 'lucide-react'

interface FlowStep {
  step: number
  model: string
  purpose: string
  executionTime: number
}

interface OrchestrationFlowDiagramProps {
  steps: FlowStep[]
  onStepClick?: (stepIndex: number) => void
}

export function OrchestrationFlowDiagram({ steps, onStepClick }: OrchestrationFlowDiagramProps) {
  const getStepConfig = (purpose: string) => {
    switch (purpose) {
      case 'web-search':
        return {
          icon: Search,
          color: 'blue',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/40',
          iconColor: 'text-blue-400',
          label: 'Research'
        }
      case 'prompt-enhancement':
        return {
          icon: Sparkles,
          color: 'purple',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/40',
          iconColor: 'text-purple-400',
          label: 'Optimize'
        }
      case 'image-generation':
        return {
          icon: ImageIcon,
          color: 'green',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/40',
          iconColor: 'text-green-400',
          label: 'Generate'
        }
      default:
        return {
          icon: Sparkles,
          color: 'zinc',
          bgColor: 'bg-zinc-500/10',
          borderColor: 'border-zinc-500/40',
          iconColor: 'text-zinc-400',
          label: purpose
        }
    }
  }

  const totalTime = steps.reduce((acc, step) => acc + step.executionTime, 0)

  return (
    <div className="mb-6 p-4 rounded-xl border border-zinc-700/30 bg-zinc-800/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white mb-1"
            style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
          >
            🤖 Forefront Intelligence Orchestration
          </h4>
          <p className="text-xs text-zinc-400">Multi-model workflow executed in {(totalTime / 1000).toFixed(1)}s</p>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const config = getStepConfig(step.purpose)
          const Icon = config.icon

          return (
            <React.Fragment key={step.step}>
              {/* Step Node */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onStepClick?.(index)}
                className={`flex-1 p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:bg-opacity-20 transition-all group cursor-pointer`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg bg-zinc-800/50 ${config.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white mb-0.5"
                      style={{ fontFamily: "'Core Sans A 65 Bold', sans-serif" }}
                    >
                      {config.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                      {step.model}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Clock size={10} className="text-zinc-500" />
                      <p className="text-[10px] text-zinc-500">
                        {(step.executionTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.15 }}
                  className="flex-shrink-0"
                >
                  <ArrowRight size={20} className="text-zinc-600" />
                </motion.div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Educational Note */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="font-semibold text-zinc-300">Sequential AI orchestration:</span> Each model specializes in a specific task, working together to deliver optimal results. Click any step above to see its full output.
        </p>
      </div>
    </div>
  )
}
