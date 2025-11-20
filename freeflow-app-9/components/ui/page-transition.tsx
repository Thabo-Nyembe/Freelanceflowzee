'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { GlowEffect } from '@/components/ui/glow-effect'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  }
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Fade transition for quick transitions
const fadeVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

export function FadeTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={fadeVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Slide transition for dashboard/panel transitions
const slideVariants = {
  initial: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? -100 : 100,
    opacity: 0
  }),
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  },
  exit: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? 100 : -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  })
}

export function SlideTransition({
  children,
  className,
  direction = 'right'
}: PageTransitionProps & { direction?: 'left' | 'right' }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        custom={direction}
        variants={slideVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Premium scale transition with glow effect
const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)'
  },
  enter: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.48, 0.15, 0.25, 0.96]
    }
  }
}

export function ScaleTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={scaleVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Premium transition with loading bar
export function PremiumTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="relative"
      >
        {/* Loading bar at top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 origin-left z-50"
        />
        <GlowEffect className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50 blur-md" />

        <div className={className}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
