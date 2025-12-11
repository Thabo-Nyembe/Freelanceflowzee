"use client"

import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useState, useRef, ReactNode } from "react"

/**
 * Micro-Interactions Library - A+++ UI/UX
 * Premium animations and interactions for delightful user experiences
 */

// ============================================================================
// BUTTON MICRO-INTERACTIONS
// ============================================================================

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

/**
 * MagneticButton - Button that follows cursor with magnetic effect
 *
 * Usage:
 * ```tsx
 * <MagneticButton>Click me!</MagneticButton>
 * ```
 */
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3",
        "bg-gradient-to-r from-violet-600 to-purple-600",
        "text-white font-semibold",
        "transition-all duration-200",
        "hover:shadow-xl hover:shadow-violet-500/50",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}

/**
 * RippleButton - Material design ripple effect
 */
interface RippleButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function RippleButton({ children, className, onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples([...ripples, newRipple])

    setTimeout(() => {
      setRipples(ripples => ripples.filter(r => r.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3",
        "bg-primary text-primary-foreground",
        "font-semibold transition-all duration-200",
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}

      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </motion.button>
  )
}

/**
 * PulseButton - Pulsing attention-grabbing button
 */
export function PulseButton({ children, className, onClick }: RippleButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative rounded-lg px-6 py-3",
        "bg-gradient-to-r from-pink-500 to-rose-500",
        "text-white font-semibold",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-pink-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// ============================================================================
// CARD MICRO-INTERACTIONS
// ============================================================================

interface TiltCardProps {
  children: ReactNode
  className?: string
}

/**
 * TiltCard - 3D tilt effect on hover
 */
export function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = (e.clientX - centerX) / (rect.width / 2)
    const distanceY = (e.clientY - centerY) / (rect.height / 2)

    x.set(distanceX)
    y.set(distanceY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl bg-card p-6",
        "border border-border shadow-lg",
        "transition-shadow duration-300",
        "hover:shadow-2xl",
        className
      )}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  )
}

/**
 * HoverLiftCard - Lifts up on hover with shadow
 */
export function HoverLiftCard({ children, className }: TiltCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-card p-6 border border-border",
        "cursor-pointer",
        className
      )}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FlipCard - Card that flips to show back content
 */
interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className={cn("perspective-1000", className)}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-card p-6 border border-border"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-card p-6 border border-border"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================================
// INPUT MICRO-INTERACTIONS
// ============================================================================

interface AnimatedInputProps {
  label: string
  type?: string
  placeholder?: string
  className?: string
}

/**
 * FloatingLabelInput - Floating label animation on focus
 */
export function FloatingLabelInput({
  label,
  type = "text",
  placeholder,
  className
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <motion.label
        className="absolute left-3 text-muted-foreground pointer-events-none"
        animate={{
          top: isFocused || hasValue ? "0.25rem" : "50%",
          fontSize: isFocused || hasValue ? "0.75rem" : "1rem",
          y: isFocused || hasValue ? 0 : "-50%",
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border bg-background",
          "px-3 pt-6 pb-2 text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "transition-all duration-200"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)
          setHasValue(e.target.value.length > 0)
        }}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
      />
    </div>
  )
}

/**
 * GlowingInput - Input with glowing border on focus
 */
export function GlowingInput({ label, type = "text", className }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <label className="block text-sm font-medium mb-2">{label}</label>

      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused
            ? "0 0 20px rgba(139, 92, 246, 0.3)"
            : "0 0 0 rgba(139, 92, 246, 0)",
        }}
        transition={{ duration: 0.3 }}
      >
        <input
          type={type}
          className={cn(
            "w-full rounded-lg border-2 bg-background px-4 py-2",
            "focus:outline-none transition-all duration-200",
            isFocused ? "border-violet-500" : "border-border"
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </motion.div>
    </div>
  )
}

// ============================================================================
// TOGGLE & SWITCH MICRO-INTERACTIONS
// ============================================================================

interface AnimatedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

/**
 * AnimatedToggle - Smooth toggle switch with spring animation
 */
export function AnimatedToggle({ checked, onChange, label }: AnimatedToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm font-medium">{label}</span>}

      <motion.button
        className={cn(
          "relative w-14 h-7 rounded-full",
          "transition-colors duration-200",
          checked ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-700"
        )}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{
            left: checked ? "calc(100% - 1.5rem)" : "0.25rem",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </motion.button>
    </div>
  )
}

// ============================================================================
// ICON ANIMATIONS
// ============================================================================

interface AnimatedIconProps {
  icon: ReactNode
  className?: string
}

/**
 * BounceIcon - Icon bounces on hover
 */
export function BounceIcon({ icon, className }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      whileHover={{
        y: [0, -10, 0],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {icon}
    </motion.div>
  )
}

/**
 * SpinIcon - Icon spins on hover
 */
export function SpinIcon({ icon, className }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      whileHover={{
        rotate: 360,
        transition: { duration: 0.6 },
      }}
    >
      {icon}
    </motion.div>
  )
}

/**
 * PulseIcon - Icon pulses continuously
 */
export function PulseIcon({ icon, className }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {icon}
    </motion.div>
  )
}

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * GradientHover - Text with gradient on hover
 */
export function GradientHover({ children, className }: { children: ReactNode; className?: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className={cn(
          "inline-block",
          isHovered && "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        )}
        animate={{
          backgroundPosition: isHovered ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%",
        }}
        transition={{
          duration: 3,
          repeat: isHovered ? Infinity : 0,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      >
        {children}
      </motion.span>
    </motion.div>
  )
}

/**
 * UnderlineHover - Animated underline on hover
 */
export function UnderlineHover({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("relative inline-block cursor-pointer", className)}
      initial="rest"
      whileHover="hover"
    >
      <span>{children}</span>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600"
        variants={{
          rest: { width: "0%" },
          hover: { width: "100%" },
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// ============================================================================
// BADGE ANIMATIONS
// ============================================================================

/**
 * PoppingBadge - Badge with pop animation
 */
interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: "default" | "success" | "warning" | "error"
}

export function PoppingBadge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <motion.span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15,
      }}
      whileHover={{ scale: 1.1 }}
    >
      {children}
    </motion.span>
  )
}

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

/**
 * DotLoader - Three dots bouncing loader
 */
export function DotLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-600"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

/**
 * SpinLoader - Spinning circle loader
 */
export function SpinLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full", className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

/**
 * PulseLoader - Pulsing circle loader
 */
export function PulseLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("w-8 h-8 rounded-full bg-violet-600", className)}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

// Add CSS for backface-hidden and perspective
const styles = `
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.perspective-1000 {
  perspective: 1000px;
}
`

// Note: Add styles to globals.css
