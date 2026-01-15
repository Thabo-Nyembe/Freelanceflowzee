'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface TourStep {
  id: string
  target: string // CSS selector for the element to highlight
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'input' | 'hover' | 'wait'
  actionTarget?: string
  nextOnAction?: boolean
  spotlight?: boolean
  disableInteraction?: boolean
  onEnter?: () => void
  onExit?: () => void
}

export interface Tour {
  id: string
  name: string
  description: string
  category: 'getting-started' | 'feature' | 'workflow' | 'advanced'
  steps: TourStep[]
  estimatedTime: number // in minutes
  prerequisites?: string[]
  icon?: string
}

export interface TourProgress {
  tourId: string
  currentStep: number
  completed: boolean
  startedAt: string
  completedAt?: string
  skippedSteps: number[]
}

interface TourState {
  isActive: boolean
  currentTour: Tour | null
  currentStepIndex: number
  progress: Map<string, TourProgress>
  completedTours: string[]
}

// Pre-defined tours for the platform
export const PLATFORM_TOURS: Tour[] = [
  {
    id: 'welcome-tour',
    name: 'Welcome to Kazi',
    description: 'A quick introduction to your new workspace',
    category: 'getting-started',
    estimatedTime: 3,
    icon: '👋',
    steps: [
      {
        id: 'welcome-1',
        target: '[data-tour="sidebar"]',
        title: 'Your Navigation Hub',
        content: 'The sidebar gives you quick access to all features. Click any item to navigate.',
        placement: 'right',
        spotlight: true
      },
      {
        id: 'welcome-2',
        target: '[data-tour="dashboard-stats"]',
        title: 'Dashboard Overview',
        content: 'See your key metrics at a glance. This updates in real-time as you work.',
        placement: 'bottom',
        spotlight: true
      },
      {
        id: 'welcome-3',
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Create projects, tasks, or invoices with one click from here.',
        placement: 'bottom',
        spotlight: true
      },
      {
        id: 'welcome-4',
        target: '[data-tour="notifications"]',
        title: 'Stay Updated',
        content: 'Never miss important updates. Notifications appear here in real-time.',
        placement: 'bottom',
        spotlight: true
      },
      {
        id: 'welcome-5',
        target: '[data-tour="command-palette"]',
        title: 'Pro Tip: Command Palette',
        content: 'Press ⌘K (or Ctrl+K) anytime to quickly search and navigate.',
        placement: 'center',
        spotlight: false
      }
    ]
  },
  {
    id: 'projects-tour',
    name: 'Managing Projects',
    description: 'Learn how to create and manage projects effectively',
    category: 'feature',
    estimatedTime: 5,
    icon: '📁',
    prerequisites: ['welcome-tour'],
    steps: [
      {
        id: 'projects-1',
        target: '[data-tour="new-project-btn"]',
        title: 'Create Your First Project',
        content: 'Click here to create a new project. Projects help organize your work.',
        placement: 'bottom',
        action: 'click',
        nextOnAction: true,
        spotlight: true
      },
      {
        id: 'projects-2',
        target: '[data-tour="project-name-input"]',
        title: 'Name Your Project',
        content: 'Give your project a clear, descriptive name.',
        placement: 'right',
        action: 'input',
        spotlight: true
      },
      {
        id: 'projects-3',
        target: '[data-tour="project-client-select"]',
        title: 'Assign a Client',
        content: 'Link this project to a client for better organization and billing.',
        placement: 'right',
        spotlight: true
      },
      {
        id: 'projects-4',
        target: '[data-tour="project-status"]',
        title: 'Track Progress',
        content: 'Update project status as work progresses. This helps with reporting.',
        placement: 'left',
        spotlight: true
      }
    ]
  },
  {
    id: 'clients-tour',
    name: 'Client Management',
    description: 'Master client relationships and deal tracking',
    category: 'feature',
    estimatedTime: 4,
    icon: '👥',
    steps: [
      {
        id: 'clients-1',
        target: '[data-tour="clients-grid"]',
        title: 'Your Client List',
        content: 'All your clients are organized here. Click any card for details.',
        placement: 'top',
        spotlight: true
      },
      {
        id: 'clients-2',
        target: '[data-tour="client-actions"]',
        title: 'Quick Actions',
        content: 'Schedule meetings, create deals, or send messages directly from here.',
        placement: 'left',
        spotlight: true
      },
      {
        id: 'clients-3',
        target: '[data-tour="deal-pipeline"]',
        title: 'Deal Pipeline',
        content: 'Track deals through stages from lead to closed. Drag to move between stages.',
        placement: 'bottom',
        spotlight: true
      }
    ]
  },
  {
    id: 'invoicing-tour',
    name: 'Creating Invoices',
    description: 'Generate and send professional invoices',
    category: 'workflow',
    estimatedTime: 4,
    icon: '💰',
    steps: [
      {
        id: 'invoice-1',
        target: '[data-tour="new-invoice-btn"]',
        title: 'Create Invoice',
        content: 'Start by clicking here to create a new invoice.',
        placement: 'bottom',
        spotlight: true
      },
      {
        id: 'invoice-2',
        target: '[data-tour="invoice-client"]',
        title: 'Select Client',
        content: 'Choose the client to invoice. Their details will auto-fill.',
        placement: 'right',
        spotlight: true
      },
      {
        id: 'invoice-3',
        target: '[data-tour="invoice-items"]',
        title: 'Add Line Items',
        content: 'Add products, services, or time entries. You can import from projects.',
        placement: 'top',
        spotlight: true
      },
      {
        id: 'invoice-4',
        target: '[data-tour="invoice-send"]',
        title: 'Send Invoice',
        content: 'Preview and send via email, or download as PDF.',
        placement: 'left',
        spotlight: true
      }
    ]
  },
  {
    id: 'calendar-tour',
    name: 'Calendar & Scheduling',
    description: 'Manage your time and client meetings',
    category: 'feature',
    estimatedTime: 3,
    icon: '📅',
    steps: [
      {
        id: 'calendar-1',
        target: '[data-tour="calendar-view"]',
        title: 'Your Calendar',
        content: 'View all events, meetings, and deadlines in one place.',
        placement: 'bottom',
        spotlight: true
      },
      {
        id: 'calendar-2',
        target: '[data-tour="booking-link"]',
        title: 'Booking Links',
        content: 'Share your booking link so clients can schedule meetings with you.',
        placement: 'right',
        spotlight: true
      },
      {
        id: 'calendar-3',
        target: '[data-tour="availability"]',
        title: 'Set Availability',
        content: 'Define when you\'re available for meetings to avoid double-booking.',
        placement: 'left',
        spotlight: true
      }
    ]
  }
]

const STORAGE_KEY = 'kazi_tour_progress'

export function useTour() {
  const [state, setState] = useState<TourState>({
    isActive: false,
    currentTour: null,
    currentStepIndex: 0,
    progress: new Map(),
    completedTours: []
  })

  const supabase = createClient()

  // Load progress from localStorage and sync with database
  useEffect(() => {
    const loadProgress = async () => {
      // Load from localStorage first for instant display
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setState(prev => ({
            ...prev,
            progress: new Map(Object.entries(parsed.progress || {})),
            completedTours: parsed.completedTours || []
          }))
        } catch (e) {
          console.error('Failed to parse tour progress:', e)
        }
      }

      // Then sync with database
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', user.id)
            .single()

          if (data?.preferences?.tourProgress) {
            const dbProgress = data.preferences.tourProgress
            setState(prev => ({
              ...prev,
              progress: new Map(Object.entries(dbProgress.progress || {})),
              completedTours: dbProgress.completedTours || []
            }))
          }
        }
      } catch (e) {
        // Silently fail - use localStorage data
      }
    }

    loadProgress()
  }, [supabase])

  // Save progress
  const saveProgress = useCallback(async (progress: Map<string, TourProgress>, completedTours: string[]) => {
    const progressObj = Object.fromEntries(progress)

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      progress: progressObj,
      completedTours
    }))

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences: {
              tourProgress: {
                progress: progressObj,
                completedTours
              }
            }
          }, { onConflict: 'user_id' })
      }
    } catch (e) {
      console.error('Failed to save tour progress:', e)
    }
  }, [supabase])

  const startTour = useCallback((tourId: string) => {
    const tour = PLATFORM_TOURS.find(t => t.id === tourId)
    if (!tour) {
      toast.error('Tour not found')
      return
    }

    // Check prerequisites
    if (tour.prerequisites) {
      const missingPrereqs = tour.prerequisites.filter(p => !state.completedTours.includes(p))
      if (missingPrereqs.length > 0) {
        const prereqNames = missingPrereqs.map(p => PLATFORM_TOURS.find(t => t.id === p)?.name).join(', ')
        toast.info('Complete prerequisites first', { description: `Please complete: ${prereqNames}` })
        return
      }
    }

    const existingProgress = state.progress.get(tourId)
    const startStep = existingProgress && !existingProgress.completed ? existingProgress.currentStep : 0

    setState(prev => ({
      ...prev,
      isActive: true,
      currentTour: tour,
      currentStepIndex: startStep
    }))

    // Update progress
    const newProgress = new Map(state.progress)
    newProgress.set(tourId, {
      tourId,
      currentStep: startStep,
      completed: false,
      startedAt: existingProgress?.startedAt || new Date().toISOString(),
      skippedSteps: existingProgress?.skippedSteps || []
    })
    setState(prev => ({ ...prev, progress: newProgress }))
    saveProgress(newProgress, state.completedTours)

    toast.success(`Starting: ${tour.name}`, { description: `${tour.steps.length} steps • ~${tour.estimatedTime} min` })
  }, [state.progress, state.completedTours, saveProgress])

  const nextStep = useCallback(() => {
    if (!state.currentTour) return

    const nextIndex = state.currentStepIndex + 1

    if (nextIndex >= state.currentTour.steps.length) {
      // Tour completed
      completeTour()
    } else {
      setState(prev => ({ ...prev, currentStepIndex: nextIndex }))

      // Update progress
      const newProgress = new Map(state.progress)
      const tourProgress = newProgress.get(state.currentTour.id)
      if (tourProgress) {
        tourProgress.currentStep = nextIndex
        newProgress.set(state.currentTour.id, tourProgress)
        saveProgress(newProgress, state.completedTours)
      }
    }
  }, [state.currentTour, state.currentStepIndex, state.progress, state.completedTours, saveProgress])

  const prevStep = useCallback(() => {
    if (!state.currentTour || state.currentStepIndex <= 0) return

    setState(prev => ({ ...prev, currentStepIndex: prev.currentStepIndex - 1 }))
  }, [state.currentTour, state.currentStepIndex])

  const skipStep = useCallback(() => {
    if (!state.currentTour) return

    const newProgress = new Map(state.progress)
    const tourProgress = newProgress.get(state.currentTour.id)
    if (tourProgress) {
      tourProgress.skippedSteps.push(state.currentStepIndex)
      newProgress.set(state.currentTour.id, tourProgress)
      saveProgress(newProgress, state.completedTours)
    }

    nextStep()
  }, [state.currentTour, state.currentStepIndex, state.progress, state.completedTours, saveProgress, nextStep])

  const completeTour = useCallback(() => {
    if (!state.currentTour) return

    const newCompletedTours = [...state.completedTours, state.currentTour.id]
    const newProgress = new Map(state.progress)
    const tourProgress = newProgress.get(state.currentTour.id)
    if (tourProgress) {
      tourProgress.completed = true
      tourProgress.completedAt = new Date().toISOString()
      newProgress.set(state.currentTour.id, tourProgress)
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      currentTour: null,
      currentStepIndex: 0,
      progress: newProgress,
      completedTours: newCompletedTours
    }))

    saveProgress(newProgress, newCompletedTours)
    toast.success('Tour completed! 🎉', { description: 'Great job! You can replay this tour anytime.' })
  }, [state.currentTour, state.progress, state.completedTours, saveProgress])

  const endTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentTour: null,
      currentStepIndex: 0
    }))
    toast.info('Tour paused', { description: 'You can continue anytime from the help menu.' })
  }, [])

  const resetTour = useCallback((tourId: string) => {
    const newProgress = new Map(state.progress)
    newProgress.delete(tourId)

    const newCompletedTours = state.completedTours.filter(id => id !== tourId)

    setState(prev => ({
      ...prev,
      progress: newProgress,
      completedTours: newCompletedTours
    }))

    saveProgress(newProgress, newCompletedTours)
    toast.success('Tour reset', { description: 'You can start fresh!' })
  }, [state.progress, state.completedTours, saveProgress])

  const resetAllTours = useCallback(() => {
    setState(prev => ({
      ...prev,
      progress: new Map(),
      completedTours: []
    }))

    saveProgress(new Map(), [])
    toast.success('All tours reset')
  }, [saveProgress])

  const currentStep = state.currentTour?.steps[state.currentStepIndex] || null

  const availableTours = PLATFORM_TOURS.filter(tour => {
    if (!tour.prerequisites) return true
    return tour.prerequisites.every(p => state.completedTours.includes(p))
  })

  const getTourProgress = (tourId: string) => {
    const progress = state.progress.get(tourId)
    const tour = PLATFORM_TOURS.find(t => t.id === tourId)
    if (!progress || !tour) return 0
    return Math.round((progress.currentStep / tour.steps.length) * 100)
  }

  return {
    // State
    isActive: state.isActive,
    currentTour: state.currentTour,
    currentStep,
    currentStepIndex: state.currentStepIndex,
    totalSteps: state.currentTour?.steps.length || 0,
    completedTours: state.completedTours,
    progress: state.progress,

    // Actions
    startTour,
    nextStep,
    prevStep,
    skipStep,
    endTour,
    completeTour,
    resetTour,
    resetAllTours,

    // Computed
    availableTours,
    allTours: PLATFORM_TOURS,
    getTourProgress,
    isFirstStep: state.currentStepIndex === 0,
    isLastStep: state.currentTour ? state.currentStepIndex === state.currentTour.steps.length - 1 : false
  }
}

// Context for global tour state
const TourContext = createContext<ReturnType<typeof useTour> | null>(null)

export const TourProvider = TourContext.Provider

export function useTourContext() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider')
  }
  return context
}
