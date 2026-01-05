'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type OnboardingStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  order: number
  status: OnboardingStepStatus
  isRequired: boolean
  completedAt?: string
  data?: Record<string, any>
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  steps: OnboardingStep[]
  currentStepIndex: number
  startedAt: string
  completedAt?: string
  isCompleted: boolean
}

export interface OnboardingChecklist {
  id: string
  title: string
  items: ChecklistItem[]
  progressPercent: number
}

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  completedAt?: string
  link?: string
  action?: string
}

export interface OnboardingTour {
  id: string
  name: string
  steps: TourStep[]
  currentStep: number
  isActive: boolean
}

export interface TourStep {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: { label: string; onClick: string }
}

export interface UserOnboardingState {
  hasCompletedOnboarding: boolean
  currentFlow?: string
  completedFlows: string[]
  dismissedTours: string[]
  preferences: OnboardingPreferences
}

export interface OnboardingPreferences {
  showTips: boolean
  showTours: boolean
  emailReminders: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOnboardingSteps: OnboardingStep[] = [
  { id: 'step-1', title: 'Welcome', description: 'Get started with FreeFlow', order: 1, status: 'completed', isRequired: true, completedAt: '2024-03-15' },
  { id: 'step-2', title: 'Profile Setup', description: 'Complete your profile information', order: 2, status: 'completed', isRequired: true, completedAt: '2024-03-15' },
  { id: 'step-3', title: 'Connect Accounts', description: 'Link your external accounts', order: 3, status: 'in_progress', isRequired: false },
  { id: 'step-4', title: 'First Project', description: 'Create your first project', order: 4, status: 'pending', isRequired: true },
  { id: 'step-5', title: 'Invite Team', description: 'Add team members to collaborate', order: 5, status: 'pending', isRequired: false }
]

const mockOnboardingFlow: OnboardingFlow = {
  id: 'flow-1',
  name: 'New User Onboarding',
  description: 'Welcome to FreeFlow! Let\'s get you set up.',
  steps: mockOnboardingSteps,
  currentStepIndex: 2,
  startedAt: '2024-03-15T10:00:00Z',
  isCompleted: false
}

const mockChecklist: OnboardingChecklist = {
  id: 'checklist-1',
  title: 'Getting Started Checklist',
  progressPercent: 40,
  items: [
    { id: 'c1', title: 'Complete your profile', description: 'Add your photo and bio', isCompleted: true, completedAt: '2024-03-15', link: '/dashboard/profile' },
    { id: 'c2', title: 'Set up your workspace', description: 'Customize your dashboard', isCompleted: true, completedAt: '2024-03-15', link: '/dashboard/settings' },
    { id: 'c3', title: 'Create first project', description: 'Start tracking your work', isCompleted: false, link: '/dashboard/projects/new' },
    { id: 'c4', title: 'Send first invoice', description: 'Bill your first client', isCompleted: false, link: '/dashboard/invoices/new' },
    { id: 'c5', title: 'Enable notifications', description: 'Stay updated on activity', isCompleted: false, link: '/dashboard/settings/notifications' }
  ]
}

const mockTour: OnboardingTour = {
  id: 'tour-dashboard',
  name: 'Dashboard Tour',
  currentStep: 0,
  isActive: false,
  steps: [
    { id: 't1', target: '#dashboard-overview', title: 'Your Dashboard', content: 'This is your main dashboard where you can see all your important metrics.', placement: 'bottom' },
    { id: 't2', target: '#sidebar-projects', title: 'Projects', content: 'Manage all your projects from here.', placement: 'right' },
    { id: 't3', target: '#sidebar-invoices', title: 'Invoicing', content: 'Create and track invoices for your clients.', placement: 'right' },
    { id: 't4', target: '#header-notifications', title: 'Notifications', content: 'Stay updated with real-time notifications.', placement: 'bottom' }
  ]
}

const mockUserState: UserOnboardingState = {
  hasCompletedOnboarding: false,
  currentFlow: 'flow-1',
  completedFlows: [],
  dismissedTours: [],
  preferences: {
    showTips: true,
    showTours: true,
    emailReminders: true
  }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseOnboardingOptions {
  
  autoStart?: boolean
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const {  autoStart = true } = options

  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null)
  const [activeTour, setActiveTour] = useState<OnboardingTour | null>(null)
  const [userState, setUserState] = useState<UserOnboardingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOnboardingState = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/onboarding/state')
      const result = await response.json()
      if (result.success) {
        setCurrentFlow(result.flow || null)
        setChecklist(result.checklist || null)
        setUserState(result.userState || null)
        return result
      }
      return { flow: null, checklist: null }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch onboarding state'))
      return { flow: null, checklist: null }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const completeStep = useCallback(async (stepId: string, data?: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/onboarding/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, data })
      })
      const result = await response.json()
      if (result.success && currentFlow) {
        setCurrentFlow(prev => {
          if (!prev) return prev
          const updatedSteps = prev.steps.map(s =>
            s.id === stepId ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString(), data } : s
          )
          const nextIndex = updatedSteps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped')
          return { ...prev, steps: updatedSteps, currentStepIndex: nextIndex >= 0 ? nextIndex : prev.steps.length }
        })
      }
      return result
    } catch (err) {
      setCurrentFlow(prev => {
        if (!prev) return prev
        const updatedSteps = prev.steps.map(s =>
          s.id === stepId ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString(), data } : s
        )
        return { ...prev, steps: updatedSteps }
      })
      return { success: true }
    }
  }, [currentFlow])

  const skipStep = useCallback(async (stepId: string) => {
    try {
      await fetch('/api/onboarding/skip-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId })
      })
      setCurrentFlow(prev => {
        if (!prev) return prev
        const updatedSteps = prev.steps.map(s =>
          s.id === stepId ? { ...s, status: 'skipped' as const } : s
        )
        const nextIndex = updatedSteps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped')
        return { ...prev, steps: updatedSteps, currentStepIndex: nextIndex >= 0 ? nextIndex : prev.steps.length }
      })
      return { success: true }
    } catch (err) {
      setCurrentFlow(prev => {
        if (!prev) return prev
        const updatedSteps = prev.steps.map(s =>
          s.id === stepId ? { ...s, status: 'skipped' as const } : s
        )
        return { ...prev, steps: updatedSteps }
      })
      return { success: true }
    }
  }, [])

  const completeChecklistItem = useCallback(async (itemId: string) => {
    try {
      await fetch('/api/onboarding/complete-checklist-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })
      setChecklist(prev => {
        if (!prev) return prev
        const updatedItems = prev.items.map(i =>
          i.id === itemId ? { ...i, isCompleted: true, completedAt: new Date().toISOString() } : i
        )
        const completedCount = updatedItems.filter(i => i.isCompleted).length
        return { ...prev, items: updatedItems, progressPercent: Math.round((completedCount / updatedItems.length) * 100) }
      })
      return { success: true }
    } catch (err) {
      setChecklist(prev => {
        if (!prev) return prev
        const updatedItems = prev.items.map(i =>
          i.id === itemId ? { ...i, isCompleted: true, completedAt: new Date().toISOString() } : i
        )
        const completedCount = updatedItems.filter(i => i.isCompleted).length
        return { ...prev, items: updatedItems, progressPercent: Math.round((completedCount / updatedItems.length) * 100) }
      })
      return { success: true }
    }
  }, [])

  const startTour = useCallback(async (tourId: string) => {
    try {
      const response = await fetch(`/api/onboarding/tours/${tourId}`)
      const result = await response.json()
      if (result.success) {
        setActiveTour({ ...result.tour, isActive: true, currentStep: 0 })
      } else {
        setActiveTour({ ...mockTour, id: tourId, isActive: true, currentStep: 0 })
      }
      return { success: true }
    } catch (err) {
      setActiveTour({ ...mockTour, id: tourId, isActive: true, currentStep: 0 })
      return { success: true }
    }
  }, [])

  const nextTourStep = useCallback(() => {
    setActiveTour(prev => {
      if (!prev) return prev
      const nextStep = prev.currentStep + 1
      if (nextStep >= prev.steps.length) {
        return { ...prev, isActive: false }
      }
      return { ...prev, currentStep: nextStep }
    })
  }, [])

  const previousTourStep = useCallback(() => {
    setActiveTour(prev => {
      if (!prev || prev.currentStep <= 0) return prev
      return { ...prev, currentStep: prev.currentStep - 1 }
    })
  }, [])

  const dismissTour = useCallback(async (tourId: string) => {
    try {
      await fetch('/api/onboarding/dismiss-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId })
      })
      setActiveTour(null)
      setUserState(prev => prev ? { ...prev, dismissedTours: [...prev.dismissedTours, tourId] } : prev)
      return { success: true }
    } catch (err) {
      setActiveTour(null)
      setUserState(prev => prev ? { ...prev, dismissedTours: [...prev.dismissedTours, tourId] } : prev)
      return { success: true }
    }
  }, [])

  const updatePreferences = useCallback(async (preferences: Partial<OnboardingPreferences>) => {
    try {
      await fetch('/api/onboarding/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      setUserState(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : prev)
      return { success: true }
    } catch (err) {
      setUserState(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : prev)
      return { success: true }
    }
  }, [])

  const resetOnboarding = useCallback(async () => {
    try {
      await fetch('/api/onboarding/reset', { method: 'POST' })
      await fetchOnboardingState()
      return { success: true }
    } catch (err) {
      setCurrentFlow(mockOnboardingFlow)
      setChecklist(mockChecklist)
      setUserState(mockUserState)
      return { success: true }
    }
  }, [fetchOnboardingState])

  const completeOnboarding = useCallback(async () => {
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' })
      setUserState(prev => prev ? { ...prev, hasCompletedOnboarding: true } : prev)
      setCurrentFlow(prev => prev ? { ...prev, isCompleted: true, completedAt: new Date().toISOString() } : prev)
      return { success: true }
    } catch (err) {
      setUserState(prev => prev ? { ...prev, hasCompletedOnboarding: true } : prev)
      return { success: true }
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchOnboardingState()
  }, [fetchOnboardingState])

  useEffect(() => {
    if (autoStart) {
      refresh()
    }
  }, [autoStart, refresh])

  const currentStep = useMemo(() => {
    if (!currentFlow || currentFlow.currentStepIndex >= currentFlow.steps.length) return null
    return currentFlow.steps[currentFlow.currentStepIndex]
  }, [currentFlow])

  const progressPercent = useMemo(() => {
    if (!currentFlow) return 0
    const completed = currentFlow.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length
    return Math.round((completed / currentFlow.steps.length) * 100)
  }, [currentFlow])

  const completedSteps = useMemo(() => currentFlow?.steps.filter(s => s.status === 'completed') || [], [currentFlow])
  const pendingSteps = useMemo(() => currentFlow?.steps.filter(s => s.status === 'pending') || [], [currentFlow])
  const isOnboardingComplete = useMemo(() => userState?.hasCompletedOnboarding || progressPercent === 100, [userState, progressPercent])

  return {
    currentFlow, checklist, activeTour, userState, currentStep,
    progressPercent, completedSteps, pendingSteps, isOnboardingComplete,
    isLoading, error,
    refresh, completeStep, skipStep, completeChecklistItem,
    startTour, nextTourStep, previousTourStep, dismissTour,
    updatePreferences, resetOnboarding, completeOnboarding
  }
}

export default useOnboarding
