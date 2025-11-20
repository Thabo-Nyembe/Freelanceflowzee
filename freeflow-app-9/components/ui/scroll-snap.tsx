'use client'

import { cn } from '@/lib/utils'

/**
 * Premium Scroll Snap Container
 * Enables smooth scroll snapping for sections
 */
interface ScrollSnapContainerProps {
  children: React.ReactNode
  className?: string
  type?: 'mandatory' | 'proximity'
  axis?: 'x' | 'y' | 'both'
  align?: 'start' | 'center' | 'end'
}

export function ScrollSnapContainer({
  children,
  className,
  type = 'mandatory',
  axis = 'y',
  align = 'start'
}: ScrollSnapContainerProps) {
  const snapTypeClass = {
    x: `scroll-snap-type-x scroll-snap-${type}`,
    y: `scroll-snap-type-y scroll-snap-${type}`,
    both: `scroll-snap-type-both scroll-snap-${type}`
  }[axis]

  return (
    <div
      className={cn(
        'overflow-auto',
        snapTypeClass,
        className
      )}
      style={{
        scrollSnapType: `${axis === 'both' ? 'both' : axis} ${type}`,
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  )
}

/**
 * Scroll Snap Item
 * Individual snap point section
 */
interface ScrollSnapItemProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  stop?: 'normal' | 'always'
}

export function ScrollSnapItem({
  children,
  className,
  align = 'start',
  stop = 'normal'
}: ScrollSnapItemProps) {
  return (
    <div
      className={cn('scroll-snap-item', className)}
      style={{
        scrollSnapAlign: align,
        scrollSnapStop: stop
      }}
    >
      {children}
    </div>
  )
}

/**
 * Horizontal Scroll Snap
 * Pre-configured horizontal scroll snap container
 */
interface HorizontalScrollSnapProps {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  gap?: number
}

export function HorizontalScrollSnap({
  children,
  className,
  itemClassName,
  gap = 4
}: HorizontalScrollSnapProps) {
  return (
    <ScrollSnapContainer
      axis="x"
      type="proximity"
      className={cn(
        'flex overflow-x-auto scrollbar-hide',
        `gap-${gap}`,
        className
      )}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollSnapItem
              key={index}
              align="center"
              className={cn('flex-shrink-0', itemClassName)}
            >
              {child}
            </ScrollSnapItem>
          ))
        : children}
    </ScrollSnapContainer>
  )
}

/**
 * Full Page Scroll Snap
 * Full viewport sections with scroll snap
 */
interface FullPageScrollSnapProps {
  children: React.ReactNode
  className?: string
}

export function FullPageScrollSnap({
  children,
  className
}: FullPageScrollSnapProps) {
  return (
    <ScrollSnapContainer
      axis="y"
      type="mandatory"
      className={cn('h-screen overflow-y-auto', className)}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollSnapItem
              key={index}
              align="start"
              stop="always"
              className="min-h-screen"
            >
              {child}
            </ScrollSnapItem>
          ))
        : children}
    </ScrollSnapContainer>
  )
}

export default ScrollSnapContainer
