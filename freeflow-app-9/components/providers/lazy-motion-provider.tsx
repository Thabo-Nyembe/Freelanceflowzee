'use client'

import { LazyMotion } from 'framer-motion'
import { ReactNode } from 'react'

// Async load animation features - defers until after initial render
const loadFeatures = () =>
  import('framer-motion').then((mod) => mod.domAnimation)

interface LazyMotionProviderProps {
  children: ReactNode
}

/**
 * LazyMotion Provider for optimized framer-motion bundle
 * Features load asynchronously after initial hydration
 * Reduces initial JS execution time
 */
export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures}>
      {children}
    </LazyMotion>
  )
}
