'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react'
import type { PerplexitySearchResult } from '@/lib/perplexity/types'

interface CitationDisplayProps {
  citations?: string[]
  searchResults?: PerplexitySearchResult[] | any
  isDarkMode?: boolean
}

export function CitationDisplay({ citations = [], searchResults = [], isDarkMode = true }: CitationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle searchResults being either an array or Perplexity response object
  const resultsArray = Array.isArray(searchResults)
    ? searchResults
    : searchResults?.search_results || []

  if (citations.length === 0 && resultsArray.length === 0) {
    return null
  }

  const displayCitations = citations.slice(0, 5)
  const displayResults = resultsArray.slice(0, 5)

  return (
    <div className={`mt-4 border rounded-lg ${
      isDarkMode ? 'border-zinc-700 bg-zinc-800/30' : 'border-zinc-200 bg-zinc-50'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
          isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <LinkIcon size={16} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Sources ({displayCitations.length || displayResults.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} />
        ) : (
          <ChevronDown size={16} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`border-t space-y-2 p-3 ${
              isDarkMode ? 'border-zinc-700' : 'border-zinc-200'
            }`}>
              {/* Citation URLs */}
              {displayCitations.map((citation, index) => (
                <a
                  key={index}
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-2 p-2 rounded-md transition-colors group ${
                    isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                  }`}
                >
                  <span className={`text-xs font-mono shrink-0 ${
                    isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
                    [{index + 1}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${
                      isDarkMode ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-700'
                    }`}>
                      {citation}
                    </p>
                  </div>
                  <ExternalLink size={12} className={`shrink-0 ${
                    isDarkMode ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'
                  }`} />
                </a>
              ))}

              {/* Search Results with Snippets */}
              {displayResults.map((result: any, index: number) => (
                <a
                  key={index}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-3 rounded-md border transition-colors ${
                    isDarkMode
                      ? 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-medium line-clamp-1 ${
                      isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      {result.title}
                    </h4>
                    <ExternalLink size={14} className={`shrink-0 ${
                      isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                    }`} />
                  </div>
                  {result.snippet && (
                    <p className={`text-xs line-clamp-2 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {result.snippet}
                    </p>
                  )}
                  {result.date && (
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      {new Date(result.date).toLocaleDateString()}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
