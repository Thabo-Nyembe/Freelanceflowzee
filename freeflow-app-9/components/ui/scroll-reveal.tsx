'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Premium Scroll Reveal Component
 * Reveals content with animations as user scrolls
 */
interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'blur'
  delay?: number
  duration?: number
  once?: boolean
  threshold?: number
}

const revealVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' }
  }
}

export function ScrollReveal({
  children,
  className,
  variant = 'slide-up',
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.1
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={revealVariants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.48, 0.15, 0.25, 0.96]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered Scroll Reveal
 * Reveals multiple children with stagger delay
 */
interface ScrollRevealStaggerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  variant?: ScrollRevealProps['variant']
}

export function ScrollRevealStagger({
  children,
  className,
  staggerDelay = 0.1,
  variant = 'slide-up'
}: ScrollRevealStaggerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={revealVariants[variant]}
              transition={{
                duration: 0.5,
                ease: [0.48, 0.15, 0.25, 0.96]
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}

/**
 * Text Reveal by Character
 * Reveals text character by character on scroll
 */
interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const characters = text.split('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  }

  const characterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.48, 0.15, 0.25, 0.96]
      }
    }
  }

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={cn('inline-block', className)}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={characterVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default ScrollReveal
