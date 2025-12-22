'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'tinted'
  animated?: boolean
  hoverEffect?: boolean
}

export function LiquidGlassCard({
  children,
  className = '',
  variant = 'default',
  animated = true,
  hoverEffect = true
}: LiquidGlassCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white/40 via-white/30 to-white/20 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-900/50'
      case 'tinted':
        return 'bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/30 dark:from-gray-800/70 dark:via-gray-800/50 dark:to-gray-900/40'
      default:
        return 'bg-white/30 dark:bg-gray-800/50'
    }
  }

  const baseClasses = cn(
    'relative overflow-hidden rounded-2xl',
    'backdrop-blur-xl backdrop-saturate-150',
    'border border-white/20 dark:border-white/10',
    'shadow-xl shadow-black/5 dark:shadow-black/20',
    getVariantClasses(),
    className
  )

  const CardComponent = animated ? motion.div : 'div'

  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      }
    : {}

  const hoverProps = hoverEffect
    ? {
        whileHover: {
          scale: 1.02,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          transition: { duration: 0.2 }
        }
      }
    : {}

  return (
    <CardComponent className={baseClasses} {...animationProps} {...hoverProps}>
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Animated liquid blob (subtle) */}
      <motion.div
        className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Content container with z-index to stay above effects */}
      <div className="relative z-10">
        {children}
      </div>
    </CardComponent>
  )
}

// Additional exports for card subcomponents
interface LiquidGlassCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassCardHeader({ children, className = '' }: LiquidGlassCardHeaderProps) {
  return (
    <div className={cn('p-6 pb-4', className)}>
      {children}
    </div>
  )
}

interface LiquidGlassCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassCardTitle({ children, className = '' }: LiquidGlassCardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900 dark:text-gray-100', className)}>
      {children}
    </h3>
  )
}

interface LiquidGlassCardContentProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassCardContent({ children, className = '' }: LiquidGlassCardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}
