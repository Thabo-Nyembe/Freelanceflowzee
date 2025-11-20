'use client'

import { useEffect } from 'react'

/**
 * Premium Smooth Scroll Hook
 * Enables smooth scrolling behavior across the entire platform
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Enable smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])
}

/**
 * Scroll To Element Utility
 * Smooth scroll to any element with custom offset
 */
export function scrollToElement(
  elementId: string,
  options?: {
    offset?: number
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
  }
) {
  const element = document.getElementById(elementId)
  if (!element) return

  const offset = options?.offset || 0
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: options?.behavior || 'smooth'
  })
}

/**
 * Scroll To Top Utility
 * Smooth scroll to top of page
 */
export function scrollToTop(behavior: ScrollBehavior = 'smooth') {
  window.scrollTo({
    top: 0,
    behavior
  })
}

/**
 * Premium Smooth Scroll Container
 * Container with smooth scrolling and custom easing
 */
interface SmoothScrollContainerProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

export function SmoothScrollContainer({
  children,
  className = ''
}: SmoothScrollContainerProps) {
  return (
    <div
      className={`smooth-scroll-container ${className}`}
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  )
}

export default useSmoothScroll
