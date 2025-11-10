'use client'

import { X } from 'lucide-react'
import { GenerationPortfolio } from './GenerationPortfolio'
import { motion, AnimatePresence } from 'framer-motion'

interface GenerationPortfolioModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function GenerationPortfolioModal({ userId, isOpen, onClose }: GenerationPortfolioModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] overflow-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-black min-h-screen p-6 md:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 p-3 bg-zinc-900 hover:bg-white text-white hover:text-black rounded-lg transition-all duration-200 z-50"
          >
            <X size={20} />
          </button>

          {/* Generation Portfolio Content */}
          <div className="max-w-7xl mx-auto">
            <GenerationPortfolio userId={userId} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
