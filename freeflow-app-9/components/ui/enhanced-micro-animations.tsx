'use client'

import * as React from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

// Context7 MCP Integration for micro-animations
import { useContext7GUI } from './enhanced-gui-2025'

// Animation presets
export const animationPresets = {
  // Entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: [0.3, 1.1, 1],
      transition: { 
        duration: 0.6,
        times: [0, 0.6, 1],
        ease: 'easeOut'
      }
    },
    exit: { opacity: 0, scale: 0.3 },
    transition: { duration: 0.3 }
  },
  flipIn: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  // Hover animations
  lift: {
    whileHover: { 
      y: -4,
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },
  glow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.2 }
    }
  },
  rotate: {
    whileHover: {
      rotate: 5,
      transition: { duration: 0.2 }
    }
  },
  shake: {
    whileHover: {
      x: [0, -2, 2, -2, 2, 0],
      transition: { duration: 0.4 }
    }
  },
  pulse: {
    whileHover: {
      scale: [1, 1.05, 1],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    }
  },
  
  // Loading animations
  spin: {
    animate: {
      rotate: 360,
      transition: { 
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  float: {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // State change animations
  success: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    }
  },
  error: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  },
  warning: {
    animate: {
      scale: [1, 1.1, 1],
      transition: { 
        duration: 0.3,
        repeat: 2
      }
    }
  }
}

// Enhanced motion components
interface AnimatedElementProps {
  children: React.ReactNode
  animation?: keyof typeof animationPresets | 'custom'
  customAnimation?: any
  delay?: number
  duration?: number
  className?: string
  trigger?: 'mount' | 'hover' | 'inView' | 'manual'
  once?: boolean
  threshold?: number
  [key: string]: any
}

export function AnimatedElement({
  children,
  animation = 'fadeIn',
  customAnimation,
  delay = 0,
  duration,
  className,
  trigger = 'mount',
  once = true,
  threshold = 0.1,
  ...props
}: AnimatedElementProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })
  const controls = useAnimation()

  // Context7 MCP Integration
  const { features, isActive } = useContext7GUI()
  const microInteractionsEnabled = features?.microInteractions && isActive

  const animationConfig = customAnimation || animationPresets[animation as keyof typeof animationPresets] || animationPresets.fadeIn

  React.useEffect(() => {
    if (trigger === 'inView' && isInView) {
      controls.start('animate')
    } else if (trigger === 'mount') {
      const timer = setTimeout(() => {
        controls.start('animate')
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, trigger, controls, delay])

  // Enhanced animation with Context7 features
  const finalAnimation = React.useMemo(() => {
    if (!animationConfig) {
      return animationPresets.fadeIn
    }

    let config = duration
      ? { ...animationConfig, transition: { ...animationConfig?.transition, duration } }
      : animationConfig

    // Apply Context7 enhancements
    if (microInteractionsEnabled) {
      config = {
        ...config,
        whileHover: {
          ...config.whileHover,
          scale: 1.02,
          transition: { duration: 0.2, ease: 'easeOut' }
        },
        whileTap: {
          ...config.whileTap,
          scale: 0.98,
          transition: { duration: 0.1 }
        }
      }
    }

    return config
  }, [animationConfig, duration, microInteractionsEnabled])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={finalAnimation.initial}
      animate={trigger === 'inView' ? controls : finalAnimation.animate}
      exit={finalAnimation.exit}
      whileHover={finalAnimation.whileHover}
      whileTap={finalAnimation.whileTap}
      transition={finalAnimation.transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Staggered animation container
interface StaggeredContainerProps {
  children: React.ReactNode
  stagger?: number
  animation?: keyof typeof animationPresets
  className?: string
}

export function StaggeredContainer({
  children,
  stagger = 0.1,
  animation = 'slideInUp',
  className
}: StaggeredContainerProps) {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: stagger
      }
    }
  }

  const itemVariants = animationPresets[animation]

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Interactive button with micro-animations
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
  loading?: boolean
  success?: boolean
  error?: boolean
  children: React.ReactNode
}

export function AnimatedButton({
  variant = 'default',
  loading = false,
  success = false,
  error = false,
  children,
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false)

  // Context7 MCP Integration
  const { features, isActive } = useContext7GUI()
  const microInteractionsEnabled = features?.microInteractions && isActive
  const hapticFeedbackEnabled = features?.hapticFeedback && isActive

  const buttonVariants = {
    default: {
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    },
    pressed: {
      scale: microInteractionsEnabled ? 0.95 : 0.98,
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    },
    loading: {
      scale: [1, 1.05, 1],
      transition: {
        duration: microInteractionsEnabled ? 0.8 : 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    success: {
      scale: [1, 1.1, 1],
      backgroundColor: '#10B981',
      transition: { duration: microInteractionsEnabled ? 0.2 : 0.3 }
    },
    error: {
      x: [0, -5, 5, -5, 5, 0],
      backgroundColor: '#EF4444',
      transition: { duration: microInteractionsEnabled ? 0.3 : 0.4 }
    }
  }

  const getVariant = () => {
    if (loading) return 'loading'
    if (success) return 'success'
    if (error) return 'error'
    if (isPressed) return 'pressed'
    return 'default'
  }

  const handleMouseDown = () => {
    setIsPressed(true)

    // Haptic feedback simulation (Context7 feature)
    if (hapticFeedbackEnabled && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden transition-colors duration-200",
        microInteractionsEnabled && "hover:shadow-lg transition-shadow",
        className
      )}
      variants={buttonVariants}
      animate={getVariant()}
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      {...props}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-current bg-opacity-10"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.span
        animate={{ opacity: loading ? 0.3 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

// Notification toast with animations
interface AnimatedToastProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onDismiss?: () => void
  autoHide?: boolean
  duration?: number
}

export function AnimatedToast({
  message,
  type = 'info',
  onDismiss,
  autoHide = true,
  duration = 5000
}: AnimatedToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, duration, onDismiss])

  const toastVariants = {
    hidden: { 
      opacity: 0, 
      x: 300,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: 300,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  }

  const progressVariants = {
    initial: { scaleX: 1 },
    animate: { 
      scaleX: 0,
      transition: { duration: duration / 1000, ease: 'linear' }
    }
  }

  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={cn(
            "rounded-lg shadow-lg text-white p-4 relative overflow-hidden",
            typeColors[type]
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{message}</span>
              {onDismiss && (
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onDismiss, 300)
                  }}
                  className="ml-2 text-white hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
            
            {autoHide && (
              <motion.div
                variants={progressVariants}
                initial="initial"
                animate="animate"
                className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 origin-left"
                style={{ width: '100%' }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Animated counter
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 1, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const updateCounter = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [value, duration, displayValue])

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  )
}

// Animated progress bar
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  animated?: boolean
  color?: string
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  showValue = false,
  animated = true,
  color = 'bg-blue-500'
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("relative", className)}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1 : 0,
            ease: 'easeOut'
          }}
        />
      </div>
      
      {showValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center text-xs font-medium"
        >
          <AnimatedCounter value={Math.round(percentage)} />%
        </motion.div>
      )}
    </div>
  )
}

// Morphing icon component
interface MorphingIconProps {
  icons: React.ReactNode[]
  currentIndex: number
  className?: string
}

export function MorphingIcon({ icons, currentIndex, className }: MorphingIconProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {icons[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Animated list item for drag and drop
interface AnimatedListItemProps {
  children: React.ReactNode
  className?: string
  onRemove?: () => void
}

export function AnimatedListItem({ children, className, onRemove }: AnimatedListItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, height: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

// Export all animation presets and utilities
export { motion, AnimatePresence, useAnimation, useInView }
export default AnimatedElement



