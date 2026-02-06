'use client'

/**
 * Lightweight CSS-based Animation Components
 *
 * These components provide common animation patterns using CSS transitions
 * instead of framer-motion (5.3MB). Use these for simple animations to
 * reduce bundle size.
 *
 * For complex physics-based animations, use lazy-loaded framer-motion.
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// =====================================================
// FADE IN ANIMATION
// =====================================================

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number // ms
  duration?: number // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number // px
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 300,
  direction = 'up',
  distance = 20,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`
        case 'down':
          return `translateY(-${distance}px)`
        case 'left':
          return `translateX(${distance}px)`
        case 'right':
          return `translateX(-${distance}px)`
        default:
          return 'none'
      }
    }
    return 'none'
  }

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  )
}

// =====================================================
// SCROLL REVEAL ANIMATION
// =====================================================

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  threshold?: number // 0-1
  rootMargin?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin, once])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  )
}

// =====================================================
// STAGGER CHILDREN ANIMATION
// =====================================================

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  staggerDelay?: number // ms between each child
  initialDelay?: number // ms before first child
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 100,
  initialDelay = 0,
}: StaggerChildrenProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn
          key={index}
          delay={initialDelay + index * staggerDelay}
          direction="up"
        >
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// =====================================================
// SCALE ON HOVER
// =====================================================

interface ScaleOnHoverProps {
  children: ReactNode
  className?: string
  scale?: number
  duration?: number
}

export function ScaleOnHover({
  children,
  className,
  scale = 1.05,
  duration = 200,
}: ScaleOnHoverProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('cursor-pointer', className)}
      style={{
        transform: isHovered ? `scale(${scale})` : 'scale(1)',
        transition: `transform ${duration}ms ease-out`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}

// =====================================================
// PULSE ANIMATION
// =====================================================

interface PulseProps {
  children: ReactNode
  className?: string
  duration?: number // ms
}

export function Pulse({ children, className, duration = 2000 }: PulseProps) {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// =====================================================
// SLIDE IN ANIMATION
// =====================================================

interface SlideInProps {
  children: ReactNode
  className?: string
  direction: 'left' | 'right' | 'top' | 'bottom'
  duration?: number
  isOpen?: boolean
}

export function SlideIn({
  children,
  className,
  direction,
  duration = 300,
  isOpen = true,
}: SlideInProps) {
  const getTransform = () => {
    if (!isOpen) {
      switch (direction) {
        case 'left':
          return 'translateX(-100%)'
        case 'right':
          return 'translateX(100%)'
        case 'top':
          return 'translateY(-100%)'
        case 'bottom':
          return 'translateY(100%)'
      }
    }
    return 'translate(0)'
  }

  return (
    <div
      className={cn(className)}
      style={{
        transform: getTransform(),
        transition: `transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  )
}

// =====================================================
// COLLAPSE ANIMATION
// =====================================================

interface CollapseProps {
  children: ReactNode
  className?: string
  isOpen: boolean
  duration?: number
}

export function Collapse({
  children,
  className,
  isOpen,
  duration = 300,
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(isOpen ? 'auto' : '0px')

  useEffect(() => {
    if (isOpen) {
      const contentHeight = contentRef.current?.scrollHeight
      setHeight(`${contentHeight}px`)
      // After animation, set to auto for responsive content
      const timer = setTimeout(() => setHeight('auto'), duration)
      return () => clearTimeout(timer)
    } else {
      // First set explicit height, then animate to 0
      const contentHeight = contentRef.current?.scrollHeight
      setHeight(`${contentHeight}px`)
      requestAnimationFrame(() => {
        setHeight('0px')
      })
    }
  }, [isOpen, duration])

  return (
    <div
      ref={contentRef}
      className={cn('overflow-hidden', className)}
      style={{
        height,
        transition: `height ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  )
}

// =====================================================
// SKELETON LOADER
// =====================================================

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variantClasses[variant],
        className
      )}
      style={{
        width: width ?? '100%',
        height: height ?? (variant === 'text' ? '1rem' : '100%'),
      }}
    />
  )
}

// =====================================================
// NUMBER COUNTER ANIMATION
// =====================================================

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

export function CountUp({
  end,
  start = 0,
  duration = 1000,
  className,
  formatter = (v) => v.toLocaleString(),
}: CountUpProps) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    const steps = 60
    const increment = (end - start) / steps
    const stepDuration = duration / steps
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [start, end, duration])

  return <span className={className}>{formatter(count)}</span>
}

// =====================================================
// TYPEWRITER EFFECT
// =====================================================

interface TypewriterProps {
  text: string
  className?: string
  speed?: number // ms per character
  delay?: number // initial delay
}

export function Typewriter({
  text,
  className,
  speed = 50,
  delay = 0,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setIsStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!isStarted) return

    let currentIndex = 0
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, isStarted])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
