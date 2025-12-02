'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeViewerProps {
  code: string
  language: 'html' | 'css' | 'javascript'
  isDarkMode?: boolean
}

export function CodeViewer({ code, language, isDarkMode = true }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn(
      "w-full h-full overflow-auto relative",
      isDarkMode ? "bg-[#0d0d0d]" : "bg-zinc-50"
    )}>
      {/* Copy Button */}
      {code && (
        <button
          onClick={handleCopy}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-md transition-all duration-200",
            isDarkMode
              ? "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-zinc-400 hover:text-white border border-[#2a2a2a]"
              : "bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-300"
          )}
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: isDarkMode ? '#0d0d0d' : '#fafafa',
          fontSize: '14px',
          lineHeight: '1.7',
        }}
        showLineNumbers
        wrapLines
      >
        {code || `// No ${language.toUpperCase()} code yet`}
      </SyntaxHighlighter>
    </div>
  )
}
