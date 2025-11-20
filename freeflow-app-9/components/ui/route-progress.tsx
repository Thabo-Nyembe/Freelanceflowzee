'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Premium Route Progress Bar
 * Shows animated progress bar during route changes
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
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setLoading(true)
    setProgress(0)

    // Fast progress simulation
    const timer1 = setTimeout(() => setProgress(60), 50)
    const timer2 = setTimeout(() => setProgress(100), 150)
    const timer3 = setTimeout(() => setLoading(false), 200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {loading && (
        <>
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: progress / 100, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed top-0 left-0 right-0 z-[100] origin-left',
              `bg-gradient-to-r ${color}`,
              className
            )}
            style={{ height: `${height}px` }}
          />

          {/* Glow effect */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0.5 }}
            animate={{ scaleX: progress / 100, opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed top-0 left-0 right-0 z-[99] origin-left blur-sm',
              `bg-gradient-to-r ${color}`
            )}
            style={{ height: `${height * 2}px` }}
          />

          {/* Optional spinner */}
          {showSpinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-4 right-4 z-[100] bg-slate-900/90 backdrop-blur-sm rounded-full p-2 border border-purple-500/30"
            >
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
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
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
    const timer = setTimeout(() => setIsNavigating(false), 200)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 origin-left z-[100]"
        />
      )}
    </AnimatePresence>
  )
}

export default RouteProgress
