'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ArrowUp, ArrowDown, Copy, X } from 'lucide-react'

interface NodeContextMenuProps {
  x: number
  y: number
  nodeId: string
  isFirst: boolean
  isLast: boolean
  onClose: () => void
  onDelete: (nodeId: string) => void
  onMoveUp?: (nodeId: string) => void
  onMoveDown?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
}

export function NodeContextMenu({
  x,
  y,
  nodeId,
  isFirst,
  isLast,
  onClose,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Close on Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete(nodeId)
      onClose()
    }
  }

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(nodeId)
      onClose()
    }
  }

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(nodeId)
      onClose()
    }
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(nodeId)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{
          position: 'fixed',
          left: x,
          top: y,
          zIndex: 9999
        }}
        className="min-w-[200px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Node Options</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-300"
          >
            <X size={12} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {/* Move Up */}
          {!isFirst && onMoveUp && (
            <button
              onClick={handleMoveUp}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <ArrowUp size={14} className="text-zinc-500" />
              <span>Move Up</span>
            </button>
          )}

          {/* Move Down */}
          {!isLast && onMoveDown && (
            <button
              onClick={handleMoveDown}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <ArrowDown size={14} className="text-zinc-500" />
              <span>Move Down</span>
            </button>
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Copy size={14} className="text-zinc-500" />
              <span>Duplicate</span>
            </button>
          )}

          {/* Divider */}
          {(onMoveUp || onMoveDown || onDuplicate) && (
            <div className="my-1 h-px bg-zinc-800" />
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} className="text-red-500" />
            <span>Delete Node</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
