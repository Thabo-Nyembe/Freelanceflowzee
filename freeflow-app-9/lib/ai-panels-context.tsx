'use client'

/**
 * AI Panels Context
 *
 * Manages global state for AI Intelligence and AI Activity panels
 * Allows panels to be toggled from anywhere in the dashboard
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface AIPanelsContextValue {
  // AI Intelligence Panel
  isIntelligencePanelOpen: boolean
  toggleIntelligencePanel: () => void
  setIntelligencePanelOpen: (open: boolean) => void

  // AI Activity Panel
  isActivityPanelOpen: boolean
  toggleActivityPanel: () => void
  setActivityPanelOpen: (open: boolean) => void

  // Close all panels
  closeAllPanels: () => void
}

const AIPanelsContext = createContext<AIPanelsContextValue | undefined>(undefined)

export function AIPanelsProvider({ children }: { children: React.ReactNode }) {
  const [isIntelligencePanelOpen, setIsIntelligencePanelOpen] = useState(false)
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false)

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIntelligence = localStorage.getItem('kazi-intelligence-panel-open')
      const savedActivity = localStorage.getItem('kazi-activity-panel-open')

      if (savedIntelligence !== null) {
        setIsIntelligencePanelOpen(savedIntelligence === 'true')
      }
      if (savedActivity !== null) {
        setIsActivityPanelOpen(savedActivity === 'true')
      }
    }
  }, [])

  const toggleIntelligencePanel = useCallback(() => {
    setIsIntelligencePanelOpen(prev => {
      const newValue = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('kazi-intelligence-panel-open', String(newValue))
      }
      // Close activity panel when opening intelligence
      if (newValue) setIsActivityPanelOpen(false)
      return newValue
    })
  }, [])

  const toggleActivityPanel = useCallback(() => {
    setIsActivityPanelOpen(prev => {
      const newValue = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('kazi-activity-panel-open', String(newValue))
      }
      // Close intelligence panel when opening activity
      if (newValue) setIsIntelligencePanelOpen(false)
      return newValue
    })
  }, [])

  const setIntelligencePanelOpen = useCallback((open: boolean) => {
    setIsIntelligencePanelOpen(open)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi-intelligence-panel-open', String(open))
    }
  }, [])

  const setActivityPanelOpen = useCallback((open: boolean) => {
    setIsActivityPanelOpen(open)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi-activity-panel-open', String(open))
    }
  }, [])

  const closeAllPanels = useCallback(() => {
    setIsIntelligencePanelOpen(false)
    setIsActivityPanelOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi-intelligence-panel-open', 'false')
      localStorage.setItem('kazi-activity-panel-open', 'false')
    }
  }, [])

  return (
    <AIPanelsContext.Provider
      value={{
        isIntelligencePanelOpen,
        toggleIntelligencePanel,
        setIntelligencePanelOpen,
        isActivityPanelOpen,
        toggleActivityPanel,
        setActivityPanelOpen,
        closeAllPanels,
      }}
    >
      {children}
    </AIPanelsContext.Provider>
  )
}

export function useAIPanels() {
  const context = useContext(AIPanelsContext)
  if (context === undefined) {
    throw new Error('useAIPanels must be used within AIPanelsProvider')
  }
  return context
}
