'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
  duration?: number
  spread?: number
}

export function TextShimmer({
  children,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.5)',
  duration = 3,
  spread = 3
}: TextShimmerProps) {
  return (
    <motion.div
      className={cn('relative inline-block', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span
        className="relative inline-block bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text text-transparent"
        style={{
          backgroundSize: spread * 100 + '% 100%',
          backgroundImage: 'linear-gradient(90deg, currentColor 0%, currentColor 40%, ' + shimmerColor + ' 50%, currentColor 60%, currentColor 100%)'
        }}
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text"
          style={{
            backgroundSize: spread * 100 + '% 100%'
          }}
          animate={{
            backgroundPosition: ['-200% 0', '200% 0']
          }}
          transition={{
            duration: duration,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          {children}
        </motion.span>
        {children}
      </span>
    </motion.div>
  )
}
