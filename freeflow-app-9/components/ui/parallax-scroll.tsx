'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Premium Parallax Scroll Component
 * Creates depth and movement based on scroll position
 */
interface ParallaxScrollProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down'
  offset?: number
}

export function ParallaxScroll({
  children,
  className,
  speed = 0.5,
  direction = 'up',
  offset = 0
}: ParallaxScrollProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const multiplier = direction === 'up' ? -1 : 1
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [offset, multiplier * speed * 200 + offset]
  )

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Parallax Image
 * Image with parallax scrolling effect
 */
interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number
  scale?: number
}

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.5,
  scale = 1.2
}: ParallaxImageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 100])
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [scale, 1, scale])

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: scaleValue }}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

/**
 * Parallax Layer
 * Create multi-layer parallax effects
 */
interface ParallaxLayerProps {
  children: React.ReactNode
  className?: string
  depth?: number
  baseSpeed?: number
}

export function ParallaxLayer({
  children,
  className,
  depth = 1,
  baseSpeed = 50
}: ParallaxLayerProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -baseSpeed * depth]
  )

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  )

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Parallax Section
 * Full section with parallax background
 */
interface ParallaxSectionProps {
  children: React.ReactNode
  className?: string
  backgroundImage?: string
  backgroundClassName?: string
  speed?: number
  overlay?: boolean
}

export function ParallaxSection({
  children,
  className,
  backgroundImage,
  backgroundClassName,
  speed = 0.5,
  overlay = true
}: ParallaxSectionProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200])

  return (
    <section ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Parallax Background */}
      {backgroundImage && (
        <motion.div
          style={{ y }}
          className={cn(
            'absolute inset-0 -z-10',
            backgroundClassName
          )}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {overlay && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/80" />
          )}
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}

/**
 * Parallax Text
 * Text with depth effect on scroll
 */
interface ParallaxTextProps {
  children: React.ReactNode
  className?: string
  speed?: number
  blur?: boolean
}

export function ParallaxText({
  children,
  className,
  speed = 0.3,
  blur = false
}: ParallaxTextProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const blurTransform = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 10])
  const blurValue = blur ? blurTransform : undefined

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        opacity,
        filter: blurValue ? blurValue.get() ? `blur(${blurValue.get()}px)` : undefined : undefined
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ParallaxScroll
