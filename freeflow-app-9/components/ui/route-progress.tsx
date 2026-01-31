'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * Premium Route Progress Bar
 * Shows animated progress bar during route changes
 * Uses CSS animations for better performance
 */
interface RouteProgressProps {
  className?: string
  height?: number
  color?: string
  showSpinner?: boolean
}

export function RouteProgress({
  className,
  height = 3,
  color = 'from-purple-500 via-blue-500 to-purple-500',
  showSpinner = false
}: RouteProgressProps) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] origin-left animate-[progress_0.3s_ease-out_forwards]',
          `bg-gradient-to-r ${color}`,
          className
        )}
        style={{ height: `${height}px` }}
      />

      {/* Glow effect */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[99] origin-left blur-sm animate-[progress_0.4s_ease-in-out_forwards] opacity-50',
          `bg-gradient-to-r ${color}`
        )}
        style={{ height: `${height * 2}px` }}
      />

      {/* Optional spinner */}
      {showSpinner && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900/90 backdrop-blur-sm rounded-full p-2 border border-purple-500/30 animate-in fade-in zoom-in-75 duration-200">
          <svg
            className="animate-spin h-5 w-5 text-purple-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </>
  )
}

/**
 * Minimal Route Progress
 * Simple thin line at top
 */
export function MinimalRouteProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 400)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 origin-left z-[100] animate-[progress_0.4s_ease-out_forwards]" />
  )
}

export default RouteProgress
