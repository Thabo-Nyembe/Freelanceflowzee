'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowEffectProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  intensity?: 'low' | 'medium' | 'high'
  animated?: boolean
}

export function GlowEffect({
  children,
  className = '',
  glowColor = 'rgb(59, 130, 246)',
  intensity = 'medium',
  animated = true
}: GlowEffectProps) {
  const glowSizes = {
    low: '10px',
    medium: '20px',
    high: '30px'
  }

  const glowSize = glowSizes[intensity]

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      whileHover={{
        scale: animated ? 1.02 : 1
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 blur-xl"
        style={{
          background: glowColor,
          filter: 'blur(' + glowSize + ')'
        }}
        whileHover={{
          opacity: animated ? 0.6 : 0.4
        }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
