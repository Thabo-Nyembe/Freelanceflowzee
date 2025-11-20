'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BorderTrailProps {
  children: React.ReactNode
  className?: string
  trailColor?: string
  duration?: number
  size?: number
  delay?: number
}

export function BorderTrail({
  children,
  className = '',
  trailColor = 'rgba(59, 130, 246, 0.5)',
  duration = 4,
  size = 100,
  delay = 0
}: BorderTrailProps) {
  return (
    <div className={cn('relative', className)}>
      {/* The trailing border effect */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, ' + trailColor + ' 10%, transparent 20%)',
            backgroundSize: size + '% ' + size + '%'
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Inner mask to create border effect */}
        <div className="absolute inset-[2px] bg-transparent rounded-xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Variant: Simple border glow (no rotation)
interface BorderGlowProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  animated?: boolean
}

export function BorderGlow({
  children,
  className = '',
  glowColor = 'rgb(59, 130, 246)',
  animated = true
}: BorderGlowProps) {
  return (
    <motion.div
      className={cn('relative rounded-xl', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Glow border */}
      <motion.div
        className="absolute -inset-[1px] rounded-xl opacity-0"
        style={{
          background: 'linear-gradient(90deg, ' + glowColor + ', transparent, ' + glowColor + ')',
          filter: 'blur(4px)'
        }}
        whileHover={{
          opacity: animated ? 0.6 : 0.4
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
