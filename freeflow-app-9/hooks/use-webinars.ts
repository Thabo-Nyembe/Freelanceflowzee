'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type WebinarStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled'
export type WebinarType = 'live' | 'recorded' | 'hybrid'

export interface Webinar {
  id: string
  title: string
  description: string
  type: WebinarType
  status: WebinarStatus
  scheduledAt: string
  duration: number // minutes
  timezone: string
  hostId: string
  hostName: string
  hostAvatar?: string
  coHosts: WebinarHost[]
  panelists: WebinarPanelist[]
  registrations: WebinarRegistration[]
  attendees: WebinarAttendee[]
  maxAttendees?: number
  joinUrl?: string
  streamUrl?: string
  recordingUrl?: string
  thumbnailUrl?: string
  category: string
  tags: string[]
  isPublic: boolean
  requiresRegistration: boolean
  allowQuestions: boolean
  allowChat: boolean
  questions: WebinarQuestion[]
  polls: WebinarPoll[]
  analytics: WebinarAnalytics
  settings: WebinarSettings
  createdAt: string
  updatedAt: string
  startedAt?: string
  endedAt?: string
}

export interface WebinarHost {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'co-host' | 'moderator'
}

export interface WebinarPanelist {
  id: string
  name: string
  email: string
  avatar?: string
  title?: string
  company?: string
  bio?: string
}

export interface WebinarRegistration {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  registeredAt: string
  source?: string
  customFields: Record<string, any>
  status: 'registered' | 'attended' | 'no_show' | 'cancelled'
}

export interface WebinarAttendee {
  id: string
  registrationId: string
  name: string
  email: string
  joinedAt: string
  leftAt?: string
  duration: number // minutes attended
  engagementScore: number
}

export interface WebinarQuestion {
  id: string
  content: string
  askedBy: string
  askedByEmail: string
  isAnonymous: boolean
  isAnswered: boolean
  answer?: string
  answeredBy?: string
  votes: number
  createdAt: string
}

export interface WebinarPoll {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  isActive: boolean
  isAnonymous: boolean
  showResults: boolean
  createdAt: string
}

export interface WebinarAnalytics {
  registrations: number
  attendees: number
  peakAttendees: number
  avgDuration: number
  engagementRate: number
  questionsAsked: number
  pollResponses: number
  chatMessages: number
  attendeeFeedback: { rating: number; count: number }[]
}

export interface WebinarSettings {
  autoRecord: boolean
  allowReplays: boolean
  replayAvailability: number // days
  enableTranscription: boolean
  enableCaptions: boolean
  waitingRoom: boolean
  muteOnEntry: boolean
  allowHandRaise: boolean
  reminderEmails: boolean
  followUpEmails: boolean
  customBranding: boolean
  brandColor?: string
  brandLogo?: string
}

export interface WebinarStats {
  totalWebinars: number
  upcomingWebinars: number
  completedWebinars: number
  totalRegistrations: number
  totalAttendees: number
  avgAttendanceRate: number
  avgEngagement: number
  popularTopics: { topic: string; count: number }[]
  monthlyTrend: { month: string; webinars: number; attendees: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWebinars: Webinar[] = [
  {
    id: 'web-1',
    title: 'Introduction to AI-Powered Productivity',
    description: 'Learn how AI tools can supercharge your workflow and boost productivity.',
    type: 'live',
    status: 'scheduled',
    scheduledAt: '2024-03-28T14:00:00Z',
    duration: 60,
    timezone: 'America/New_York',
    hostId: 'user-1',
    hostName: 'Alex Chen',
    hostAvatar: '/avatars/alex.jpg',
    coHosts: [{ id: 'user-2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'moderator' }],
    panelists: [
      { id: 'panel-1', name: 'Dr. AI Expert', email: 'expert@example.com', title: 'AI Researcher', company: 'TechLab', bio: 'Leading AI researcher' }
    ],
    registrations: [
      { id: 'reg-1', name: 'Emily Johnson', email: 'emily@example.com', registeredAt: '2024-03-20', status: 'registered', customFields: {} },
      { id: 'reg-2', name: 'Michael Brown', email: 'michael@example.com', company: 'StartupCo', registeredAt: '2024-03-21', status: 'registered', customFields: {} }
    ],
    attendees: [],
    maxAttendees: 500,
    joinUrl: 'https://webinar.example.com/join/web-1',
    thumbnailUrl: '/webinars/ai-productivity.jpg',
    category: 'Technology',
    tags: ['ai', 'productivity', 'automation'],
    isPublic: true,
    requiresRegistration: true,
    allowQuestions: true,
    allowChat: true,
    questions: [],
    polls: [
      { id: 'poll-1', question: 'Which AI tool do you use most?', options: [{ id: 'o1', text: 'ChatGPT', votes: 0 }, { id: 'o2', text: 'Claude', votes: 0 }, { id: 'o3', text: 'Copilot', votes: 0 }], isActive: false, isAnonymous: true, showResults: false, createdAt: '2024-03-20' }
    ],
    analytics: { registrations: 245, attendees: 0, peakAttendees: 0, avgDuration: 0, engagementRate: 0, questionsAsked: 0, pollResponses: 0, chatMessages: 0, attendeeFeedback: [] },
    settings: { autoRecord: true, allowReplays: true, replayAvailability: 30, enableTranscription: true, enableCaptions: true, waitingRoom: true, muteOnEntry: true, allowHandRaise: true, reminderEmails: true, followUpEmails: true, customBranding: false },
    createdAt: '2024-03-15',
    updatedAt: '2024-03-20'
  },
  {
    id: 'web-2',
    title: 'Product Demo: New Features Launch',
    description: 'Exclusive look at our latest features and improvements.',
    type: 'live',
    status: 'ended',
    scheduledAt: '2024-03-15T16:00:00Z',
    duration: 45,
    timezone: 'America/New_York',
    hostId: 'user-2',
    hostName: 'Sarah Miller',
    coHosts: [],
    panelists: [],
    registrations: [
      { id: 'reg-3', name: 'John Davis', email: 'john@example.com', registeredAt: '2024-03-10', status: 'attended', customFields: {} }
    ],
    attendees: [
      { id: 'att-1', registrationId: 'reg-3', name: 'John Davis', email: 'john@example.com', joinedAt: '2024-03-15T15:55:00Z', leftAt: '2024-03-15T16:42:00Z', duration: 47, engagementScore: 85 }
    ],
    maxAttendees: 200,
    recordingUrl: 'https://recordings.example.com/web-2.mp4',
    thumbnailUrl: '/webinars/product-demo.jpg',
    category: 'Product',
    tags: ['demo', 'features', 'product'],
    isPublic: true,
    requiresRegistration: true,
    allowQuestions: true,
    allowChat: true,
    questions: [
      { id: 'q-1', content: 'When will this be available?', askedBy: 'John Davis', askedByEmail: 'john@example.com', isAnonymous: false, isAnswered: true, answer: 'Available next week!', answeredBy: 'Sarah Miller', votes: 5, createdAt: '2024-03-15T16:20:00Z' }
    ],
    polls: [],
    analytics: { registrations: 180, attendees: 142, peakAttendees: 138, avgDuration: 38, engagementRate: 78, questionsAsked: 25, pollResponses: 0, chatMessages: 89, attendeeFeedback: [{ rating: 5, count: 45 }, { rating: 4, count: 62 }, { rating: 3, count: 20 }] },
    settings: { autoRecord: true, allowReplays: true, replayAvailability: 30, enableTranscription: true, enableCaptions: true, waitingRoom: false, muteOnEntry: true, allowHandRaise: true, reminderEmails: true, followUpEmails: true, customBranding: false },
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15',
    startedAt: '2024-03-15T16:00:00Z',
    endedAt: '2024-03-15T16:45:00Z'
  }
]

const mockStats: WebinarStats = {
  totalWebinars: 28,
  upcomingWebinars: 5,
  completedWebinars: 23,
  totalRegistrations: 4250,
  totalAttendees: 3180,
  avgAttendanceRate: 74.8,
  avgEngagement: 72.5,
  popularTopics: [
    { topic: 'Technology', count: 12 },
    { topic: 'Product', count: 8 },
    { topic: 'Marketing', count: 5 }
  ],
  monthlyTrend: [
    { month: '2024-01', webinars: 8, attendees: 920 },
    { month: '2024-02', webinars: 10, attendees: 1180 },
    { month: '2024-03', webinars: 10, attendees: 1080 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseWebinarsOptions {
  
}

export function useWebinars(options: UseWebinarsOptions = {}) {
  const {  } = options

  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [currentWebinar, setCurrentWebinar] = useState<Webinar | null>(null)
  const [stats, setStats] = useState<WebinarStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchWebinars = useCallback(async () => {
    }, [])

  const updateWebinar = useCallback(async (webinarId: string, updates: Partial<Webinar>) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      ...updates,
      updatedAt: new Date().toISOString()
    } : w))
    return { success: true }
  }, [])

  const deleteWebinar = useCallback(async (webinarId: string) => {
    setWebinars(prev => prev.filter(w => w.id !== webinarId))
    return { success: true }
  }, [])

  const scheduleWebinar = useCallback(async (webinarId: string) => {
    return updateWebinar(webinarId, { status: 'scheduled' })
  }, [updateWebinar])

  const startWebinar = useCallback(async (webinarId: string) => {
    setIsLive(true)
    return updateWebinar(webinarId, { status: 'live', startedAt: new Date().toISOString() })
  }, [updateWebinar])

  const endWebinar = useCallback(async (webinarId: string) => {
    setIsLive(false)
    return updateWebinar(webinarId, { status: 'ended', endedAt: new Date().toISOString() })
  }, [updateWebinar])

  const cancelWebinar = useCallback(async (webinarId: string) => {
    return updateWebinar(webinarId, { status: 'cancelled' })
  }, [updateWebinar])

  const addPanelist = useCallback(async (webinarId: string, panelist: Omit<WebinarPanelist, 'id'>) => {
    const newPanelist: WebinarPanelist = { id: `panel-${Date.now()}`, ...panelist }
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      panelists: [...w.panelists, newPanelist]
    } : w))
    return { success: true, panelist: newPanelist }
  }, [])

  const removePanelist = useCallback(async (webinarId: string, panelistId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      panelists: w.panelists.filter(p => p.id !== panelistId)
    } : w))
    return { success: true }
  }, [])

  const registerForWebinar = useCallback(async (webinarId: string, data: { name: string; email: string; company?: string }) => {
    const registration: WebinarRegistration = {
      id: `reg-${Date.now()}`,
      name: data.name,
      email: data.email,
      company: data.company,
      registeredAt: new Date().toISOString(),
      status: 'registered',
      customFields: {}
    }
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      registrations: [...w.registrations, registration],
      analytics: { ...w.analytics, registrations: w.analytics.registrations + 1 }
    } : w))
    return { success: true, registration }
  }, [])

  const cancelRegistration = useCallback(async (webinarId: string, registrationId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      registrations: w.registrations.map(r => r.id === registrationId ? { ...r, status: 'cancelled' as const } : r)
    } : w))
    return { success: true }
  }, [])

  const createPoll = useCallback(async (webinarId: string, poll: Omit<WebinarPoll, 'id' | 'createdAt'>) => {
    const newPoll: WebinarPoll = {
      id: `poll-${Date.now()}`,
      ...poll,
      createdAt: new Date().toISOString()
    }
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      polls: [...w.polls, newPoll]
    } : w))
    return { success: true, poll: newPoll }
  }, [])

  const launchPoll = useCallback(async (webinarId: string, pollId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      polls: w.polls.map(p => ({ ...p, isActive: p.id === pollId }))
    } : w))
    return { success: true }
  }, [])

  const closePoll = useCallback(async (webinarId: string, pollId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      polls: w.polls.map(p => p.id === pollId ? { ...p, isActive: false, showResults: true } : p)
    } : w))
    return { success: true }
  }, [])

  const votePoll = useCallback(async (webinarId: string, pollId: string, optionId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      polls: w.polls.map(p => p.id === pollId ? {
        ...p,
        options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
      } : p)
    } : w))
    return { success: true }
  }, [])

  const askQuestion = useCallback(async (webinarId: string, content: string, isAnonymous = false) => {
    const question: WebinarQuestion = {
      id: `q-${Date.now()}`,
      content,
      askedBy: isAnonymous ? 'Anonymous' : 'You',
      askedByEmail: 'you@example.com',
      isAnonymous,
      isAnswered: false,
      votes: 0,
      createdAt: new Date().toISOString()
    }
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      questions: [...w.questions, question]
    } : w))
    return { success: true, question }
  }, [])

  const answerQuestion = useCallback(async (webinarId: string, questionId: string, answer: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      questions: w.questions.map(q => q.id === questionId ? {
        ...q,
        isAnswered: true,
        answer,
        answeredBy: 'You'
      } : q)
    } : w))
    return { success: true }
  }, [])

  const voteQuestion = useCallback(async (webinarId: string, questionId: string) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      questions: w.questions.map(q => q.id === questionId ? { ...q, votes: q.votes + 1 } : q)
    } : w))
    return { success: true }
  }, [])

  const updateSettings = useCallback(async (webinarId: string, settings: Partial<WebinarSettings>) => {
    setWebinars(prev => prev.map(w => w.id === webinarId ? {
      ...w,
      settings: { ...w.settings, ...settings }
    } : w))
    return { success: true }
  }, [])

  const duplicateWebinar = useCallback(async (webinarId: string) => {
    const original = webinars.find(w => w.id === webinarId)
    if (!original) return { success: false, error: 'Webinar not found' }

    const duplicate: Webinar = {
      ...original,
      id: `web-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      registrations: [],
      attendees: [],
      questions: [],
      analytics: { registrations: 0, attendees: 0, peakAttendees: 0, avgDuration: 0, engagementRate: 0, questionsAsked: 0, pollResponses: 0, chatMessages: 0, attendeeFeedback: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: undefined,
      endedAt: undefined
    }
    setWebinars(prev => [duplicate, ...prev])
    return { success: true, webinar: duplicate }
  }, [webinars])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchWebinars()
  }, [fetchWebinars])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const upcomingWebinars = useMemo(() => webinars.filter(w => w.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()), [webinars])
  const pastWebinars = useMemo(() => webinars.filter(w => w.status === 'ended'), [webinars])
  const liveWebinars = useMemo(() => webinars.filter(w => w.status === 'live'), [webinars])
  const draftWebinars = useMemo(() => webinars.filter(w => w.status === 'draft'), [webinars])
  const webinarsWithRecordings = useMemo(() => webinars.filter(w => w.recordingUrl), [webinars])

  return {
    webinars, currentWebinar, stats,
    upcomingWebinars, pastWebinars, liveWebinars, draftWebinars, webinarsWithRecordings,
    isLoading, isLive, error,
    refresh, createWebinar, updateWebinar, deleteWebinar,
    scheduleWebinar, startWebinar, endWebinar, cancelWebinar, duplicateWebinar,
    addPanelist, removePanelist, registerForWebinar, cancelRegistration,
    createPoll, launchPoll, closePoll, votePoll,
    askQuestion, answerQuestion, voteQuestion,
    updateSettings, setCurrentWebinar
  }
}

export default useWebinars
