"use client"

import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion"
import { ReactNode, useRef } from "react"

/**
 * 3D Effects & Depth Library - A+++ UI/UX
 * Premium 3D transformations and depth effects for immersive experiences
 */

// ============================================================================
// PARALLAX EFFECTS
// ============================================================================

interface ParallaxCardProps {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * ParallaxCard - Card with parallax 3D effect on mouse move
 */
export function ParallaxCard({ children, className, strength = 15 }: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [strength, -strength])
  const rotateY = useTransform(x, [-0.5, 0.5], [-strength, strength])

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
      className={cn("relative", className)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ParallaxLayers - Multi-layer parallax effect
 */
interface ParallaxLayersProps {
  children: ReactNode[]
  className?: string
}

// Separate component for each parallax layer to properly use hooks
interface ParallaxLayerItemProps {
  child: ReactNode
  index: number
  x: MotionValue<number>
  y: MotionValue<number>
}

function ParallaxLayerItem({ child, index, x, y }: ParallaxLayerItemProps) {
  const depth = (index + 1) * 20
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })
  const translateX = useTransform(springX, (value) => value * (index + 1))
  const translateY = useTransform(springY, (value) => value * (index + 1))

  return (
    <motion.div
      style={{
        x: translateX,
        y: translateY,
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-0"
    >
      {child}
    </motion.div>
  )
}

export function ParallaxLayers({ children, className }: ParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / 50)
    y.set((e.clientY - centerY) / 50)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative perspective-1000", className)}
    >
      {children.map((child, index) => (
        <ParallaxLayerItem key={index} child={child} index={index} x={x} y={y} />
      ))}
    </div>
  )
}

// ============================================================================
// FLOATING EFFECTS
// ============================================================================

/**
 * FloatingElement - Continuous floating animation with depth
 */
export function FloatingElement({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        rotateX: [0, 5, 0],
        rotateY: [0, 5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FloatingCard - Card with gentle floating animation
 */
export function FloatingCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// DEPTH CARDS
// ============================================================================

/**
 * DepthCard - Card with layered depth effect
 */
export function DepthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative group", className)}>
      {/* Shadow layers for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 transform translate-y-4" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 transform translate-y-2" />

      {/* Main content */}
      <motion.div
        className="relative bg-card rounded-2xl border border-border shadow-xl"
        whileHover={{
          y: -8,
          transition: { duration: 0.2 },
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * LayeredCard - Card with multiple 3D layers
 */
export function LayeredCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / (rect.width / 2))
    y.set((e.clientY - centerY) / (rect.height / 2))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative", className)}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl opacity-20"
        style={{ transform: "translateZ(-50px)" }}
      />

      {/* Middle layer */}
      <div
        className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-2xl border border-border"
        style={{ transform: "translateZ(25px)" }}
      />

      {/* Front layer */}
      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl p-6"
        style={{ transform: "translateZ(50px)" }}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ============================================================================
// ISOMETRIC ELEMENTS
// ============================================================================

/**
 * IsometricCard - Card with isometric 3D perspective
 */
export function IsometricCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(15deg) rotateY(-15deg)",
      }}
      whileHover={{
        rotateX: 20,
        rotateY: -20,
        scale: 1.05,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl p-6">
        {children}

        {/* Side panels for 3D effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent rounded-2xl"
          style={{ transform: "translateZ(-10px)" }}
        />
      </div>
    </motion.div>
  )
}

/**
 * IsometricButton - Button with isometric effect
 */
export function IsometricButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative px-6 py-3 rounded-lg",
        "bg-gradient-to-br from-violet-600 to-purple-600",
        "text-white font-semibold",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.05,
        rotateX: 5,
        rotateY: 5,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Button face */}
      <span
        className="relative z-10"
        style={{ transform: "translateZ(10px)" }}
      >
        {children}
      </span>

      {/* Button depth */}
      <div
        className="absolute inset-0 bg-purple-700 rounded-lg"
        style={{ transform: "translateZ(-5px)" }}
      />
    </motion.button>
  )
}

// ============================================================================
// PERSPECTIVE HOVER EFFECTS
// ============================================================================

/**
 * PerspectiveImage - Image with 3D perspective on hover
 */
export function PerspectiveImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
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

    x.set((e.clientX - centerX) / (rect.width / 2))
    y.set((e.clientY - centerY) / (rect.height / 2))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative overflow-hidden rounded-2xl", className)}
    >
      <img src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ transform: "translateZ(50px)" }}
      / loading="lazy">

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
        style={{
          transform: "translateZ(60px)",
        }}
      />
    </motion.div>
  )
}

// ============================================================================
// STACK EFFECTS
// ============================================================================

/**
 * StackedCards - Cards stacked with 3D depth
 */
export function StackedCards({
  items,
  className,
}: {
  items: ReactNode[]
  className?: string
}) {
  return (
    <div className={cn("relative perspective-1000", className)} style={{ height: "400px" }}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-card rounded-2xl border border-border shadow-lg p-6"
          style={{
            transformStyle: "preserve-3d",
            zIndex: items.length - index,
          }}
          initial={{
            rotateX: 0,
            y: 0,
            scale: 1 - index * 0.05,
          }}
          whileHover={{
            rotateX: -5,
            y: -index * 20,
            scale: 1,
            zIndex: items.length + 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// RIBBON EFFECTS
// ============================================================================

/**
 * RibbonCard - Card with 3D ribbon corner
 */
export function RibbonCard({
  children,
  ribbon,
  className,
}: {
  children: ReactNode
  ribbon: string
  className?: string
}) {
  return (
    <div className={cn("relative perspective-1000", className)}>
      <motion.div
        className="relative bg-card rounded-2xl border border-border shadow-xl p-6"
        style={{ transformStyle: "preserve-3d" }}
        whileHover={{ rotateY: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}

        {/* 3D Ribbon */}
        <div className="absolute -top-3 -right-3 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
          <motion.div
            className="px-8 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg"
            style={{
              transform: "translateZ(20px) rotateZ(45deg)",
              transformOrigin: "bottom left",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {ribbon}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================================
// GLASSMORPHISM 3D
// ============================================================================

/**
 * Glass3DCard - Glassmorphism card with 3D depth
 */
export function Glass3DCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / (rect.width / 2))
    y.set((e.clientY - centerY) / (rect.height / 2))
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white/10 backdrop-blur-xl",
        "border border-white/20",
        "shadow-2xl",
        className
      )}
    >
      <div
        className="p-6"
        style={{ transform: "translateZ(50px)" }}
      >
        {children}
      </div>

      {/* Glossy overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
        style={{ transform: "translateZ(60px)" }}
      />
    </motion.div>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * // Parallax card
 * <ParallaxCard className="p-6 bg-card">
 *   <h3>Hover me for 3D effect</h3>
 * </ParallaxCard>
 *
 * // Floating element
 * <FloatingElement>
 *   <div className="w-20 h-20 bg-violet-500 rounded-full" />
 * </FloatingElement>
 *
 * // Depth card
 * <DepthCard>
 *   <h3>Card with layered depth</h3>
 *   <p>Multiple shadow layers create immersive depth</p>
 * </DepthCard>
 *
 * // Isometric button
 * <IsometricButton onClick={handleClick}>
 *   Click Me
 * </IsometricButton>
 *
 * // Stacked cards
 * <StackedCards
 *   items={[
 *     <div>Card 1</div>,
 *     <div>Card 2</div>,
 *     <div>Card 3</div>,
 *   ]}
 * />
 * ```
 */
