/**
 * Keyboard Shortcuts Hook
 *
 * Provides global keyboard shortcuts for common dashboard actions
 */

'use client'

import { useEffect, useContext } from 'react'
import { useSidebar } from '@/lib/sidebar-context'
import { AIPanelsContext } from '@/lib/ai-panels-context'

export function useKeyboardShortcuts() {
  const { toggleSidebar, toggleFullscreen } = useSidebar()

  // Optional: Only use AI panels if context is available
  const aiPanelsContext = useContext(AIPanelsContext)
  const toggleIntelligencePanel = aiPanelsContext?.toggleIntelligencePanel
  const toggleActivityPanel = aiPanelsContext?.toggleActivityPanel

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Fullscreen: F11 or Cmd/Ctrl+Shift+F
      if (
        e.key === 'F11' ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f')
      ) {
        e.preventDefault()
        toggleFullscreen()
      }

      // Toggle Sidebar: Cmd/Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Toggle AI Intelligence: Cmd/Ctrl+I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        if (toggleIntelligencePanel) {
          toggleIntelligencePanel()
        }
      }

      // Toggle AI Activity: Cmd/Ctrl+Shift+A
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        if (toggleActivityPanel) {
          toggleActivityPanel()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleSidebar, toggleFullscreen, toggleIntelligencePanel, toggleActivityPanel])
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  fullscreen: ['F11', 'Cmd/Ctrl+Shift+F'],
  sidebar: ['Cmd/Ctrl+B'],
  aiIntelligence: ['Cmd/Ctrl+I'],
  aiActivity: ['Cmd/Ctrl+Shift+A'],
} as const
