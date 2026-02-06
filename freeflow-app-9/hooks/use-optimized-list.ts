/**
 * useOptimizedList Hook
 *
 * Provides optimized list rendering with:
 * - Automatic chunked rendering for large lists
 * - Memoized item callbacks
 * - Efficient filtering and sorting
 * - Pagination support
 *
 * USAGE:
 * ```tsx
 * const {
 *   visibleItems,
 *   loadMore,
 *   hasMore,
 *   totalCount,
 *   getItemKey,
 *   handleItemClick
 * } = useOptimizedList(items, {
 *   pageSize: 20,
 *   filterFn: (item) => item.active,
 *   sortFn: (a, b) => a.name.localeCompare(b.name),
 *   onItemClick: (item) => console.log(item)
 * })
 * ```
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { generateStableKey } from '@/lib/performance-utils'

interface UseOptimizedListOptions<T> {
  pageSize?: number
  filterFn?: (item: T) => boolean
  sortFn?: (a: T, b: T) => number
  onItemClick?: (item: T, index: number) => void
  initialPage?: number
  keyExtractor?: (item: T, index: number) => string
}

interface UseOptimizedListResult<T> {
  visibleItems: T[]
  loadMore: () => void
  hasMore: boolean
  totalCount: number
  filteredCount: number
  currentPage: number
  totalPages: number
  getItemKey: (item: T, index: number) => string
  handleItemClick: (item: T, index: number) => void
  reset: () => void
  goToPage: (page: number) => void
  isLoading: boolean
}

export function useOptimizedList<T>(
  items: T[],
  options: UseOptimizedListOptions<T> = {}
): UseOptimizedListResult<T> {
  const {
    pageSize = 20,
    filterFn,
    sortFn,
    onItemClick,
    initialPage = 1,
    keyExtractor
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Filter and sort items with memoization
  const processedItems = useMemo(() => {
    let result = [...items]

    // Apply filter if provided
    if (filterFn) {
      result = result.filter(filterFn)
    }

    // Apply sort if provided
    if (sortFn) {
      result.sort(sortFn)
    }

    return result
  }, [items, filterFn, sortFn])

  // Calculate pagination values
  const totalCount = items.length
  const filteredCount = processedItems.length
  const totalPages = Math.ceil(filteredCount / pageSize)
  const hasMore = currentPage < totalPages

  // Get visible items for current page
  const visibleItems = useMemo(() => {
    const endIndex = currentPage * pageSize
    return processedItems.slice(0, endIndex)
  }, [processedItems, currentPage, pageSize])

  // Load more items
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)

      // Simulate loading delay for smooth UX
      loadingTimeoutRef.current = setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsLoading(false)
      }, 100)
    }
  }, [hasMore, isLoading])

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  // Generate stable key for item
  const getItemKey = useCallback((item: T, index: number): string => {
    if (keyExtractor) {
      return keyExtractor(item, index)
    }
    return generateStableKey(item, index)
  }, [keyExtractor])

  // Handle item click with stable callback
  const handleItemClick = useCallback((item: T, index: number) => {
    onItemClick?.(item, index)
  }, [onItemClick])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Reset when items change significantly
  useEffect(() => {
    setCurrentPage(initialPage)
  }, [items.length, initialPage])

  return {
    visibleItems,
    loadMore,
    hasMore,
    totalCount,
    filteredCount,
    currentPage,
    totalPages,
    getItemKey,
    handleItemClick,
    reset,
    goToPage,
    isLoading
  }
}

/**
 * useChunkedRender Hook
 *
 * Renders items in chunks to prevent blocking the main thread
 * Useful for lists with expensive item renders
 */
export function useChunkedRender<T>(
  items: T[],
  chunkSize: number = 10,
  delayMs: number = 16
) {
  const [renderedCount, setRenderedCount] = useState(chunkSize)

  useEffect(() => {
    if (renderedCount < items.length) {
      const timer = setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + chunkSize, items.length))
      }, delayMs)

      return () => clearTimeout(timer)
    }
  }, [renderedCount, items.length, chunkSize, delayMs])

  // Reset when items change
  useEffect(() => {
    setRenderedCount(chunkSize)
  }, [items.length, chunkSize])

  return {
    renderedItems: items.slice(0, renderedCount),
    isComplete: renderedCount >= items.length,
    progress: Math.round((renderedCount / items.length) * 100)
  }
}

/**
 * useIntersectionObserver Hook
 *
 * Detect when an element enters the viewport
 * Useful for infinite scroll and lazy loading
 */
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callbackRef.current()
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    })

    observer.observe(target)

    return () => observer.disconnect()
  }, [options])

  return targetRef
}

export default useOptimizedList
