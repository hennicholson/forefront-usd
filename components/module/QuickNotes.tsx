'use client'
import { useState } from 'react'
import { ChevronDown, BookOpen, Link as LinkIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickNotesProps {
  sections: Array<{ id: string; title: string }>
  keyTakeaways: string[]
  resources: Array<{ title: string; url: string }>
}

export function QuickNotes({ sections, keyTakeaways, resources }: QuickNotesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className="sticky top-24 space-y-6">
      {/* Jump to section */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-forefront-cyan" />
            <span className="font-semibold text-white">Jump To</span>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-2">
                {sections.map((section, i) => (
                  <button
                    key={section.id}
                    className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    onClick={() => {
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {i + 1}. {section.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Key takeaways */}
      <div className="bg-gray-800 rounded-2xl border border-forefront-cyan/30 p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-forefront-cyan">✨</span>
          Key Takeaways
        </h3>
        <ul className="space-y-2">
          {keyTakeaways.map((takeaway, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-forefront-cyan mt-1">•</span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Resources */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
        <h3 className="font-semibold text-white mb-4">Resources</h3>
        <div className="space-y-2">
          {resources.map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-forefront-cyan hover:text-forefront-blue transition-colors"
            >
              <LinkIcon size={14} />
              <span>{resource.title}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
