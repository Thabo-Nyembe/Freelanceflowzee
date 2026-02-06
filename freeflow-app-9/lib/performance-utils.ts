/**
 * Performance Utilities for React Components
 *
 * This module provides utilities for optimizing React component performance:
 * - Memoization helpers
 * - Callback stability utilities
 * - Object reference stability helpers
 * - List rendering optimizations
 */

import { useCallback, useMemo, useRef, useEffect } from 'react'

/**
 * Creates a stable callback that doesn't change between renders
 * Useful for passing callbacks to memoized children
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  )
}

/**
 * Creates a stable object reference that only changes when values change
 * Prevents unnecessary re-renders from object recreation
 */
export function useStableObject<T extends Record<string, any>>(obj: T): T {
  const ref = useRef(obj)
  const keys = Object.keys(obj).sort().join(',')
  const values = Object.values(obj).map(v =>
    typeof v === 'object' ? JSON.stringify(v) : String(v)
  ).join(',')

  return useMemo(() => {
    ref.current = obj
    return obj
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, values])
}

/**
 * Creates a stable array reference that only changes when items change
 */
export function useStableArray<T>(arr: T[]): T[] {
  const serialized = useMemo(() => {
    try {
      return JSON.stringify(arr)
    } catch {
      return arr.map(String).join(',')
    }
  }, [arr])

  return useMemo(() => arr, [serialized])
}

/**
 * Debounces a value with the specified delay
 * Useful for search inputs and other frequently changing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Need to import useState for useDebounce
import { useState } from 'react'

/**
 * Throttles a callback to run at most once per interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRan.current >= delay) {
        lastRan.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          lastRan.current = Date.now()
          callback(...args)
        }, delay - (now - lastRan.current))
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Memoizes expensive computations with automatic cache invalidation
 */
export function useMemoizedComputation<T, D extends any[]>(
  compute: () => T,
  deps: D,
  options?: { maxAge?: number }
): T {
  const lastComputeTime = useRef(0)
  const cachedValue = useRef<T | undefined>(undefined)
  const maxAge = options?.maxAge ?? Infinity

  return useMemo(() => {
    const now = Date.now()
    if (cachedValue.current !== undefined && now - lastComputeTime.current < maxAge) {
      return cachedValue.current
    }
    const result = compute()
    cachedValue.current = result
    lastComputeTime.current = now
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Creates a stable event handler that can be safely passed to memoized children
 */
export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn)

  useEffect(() => {
    ref.current = fn
  })

  return useCallback(
    ((...args: Parameters<T>) => ref.current(...args)) as T,
    []
  )
}

/**
 * Returns previous value of a prop/state
 * Useful for comparison and conditional updates
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * Only re-renders when the selector returns a different value
 * Similar to Redux's useSelector behavior
 */
export function useShallowMemo<T extends Record<string, any>>(obj: T): T {
  const ref = useRef(obj)

  if (!shallowEqual(ref.current, obj)) {
    ref.current = obj
  }

  return ref.current
}

/**
 * Shallow equality comparison for objects
 */
function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}

/**
 * Performance-optimized list item key generator
 * Ensures stable keys for list rendering
 */
export function generateStableKey(item: any, index: number): string {
  if (item?.id !== undefined) return String(item.id)
  if (item?.key !== undefined) return String(item.key)
  if (item?._id !== undefined) return String(item._id)
  if (typeof item === 'string' || typeof item === 'number') return `${item}-${index}`
  return `item-${index}`
}

/**
 * Creates a memoized formatter function
 * Useful for expensive formatting operations
 */
export function createMemoizedFormatter<T, R>(
  formatter: (value: T) => R,
  cacheSize = 100
): (value: T) => R {
  const cache = new Map<T, R>()

  return (value: T): R => {
    if (cache.has(value)) {
      return cache.get(value)!
    }

    const result = formatter(value)

    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    cache.set(value, result)
    return result
  }
}

// Pre-built formatters
export const memoizedCurrencyFormatter = createMemoizedFormatter(
  (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
)

export const memoizedNumberFormatter = createMemoizedFormatter(
  (value: number) => new Intl.NumberFormat('en-US').format(value)
)

export const memoizedPercentFormatter = createMemoizedFormatter(
  (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
)

export const memoizedDateFormatter = createMemoizedFormatter(
  (date: string | Date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
)

export const memoizedTimeFormatter = createMemoizedFormatter(
  (date: string | Date) => new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
)
