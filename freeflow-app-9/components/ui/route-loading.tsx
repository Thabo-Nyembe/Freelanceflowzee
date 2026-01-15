'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowEffect } from './glow-effect'

/**
 * Premium Route Loading Overlay
 * Full-screen loading state during route changes
 */
interface RouteLoadingProps {
  className?: string
  variant?: 'minimal' | 'full' | 'logo'
  delay?: number
}

export function RouteLoading({
  className,
  variant = 'minimal',
  delay = 100
}: RouteLoadingProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)

    // Fast transition - minimal delay
    const showTimer = setTimeout(() => {
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(showTimer)
  }, [pathname, delay])

  if (variant === 'minimal') {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center',
              className
            )}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
            >
              <GlowEffect className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-xl" />
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 relative z-10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'full') {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 flex flex-col items-center justify-center',
              className
            )}
          >
            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
              />
            </div>

            {/* Loading content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <GlowEffect className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl" />

              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Zap className="w-6 h-6 text-blue-400" />
                </motion.div>
              </div>

              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                Loading KAZI...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'logo') {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 bg-slate-950 z-50 flex items-center justify-center',
              className
            )}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] }}
              className="relative"
            >
              <GlowEffect className="absolute -inset-12 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
              <img src="/kazi-brand/logo.svg"
                alt="KAZI"
                className="h-16 w-auto relative z-10"
              / loading="lazy">
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return null
}

/**
 * Route Loading Indicator
 * Small corner indicator for route changes
 */
export function RouteLoadingIndicator() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 150)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30 flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span className="text-xs font-medium text-purple-400">Loading...</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RouteLoading
