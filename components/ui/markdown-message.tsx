'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownMessageProps {
  content: string
  isDarkMode?: boolean
}

export function MarkdownMessage({ content, isDarkMode = true }: MarkdownMessageProps) {
  return (
    <div
      className={`prose prose-sm w-full max-w-full overflow-hidden ${
        isDarkMode
          ? 'prose-invert prose-headings:text-white prose-p:text-zinc-200 prose-strong:text-white prose-code:text-cyan-400 prose-pre:bg-zinc-900 prose-a:text-blue-400'
          : 'prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-code:text-cyan-600 prose-pre:bg-zinc-100 prose-a:text-blue-600'
      }`}
      style={{ width: '100%' }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Custom table styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className={`min-w-full divide-y ${
                  isDarkMode ? 'divide-zinc-700' : 'divide-zinc-200'
                }`}
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className={isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'} {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-700' : 'divide-zinc-200'}`} {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className={isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
              }`}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className={`px-4 py-3 text-sm ${
                isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
              }`}
              {...props}
            />
          ),
          // Code blocks with better styling
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isDarkMode
                      ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                      : 'bg-zinc-100 text-cyan-600 border border-zinc-200'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} block`} style={{ whiteSpace: 'pre', maxWidth: '100%' }} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ node, ...props }) => (
            <pre
              className={`rounded-lg p-4 overflow-x-auto my-3 ${
                isDarkMode
                  ? 'bg-zinc-900 border border-zinc-800'
                  : 'bg-zinc-100 border border-zinc-200'
              }`}
              style={{
                width: '100%',
                maxWidth: '100%',
                whiteSpace: 'pre',
                overflowX: 'auto'
              }}
              {...props}
            />
          ),
          // Links
          a: ({ node, ...props }) => (
            <a
              className={`underline transition-colors ${
                isDarkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-2 my-3" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-2 my-3" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className={`leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`} {...props} />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`border-l-4 pl-4 italic my-3 ${
                isDarkMode
                  ? 'border-zinc-600 text-zinc-400'
                  : 'border-zinc-400 text-zinc-600'
              }`}
              {...props}
            />
          ),
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="leading-relaxed my-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
