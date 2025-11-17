'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Accessibility Context
interface AccessibilityContextType {
  announcements: string[]
  announce: (message: string) => void
  focusRing: boolean
  setFocusRing: (enabled: boolean) => void
  reducedMotion: boolean
  setReducedMotion: (enabled: boolean) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  fontSize: 'small' | 'medium' | 'large'
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

// Screen Reader Announcer Component
export function ScreenReaderAnnouncer() {
  const { announcements } = useAccessibility()

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  )
}

// Skip Links Component
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </a>
    </div>
  )
}

// Accessibility Provider
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = React.useState<string[]>([])
  const [focusRing, setFocusRing] = React.useState(true)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [highContrast, setHighContrast] = React.useState(false)
  const [fontSize, setFontSize] = React.useState<'small' | 'medium' | 'large'>('medium')

  // Detect system preferences
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setReducedMotion(prefersReducedMotion)

      // Check for high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      setHighContrast(prefersHighContrast)
    }
  }, [])

  const announce = React.useCallback((message: string) => {
    setAnnouncements((prev) => [...prev, message])
    // Clear announcements after a delay to prevent accumulation
    setTimeout(() => {
      setAnnouncements((prev) => prev.slice(1))
    }, 1000)
  }, [])

  // Apply accessibility settings to document
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement

      // Apply focus ring setting
      root.classList.toggle('no-focus-ring', !focusRing)

      // Apply reduced motion setting
      root.classList.toggle('reduce-motion', reducedMotion)

      // Apply high contrast setting
      root.classList.toggle('high-contrast', highContrast)

      // Apply font size setting
      root.classList.remove('font-small', 'font-medium', 'font-large')
      root.classList.add(`font-${fontSize}`)
    }
  }, [focusRing, reducedMotion, highContrast, fontSize])

  const contextValue: AccessibilityContextType = {
    announcements,
    announce,
    focusRing,
    setFocusRing,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <SkipLinks />
      <ScreenReaderAnnouncer />
      {children}
    </AccessibilityContext.Provider>
  )
}

// Hook to use accessibility context
export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Enhanced Button with accessibility features
export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    loading?: boolean
    loadingText?: string
    announceOnClick?: string
  }
>(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  loading = false,
  loadingText = 'Loading...',
  announceOnClick,
  onClick,
  children,
  disabled,
  ...props 
}, ref) => {
  const { announce } = useAccessibility()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (announceOnClick) {
      announce(announceOnClick)
    }
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          'text-primary underline-offset-4 hover:underline': variant === 'link',
        },
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">{loadingText}</span>
          {size !== 'icon' && loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
})
AccessibleButton.displayName = 'AccessibleButton'

// Enhanced Input with accessibility features
export const AccessibleInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    description?: string
    error?: string
    required?: boolean
  }
>(({ className, type, label, description, error, required, id, ...props }, ref) => {
  const inputId = id || React.useId()
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && "after:content-['*'] after:text-destructive after:ml-1"
          )}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        id={inputId}
        aria-describedby={cn(descriptionId, errorId)}
        aria-invalid={!!error}
        aria-required={required}
        {...props}
      />
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
AccessibleInput.displayName = 'AccessibleInput'

// Focus Trap Component
export function FocusTrap({ 
  children, 
  enabled = true 
}: { 
  children: React.ReactNode
  enabled?: boolean 
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}

// Keyboard Navigation Hook
export function useKeyboardNavigation(
  items: string[],
  onSelect: (item: string) => void
) {
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect(items[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setActiveIndex(-1)
        break
    }
  }, [items, activeIndex, onSelect])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { activeIndex, setActiveIndex }
}

// ARIA Live Region Hook
export function useAriaLive() {
  const { announce } = useAccessibility()
  
  const announcePolite = React.useCallback((message: string) => {
    announce(message)
  }, [announce])

  const announceAssertive = React.useCallback((message: string) => {
    // For assertive announcements, we can create a temporary element
    const element = document.createElement('div')
    element.setAttribute('aria-live', 'assertive')
    element.setAttribute('aria-atomic', 'true')
    element.className = 'sr-only'
    element.textContent = message
    
    document.body.appendChild(element)
    
    setTimeout(() => {
      document.body.removeChild(element)
    }, 1000)
  }, [])

  return { announcePolite, announceAssertive }
}



