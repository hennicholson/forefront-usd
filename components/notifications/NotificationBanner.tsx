'use client'
import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationBanner() {
  const { requestPermission, dismissBanner, shouldShowBanner } = useNotifications()
  const [isVisible, setIsVisible] = useState(shouldShowBanner())
  const [isRequesting, setIsRequesting] = useState(false)

  const handleEnable = async () => {
    setIsRequesting(true)
    const result = await requestPermission()
    setIsRequesting(false)

    if (result === 'granted') {
      // Permission granted! Hide banner
      setIsVisible(false)
    } else if (result === 'denied') {
      // User denied, hide banner
      setIsVisible(false)
      dismissBanner()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    dismissBanner()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Icon and message */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  Stay connected with the network
                </p>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Get notified when you receive messages, mentions, or reactions
                </p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleEnable}
                disabled={isRequesting}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '36px' }}
              >
                {isRequesting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Enabling...</span>
                  </div>
                ) : (
                  'Enable Notifications'
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
