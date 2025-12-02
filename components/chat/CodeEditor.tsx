'use client'

import { useState } from 'react'
import { LivePreview } from './LivePreview'
import { CodeViewer } from './CodeViewer'
import { Eye, FileCode, Palette, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface CodeEditorProps {
  code: {
    html: string
    css: string
    javascript: string
  }
  isDarkMode?: boolean
}

type TabType = 'preview' | 'html' | 'css' | 'javascript'

export function CodeEditor({ code, isDarkMode = true }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('preview')

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: 'preview', label: 'preview', icon: <Eye size={15} /> },
    { id: 'html', label: 'html', icon: <FileCode size={15} /> },
    { id: 'css', label: 'css', icon: <Palette size={15} /> },
    { id: 'javascript', label: 'js', icon: <Zap size={15} /> },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar with Better Contrast */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 border-b ${isDarkMode ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-zinc-100 border-zinc-300'}`}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lowercase tracking-wide transition-all duration-200",
              "font-semibold",
              activeTab === tab.id
                ? isDarkMode
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-black text-white shadow-sm'
                : isDarkMode
                ? 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            )}
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              letterSpacing: '0.5px',
            }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content Area with Animation */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'preview' && <LivePreview code={code} />}
            {activeTab === 'html' && <CodeViewer code={code.html} language="html" isDarkMode={isDarkMode} />}
            {activeTab === 'css' && <CodeViewer code={code.css} language="css" isDarkMode={isDarkMode} />}
            {activeTab === 'javascript' && <CodeViewer code={code.javascript} language="javascript" isDarkMode={isDarkMode} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
