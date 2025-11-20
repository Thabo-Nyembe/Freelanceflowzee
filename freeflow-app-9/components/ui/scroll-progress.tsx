'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Premium Scroll Progress Indicator
 * Shows page scroll progress with gradient bar
 */
interface ScrollProgressProps {
  className?: string
  position?: 'top' | 'bottom'
  height?: number
  gradient?: string
  showPercentage?: boolean
}

export function ScrollProgress({
  className,
  position = 'top',
  height = 3,
  gradient = 'from-purple-500 via-blue-500 to-purple-500',
  showPercentage = false
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setPercentage(Math.round(latest * 100))
    })
  }, [scrollYProgress])

  return (
    <>
      <motion.div
        className={cn(
          'fixed left-0 right-0 z-50 origin-left',
          `bg-gradient-to-r ${gradient}`,
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        style={{
          scaleX,
          height: `${height}px`
        }}
      />
      {showPercentage && (
        <motion.div
          className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-purple-500/30 text-white text-xs font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  )
}

/**
 * Circular Scroll Progress
 * Shows scroll progress in a circular indicator
 */
export function CircularScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setProgress(latest)
    })
  }, [scrollYProgress])

  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference - progress * circumference

  return (
    <motion.div
      className={cn(
        'fixed bottom-8 right-8 z-50 w-12 h-12',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="rgb(30, 41, 59)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <motion.circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white">
          {Math.round(progress * 100)}
        </span>
      </div>
    </motion.div>
  )
}

export default ScrollProgress
