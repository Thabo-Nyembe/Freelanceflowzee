'use client'

import { useState, useEffect, useCallback } from 'react'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission | 'default'
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
    error: null
  })

  // Check support and current state on mount
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false
        }))
        return
      }

      const permission = Notification.permission

      // Check if already subscribed
      let isSubscribed = false
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        isSubscribed = !!subscription
      } catch {
        // Service worker not ready
      }

      setState({
        isSupported,
        permission,
        isSubscribed,
        isLoading: false,
        error: null
      })
    }

    checkSupport()
  }, [])

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }))
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))
      return permission === 'granted'
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to request permission'
      }))
      return false
    }
  }, [state.isSupported])

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request permission if needed
      if (state.permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Permission denied'
          }))
          return false
        }
      }

      // Get VAPID public key from API
      const keyResponse = await fetch('/api/push/vapid-key')
      const { publicKey } = await keyResponse.json()

      if (!publicKey) {
        throw new Error('VAPID key not configured')
      }

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceInfo: getDeviceInfo()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }))

      return true
    } catch (error) {
      console.error('Push subscription error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Subscription failed'
      }))
      return false
    }
  }, [state.isSupported, state.permission, requestPermission])

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe locally
        await subscription.unsubscribe()

        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }))

      return true
    } catch (error) {
      console.error('Push unsubscribe error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unsubscribe failed'
      }))
      return false
    }
  }, [])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe
  }
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'

  // Detect browser
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  // Detect device type
  if (/Mobi|Android/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile'
  }

  return { browser, os, device_type: deviceType }
}
