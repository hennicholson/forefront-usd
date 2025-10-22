'use client'
import { useState, useEffect } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied'

interface BrowserNotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: any
  onClick?: () => void
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result as NotificationPermission)

      // Store in localStorage that user has been asked
      if (typeof window !== 'undefined') {
        localStorage.setItem('notifications-asked', 'true')
      }

      return result as NotificationPermission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  const sendNotification = (options: BrowserNotificationOptions) => {
    // Don't send if not supported or permission not granted
    if (!isSupported || permission !== 'granted') {
      return null
    }

    // Don't send if user is actively viewing the tab
    if (typeof document !== 'undefined' && document.hasFocus()) {
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/forefront1.jpg',
        tag: options.tag,
        data: options.data,
        requireInteraction: false, // Auto-dismiss after a few seconds
        silent: false
      })

      // Handle click event
      if (options.onClick) {
        notification.onclick = () => {
          window.focus() // Focus the window
          options.onClick?.()
          notification.close()
        }
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }

  const hasAskedPermission = (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('notifications-asked') === 'true'
  }

  const dismissBanner = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications-banner-dismissed', 'true')
    }
  }

  const shouldShowBanner = (): boolean => {
    if (!isSupported || permission !== 'default') return false
    if (typeof window === 'undefined') return false
    return localStorage.getItem('notifications-banner-dismissed') !== 'true'
  }

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    hasAskedPermission,
    dismissBanner,
    shouldShowBanner
  }
}
