'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track online/offline status
 * Returns true when online, false when offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook to get detailed network status
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<{
    isOnline: boolean
    effectiveType?: string
    downlink?: number
    rtt?: number
  }>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  })

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection ||
                        (navigator as any).mozConnection ||
                        (navigator as any).webkitConnection

      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      })
    }

    // Initial update
    updateNetworkStatus()

    // Listen for changes
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return status
}

/**
 * Hook to retry failed operations when coming back online
 */
export function useRetryOnReconnect(callback: () => void, dependencies: any[] = []) {
  const isOnline = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline) {
      // We just came back online
      callback()
      setWasOffline(false)
    }
  }, [isOnline, wasOffline, callback, ...dependencies])

  return isOnline
}

/**
 * Hook to show offline indicator
 */
export function useOfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    } else {
      // Delay hiding to allow for brief disconnections
      const timer = setTimeout(() => setShowIndicator(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  return { isOnline, showIndicator }
}
