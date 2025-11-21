/**
 * Accessibility (A11y) Utilities
 * Helpers for improving accessibility and WCAG compliance
 */

'use client'

import { useEffect, useRef, MutableRefObject } from 'react'

// ARIA live region announcer
export class LiveAnnouncer {
  private static instance: LiveAnnouncer
  private liveRegion: HTMLDivElement | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      this.createLiveRegion()
    }
  }

  static getInstance(): LiveAnnouncer {
    if (!LiveAnnouncer.instance) {
      LiveAnnouncer.instance = new LiveAnnouncer()
    }
    return LiveAnnouncer.instance
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('role', 'status')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.className = 'sr-only'
    document.body.appendChild(this.liveRegion)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return

    this.liveRegion.setAttribute('aria-live', priority)
    this.liveRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = ''
      }
    }, 1000)
  }
}

// Hook for announcing messages to screen readers
export function useAnnouncer() {
  const announcer = LiveAnnouncer.getInstance()

  return {
    announce: (message: string, priority?: 'polite' | 'assertive') =>
      announcer.announce(message, priority)
  }
}

// Focus trap hook for modals/dialogs
export function useFocusTrap<T extends HTMLElement>(isActive: boolean): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    const element = ref.current
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstFocusable?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    return () => element.removeEventListener('keydown', handleTabKey)
  }, [isActive])

  return ref
}

// Focus management - restore focus after modal closes
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    previousFocusRef.current?.focus()
    previousFocusRef.current = null
  }

  return { saveFocus, restoreFocus }
}

// Skip to main content link
export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>
  )
}

// Visually hidden but accessible to screen readers
export function visuallyHidden(text: string): { 'aria-label': string; className: string } {
  return {
    'aria-label': text,
    className: 'sr-only'
  }
}

// Check color contrast ratio (WCAG AA requires 4.5:1 for normal text)
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Simple RGB extraction (assumes hex format)
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// Check if contrast meets WCAG standards
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  large: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  const required = level === 'AAA' ? (large ? 4.5 : 7) : large ? 3 : 4.5
  return ratio >= required
}

// Generate ARIA attributes for common patterns
export const AriaHelpers = {
  // For expandable sections
  expandable: (expanded: boolean, controlsId: string) => ({
    'aria-expanded': expanded,
    'aria-controls': controlsId
  }),

  // For tabs
  tab: (selected: boolean, controlsId: string) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controlsId,
    tabIndex: selected ? 0 : -1
  }),

  // For tab panels
  tabPanel: (tabId: string, hidden: boolean) => ({
    role: 'tabpanel',
    'aria-labelledby': tabId,
    hidden
  }),

  // For modals
  modal: (labelId: string, descId?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    ...(descId && { 'aria-describedby': descId })
  }),

  // For lists
  list: (itemCount: number) => ({
    role: 'list',
    'aria-label': `List of ${itemCount} items`
  }),

  // For progress indicators
  progress: (value: number, max: number = 100) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': `Progress: ${value} of ${max}`
  }),

  // For status messages
  status: (message: string, priority: 'polite' | 'assertive' = 'polite') => ({
    role: 'status',
    'aria-live': priority,
    'aria-atomic': true,
    children: message
  }),

  // For loading states
  loading: (isLoading: boolean) => ({
    'aria-busy': isLoading,
    'aria-live': 'polite'
  })
}

// Keyboard navigation helpers
export const KeyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
}

// Check if element is focusable
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false

  const tagName = element.tagName.toLowerCase()
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea']

  if (focusableTags.includes(tagName)) {
    return !element.hasAttribute('disabled')
  }

  return element.hasAttribute('tabindex')
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

// Announce page navigation to screen readers
export function announceNavigation(pageName: string) {
  const announcer = LiveAnnouncer.getInstance()
  announcer.announce(`Navigated to ${pageName}`, 'polite')
}

// Announce loading state
export function announceLoading(isLoading: boolean, message?: string) {
  const announcer = LiveAnnouncer.getInstance()
  if (isLoading) {
    announcer.announce(message || 'Loading...', 'polite')
  } else {
    announcer.announce('Loading complete', 'polite')
  }
}

// Announce form errors
export function announceFormError(errors: string[]) {
  const announcer = LiveAnnouncer.getInstance()
  if (errors.length > 0) {
    announcer.announce(
      `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`,
      'assertive'
    )
  }
}
