export const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Forefront!',
    description: 'This quick interactive tour will show you all the powerful features available in every module. Let\'s get started!',
    targetSelector: 'body',
    position: 'center' as const,
    action: 'none' as const,
    highlightPulse: false
  },
  {
    id: 'sidebar',
    title: 'Progress Sidebar',
    description: 'This sidebar shows all lessons in the module. Click any unlocked slide to jump to it. Your progress is tracked automatically with checkmarks!',
    targetSelector: 'div.fixed.left-0.w-80', // Sidebar - specific width class ensures single match
    position: 'right' as const,
    action: 'navigate' as const
  },
  {
    id: 'ai-playground',
    title: 'AI Playground',
    description: 'Click the sparkle icon (✨) to open your personal AI assistant. Ask questions about the material, request explanations, or get examples!',
    targetSelector: 'button[title="AI Playground"]', // Already specific - has title attribute
    position: 'bottom' as const,
    action: 'click' as const
  },
  {
    id: 'notes',
    title: 'Notes Panel',
    description: 'Click the message icon (💬) to take notes. Each slide has its own note space, and everything is saved automatically!',
    targetSelector: 'div.fixed.top-0.right-0 > div > button:nth-of-type(2)', // 2nd button in header right group (after AI button)
    position: 'bottom' as const,
    action: 'click' as const
  },
  {
    id: 'theme',
    title: 'Dark/Light Mode',
    description: 'Toggle between dark and light themes for comfortable learning in any environment.',
    targetSelector: 'div.fixed.top-0.right-0 > div > button:nth-of-type(3)', // 3rd button in header right group
    position: 'bottom' as const,
    action: 'click' as const
  },
  {
    id: 'progress-bar',
    title: 'Progress Tracking',
    description: 'This progress bar shows how much of the module you\'ve completed. Watch it grow as you learn!',
    targetSelector: 'div.w-32.h-2', // Progress bar - specific dimensions ensure single match
    position: 'bottom' as const,
    action: 'none' as const
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Now you know how to use all the features! Feel free to explore the module at your own pace. Happy learning! 🚀',
    targetSelector: 'body',
    position: 'center' as const,
    action: 'none' as const,
    highlightPulse: false
  }
]
