'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system'
    content: string
    metadata?: any
    createdAt?: Date | string
  }
  isDarkMode?: boolean
}

const springTransition = { type: "spring", stiffness: 400, damping: 30 }

export function ChatMessage({ message, isDarkMode = true }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="mb-3 flex flex-col gap-1.5"
    >
      {/* Role Label */}
      <div
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wide",
          isUser ? "text-zinc-400" : "text-zinc-500"
        )}
        style={{
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          letterSpacing: '1px'
        }}
      >
        {isUser ? 'you' : 'assistant'}
      </div>

      {/* Message Content */}
      <motion.div
        whileHover={{ scale: 1.002 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "rounded-2xl p-4 transition-all duration-200",
          isUser
            ? isDarkMode
              ? "bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50"
              : "bg-zinc-100 border border-zinc-200 hover:border-zinc-300"
            : isDarkMode
              ? "bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50"
              : "bg-zinc-50 border border-zinc-200 hover:border-zinc-300"
        )}
        style={{
          boxShadow: !isUser && isDarkMode ? '0 0 20px rgba(255, 255, 255, 0.02)' : undefined
        }}
      >
        {isUser ? (
          // User messages: plain text
          <div
            className={cn(
              "whitespace-pre-wrap text-sm leading-relaxed",
              isDarkMode ? "text-zinc-200" : "text-zinc-800"
            )}
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              letterSpacing: '0.2px'
            }}
          >
            {message.content}
          </div>
        ) : (
          // Assistant messages: render markdown
          <div
            className={cn(
              "text-sm leading-relaxed prose prose-sm max-w-none",
              isDarkMode ? "prose-invert text-zinc-300" : "text-zinc-700"
            )}
          >
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }: any) {
                  const inline = props.inline
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[13px]",
                        isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                a({ node, children, ...props }) {
                  return (
                    <a
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  )
                },
                img({ node, ...props }) {
                  return (
                    <img
                      className="max-w-full rounded-xl mt-3"
                      {...props}
                    />
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Citations/Metadata (if available) */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-700/30">
            <div
              className="text-[10px] font-semibold uppercase text-zinc-500 mb-1.5"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                letterSpacing: '1px'
              }}
            >
              sources
            </div>
            {message.metadata.citations.map((citation: string, idx: number) => (
              <div
                key={idx}
                className="text-xs text-blue-400 mb-1"
              >
                [{idx + 1}] {citation}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
