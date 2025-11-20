'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Premium Route Transition Wrapper
 * Wraps page content with smooth transitions
 */
interface RouteTransitionWrapperProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'slide' | 'scale' | 'blur' | 'premium'
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  },
  slide: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] }
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] }
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(4px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(4px)' },
    transition: { duration: 0.25, ease: [0.48, 0.15, 0.25, 0.96] }
  },
  premium: {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 },
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] }
  }
}

export function RouteTransitionWrapper({
  children,
  className,
  variant = 'premium'
}: RouteTransitionWrapperProps) {
  const pathname = usePathname()
  const config = transitionVariants[variant]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={config.initial}
        animate={config.animate}
        exit={config.exit}
        transition={config.transition}
        className={cn('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Staggered Route Transition
 * Children animate in with stagger delay
 */
export function StaggeredRouteTransition({
  children,
  className,
  staggerDelay = 0.1
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  const pathname = usePathname()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.48, 0.15, 0.25, 0.96]
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={className}
      >
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        ) : (
          <motion.div variants={itemVariants}>{children}</motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default RouteTransitionWrapper
