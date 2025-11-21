/**
 * Keyboard Shortcuts System
 * Global keyboard shortcut management with help modal
 */

'use client'

import { useEffect } from 'react'

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
        description: 'Go to Dashboard',
        action: () => { if (typeof window !== 'undefined') window.location.href = '/dashboard' },
        category: 'navigation'
      },
      {
        key: 'p',
        altKey: true,
        description: 'Go to Projects',
        action: () => { if (typeof window !== 'undefined') window.location.href = '/dashboard/projects-hub' },
        category: 'navigation'
      },
      {
        key: 'm',
        altKey: true,
        description: 'Go to Messages',
        action: () => { if (typeof window !== 'undefined') window.location.href = '/dashboard/messages' },
        category: 'navigation'
      },
      {
        key: 's',
        altKey: true,
        description: 'Go to Settings',
        action: () => { if (typeof window !== 'undefined') window.location.href = '/dashboard/settings' },
        category: 'navigation'
      }
    ]
  },
  {
    name: 'Actions',
    shortcuts: [
      {
        key: '/',
        ctrlKey: true,
        description: 'Focus Search',
        action: () => {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
          searchInput?.focus()
        },
        category: 'actions'
      },
      {
        key: 'n',
        ctrlKey: true,
        description: 'New Item',
        action: () => {
          const newButton = document.querySelector('[data-action="new"]') as HTMLButtonElement
          newButton?.click()
        },
        category: 'actions'
      }
    ]
  }
]

// Hook for using keyboard shortcuts
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
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
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
  const keys: string[] = []

  if (shortcut.ctrlKey) keys.push('Ctrl')
  if (shortcut.metaKey) keys.push('Cmd')
  if (shortcut.altKey) keys.push('Alt')
  if (shortcut.shiftKey) keys.push('Shift')

  keys.push(shortcut.key.toUpperCase())

  return keys.join(' + ')
}

// Get all shortcuts from categories
export function getAllShortcuts(categories: ShortcutCategory[]): KeyboardShortcut[] {
  return categories.flatMap(category => category.shortcuts)
}

// Hook to register global shortcuts
export function useGlobalShortcuts() {
  useKeyboardShortcuts(getAllShortcuts(DEFAULT_SHORTCUTS))
}
