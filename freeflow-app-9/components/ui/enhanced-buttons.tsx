'use client'

import React, { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Magnetic Button with attraction effect
export const MagneticButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}> = ({
  children,
  className,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { stiffness: 400, damping: 30 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * 0.3
    const deltaY = (e.clientY - centerY) * 0.3

    x.set(deltaX)
    y.set(deltaY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'transform-gpu active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  )
}

// Ripple Effect Button
export const RippleButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  rippleColor?: string
}> = ({
  children,
  className,
  onClick,
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.6)'
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3 font-medium',
        'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: rippleColor
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Morphing Button with state changes
export const MorphingButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  success?: boolean
}> = ({
  children,
  className,
  onClick,
  loading = false,
  disabled = false,
  success = false
}) => {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (disabled || loading) return
    setIsClicked(true)
    onClick?.()
    setTimeout(() => setIsClicked(false), 2000)
  }

  const getButtonState = () => {
    if (loading) return { bg: 'bg-yellow-500', text: 'Loading...', icon: <Loader2 className="w-4 h-4 animate-spin" /> }
    if (success) return { bg: 'bg-green-500', text: 'Success!', icon: '✓' }
    if (isClicked) return { bg: 'bg-blue-600', text: 'Processing...', icon: null }
    return { bg: 'bg-blue-500', text: children, icon: null }
  }

  const state = getButtonState()

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3 font-medium text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      animate={{
        backgroundColor: state.bg.replace('bg-', ''),
        scale: isClicked ? 0.95 : 1
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {state.icon && <span>{state.icon}</span>}
        <span>{state.text}</span>
      </motion.div>
    </motion.button>
  )
}

// Neon Glow Button
export const NeonButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  color?: 'blue' | 'purple' | 'pink' | 'green'
}> = ({
  children,
  className,
  onClick,
  disabled = false,
  color = 'blue'
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-500',
      shadow: 'shadow-blue-500/50',
      hover: 'hover:shadow-blue-500/80'
    },
    purple: {
      bg: 'bg-purple-500',
      shadow: 'shadow-purple-500/50',
      hover: 'hover:shadow-purple-500/80'
    },
    pink: {
      bg: 'bg-pink-500',
      shadow: 'shadow-pink-500/50',
      hover: 'hover:shadow-pink-500/80'
    },
    green: {
      bg: 'bg-green-500',
      shadow: 'shadow-green-500/50',
      hover: 'hover:shadow-green-500/80'
    }
  }

  return (
    <motion.button
      className={cn(
        'relative rounded-lg px-6 py-3 font-medium text-white border-2',
        'transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        colors[color].bg,
        colors[color].shadow,
        colors[color].hover,
        `border-${color}-500`,
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? {
        scale: 1.05,
        boxShadow: `0 0 30px ${color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#10b981'}80`
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={{
        boxShadow: [
          `0 0 20px ${color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#10b981'}40`,
          `0 0 30px ${color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#10b981'}60`,
          `0 0 20px ${color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#10b981'}40`
        ]
      }}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {children}
    </motion.button>
  )
}

// Slide Fill Button
export const SlideFillButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  direction?: 'left' | 'right' | 'top' | 'bottom'
  fillColor?: string
}> = ({
  children,
  className,
  onClick,
  disabled = false,
  direction = 'right',
  fillColor = 'bg-blue-600'
}) => {
  const getTransform = () => {
    switch (direction) {
      case 'left': return { x: '-100%' }
      case 'right': return { x: '100%' }
      case 'top': return { y: '-100%' }
      case 'bottom': return { y: '100%' }
      default: return { x: '100%' }
    }
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3 font-medium',
        'border-2 border-blue-500 text-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <motion.div
        className={cn('absolute inset-0', fillColor)}
        initial={getTransform()}
        whileHover={{ x: 0, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <span className="relative z-10 mix-blend-difference">{children}</span>
    </motion.button>
  )
}

// Particle Button with animated particles
export const ParticleButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  particleCount?: number
}> = ({
  children,
  className,
  onClick,
  disabled = false,
  particleCount = 12
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY
    }))

    setParticles(newParticles)

    setTimeout(() => {
      setParticles([])
    }, 1000)

    onClick?.()
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3 font-medium',
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {particles.map((particle, index) => {
        const angle = (index / particleCount) * 2 * Math.PI
        const distance = 100
        const targetX = particle.x + Math.cos(angle) * distance
        const targetY = particle.y + Math.sin(angle) * distance

        return (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
            style={{ left: particle.x - 4, top: particle.y - 4 }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{
              x: targetX - particle.x,
              y: targetY - particle.y,
              opacity: 0,
              scale: [0, 1, 0]
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )
      })}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export default {
  MagneticButton,
  RippleButton,
  MorphingButton,
  NeonButton,
  SlideFillButton,
  ParticleButton
}