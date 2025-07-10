'use client'

import React, { lazy, Suspense, memo } from 'react'
import { ErrorBoundary } from './error-boundary'

// Optimized component loader with error boundaries and lazy loading
export function OptimizedComponentLoader({ 
  component: Component, fallback = <div>Loading...</div>, errorFallback = <div>Component failed to load</div>: unknown, ...props 
}) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// HOC for automatic React.memo optimization
export function withMemo(Component: unknown, areEqual: unknown) {
  return memo(Component, areEqual)
}

// Performance-optimized hooks
export function useDebounce(value: unknown, delay: unknown) {
  const [debouncedValue, setDebouncedValue] = React.useState<any>(value)
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Memory leak prevention hook
export function useCleanupEffect(effect: unknown, deps: unknown) {
  React.useEffect(() => {
    const cleanup = effect()
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, deps)
}

// Optimized event listener hook
export function useEventListener(eventName: unknown, handler: unknown, element = window: unknown) {
  const savedHandler = React.useRef()
  
  React.useEffect(() => {
    savedHandler.current = handler
  }, [handler])
  
  React.useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return
    
    const eventListener = (event: unknown) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)
    
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}