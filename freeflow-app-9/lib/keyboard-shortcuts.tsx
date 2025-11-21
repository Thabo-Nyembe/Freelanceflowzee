/**
 * Keyboard Shortcuts System
 * Global keyboard shortcut management with help modal
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  category?: string
}

export interface ShortcutCategory {
  name: string
  shortcuts: KeyboardShortcut[]
}

// Default keyboard shortcuts
export const DEFAULT_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      {
        key: 'h',
        altKey: true,
        description: 'Go to Home',
        action: () => window.location.href = '/dashboard',
        category: 'navigation'
      },
      {
        key: 'p',
        altKey: true,
        description: 'Go to Projects',
        action: () => window.location.href = '/dashboard/projects-hub',
        category: 'navigation'
      },
      {
        key: 's',
        altKey: true,
        description: 'Go to Settings',
        action: () => window.location.href = '/dashboard/settings',
        category: 'navigation'
      }
    ]
  },
  {
    name: 'Actions',
    shortcuts: [
      {
        key: 'k',
        ctrlKey: true,
        description: 'Open Command Palette',
        action: () => console.log('Command palette'),
        category: 'actions'
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Save',
        action: () => console.log('Save'),
        category: 'actions'
      },
      {
        key: 'n',
        ctrlKey: true,
        description: 'New Item',
        action: () => console.log('New item'),
        category: 'actions'
      }
    ]
  },
  {
    name: 'Help',
    shortcuts: [
      {
        key: '?',
        shiftKey: true,
        description: 'Show Keyboard Shortcuts',
        action: () => console.log('Show shortcuts'),
        category: 'help'
      }
    ]
  }
]

// Keyboard shortcut hook
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey
        const metaMatch = shortcut.metaKey ? event.metaKey : true

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(navigator.platform.includes('Mac') ? '' : 'Ctrl')
  }
  if (shortcut.altKey) {
    parts.push(navigator.platform.includes('Mac') ? '%' : 'Alt')
  }
  if (shortcut.shiftKey) {
    parts.push(navigator.platform.includes('Mac') ? 'ç' : 'Shift')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join(' + ')
}

// Keyboard shortcuts help modal hook
export function useShortcutHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, setIsOpen, toggle: () => setIsOpen(prev => !prev) }
}

// Global navigation shortcuts hook
export function useGlobalShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      altKey: true,
      description: 'Go to Dashboard',
      action: () => router.push('/dashboard')
    },
    {
      key: 'p',
      altKey: true,
      description: 'Go to Projects',
      action: () => router.push('/dashboard/projects-hub')
    },
    {
      key: 'm',
      altKey: true,
      description: 'Go to Messages',
      action: () => router.push('/dashboard/messages')
    },
    {
      key: 's',
      altKey: true,
      description: 'Go to Settings',
      action: () => router.push('/dashboard/settings')
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Focus Search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        searchInput?.focus()
      }
    }
  ]

  useKeyboardShortcuts(shortcuts)
}

// Escape key handler
export function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [callback])
}

// Enter key handler
export function useEnterKey(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const target = event.target as HTMLElement
        if (target.tagName !== 'TEXTAREA') {
          callback()
        }
      }
    }

    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, deps)
}
