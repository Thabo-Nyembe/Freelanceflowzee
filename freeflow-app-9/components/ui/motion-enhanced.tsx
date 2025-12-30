'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

// Enhanced motion container with stagger effects inspired by Motion primitives
export const StaggerContainer: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
}> = ({ children, className, staggerDelay = 0.1, direction = 'up' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  }

  const getChildVariants = () => {
    switch (direction) {
      case 'up':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
      case 'down':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
      case 'left':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
      case 'right':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
    }
  }

  return (
    <motion.div
      className={cn('', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={getChildVariants()}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Smooth scroll reveal component inspired by Smooth UI
export const ScrollReveal: React.FC<{
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}> = ({
  children,
  className,
  delay = 0,
  duration = 0.6,
  distance = 30,
  direction = 'up'
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls])

  const getDirection = () => {
    switch (direction) {
      case 'up': return { y: distance }
      case 'down': return { y: -distance }
      case 'left': return { x: distance }
      case 'right': return { x: -distance }
      default: return { y: distance }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...getDirection()
      }}
      animate={controls}
      variants={{
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Magnetic interaction component inspired by Cult UI
export const MagneticElement: React.FC<{
  children: React.ReactNode
  className?: string
  strength?: number
  disabled?: boolean
}> = ({ children, className, strength = 0.3, disabled = false }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

// Floating action button with breath animation
export const FloatingActionButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
}> = ({
  children,
  className,
  onClick,
  position = 'bottom-right',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <motion.button
      className={cn(
        'fixed z-50 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg backdrop-blur-md',
        'hover:shadow-xl active:scale-95 transition-all duration-200',
        'flex items-center justify-center',
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      onClick={onClick}
      whileHover={{
        scale: 1.1,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    >
      {children}
    </motion.button>
  )
}

// Morphing shape background
export const MorphingBackground: React.FC<{
  className?: string
  colors?: string[]
  duration?: number
}> = ({
  className,
  colors = ['from-blue-400', 'from-purple-400', 'from-pink-400', 'from-indigo-400'],
  duration = 8
}) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length)
    }, duration * 1000)

    return () => clearInterval(interval)
  }, [colors.length, duration])

  return (
    <motion.div
      className={cn(
        'absolute inset-0 opacity-20 bg-gradient-to-br to-transparent',
        colors[currentColorIndex],
        className
      )}
      key={currentColorIndex}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.2, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: duration / 2, ease: 'easeInOut' }}
    />
  )
}

// Text reveal animation
export const TextReveal: React.FC<{
  text: string
  className?: string
  delay?: number
}> = ({ text, className, delay = 0 }) => {
  const words = text.split(' ')

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay
          }
        }
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

// Glassmorphism card with hover effects
export const GlassmorphismCard: React.FC<{
  children: React.ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg'
  opacity?: number
}> = ({ children, className, blur = 'md', opacity = 0.1 }) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/20',
        'bg-white/10 shadow-xl',
        blurClasses[blur],
        className
      )}
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
      whileHover={{
        scale: 1.02,
        backgroundColor: `rgba(255, 255, 255, ${opacity + 0.05})`,
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

export default {
  StaggerContainer,
  ScrollReveal,
  MagneticElement,
  FloatingActionButton,
  MorphingBackground,
  TextReveal,
  GlassmorphismCard
}