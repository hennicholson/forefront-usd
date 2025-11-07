'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  Code,
  Video,
  CheckCircle,
  Circle,
  Clock,
  Award,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  Bookmark,
  Share2,
  Download,
  Sun,
  Moon
} from 'lucide-react'

interface Slide {
  id: string
  title: string
  content: string
  type: 'intro' | 'lesson' | 'code' | 'video' | 'quiz' | 'summary'
  videoUrl?: string
  codeSnippet?: string
  duration?: string
  completed?: boolean
}

interface Module {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  slides: Slide[]
  progress: number
}

// Sample module data
const sampleModule: Module = {
  id: '1',
  title: 'Introduction to AI & Machine Learning',
  description: 'Master the fundamentals of artificial intelligence and machine learning',
  instructor: 'Dr. Sarah Chen',
  duration: '2 hours 30 min',
  progress: 0,
  slides: [
    {
      id: '1',
      title: 'Welcome to AI',
      type: 'intro',
      duration: '5 min',
      content: `# Welcome to the Future of AI 🚀

## What You\'ll Master

In this comprehensive module, you\'ll discover:

• **Core Concepts** - Understanding intelligence, both artificial and human
• **ML Fundamentals** - How machines learn from data
• **Neural Networks** - The building blocks of deep learning
• **Real Applications** - From ChatGPT to self-driving cars
• **Hands-on Practice** - Build your first AI model

## Your Journey Starts Here

Get ready to transform your understanding of technology and unlock new possibilities in your career.

*"The best way to predict the future is to invent it."* - Alan Kay`
    },
    {
      id: '2',
      title: 'What is Artificial Intelligence?',
      type: 'lesson',
      duration: '10 min',
      content: `## Understanding Artificial Intelligence

**Artificial Intelligence (AI)** is the simulation of human intelligence processes by machines, especially computer systems.

### Key Components:

#### 1. Machine Learning
The ability for computers to learn without being explicitly programmed.

#### 2. Neural Networks
Systems inspired by the human brain that can recognize patterns.

#### 3. Natural Language Processing
Helping computers understand and generate human language.

#### 4. Computer Vision
Enabling machines to interpret and understand visual information.

### Real-World Impact

AI is revolutionizing industries:
• Healthcare: Diagnosing diseases
• Finance: Fraud detection
• Transportation: Autonomous vehicles
• Entertainment: Content recommendations

> 💡 **Key Insight**: AI isn\'t about replacing humans—it\'s about augmenting human capabilities.`
    },
    {
      id: '3',
      title: 'Your First Python AI Code',
      type: 'code',
      duration: '15 min',
      codeSnippet: `# Your First AI: Linear Regression Model
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# Step 1: Create sample data
# Imagine we're predicting house prices based on size
house_sizes = np.array([[500], [750], [1000], [1250], [1500], [1750], [2000]])
house_prices = np.array([150000, 200000, 250000, 300000, 350000, 400000, 450000])

# Step 2: Create and train the model
model = LinearRegression()
model.fit(house_sizes, house_prices)

# Step 3: Make predictions
new_house = [[1600]]
predicted_price = model.predict(new_house)

print("🏠 House size:", new_house[0][0], "sq ft")
print("💰 Predicted price: $", round(predicted_price[0], 2))

# Step 4: Visualize the results
plt.scatter(house_sizes, house_prices, color='blue', label='Actual data')
plt.plot(house_sizes, model.predict(house_sizes), color='red', label='Model prediction')
plt.xlabel('House Size (sq ft)')
plt.ylabel('Price ($)')
plt.title('AI House Price Predictor')
plt.legend()
plt.show()

# Congratulations! You've just built your first AI model! 🎉`,
      content: `## Build Your First AI Model

Let\'s create a simple machine learning model that can predict house prices based on size. This is a real-world application of AI that\'s used in real estate platforms.

### What This Code Does:
1. **Imports Libraries** - We use scikit-learn, a powerful ML library
2. **Creates Training Data** - Real house sizes and prices
3. **Trains the Model** - The AI learns the relationship
4. **Makes Predictions** - Estimates price for a new house
5. **Visualizes Results** - Shows how well our model performs

### Try It Yourself:
Click "Run Code" to see the AI in action. Then try changing the house sizes or prices to see how it affects predictions!`
    },
    {
      id: '4',
      title: 'Deep Dive: Neural Networks',
      type: 'video',
      videoUrl: 'https://example.com/neural-networks.mp4',
      duration: '20 min',
      content: `## Neural Networks Explained

Watch this comprehensive video to understand:
• How neurons work in the brain vs artificial neurons
• The mathematics behind neural networks
• Forward and backward propagation
• Training deep learning models

### Key Takeaways:
- Neural networks are universal function approximators
- They learn through adjusting weights and biases
- Deep learning = neural networks with multiple layers
- GPUs accelerate neural network training`
    },
    {
      id: '5',
      title: 'Knowledge Check',
      type: 'quiz',
      duration: '5 min',
      content: `## Test Your Understanding

### Question 1: What is Machine Learning?
A) Programming computers explicitly
B) Computers learning from data without explicit programming ✓
C) Installing new software
D) Upgrading hardware

### Question 2: Neural Networks are inspired by?
A) The internet
B) Social networks
C) The human brain ✓
D) Computer networks

### Question 3: Which is NOT a real AI application?
A) Face recognition
B) Language translation
C) Time travel ✓
D) Game playing

Great job! You\'re mastering the fundamentals of AI! 🎯`
    },
    {
      id: '6',
      title: 'Summary & Next Steps',
      type: 'summary',
      duration: '5 min',
      content: `## 🎉 Congratulations! Module Complete

### What You\'ve Learned:
✅ Core concepts of Artificial Intelligence
✅ Difference between AI, ML, and Deep Learning
✅ Built your first predictive model
✅ Understanding of neural networks
✅ Real-world AI applications

### Your Achievement:
**AI Fundamentals Badge Earned!** 🏆

### Next Steps:
1. **Practice Project**: Build a sentiment analyzer
2. **Advanced Module**: Deep Learning with TensorFlow
3. **Community**: Join our AI study group
4. **Challenge**: Participate in the weekly AI hackathon

### Resources:
• [Download Module Notes](/)
• [Code Repository](/)
• [Additional Reading](/)
• [Office Hours with Dr. Chen](/)

Keep learning, keep building! The future of AI is in your hands. 🚀`
    }
  ]
}

export default function ModuleLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params)
  const slug = unwrappedParams.slug
  const [module, setModule] = useState<Module>(sampleModule)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set())

  const currentSlide = module.slides[currentSlideIndex]
  const progress = (completedSlides.size / module.slides.length) * 100

  // Mark slide as completed when viewed
  useEffect(() => {
    if (currentSlide && !completedSlides.has(currentSlide.id)) {
      const timer = setTimeout(() => {
        setCompletedSlides(prev => new Set(prev).add(currentSlide.id))
      }, 3000) // Mark as completed after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [currentSlide, completedSlides])

  // Auto-advance if autoPlay is on
  useEffect(() => {
    if (autoPlay && currentSlideIndex < module.slides.length - 1) {
      const duration = parseInt(currentSlide.duration || '5') * 1000
      const timer = setTimeout(() => {
        setCurrentSlideIndex(prev => prev + 1)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, currentSlideIndex, currentSlide, module.slides.length])

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const getSlideIcon = (type: Slide['type']) => {
    switch (type) {
      case 'intro': return <Sparkles size={16} />
      case 'lesson': return <BookOpen size={16} />
      case 'code': return <Code size={16} />
      case 'video': return <Video size={16} />
      case 'quiz': return <Target size={16} />
      case 'summary': return <Award size={16} />
      default: return <FileText size={16} />
    }
  }

  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case 'code':
        return (
          <div className="space-y-6">
            <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}>
              <div dangerouslySetInnerHTML={{
                __html: currentSlide.content
                  .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                  .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                  .replace(/\n/g, '<br/>')
              }} />
            </div>
            {currentSlide.codeSnippet && (
              <div className="relative group">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Run Code
                  </button>
                  <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors">
                    Copy
                  </button>
                </div>
                <pre className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 rounded-lg overflow-x-auto`}>
                  <code className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentSlide.codeSnippet}
                  </code>
                </pre>
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <Play size={64} className="text-white opacity-50" />
            </div>
            <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}>
              <div dangerouslySetInnerHTML={{
                __html: currentSlide.content
                  .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>')
                  .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                  .replace(/\n/g, '<br/>')
              }} />
            </div>
          </div>
        )

      default:
        return (
          <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-gray'} max-w-none`}>
            <div dangerouslySetInnerHTML={{
              __html: currentSlide.content
                .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-bold mb-8">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>')
                .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-semibold mt-4 mb-2">$1</h4>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-600">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')
                .replace(/^• (.*$)/gim, '<li class="ml-6 list-disc my-2">$1</li>')
                .replace(/✅/g, '<span class="text-green-500 text-xl">✅</span>')
                .replace(/🎯/g, '<span class="text-2xl">🎯</span>')
                .replace(/💡/g, '<span class="text-2xl">💡</span>')
                .replace(/🚀/g, '<span class="text-2xl">🚀</span>')
                .replace(/🎉/g, '<span class="text-2xl">🎉</span>')
                .replace(/🏆/g, '<span class="text-2xl">🏆</span>')
                .replace(/\n/g, '<br/>')
            }} />
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 h-16 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-b flex items-center justify-between px-4 z-40`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div>
            <h1 className="font-bold text-lg">{module.title}</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {module.instructor} • {module.duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>

          {/* Controls */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`p-2 rounded-lg ${autoPlay ? 'bg-blue-600' : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {autoPlay ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className={`p-2 rounded-lg ${notesOpen ? 'bg-blue-600' : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} transition-colors`}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed left-0 top-16 bottom-0 w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-r overflow-y-auto z-30`}
            >
              <div className="p-4">
                <h2 className="font-bold text-lg mb-4">Module Content</h2>

                <div className="space-y-2">
                  {module.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => handleSlideChange(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        index === currentSlideIndex
                          ? isDarkMode ? 'bg-blue-600/20 border-blue-500' : 'bg-blue-100 border-blue-500'
                          : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      } border ${index === currentSlideIndex ? '' : 'border-transparent'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${completedSlides.has(slide.id) ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {completedSlides.has(slide.id) ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSlideIcon(slide.type)}
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {slide.duration}
                            </span>
                          </div>
                          <h3 className="font-medium">{slide.title}</h3>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Section {index + 1} of {module.slides.length}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-3">Your Progress</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-bold">{completedSlides.size}/{module.slides.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Spent</span>
                      <span className="font-bold">45 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes Taken</span>
                      <span className="font-bold">{Object.keys(notes).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-80' : ''} transition-all duration-300`}>
          <div className="max-w-5xl mx-auto px-8 py-12">
            {/* Slide Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {getSlideIcon(currentSlide.type)}
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Section {currentSlideIndex + 1} • {currentSlide.duration}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{currentSlide.title}</h1>
            </div>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSlideContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                  currentSlideIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex gap-2">
                {module.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlideIndex
                        ? 'w-8 bg-blue-500'
                        : completedSlides.has(module.slides[index].id)
                          ? 'bg-green-500'
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(module.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === module.slides.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                  currentSlideIndex === module.slides.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors text-white`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <AnimatePresence>
          {notesOpen && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed right-0 top-16 bottom-0 w-96 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-l overflow-y-auto z-30`}
            >
              <div className="p-6">
                <h2 className="font-bold text-lg mb-4">Your Notes</h2>

                <textarea
                  value={notes[currentSlide.id] || ''}
                  onChange={(e) => setNotes({ ...notes, [currentSlide.id]: e.target.value })}
                  placeholder="Take notes for this section..."
                  className={`w-full h-64 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Note
                  </button>
                  <button className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                    <Download size={18} />
                  </button>
                </div>

                {/* All Notes */}
                <div className="mt-8">
                  <h3 className="font-semibold mb-3">All Section Notes</h3>
                  <div className="space-y-3">
                    {Object.entries(notes).map(([slideId, note]) => {
                      const slide = module.slides.find(s => s.id === slideId)
                      if (!slide || !note) return null
                      return (
                        <div key={slideId} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <h4 className="font-medium text-sm mb-1">{slide.title}</h4>
                          <p className="text-sm opacity-75">{note}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}