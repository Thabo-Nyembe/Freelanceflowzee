'use client'

import { useEffect, useRef, useCallback } from 'react'

// Safe interval hook that auto-cleans
export function useSafeInterval(callback: unknown, delay: unknown) {
  const savedCallback = useRef(callback)
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

// Safe timeout hook that auto-cleans
export function useSafeTimeout(callback: unknown, delay: unknown) {
  const savedCallback = useRef(callback)
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

// Safe event listener hook with automatic cleanup
export function useSafeEventListener(eventName: unknown, handler: unknown, element = window: unknown, options: unknown) {
  const savedHandler = useRef<any>()
  
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])
  
  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return
    
    const eventListener = (event: unknown) => savedHandler.current?.(event)
    element.addEventListener(eventName, eventListener, options)
    
    return () => {
      element.removeEventListener(eventName, eventListener, options)
    }
  }, [eventName, element, options])
}

// Safe subscription hook with automatic cleanup
export function useSafeSubscription(subscribe: unknown, dependencies = []: unknown) {
  useEffect(() => {
    const subscription = subscribe()
    
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      } else if (typeof subscription === 'function') {
        subscription()
      }
    }
  }, dependencies)
}

// Component unmount safety check
export function useIsMounted() {
  const isMounted = useRef(true)
  
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])
  
  return useCallback(() => isMounted.current, [])
}