"use client"

import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { useRef, ReactNode } from "react"

/**
 * Enhanced Scroll Animations - 2025 UI/UX Trend
 * Scroll-triggered animations, parallax effects, and scrollytelling
 */

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
}

/**
 * FadeInOnScroll - Fades in element when scrolled into view
 *
 * Usage:
 * ```tsx
 * <FadeInOnScroll>
 *   <div>Content here</div>
 * </FadeInOnScroll>
 * ```
 */
export function FadeInOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * SlideInOnScroll - Slides in from direction when scrolled into view
 *
 * Usage:
 * ```tsx
 * <SlideInOnScroll direction="left">
 *   <div>Content here</div>
 * </SlideInOnScroll>
 * ```
 */
interface SlideInProps extends ScrollAnimationProps {
  direction?: "left" | "right" | "up" | "down"
  delay?: number
}

export function SlideInOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
}: SlideInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const directionOffset = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 },
  }

  const initial = directionOffset[direction]
  const animate = isInView ? { x: 0, y: 0, opacity: 1 } : { ...initial, opacity: 0 }

  return (
    <motion.div
      ref={ref}
      initial={{ ...initial, opacity: 0 }}
      animate={animate}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScaleInOnScroll - Scales in when scrolled into view
 *
 * Usage:
 * ```tsx
 * <ScaleInOnScroll>
 *   <div>Content here</div>
 * </ScaleInOnScroll>
 * ```
 */
export function ScaleInOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * ParallaxSection - Parallax scrolling effect
 *
 * Usage:
 * ```tsx
 * <ParallaxSection speed={0.5}>
 *   <div>Slow moving content</div>
 * </ParallaxSection>
 * ```
 */
interface ParallaxProps extends ScrollAnimationProps {
  speed?: number // 0 = no movement, 1 = normal speed, <1 = slower, >1 = faster
}

export function ParallaxSection({ children, className, speed = 0.5 }: ParallaxProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  )
}

/**
 * ProgressBar - Scroll progress indicator
 *
 * Usage:
 * ```tsx
 * <ProgressBar />
 * ```
 */
export function ProgressBar({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 origin-left z-50",
        className
      )}
      style={{ scaleX }}
    />
  )
}

/**
 * StickySection - Element sticks during scroll
 *
 * Usage:
 * ```tsx
 * <StickySection>
 *   <div>Sticky content</div>
 * </StickySection>
 * ```
 */
export function StickySection({ children, className }: ScrollAnimationProps) {
  return (
    <div className={cn("sticky top-20 z-10", className)}>
      {children}
    </div>
  )
}

/**
 * RevealOnScroll - Reveals content with masking effect
 *
 * Usage:
 * ```tsx
 * <RevealOnScroll>
 *   <h1>Hidden until scrolled</h1>
 * </RevealOnScroll>
 * ```
 */
export function RevealOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        initial={{ y: 100 }}
        animate={isInView ? { y: 0 } : { y: 100 }}
        transition={{ duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * StaggeredList - Staggers animation of list items
 *
 * Usage:
 * ```tsx
 * <StaggeredList>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredList>
 * ```
 */
interface StaggeredListProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.1,
}: StaggeredListProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}

/**
 * ScrollTriggeredCounter - Counts up when scrolled into view
 *
 * Usage:
 * ```tsx
 * <ScrollTriggeredCounter end={1000} suffix="+" />
 * ```
 */
interface CounterProps {
  end: number
  start?: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function ScrollTriggeredCounter({
  end,
  start = 0,
  duration = 2,
  suffix = "",
  prefix = "",
  className,
}: CounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useTransform(
    useSpring(isInView ? end : start, {
      stiffness: 50,
      damping: 30,
      duration: duration * 1000,
    }),
    (value) => Math.round(value)
  )

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>{count}</motion.span>
      {suffix}
    </motion.span>
  )
}

/**
 * ScrollFadeGradient - Fades with gradient effect on scroll
 *
 * Usage:
 * ```tsx
 * <ScrollFadeGradient>
 *   <div>Content with gradient fade</div>
 * </ScrollFadeGradient>
 * ```
 */
export function ScrollFadeGradient({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  return (
    <motion.div ref={ref} style={{ opacity }} className={className}>
      {children}
    </motion.div>
  )
}

/**
 * HorizontalScroll - Horizontal scrolling section
 *
 * Usage:
 * ```tsx
 * <HorizontalScroll>
 *   <div>Scroll horizontally</div>
 * </HorizontalScroll>
 * ```
 */
export function HorizontalScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ x }} className="flex gap-4 will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

/**
 * ZoomOnScroll - Zooms in/out based on scroll
 *
 * Usage:
 * ```tsx
 * <ZoomOnScroll>
 *   <img src="image.jpg" alt="Zoom effect" / loading="lazy">
 * </ZoomOnScroll>
 * ```
 */
export function ZoomOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  return (
    <motion.div ref={ref} style={{ scale }} className={cn("overflow-hidden", className)}>
      {children}
    </motion.div>
  )
}

/**
 * RotateOnScroll - Rotates based on scroll position
 *
 * Usage:
 * ```tsx
 * <RotateOnScroll>
 *   <div>Rotating content</div>
 * </RotateOnScroll>
 * ```
 */
export function RotateOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <motion.div ref={ref} style={{ rotate }} className={className}>
      {children}
    </motion.div>
  )
}

/**
 * BlurOnScroll - Blurs content based on scroll
 *
 * Usage:
 * ```tsx
 * <BlurOnScroll>
 *   <div>Blurring content</div>
 * </BlurOnScroll>
 * ```
 */
export function BlurOnScroll({ children, className }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 10])
  const filter = useTransform(blur, (value) => `blur(${value}px)`)

  return (
    <motion.div ref={ref} style={{ filter }} className={className}>
      {children}
    </motion.div>
  )
}
