'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KnowledgeCheckProps {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  isDarkMode: boolean
  onComplete: (correct: boolean, selectedIndex: number) => void
  onContinue?: () => void
}

export function KnowledgeCheck({
  question,
  options,
  correctIndex,
  explanation,
  isDarkMode,
  onComplete,
  onContinue
}: KnowledgeCheckProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    if (selectedIndex === null) return
    setShowResult(true)
    const isCorrect = selectedIndex === correctIndex
    onComplete(isCorrect, selectedIndex)
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      setSelectedIndex(null)
      setShowResult(false)
    }
  }

  const isCorrect = selectedIndex === correctIndex

  return (
    <div className={cn(
      "rounded-2xl border p-6 backdrop-blur-sm",
      isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-gray-50 border-gray-200"
    )}>
      <div className="space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-blue-100 text-blue-600"
            )}>
              Knowledge Check
            </div>
          </div>
          <h3 className="text-lg font-medium leading-relaxed">{question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index
            const isCorrectOption = index === correctIndex
            const showCorrectState = showResult && isCorrectOption
            const showIncorrectState = showResult && isSelected && !isCorrect

            return (
              <motion.button
                key={index}
                onClick={() => !showResult && setSelectedIndex(index)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden",
                  !showResult && "cursor-pointer hover:scale-[1.02]",
                  showResult && "cursor-default",
                  // Default state
                  !showResult && !isSelected && (isDarkMode
                    ? "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"),
                  // Selected but not submitted
                  !showResult && isSelected && (isDarkMode
                    ? "border-white bg-zinc-800"
                    : "border-blue-500 bg-blue-50"),
                  // Correct answer
                  showCorrectState && "border-green-500 bg-green-500/10",
                  // Incorrect answer
                  showIncorrectState && "border-red-500 bg-red-500/10"
                )}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      !showResult && !isSelected && (isDarkMode ? "border-zinc-600" : "border-gray-300"),
                      !showResult && isSelected && "border-white bg-white",
                      showCorrectState && "border-green-500 bg-green-500",
                      showIncorrectState && "border-red-500 bg-red-500"
                    )}>
                      {!showResult && isSelected && (
                        <div className="w-2 h-2 rounded-full bg-black" />
                      )}
                      {showCorrectState && <CheckCircle2 size={16} className="text-white" />}
                      {showIncorrectState && <XCircle size={16} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Result & Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "p-4 rounded-xl border",
                isCorrect
                  ? isDarkMode
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-green-50 border-green-200"
                  : isDarkMode
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className={cn(
                    "font-medium text-sm",
                    isCorrect ? "text-green-600" : "text-red-600",
                    isDarkMode && (isCorrect ? "text-green-400" : "text-red-400")
                  )}>
                    {isCorrect ? "Correct! Well done." : "Not quite right."}
                  </p>
                  {explanation && (
                    <p className="text-sm opacity-80 leading-relaxed">
                      {explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="flex justify-end">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                selectedIndex !== null
                  ? "bg-white hover:bg-zinc-200 text-black"
                  : isDarkMode
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              Check Answer
              <ArrowRight size={16} />
            </button>
          ) : isCorrect ? (
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-lg font-medium text-sm bg-white hover:bg-zinc-200 text-black transition-all flex items-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedIndex(null)
                setShowResult(false)
              }}
              className="px-6 py-2.5 rounded-lg font-medium text-sm bg-orange-600 hover:bg-orange-700 text-white transition-all flex items-center gap-2"
            >
              Try Again
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
