"use client"

import { cn } from "@/lib/utils"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

/**
 * Kinetic Typography Components - 2025 UI/UX Trend
 * Animated, dynamic text effects for hero sections and headings
 */

interface KineticTextProps {
  children: string
  className?: string
  delay?: number
}

/**
 * AnimatedWord - Animates each word individually
 *
 * Usage:
 * ```tsx
 * <AnimatedWord>Transform Your Workflow</AnimatedWord>
 * ```
 */
export function AnimatedWord({ children, className, delay = 0 }: KineticTextProps) {
  const words = children.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  }

  return (
    <motion.div
      className={cn("flex flex-wrap gap-x-2", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

/**
 * AnimatedLetter - Animates each letter individually
 *
 * Usage:
 * ```tsx
 * <AnimatedLetter>KAZI</AnimatedLetter>
 * ```
 */
export function AnimatedLetter({ children, className, delay = 0 }: KineticTextProps) {
  const letters = Array.from(children)

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      rotate: -5,
    },
  }

  return (
    <motion.div
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ display: letter === " " ? "inline" : "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}

/**
 * GradientText - Animated gradient text effect
 *
 * Usage:
 * ```tsx
 * <GradientText>World-Class Platform</GradientText>
 * ```
 */
interface GradientTextProps {
  children: string
  className?: string
  from?: string
  via?: string
  to?: string
}

export function GradientText({
  children,
  className,
  from = "from-violet-600",
  via = "via-purple-600",
  to = "to-pink-600",
}: GradientTextProps) {
  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        "animate-gradient",
        from,
        via,
        to,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  )
}

/**
 * TypewriterText - Typewriter animation effect
 *
 * Usage:
 * ```tsx
 * <TypewriterText>Build. Ship. Scale.</TypewriterText>
 * ```
 */
export function TypewriterText({ children, className, delay = 0 }: KineticTextProps) {
  const [displayText, setDisplayText] = React.useState("")
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (currentIndex < children.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + children[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 50 + delay)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, children, delay])

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-full bg-current ml-1"
      />
    </span>
  )
}

/**
 * WaveText - Wave animation on hover
 *
 * Usage:
 * ```tsx
 * <WaveText>Hover Me!</WaveText>
 * ```
 */
export function WaveText({ children, className }: { children: string; className?: string }) {
  const letters = Array.from(children)

  return (
    <motion.div className={cn("inline-flex", className)}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block cursor-pointer"
          whileHover={{
            y: -10,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 10,
            },
          }}
          style={{ display: letter === " " ? "inline" : "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}

/**
 * GlitchText - Glitch animation effect
 *
 * Usage:
 * ```tsx
 * <GlitchText>GLITCH</GlitchText>
 * ```
 */
export function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 -z-10 text-red-500"
        style={{
          animation: "glitch-1 0.5s infinite",
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
        }}
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 -z-10 text-blue-500"
        style={{
          animation: "glitch-2 0.5s infinite",
          clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
        }}
      >
        {children}
      </span>
    </div>
  )
}

/**
 * ScrollRevealText - Reveals text on scroll
 *
 * Usage:
 * ```tsx
 * <ScrollRevealText>Scroll to reveal</ScrollRevealText>
 * ```
 */
export function ScrollRevealText({ children, className }: { children: string; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const words = children.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={cn("flex flex-wrap gap-x-2", className)}
      variants={container}
      initial="hidden"
      animate={controls}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

/**
 * FloatingText - Floating animation effect
 *
 * Usage:
 * ```tsx
 * <FloatingText>Floating Text</FloatingText>
 * ```
 */
export function FloatingText({ children, className }: { children: string; className?: string }) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      animate={{
        y: [-5, 5, -5],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ShimmerText - Shimmer effect on text
 *
 * Usage:
 * ```tsx
 * <ShimmerText>Shimmer Effect</ShimmerText>
 * ```
 */
export function ShimmerText({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("relative inline-block overflow-hidden", className)}>
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

// Add these keyframes to globals.css for glitch effect
const glitchKeyframes = `
@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
`

// Note: Add glitchKeyframes to globals.css

import React from 'react'
