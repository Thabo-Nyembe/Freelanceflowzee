'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Brain,
  Hand,
  Cpu
} from 'lucide-react'

// Context7 MCP Enhanced Type Definitions for 2025 GUI Features
interface GUI2025ContextState {
  spatialMode: boolean
  adaptiveTheme: 'auto' | 'light' | 'dark' | 'lightning-dark'
  interactionMode: 'touch' | 'gesture' | 'voice' | 'neural' | 'hybrid'
  personalizedUI: boolean
  aiDrivenPersonalization: boolean
  zeroUIMode: boolean
  kineticTypography: boolean
  microInteractions: boolean
  glassmorphism: boolean
  neuromorphism: boolean
  liquidDesign: boolean
  spatialComputing: boolean
  gestureControls: boolean
  voiceCommands: boolean
  hapticFeedback: boolean
  biometricAuth: boolean
  contextualAdaptation: boolean
}

interface ModernGUIProps {
  variant?: 'standard' | 'spatial' | 'adaptive' | 'zero-ui' | 'kinetic' | 'neural'
  theme?: 'lightning-dark' | 'adaptive-light' | 'spatial-gradient' | 'liquid-glass'
  interactionLevel?: 'basic' | 'enhanced' | 'immersive' | 'revolutionary'
  personalizeMode?: boolean
  aiEnhanced?: boolean
  children?: React.ReactNode
  className?: string
}

// Lightning Dark Theme Component (2025 Trend)
export function LightningDarkContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  const [lightningEffects, setLightningEffects] = React.useState(false)

  return (
    <motion.div
      className={cn(
        "relative bg-gray-950 text-white overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/10 before:via-purple-500/5 before:to-cyan-500/10",
        "after:absolute after:inset-0 after:bg-gradient-to-tl after:from-transparent after:via-white/[0.02] after:to-transparent",
        className
      )}
      onHoverStart={() => setLightningEffects(true)}
      onHoverEnd={() => setLightningEffects(false)}
    >
      {/* Dynamic Lightning Effects */}
      <AnimatePresence>
        {lightningEffects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/60 via-transparent to-transparent"
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0, 1, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            <motion.div
              className="absolute top-1/3 right-1/4 w-full h-px bg-gradient-to-r from-purple-400/60 via-transparent to-transparent"
              animate={{
                opacity: [0, 1, 0],
                scaleX: [0, 1, 0]
              }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glowing Accents */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse" />
      <div className="absolute bottom-6 left-6 w-1 h-1 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50 animate-pulse delay-700" />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Interactive 3D Elements with Spatial Design (2025 Trend)
export function Spatial3DCard({ children, depth = 1, className }: {
  children: React.ReactNode,
  depth?: number,
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    setMousePosition({ x, y })
  }

  const transform = `
    perspective(1000px)
    rotateX(${mousePosition.y * depth * 10}deg)
    rotateY(${mousePosition.x * depth * 10}deg)
    translateZ(${isHovered ? 20 : 0}px)
  `

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative cursor-pointer transition-all duration-300 ease-out",
        "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl",
        "border border-white/20 rounded-2xl shadow-2xl",
        "hover:shadow-3xl hover:shadow-purple-500/20",
        className
      )}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 3D Depth Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl translate-z-[-10px]" />
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/5 to-blue-500/5 rounded-2xl translate-z-[-20px]" />

      {/* Interactive Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-2xl opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  )
}

// Kinetic Typography Component (2025 Trend)
export function KineticText({
  children,
  variant = 'wave',
  trigger = 'hover',
  className
}: {
  children: string,
  variant?: 'wave' | 'morph' | 'liquid' | 'split' | 'particle',
  trigger?: 'hover' | 'scroll' | 'auto',
  className?: string
}) {
  const [isActive, setIsActive] = React.useState(trigger === 'auto')
  const letters = children.split('')

  const variants = {
    wave: {
      hidden: { y: 0 },
      visible: (i: number) => ({
        y: [0, -20, 0],
        transition: {
          delay: i * 0.1,
          duration: 0.6,
          ease: "easeInOut"
        }
      })
    },
    morph: {
      hidden: { scale: 1, rotateX: 0 },
      visible: (i: number) => ({
        scale: [1, 1.2, 1],
        rotateX: [0, 180, 360],
        transition: {
          delay: i * 0.05,
          duration: 0.8,
          ease: "easeInOut"
        }
      })
    },
    liquid: {
      hidden: { scaleY: 1, skewX: 0 },
      visible: (i: number) => ({
        scaleY: [1, 1.5, 1],
        skewX: [0, 15, -15, 0],
        transition: {
          delay: i * 0.08,
          duration: 1,
          ease: "easeInOut"
        }
      })
    }
  }

  return (
    <motion.span
      className={cn("inline-block", className)}
      onHoverStart={() => trigger === 'hover' && setIsActive(true)}
      onHoverEnd={() => trigger === 'hover' && setIsActive(false)}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block"
          custom={i}
          variants={variants[variant]}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  )
}

// AI-Driven Adaptive Interface (2025 Trend)
export function AdaptiveInterface({
  children,
  userBehavior,
  contextData,
  className
}: {
  children: React.ReactNode,
  userBehavior?: any,
  contextData?: any,
  className?: string
}) {
  const [adaptiveState, setAdaptiveState] = React.useState({
    layout: 'default',
    colorScheme: 'auto',
    density: 'comfortable',
    interactions: 'standard'
  })

  // AI-driven adaptation logic
  React.useEffect(() => {
    // Simulate AI analysis of user behavior
    const adaptInterface = () => {
      const timeOfDay = new Date().getHours()
      const isEvening = timeOfDay >= 18 || timeOfDay <= 6

      setAdaptiveState(prev => ({
        ...prev,
        colorScheme: isEvening ? 'dark' : 'light',
        density: userBehavior?.isFrequentUser ? 'compact' : 'comfortable',
        interactions: userBehavior?.preferenceLevel || 'standard'
      }))
    }

    adaptInterface()
    const interval = setInterval(adaptInterface, 60000) // Re-evaluate every minute

    return () => clearInterval(interval)
  }, [userBehavior, contextData])

  return (
    <motion.div
      className={cn(
        "relative transition-all duration-1000 ease-out",
        adaptiveState.colorScheme === 'dark'
          ? "bg-gray-950 text-white"
          : "bg-white text-gray-900",
        adaptiveState.density === 'compact' ? "space-y-2" : "space-y-4",
        className
      )}
      layout
    >
      {/* AI Adaptation Indicator */}
      <motion.div
        className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Brain className="h-3 w-3" />
        <span>AI Adapted</span>
      </motion.div>

      {children}
    </motion.div>
  )
}

// Gesture-Based Controls (2025 Trend)
export function GestureControlZone({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  className
}: {
  children: React.ReactNode,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  onPinch?: (scale: number) => void,
  onRotate?: (angle: number) => void,
  className?: string
}) {
  const [gestureState, setGestureState] = React.useState({
    isActive: false,
    currentGesture: null as string | null
  })

  return (
    <motion.div
      className={cn(
        "relative touch-manipulation select-none",
        "border border-dashed border-transparent",
        gestureState.isActive && "border-cyan-400/50 bg-cyan-400/5",
        className
      )}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setGestureState({ isActive: true, currentGesture: 'drag' })}
      onDragEnd={() => setGestureState({ isActive: false, currentGesture: null })}
      onPan={(event, info) => {
        const { delta } = info
        const threshold = 50

        if (Math.abs(delta.x) > threshold) {
          if (delta.x > 0 && onSwipeRight) onSwipeRight()
          if (delta.x < 0 && onSwipeLeft) onSwipeLeft()
        }

        if (Math.abs(delta.y) > threshold) {
          if (delta.y > 0 && onSwipeDown) onSwipeDown()
          if (delta.y < 0 && onSwipeUp) onSwipeUp()
        }
      }}
    >
      {/* Gesture Feedback */}
      {gestureState.isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-cyan-400">
            <Hand className="h-3 w-3" />
            <span>Gesture Active</span>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}

// Liquid Design Components (2025 Trend)
export function LiquidButton({
  children,
  variant = 'primary',
  liquidEffect = true,
  morphOnHover = true,
  className,
  ...props
}: {
  children: React.ReactNode,
  variant?: 'primary' | 'secondary' | 'accent',
  liquidEffect?: boolean,
  morphOnHover?: boolean,
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [clickRipple, setClickRipple] = React.useState({ x: 0, y: 0, active: false })

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setClickRipple({ x, y, active: true })
    setTimeout(() => setClickRipple(prev => ({ ...prev, active: false })), 600)

    if (props.onClick) props.onClick(e)
  }

  const variants = {
    primary: "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
    secondary: "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900",
    accent: "bg-gradient-to-r from-cyan-400 to-purple-400 text-white"
  }

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-full px-6 py-3 font-medium",
        "transform-gpu transition-all duration-300 ease-out",
        "shadow-lg hover:shadow-xl active:scale-95",
        variants[variant],
        morphOnHover && "hover:rounded-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {/* Liquid Background Effect */}
      {liquidEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          animate={{
            x: isHovered ? ["0%", "100%"] : "0%",
            opacity: isHovered ? [0, 1, 0] : 0
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Click Ripple Effect */}
      <AnimatePresence>
        {clickRipple.active && (
          <motion.div
            className="absolute bg-white/30 rounded-full"
            style={{
              left: clickRipple.x,
              top: clickRipple.y,
            }}
            initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
            animate={{ width: 300, height: 300 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Neuromorphic Design Components (2025 Trend)
export function NeuroCard({
  children,
  pressed = false,
  interactive = true,
  variant = 'elevated',
  className
}: {
  children: React.ReactNode,
  pressed?: boolean,
  interactive?: boolean,
  variant?: 'elevated' | 'inset' | 'flat',
  className?: string
}) {
  const [isPressed, setIsPressed] = React.useState(pressed)

  const variants = {
    elevated: {
      boxShadow: isPressed
        ? "inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff"
        : "8px 8px 16px #d1d5db, -8px -8px 16px #ffffff",
      transform: isPressed ? "scale(0.98)" : "scale(1)"
    },
    inset: {
      boxShadow: "inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff",
      transform: "scale(1)"
    },
    flat: {
      boxShadow: "0 0 0 #d1d5db",
      transform: "scale(1)"
    }
  }

  return (
    <motion.div
      className={cn(
        "relative bg-gray-200 rounded-2xl p-6",
        "transition-all duration-200 ease-out",
        interactive && "cursor-pointer user-select-none",
        className
      )}
      animate={variants[variant]}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => interactive && setIsPressed(false)}
      onMouseLeave={() => interactive && setIsPressed(false)}
      whileHover={interactive ? { scale: 1.02 } : {}}
    >
      {children}
    </motion.div>
  )
}

// Advanced Micro-Interactions Hub (2025 Trend)
export function MicroInteractionButton({
  children,
  interaction = 'hover-grow',
  feedback = 'haptic',
  sound = false,
  className,
  ...props
}: {
  children: React.ReactNode,
  interaction?: 'hover-grow' | 'pulse' | 'shake' | 'glow' | 'morph' | 'magnetic',
  feedback?: 'haptic' | 'visual' | 'audio' | 'all',
  sound?: boolean,
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [interactionState, setInteractionState] = React.useState({
    isHovered: false,
    isClicked: false,
    magneticOffset: { x: 0, y: 0 }
  })

  const ref = React.useRef<HTMLButtonElement>(null)

  const interactions = {
    'hover-grow': {
      whileHover: { scale: 1.1, transition: { duration: 0.2 } },
      whileTap: { scale: 0.95 }
    },
    'pulse': {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 1, repeat: Infinity }
    },
    'shake': {
      whileHover: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.4 } }
    },
    'glow': {
      whileHover: {
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
        transition: { duration: 0.3 }
      }
    },
    'morph': {
      whileHover: { borderRadius: "50%", transition: { duration: 0.3 } },
      whileTap: { borderRadius: "4px", transition: { duration: 0.1 } }
    },
    'magnetic': {
      x: interactionState.magneticOffset.x,
      y: interactionState.magneticOffset.y,
      transition: { type: "spring", stiffness: 150, damping: 15 }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (interaction === 'magnetic' && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * 0.15
      const deltaY = (e.clientY - centerY) * 0.15

      setInteractionState(prev => ({
        ...prev,
        magneticOffset: { x: deltaX, y: deltaY }
      }))
    }
  }

  const handleMouseLeave = () => {
    setInteractionState(prev => ({
      ...prev,
      isHovered: false,
      magneticOffset: { x: 0, y: 0 }
    }))
  }

  const provideFeedback = () => {
    if (feedback === 'haptic' || feedback === 'all') {
      // Haptic feedback for supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }

    if (sound && (feedback === 'audio' || feedback === 'all')) {
      // Audio feedback - play a subtle click sound
      const audio = new Audio('/sounds/click.mp3')
      audio.volume = 0.1
      audio.play().catch(() => { /* Audio not available */ })
    }
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative px-4 py-2 rounded-lg bg-blue-500 text-white",
        "transform-gpu transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-400",
        className
      )}
      {...interactions[interaction]}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => {
        setInteractionState(prev => ({ ...prev, isClicked: true }))
        provideFeedback()
      }}
      onMouseUp={() => setInteractionState(prev => ({ ...prev, isClicked: false }))}
      {...props}
    >
      {/* Visual Feedback Overlays */}
      {(feedback === 'visual' || feedback === 'all') && (
        <motion.div
          className="absolute inset-0 bg-white rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: interactionState.isClicked ? 0.2 : 0 }}
          transition={{ duration: 0.1 }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// Context7 MCP Integration Component for 2025 GUI Features
export function Context7GUIProvider({
  children,
  features = {
    spatialMode: true,
    adaptiveTheme: 'lightning-dark',
    interactionMode: 'hybrid',
    personalizedUI: true,
    aiDrivenPersonalization: true,
    zeroUIMode: false,
    kineticTypography: true,
    microInteractions: true,
    glassmorphism: true,
    neuromorphism: false,
    liquidDesign: true,
    spatialComputing: true,
    gestureControls: true,
    voiceCommands: false,
    hapticFeedback: true,
    biometricAuth: false,
    contextualAdaptation: true
  } as GUI2025ContextState
}: {
  children: React.ReactNode,
  features?: Partial<GUI2025ContextState>
}) {
  const [guiState, setGuiState] = React.useState<GUI2025ContextState>({
    spatialMode: false,
    adaptiveTheme: 'auto',
    interactionMode: 'touch',
    personalizedUI: false,
    aiDrivenPersonalization: false,
    zeroUIMode: false,
    kineticTypography: false,
    microInteractions: false,
    glassmorphism: false,
    neuromorphism: false,
    liquidDesign: false,
    spatialComputing: false,
    gestureControls: false,
    voiceCommands: false,
    hapticFeedback: false,
    biometricAuth: false,
    contextualAdaptation: false,
    ...features
  })

  const contextValue = React.useMemo(() => ({
    guiState,
    updateGUIState: (updates: Partial<GUI2025ContextState>) => {
      setGuiState(prev => ({ ...prev, ...updates }))
    },
    toggleFeature: (feature: keyof GUI2025ContextState) => {
      setGuiState(prev => ({
        ...prev,
        [feature]: !prev[feature]
      }))
    }
  }), [guiState])

  return (
    <Context7GUIContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative min-h-screen transition-all duration-500",
          guiState.adaptiveTheme === 'lightning-dark' && "bg-gray-950 text-white",
          guiState.glassmorphism && "backdrop-blur-xl",
          guiState.spatialMode && "perspective-1000"
        )}
        data-gui-features={JSON.stringify(guiState)}
      >
        {/* GUI Features Status Indicator */}
        <motion.div
          className="fixed bottom-4 right-4 z-50 p-3 bg-black/80 text-white rounded-lg text-xs max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span className="font-semibold">2025 GUI Features Active</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(guiState)
              .filter(([_, value]) => value === true)
              .slice(0, 6)
              .map(([key]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full" />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))
            }
          </div>
        </motion.div>

        {children}
      </div>
    </Context7GUIContext.Provider>
  )
}

// Context7 MCP React Context
const Context7GUIContext = React.createContext<{
  guiState: GUI2025ContextState
  updateGUIState: (updates: Partial<GUI2025ContextState>) => void
  toggleFeature: (feature: keyof GUI2025ContextState) => void
} | null>(null)

export function useContext7GUI() {
  const context = React.useContext(Context7GUIContext)
  if (!context) {
    // Return default values when context is not available
    return {
      features: {
        spatialMode: false,
        adaptiveTheme: 'standard',
        interactionMode: 'standard',
        personalizedUI: false,
        aiDrivenPersonalization: false,
        zeroUIMode: false,
        microInteractions: false,
        hapticFeedback: false
      },
      isActive: false,
      updateFeatures: () => {},
      resetToDefaults: () => {}
    }
  }
  return context
}

export default Context7GUIProvider