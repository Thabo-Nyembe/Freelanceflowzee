'use client'

import React, { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// Direction Aware Card inspired by Cult UI
export const DirectionAwareCard: React.FC<{
  children: React.ReactNode
  className?: string
  overlay?: React.ReactNode
  imageUrl?: string
}> = ({ children, className, overlay, imageUrl }) => {
  const [direction, setDirection] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const getDirection = (e: React.MouseEvent) => {
    if (!ref.current) return null

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const w = rect.width
    const h = rect.height

    const top = Math.abs(y)
    const bottom = Math.abs(y - h)
    const left = Math.abs(x)
    const right = Math.abs(x - w)

    const min = Math.min(top, right, bottom, left)

    if (min === top) return 'top'
    if (min === right) return 'right'
    if (min === bottom) return 'bottom'
    return 'left'
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    setDirection(getDirection(e))
  }

  const handleMouseLeave = () => {
    setDirection(null)
  }

  const getOverlayAnimation = () => {
    switch (direction) {
      case 'top':
        return { y: 0, opacity: 1 }
      case 'right':
        return { x: 0, opacity: 1 }
      case 'bottom':
        return { y: 0, opacity: 1 }
      case 'left':
        return { x: 0, opacity: 1 }
      default:
        return { x: 0, y: 0, opacity: 0 }
    }
  }

  const getOverlayInitial = () => {
    switch (direction) {
      case 'top':
        return { y: -100, opacity: 0 }
      case 'right':
        return { x: 100, opacity: 0 }
      case 'bottom':
        return { y: 100, opacity: 0 }
      case 'left':
        return { x: -100, opacity: 0 }
      default:
        return { x: 0, y: 0, opacity: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg cursor-pointer',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>

      {overlay && direction && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-purple-600/90 flex items-center justify-center z-20"
          initial={getOverlayInitial()}
          animate={getOverlayAnimation()}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {overlay}
        </motion.div>
      )}
    </motion.div>
  )
}

// Shift Card with magnetic interaction
export const ShiftCard: React.FC<{
  children: React.ReactNode
  className?: string
  intensity?: number
}> = ({ children, className, intensity = 15 }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [intensity, -intensity])
  const rotateY = useTransform(x, [-100, 100], [-intensity, intensity])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
        'shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer',
        className
      )}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

// Texture Card with dynamic background patterns
export const TextureCard: React.FC<{
  children: React.ReactNode
  className?: string
  pattern?: 'dots' | 'grid' | 'waves' | 'noise'
  patternOpacity?: number
}> = ({ children, className, pattern = 'dots', patternOpacity = 0.1 }) => {
  const patterns = {
    dots: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity={patternOpacity} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    ),
    grid: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" opacity={patternOpacity} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    ),
    waves: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="waves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 10 10 20 20 T 40 20" stroke="currentColor" strokeWidth="1" fill="none" opacity={patternOpacity} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
      </svg>
    ),
    noise: (
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: patternOpacity
        }}
      />
    )
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      transition={{ duration: 0.2 }}
    >
      {patterns[pattern]}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Dynamic Island inspired by Apple's design
export const DynamicIsland: React.FC<{
  children: React.ReactNode
  className?: string
  expanded?: boolean
  onToggle?: () => void
}> = ({ children, className, expanded = false, onToggle }) => {
  return (
    <motion.div
      className={cn(
        'bg-black dark:bg-white text-white dark:text-black rounded-full',
        'flex items-center justify-center cursor-pointer overflow-hidden',
        className
      )}
      animate={{
        width: expanded ? '200px' : '120px',
        height: expanded ? '60px' : '32px',
        borderRadius: expanded ? '20px' : '16px'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ opacity: expanded ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Bento Grid Card Layout
export const BentoCard: React.FC<{
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  gradient?: boolean
}> = ({ children, className, size = 'md', gradient = false }) => {
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-2 row-span-1',
    lg: 'col-span-2 row-span-2',
    xl: 'col-span-3 row-span-2'
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        gradient
          ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        sizeClasses[size],
        className
      )}
      whileHover={{
        scale: 1.02,
        y: -4
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Spotlight Card with light following cursor
export const SpotlightCard: React.FC<{
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}> = ({ children, className, spotlightColor = 'rgba(59, 130, 246, 0.3)' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gray-900 text-white p-6',
        'border border-gray-700 cursor-pointer',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: mousePosition.x - 100,
            top: mousePosition.y - 100,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default {
  DirectionAwareCard,
  ShiftCard,
  TextureCard,
  DynamicIsland,
  BentoCard,
  SpotlightCard
}