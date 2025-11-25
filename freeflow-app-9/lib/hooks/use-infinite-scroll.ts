import { useEffect, useRef, useCallback, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number // Distance from bottom to trigger load (in pixels)
  enabled?: boolean
}

interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 200, enabled = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)

  const handleScroll = useCallback(async () => {
    if (!enabled || loadingRef.current || !ref.current) return

    const element = ref.current
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    // Check if user has scrolled near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadingRef.current = true
      setIsLoading(true)

      try {
        await onLoadMore()
      } catch (error) {
        console.error('Error loading more items:', error)
      } finally {
        loadingRef.current = false
        setIsLoading(false)
      }
    }
  }, [enabled, threshold, onLoadMore])

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [handleScroll, enabled])

  return { ref, isLoading, setIsLoading }
}

// Hook for window-based infinite scroll (for pages without custom scroll containers)
export function useWindowInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): { isLoading: boolean; setIsLoading: (loading: boolean) => void } {
  const { threshold = 200, enabled = true } = options
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const handleScroll = async () => {
      if (loadingRef.current) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadingRef.current = true
        setIsLoading(true)

        try {
          await onLoadMore()
        } catch (error) {
          console.error('Error loading more items:', error)
        } finally {
          loadingRef.current = false
          setIsLoading(false)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, threshold, onLoadMore])

  return { isLoading, setIsLoading }
}
