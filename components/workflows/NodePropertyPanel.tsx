'use client'
import { WorkflowNode } from '@/lib/workflows/workflow-types'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NodePropertyPanelProps {
  node: WorkflowNode | null
  onUpdate: (updates: Partial<WorkflowNode>) => void
  onClose: () => void
}

export function NodePropertyPanel({ node, onUpdate, onClose }: NodePropertyPanelProps) {
  if (!node) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[380px] bg-zinc-900/30 backdrop-blur-sm border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-zinc-500 text-sm"
      >
        <Sparkles size={32} className="mb-3 text-zinc-700" />
        <p className="text-center">Click a node to edit<br />its properties</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-[380px] bg-zinc-900/30 backdrop-blur-sm border-l border-zinc-800 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-base font-semibold text-zinc-200">Edit Node</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
          >
            <X size={18} />
          </motion.button>
        </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-zinc-400">
            Title
          </label>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:outline-none glow-border placeholder:text-zinc-600"
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-zinc-400">
            Description
          </label>
          <input
            type="text"
            value={node.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:outline-none glow-border placeholder:text-zinc-600"
          />
        </motion.div>

        {/* Tool-specific fields */}
        {node.type === 'tool' && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-zinc-400">
              Tool URL
            </label>
            <input
              type="url"
              value={node.data?.toolUrl || ''}
              onChange={(e) => onUpdate({
                data: { ...node.data, toolUrl: e.target.value }
              })}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:outline-none glow-border placeholder:text-zinc-600"
            />
          </motion.div>
        )}

        {/* Prompt-specific fields */}
        {(node.type === 'prompt' || node.type === 'screenshot') && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-zinc-400">
              {node.type === 'prompt' ? 'Prompt Text' : 'Screenshot Instructions'}
            </label>
            <textarea
              value={node.data?.promptText || ''}
              onChange={(e) => onUpdate({
                data: { ...node.data, promptText: e.target.value }
              })}
              rows={8}
              className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 text-sm font-mono focus:outline-none glow-border placeholder:text-zinc-600 resize-vertical"
            />
          </motion.div>
        )}

        {/* Action-specific fields */}
        {node.type === 'action' && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-zinc-400">
              Action Type
            </label>
            <select
              value={node.data?.actionType || 'copy'}
              onChange={(e) => onUpdate({
                data: { ...node.data, actionType: e.target.value as 'copy' | 'paste' | 'upload' | 'download' | 'wait' }
              })}
              className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-200 text-sm cursor-pointer focus:outline-none glow-border"
            >
              <option value="copy">Copy</option>
              <option value="paste">Paste</option>
              <option value="wait">Wait</option>
              <option value="upload">Upload</option>
              <option value="download">Download</option>
            </select>
          </motion.div>
        )}
      </div>
    </motion.div>
    </AnimatePresence>
  )
}
