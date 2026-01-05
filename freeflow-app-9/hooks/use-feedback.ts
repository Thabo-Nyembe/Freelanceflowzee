'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'question' | 'praise' | 'other'
export type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Feedback {
  id: string
  title: string
  description: string
  type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  category: string
  tags: string[]
  submittedBy: string
  submitterName: string
  submitterEmail: string
  submitterAvatar?: string
  votes: number
  voterIds: string[]
  comments: FeedbackComment[]
  attachments: FeedbackAttachment[]
  assigneeId?: string
  assigneeName?: string
  resolution?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface FeedbackComment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isOfficial: boolean
  createdAt: string
}

export interface FeedbackAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface FeedbackCategory {
  id: string
  name: string
  description?: string
  color: string
  feedbackCount: number
}

export interface FeedbackBoard {
  id: string
  name: string
  description?: string
  isPublic: boolean
  feedbackCount: number
  categories: string[]
}

export interface NPS {
  score: number
  comment?: string
  submittedBy: string
  createdAt: string
}

export interface FeedbackStats {
  totalFeedback: number
  newFeedback: number
  plannedItems: number
  completedItems: number
  avgResponseTime: number // hours
  topVoted: { id: string; title: string; votes: number }[]
  byType: Record<FeedbackType, number>
  byStatus: Record<FeedbackStatus, number>
  npsScore: number
  npsResponses: number
  satisfactionTrend: { date: string; score: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    title: 'Add dark mode support',
    description: 'Would love to have a dark mode option for the application. It would be easier on the eyes during night time usage.',
    type: 'feature',
    status: 'planned',
    priority: 'medium',
    category: 'UI/UX',
    tags: ['dark-mode', 'accessibility', 'ui'],
    submittedBy: 'user-3',
    submitterName: 'Emily Johnson',
    submitterEmail: 'emily@example.com',
    submitterAvatar: '/avatars/emily.jpg',
    votes: 152,
    voterIds: ['user-3', 'user-4', 'user-5'],
    comments: [
      { id: 'cmt-1', content: 'This is on our roadmap for Q2!', authorId: 'user-1', authorName: 'Alex Chen (Team)', isOfficial: true, createdAt: '2024-03-15T10:00:00Z' },
      { id: 'cmt-2', content: '+1, really need this!', authorId: 'user-6', authorName: 'Mike Brown', isOfficial: false, createdAt: '2024-03-16T14:00:00Z' }
    ],
    attachments: [],
    isPublic: true,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-16T14:00:00Z'
  },
  {
    id: 'fb-2',
    title: 'Export to PDF not working',
    description: 'When I try to export my reports to PDF, the download never starts. Using Chrome on Mac.',
    type: 'bug',
    status: 'in_progress',
    priority: 'high',
    category: 'Reports',
    tags: ['bug', 'export', 'pdf'],
    submittedBy: 'user-4',
    submitterName: 'David Wilson',
    submitterEmail: 'david@example.com',
    votes: 28,
    voterIds: ['user-4', 'user-7'],
    comments: [
      { id: 'cmt-3', content: 'We have identified the issue and are working on a fix.', authorId: 'user-2', authorName: 'Sarah Miller (Team)', isOfficial: true, createdAt: '2024-03-18T09:00:00Z' }
    ],
    attachments: [
      { id: 'att-1', name: 'error-console.png', url: '/attachments/error.png', size: 125000, type: 'image/png' }
    ],
    assigneeId: 'user-2',
    assigneeName: 'Sarah Miller',
    isPublic: true,
    createdAt: '2024-03-17T11:00:00Z',
    updatedAt: '2024-03-18T09:00:00Z'
  },
  {
    id: 'fb-3',
    title: 'Love the new dashboard!',
    description: 'Just wanted to say the new dashboard redesign is amazing. Much cleaner and easier to navigate!',
    type: 'praise',
    status: 'completed',
    priority: 'low',
    category: 'Dashboard',
    tags: ['praise', 'dashboard'],
    submittedBy: 'user-5',
    submitterName: 'Lisa Chen',
    submitterEmail: 'lisa@example.com',
    votes: 45,
    voterIds: ['user-5', 'user-8', 'user-9'],
    comments: [
      { id: 'cmt-4', content: 'Thank you so much for the kind words! We are glad you enjoy it.', authorId: 'user-1', authorName: 'Alex Chen (Team)', isOfficial: true, createdAt: '2024-03-14T15:00:00Z' }
    ],
    attachments: [],
    isPublic: true,
    createdAt: '2024-03-14T12:00:00Z',
    updatedAt: '2024-03-14T15:00:00Z',
    resolvedAt: '2024-03-14T15:00:00Z'
  }
]

const mockCategories: FeedbackCategory[] = [
  { id: 'cat-1', name: 'UI/UX', color: '#3b82f6', feedbackCount: 45 },
  { id: 'cat-2', name: 'Dashboard', color: '#22c55e', feedbackCount: 28 },
  { id: 'cat-3', name: 'Reports', color: '#f59e0b', feedbackCount: 32 },
  { id: 'cat-4', name: 'Integrations', color: '#8b5cf6', feedbackCount: 20 },
  { id: 'cat-5', name: 'Performance', color: '#ef4444', feedbackCount: 15 }
]

const mockBoards: FeedbackBoard[] = [
  { id: 'board-1', name: 'Feature Requests', description: 'Request new features', isPublic: true, feedbackCount: 85, categories: ['UI/UX', 'Dashboard', 'Integrations'] },
  { id: 'board-2', name: 'Bug Reports', description: 'Report issues', isPublic: true, feedbackCount: 32, categories: ['Reports', 'Performance'] },
  { id: 'board-3', name: 'Internal Feedback', description: 'Team suggestions', isPublic: false, feedbackCount: 12, categories: [] }
]

const mockStats: FeedbackStats = {
  totalFeedback: 225,
  newFeedback: 18,
  plannedItems: 35,
  completedItems: 120,
  avgResponseTime: 4.5,
  topVoted: [
    { id: 'fb-1', title: 'Add dark mode support', votes: 152 },
    { id: 'fb-4', title: 'Mobile app improvements', votes: 98 },
    { id: 'fb-5', title: 'Better search functionality', votes: 76 }
  ],
  byType: { bug: 45, feature: 120, improvement: 35, question: 15, praise: 8, other: 2 },
  byStatus: { new: 18, under_review: 25, planned: 35, in_progress: 12, completed: 120, declined: 15 },
  npsScore: 72,
  npsResponses: 450,
  satisfactionTrend: [
    { date: '2024-03-01', score: 68 },
    { date: '2024-03-08', score: 70 },
    { date: '2024-03-15', score: 72 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseFeedbackOptions {
  
}

export function useFeedback(options: UseFeedbackOptions = {}) {
  const {  } = options

  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [categories, setCategories] = useState<FeedbackCategory[]>([])
  const [boards, setBoards] = useState<FeedbackBoard[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFeedbackData = useCallback(async () => {
    }, [])

  const updateFeedback = useCallback(async (feedbackId: string, updates: Partial<Feedback>) => {
    setFeedback(prev => prev.map(f => f.id === feedbackId ? {
      ...f,
      ...updates,
      updatedAt: new Date().toISOString()
    } : f))
    return { success: true }
  }, [])

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    setFeedback(prev => prev.filter(f => f.id !== feedbackId))
    return { success: true }
  }, [])

  const changeStatus = useCallback(async (feedbackId: string, status: FeedbackStatus, resolution?: string) => {
    const updates: Partial<Feedback> = { status }
    if (status === 'completed' || status === 'declined') {
      updates.resolvedAt = new Date().toISOString()
      if (resolution) updates.resolution = resolution
    }
    return updateFeedback(feedbackId, updates)
  }, [updateFeedback])

  const assignFeedback = useCallback(async (feedbackId: string, assigneeId: string, assigneeName: string) => {
    return updateFeedback(feedbackId, { assigneeId, assigneeName })
  }, [updateFeedback])

  const vote = useCallback(async (feedbackId: string) => {
    setFeedback(prev => prev.map(f => {
      if (f.id !== feedbackId) return f
      const hasVoted = f.voterIds.includes('user-1')
      return {
        ...f,
        votes: hasVoted ? f.votes - 1 : f.votes + 1,
        voterIds: hasVoted ? f.voterIds.filter(id => id !== 'user-1') : [...f.voterIds, 'user-1']
      }
    }))
    return { success: true }
  }, [])

  const addComment = useCallback(async (feedbackId: string, content: string, isOfficial = false) => {
    const comment: FeedbackComment = {
      id: `cmt-${Date.now()}`,
      content,
      authorId: 'user-1',
      authorName: isOfficial ? 'You (Team)' : 'You',
      isOfficial,
      createdAt: new Date().toISOString()
    }
    setFeedback(prev => prev.map(f => f.id === feedbackId ? {
      ...f,
      comments: [...f.comments, comment],
      updatedAt: new Date().toISOString()
    } : f))
    return { success: true, comment }
  }, [])

  const deleteComment = useCallback(async (feedbackId: string, commentId: string) => {
    setFeedback(prev => prev.map(f => f.id === feedbackId ? {
      ...f,
      comments: f.comments.filter(c => c.id !== commentId)
    } : f))
    return { success: true }
  }, [])

  const addAttachment = useCallback(async (feedbackId: string, file: File) => {
    const attachment: FeedbackAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type
    }
    setFeedback(prev => prev.map(f => f.id === feedbackId ? {
      ...f,
      attachments: [...f.attachments, attachment]
    } : f))
    return { success: true, attachment }
  }, [])

  const addTag = useCallback(async (feedbackId: string, tag: string) => {
    setFeedback(prev => prev.map(f => f.id === feedbackId && !f.tags.includes(tag) ? {
      ...f,
      tags: [...f.tags, tag]
    } : f))
    return { success: true }
  }, [])

  const removeTag = useCallback(async (feedbackId: string, tag: string) => {
    setFeedback(prev => prev.map(f => f.id === feedbackId ? {
      ...f,
      tags: f.tags.filter(t => t !== tag)
    } : f))
    return { success: true }
  }, [])

  const submitNPS = useCallback(async (score: number, comment?: string) => {
    // In real implementation, this would send to API
    return { success: true }
  }, [])

  const searchFeedback = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return feedback.filter(f =>
      f.title.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  }, [feedback])

  const filterFeedback = useCallback((filters: {
    type?: FeedbackType[]
    status?: FeedbackStatus[]
    category?: string[]
    isPublic?: boolean
  }) => {
    return feedback.filter(f => {
      if (filters.type?.length && !filters.type.includes(f.type)) return false
      if (filters.status?.length && !filters.status.includes(f.status)) return false
      if (filters.category?.length && !filters.category.includes(f.category)) return false
      if (filters.isPublic !== undefined && f.isPublic !== filters.isPublic) return false
      return true
    })
  }, [feedback])

  const getTypeColor = useCallback((type: FeedbackType): string => {
    switch (type) {
      case 'bug': return '#ef4444'
      case 'feature': return '#3b82f6'
      case 'improvement': return '#22c55e'
      case 'question': return '#f59e0b'
      case 'praise': return '#ec4899'
      case 'other': return '#6b7280'
    }
  }, [])

  const getStatusColor = useCallback((status: FeedbackStatus): string => {
    switch (status) {
      case 'new': return '#3b82f6'
      case 'under_review': return '#f59e0b'
      case 'planned': return '#8b5cf6'
      case 'in_progress': return '#22c55e'
      case 'completed': return '#10b981'
      case 'declined': return '#6b7280'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchFeedbackData()
  }, [fetchFeedbackData])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const newFeedback = useMemo(() => feedback.filter(f => f.status === 'new'), [feedback])
  const plannedFeedback = useMemo(() => feedback.filter(f => f.status === 'planned'), [feedback])
  const inProgressFeedback = useMemo(() => feedback.filter(f => f.status === 'in_progress'), [feedback])
  const completedFeedback = useMemo(() => feedback.filter(f => f.status === 'completed'), [feedback])
  const publicFeedback = useMemo(() => feedback.filter(f => f.isPublic), [feedback])
  const topVotedFeedback = useMemo(() => [...feedback].sort((a, b) => b.votes - a.votes).slice(0, 10), [feedback])
  const recentFeedback = useMemo(() => [...feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [feedback])
  const hasVoted = useCallback((feedbackId: string) => {
    const item = feedback.find(f => f.id === feedbackId)
    return item?.voterIds.includes('user-1') || false
  }, [feedback])

  return {
    feedback, categories, boards, currentFeedback, stats,
    newFeedback, plannedFeedback, inProgressFeedback, completedFeedback,
    publicFeedback, topVotedFeedback, recentFeedback,
    isLoading, error,
    refresh, submitFeedback, updateFeedback, deleteFeedback,
    changeStatus, assignFeedback, vote, hasVoted,
    addComment, deleteComment, addAttachment, addTag, removeTag,
    submitNPS, searchFeedback, filterFeedback,
    getTypeColor, getStatusColor, setCurrentFeedback
  }
}

export default useFeedback
