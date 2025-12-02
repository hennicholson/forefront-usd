'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Zap, Check } from 'lucide-react'
import { allModels, categories, providers, type AIModel } from '@/lib/models/all-models'
import { Badge } from '@/components/ui/badge'

interface ModelSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedModelId: string
  onSelectModel: (modelId: string) => void
  isDarkMode?: boolean
}

export function ModelSelectorModal({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
  isDarkMode = true
}: ModelSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const filteredModels = useMemo(() => {
    let models = allModels

    // Filter by provider
    if (selectedProvider !== 'all') {
      models = models.filter(m => m.provider === selectedProvider)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      models = models.filter(m => m.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      models = models.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query) ||
        m.capabilities.some(c => c.toLowerCase().includes(query))
      )
    }

    return models
  }, [searchQuery, selectedCategory, selectedProvider])

  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-sm sm:max-w-2xl md:max-w-5xl max-h-[85vh] rounded-2xl border shadow-2xl overflow-hidden ${
            isDarkMode
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 border-b ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>
                    Select AI Model
                  </h2>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    Choose from {allModels.length}+ premium AI models across multiple providers
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                      : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                }`} size={18} />
                <input
                  type="text"
                  placeholder="Search models by name, capability, or feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-purple-500/50'
                      : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:ring-purple-500/50'
                  }`}
                />
              </div>

              {/* Provider Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedProvider('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedProvider === 'all'
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isDarkMode
                      ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  All Providers ({allModels.length})
                </button>
                {providers.map((provider) => {
                  const Icon = provider.icon
                  return (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                        selectedProvider === provider.id
                          ? isDarkMode
                            ? `bg-gradient-to-r ${provider.color} text-white`
                            : `bg-gradient-to-r ${provider.color} text-white`
                          : isDarkMode
                          ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                      }`}
                    >
                      <Icon size={14} />
                      {provider.name}
                    </button>
                  )
                })}
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? isDarkMode
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-300 text-zinc-900'
                      : isDarkMode
                      ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? isDarkMode
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-300 text-zinc-900'
                        : isDarkMode
                        ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-240px)]">
            {filteredModels.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  No models found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModels.map((model) => {
                  const Icon = model.icon
                  const isSelected = model.id === selectedModelId

                  return (
                    <motion.button
                      key={model.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleSelectModel(model.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/50'
                            : 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/50'
                          : isDarkMode
                          ? 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                          : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className={`p-1 rounded-full ${
                            isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
                          }`}>
                            <Check size={14} className="text-white" />
                          </div>
                        </div>
                      )}

                      {/* Icon with Gradient */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${model.color} flex-shrink-0`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm mb-1 ${
                            isDarkMode ? 'text-white' : 'text-zinc-900'
                          }`}>
                            {model.name}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              className={`text-xs font-medium ${
                                providers.find(p => p.id === model.provider)?.color
                                  ? `bg-gradient-to-r ${providers.find(p => p.id === model.provider)?.color} text-white border-0`
                                  : isDarkMode
                                  ? 'bg-zinc-700 text-zinc-300 border-0'
                                  : 'bg-zinc-200 text-zinc-700 border-0'
                              }`}
                            >
                              {model.provider}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${
                                isDarkMode
                                  ? 'border-zinc-600 text-zinc-400'
                                  : 'border-zinc-300 text-zinc-600'
                              }`}
                            >
                              {model.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`text-xs leading-relaxed mb-3 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {model.description}
                      </p>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {model.capabilities.slice(0, 4).map((capability, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode
                                ? 'bg-zinc-700/50 text-zinc-300'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {capability}
                          </span>
                        ))}
                        {model.capabilities.length > 4 && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode
                                ? 'bg-zinc-700/50 text-zinc-400'
                                : 'bg-zinc-200 text-zinc-600'
                            }`}
                          >
                            +{model.capabilities.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className={`flex items-center gap-4 text-xs pt-3 border-t ${
                        isDarkMode ? 'border-zinc-700' : 'border-zinc-200'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Zap size={12} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} />
                          <span className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>
                            {model.speed}
                          </span>
                        </div>
                        {model.contextWindow > 0 && (
                          <div className={isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}>
                            {model.contextWindow >= 1000000
                              ? `${(model.contextWindow / 1000000).toFixed(1)}M`
                              : model.contextWindow >= 1000
                              ? `${(model.contextWindow / 1000).toFixed(0)}K`
                              : model.contextWindow}{' '}
                            context
                          </div>
                        )}
                        <div className={isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}>
                          {model.rpm} RPM
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
