'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketType = 'bug' | 'feature' | 'question' | 'task' | 'incident'

export interface Ticket {
  id: string
  number: string
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  category: string
  tags: string[]
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  reporterAvatar?: string
  dueDate?: string
  resolvedAt?: string
  closedAt?: string
  firstResponseAt?: string
  slaBreached: boolean
  attachments: TicketAttachment[]
  comments: TicketComment[]
  history: TicketHistory[]
  customFields: Record<string, any>
  relatedTickets: string[]
  createdAt: string
  updatedAt: string
}

export interface TicketAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
}

export interface TicketComment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isInternal: boolean
  attachments: TicketAttachment[]
  createdAt: string
  updatedAt: string
}

export interface TicketHistory {
  id: string
  field: string
  oldValue: string
  newValue: string
  changedBy: string
  changedByName: string
  changedAt: string
}

export interface TicketCategory {
  id: string
  name: string
  description?: string
  color: string
  parentId?: string
  ticketCount: number
}

export interface TicketQueue {
  id: string
  name: string
  description?: string
  assignees: string[]
  autoAssign: boolean
  slaPolicy?: string
  ticketCount: number
}

export interface SLAPolicy {
  id: string
  name: string
  description?: string
  firstResponseTime: number // minutes
  resolutionTime: number // minutes
  priorities: Record<TicketPriority, { firstResponse: number; resolution: number }>
  isActive: boolean
}

export interface TicketStats {
  totalTickets: number
  openTickets: number
  resolvedToday: number
  avgResolutionTime: number // hours
  avgFirstResponse: number // minutes
  slaCompliance: number // percentage
  ticketsByPriority: Record<TicketPriority, number>
  ticketsByStatus: Record<TicketStatus, number>
  ticketsByCategory: { category: string; count: number }[]
  ticketTrend: { date: string; created: number; resolved: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTickets: Ticket[] = [
  {
    id: 'tkt-1',
    number: 'TKT-001',
    title: 'Cannot login to dashboard',
    description: 'I am unable to login to the dashboard. Getting a 500 error after entering credentials.',
    type: 'bug',
    status: 'in_progress',
    priority: 'high',
    category: 'Authentication',
    tags: ['login', 'authentication', 'critical'],
    assigneeId: 'user-2',
    assigneeName: 'Sarah Miller',
    assigneeAvatar: '/avatars/sarah.jpg',
    reporterId: 'user-3',
    reporterName: 'John Davis',
    reporterEmail: 'john@example.com',
    reporterAvatar: '/avatars/john.jpg',
    dueDate: '2024-03-22',
    firstResponseAt: '2024-03-20T10:30:00Z',
    slaBreached: false,
    attachments: [
      { id: 'att-1', name: 'error-screenshot.png', url: '/attachments/error.png', size: 245000, type: 'image/png', uploadedBy: 'user-3', uploadedAt: '2024-03-20T10:00:00Z' }
    ],
    comments: [
      { id: 'cmt-1', content: 'Thank you for reporting this. We are investigating the issue.', authorId: 'user-2', authorName: 'Sarah Miller', isInternal: false, attachments: [], createdAt: '2024-03-20T10:30:00Z', updatedAt: '2024-03-20T10:30:00Z' },
      { id: 'cmt-2', content: 'Looks like a database connection issue. Need to check with DevOps.', authorId: 'user-2', authorName: 'Sarah Miller', isInternal: true, attachments: [], createdAt: '2024-03-20T11:00:00Z', updatedAt: '2024-03-20T11:00:00Z' }
    ],
    history: [
      { id: 'hist-1', field: 'status', oldValue: 'open', newValue: 'in_progress', changedBy: 'user-2', changedByName: 'Sarah Miller', changedAt: '2024-03-20T10:15:00Z' }
    ],
    customFields: {},
    relatedTickets: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T11:00:00Z'
  },
  {
    id: 'tkt-2',
    number: 'TKT-002',
    title: 'Request for dark mode feature',
    description: 'Would be great to have a dark mode option for the application.',
    type: 'feature',
    status: 'open',
    priority: 'low',
    category: 'UI/UX',
    tags: ['feature-request', 'ui', 'dark-mode'],
    reporterId: 'user-4',
    reporterName: 'Emma Wilson',
    reporterEmail: 'emma@example.com',
    slaBreached: false,
    attachments: [],
    comments: [],
    history: [],
    customFields: {},
    relatedTickets: [],
    createdAt: '2024-03-19T14:00:00Z',
    updatedAt: '2024-03-19T14:00:00Z'
  },
  {
    id: 'tkt-3',
    number: 'TKT-003',
    title: 'How to export data to CSV?',
    description: 'I need to export my project data to CSV format. Is this possible?',
    type: 'question',
    status: 'resolved',
    priority: 'medium',
    category: 'Data Export',
    tags: ['export', 'csv', 'help'],
    assigneeId: 'user-1',
    assigneeName: 'Alex Chen',
    reporterId: 'user-5',
    reporterName: 'Mike Brown',
    reporterEmail: 'mike@example.com',
    resolvedAt: '2024-03-18T16:00:00Z',
    firstResponseAt: '2024-03-18T14:30:00Z',
    slaBreached: false,
    attachments: [],
    comments: [
      { id: 'cmt-3', content: 'Yes! You can export to CSV from Settings > Data > Export. Let me know if you need more help.', authorId: 'user-1', authorName: 'Alex Chen', isInternal: false, attachments: [], createdAt: '2024-03-18T14:30:00Z', updatedAt: '2024-03-18T14:30:00Z' }
    ],
    history: [],
    customFields: {},
    relatedTickets: [],
    createdAt: '2024-03-18T14:00:00Z',
    updatedAt: '2024-03-18T16:00:00Z'
  }
]

const mockCategories: TicketCategory[] = [
  { id: 'cat-1', name: 'Authentication', color: '#ef4444', ticketCount: 15 },
  { id: 'cat-2', name: 'UI/UX', color: '#3b82f6', ticketCount: 28 },
  { id: 'cat-3', name: 'Data Export', color: '#22c55e', ticketCount: 8 },
  { id: 'cat-4', name: 'Billing', color: '#f59e0b', ticketCount: 12 },
  { id: 'cat-5', name: 'Integration', color: '#8b5cf6', ticketCount: 20 }
]

const mockQueues: TicketQueue[] = [
  { id: 'queue-1', name: 'General Support', assignees: ['user-1', 'user-2'], autoAssign: true, ticketCount: 45 },
  { id: 'queue-2', name: 'Technical Support', assignees: ['user-2', 'user-3'], autoAssign: true, ticketCount: 32 },
  { id: 'queue-3', name: 'Billing Support', assignees: ['user-4'], autoAssign: false, ticketCount: 12 }
]

const mockStats: TicketStats = {
  totalTickets: 156,
  openTickets: 23,
  resolvedToday: 8,
  avgResolutionTime: 4.5,
  avgFirstResponse: 25,
  slaCompliance: 94.5,
  ticketsByPriority: { low: 45, medium: 68, high: 35, urgent: 8 },
  ticketsByStatus: { open: 23, in_progress: 18, pending: 12, resolved: 85, closed: 18 },
  ticketsByCategory: [
    { category: 'UI/UX', count: 28 },
    { category: 'Integration', count: 20 },
    { category: 'Authentication', count: 15 }
  ],
  ticketTrend: [
    { date: '2024-03-14', created: 12, resolved: 10 },
    { date: '2024-03-15', created: 8, resolved: 11 },
    { date: '2024-03-16', created: 15, resolved: 12 },
    { date: '2024-03-17', created: 10, resolved: 14 },
    { date: '2024-03-18', created: 9, resolved: 8 },
    { date: '2024-03-19', created: 11, resolved: 9 },
    { date: '2024-03-20', created: 7, resolved: 8 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseTicketsOptions {
  
}

export function useTickets(options: UseTicketsOptions = {}) {
  const {  } = options

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [queues, setQueues] = useState<TicketQueue[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTickets = useCallback(async () => {
    }, [tickets.length])

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t
      const history: TicketHistory[] = []
      Object.entries(updates).forEach(([key, value]) => {
        if (t[key as keyof Ticket] !== value && typeof value !== 'object') {
          history.push({
            id: `hist-${Date.now()}`,
            field: key,
            oldValue: String(t[key as keyof Ticket] || ''),
            newValue: String(value),
            changedBy: 'user-1',
            changedByName: 'You',
            changedAt: new Date().toISOString()
          })
        }
      })
      return { ...t, ...updates, history: [...t.history, ...history], updatedAt: new Date().toISOString() }
    }))
    return { success: true }
  }, [])

  const deleteTicket = useCallback(async (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId))
    return { success: true }
  }, [])

  const assignTicket = useCallback(async (ticketId: string, assigneeId: string, assigneeName: string) => {
    return updateTicket(ticketId, { assigneeId, assigneeName, status: 'in_progress' })
  }, [updateTicket])

  const unassignTicket = useCallback(async (ticketId: string) => {
    return updateTicket(ticketId, { assigneeId: undefined, assigneeName: undefined })
  }, [updateTicket])

  const changeStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
    const updates: Partial<Ticket> = { status }
    if (status === 'resolved') updates.resolvedAt = new Date().toISOString()
    if (status === 'closed') updates.closedAt = new Date().toISOString()
    return updateTicket(ticketId, updates)
  }, [updateTicket])

  const changePriority = useCallback(async (ticketId: string, priority: TicketPriority) => {
    return updateTicket(ticketId, { priority })
  }, [updateTicket])

  const addComment = useCallback(async (ticketId: string, content: string, isInternal = false) => {
    const comment: TicketComment = {
      id: `cmt-${Date.now()}`,
      content,
      authorId: 'user-1',
      authorName: 'You',
      isInternal,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      comments: [...t.comments, comment],
      firstResponseAt: t.firstResponseAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true, comment }
  }, [])

  const deleteComment = useCallback(async (ticketId: string, commentId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      comments: t.comments.filter(c => c.id !== commentId),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const addAttachment = useCallback(async (ticketId: string, file: File) => {
    const attachment: TicketAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      uploadedBy: 'user-1',
      uploadedAt: new Date().toISOString()
    }
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      attachments: [...t.attachments, attachment],
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true, attachment }
  }, [])

  const removeAttachment = useCallback(async (ticketId: string, attachmentId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      attachments: t.attachments.filter(a => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const addTag = useCallback(async (ticketId: string, tag: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId && !t.tags.includes(tag) ? {
      ...t,
      tags: [...t.tags, tag],
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const removeTag = useCallback(async (ticketId: string, tag: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      tags: t.tags.filter(tg => tg !== tag),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const linkTicket = useCallback(async (ticketId: string, relatedTicketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      relatedTickets: [...t.relatedTickets, relatedTicketId],
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const unlinkTicket = useCallback(async (ticketId: string, relatedTicketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      relatedTickets: t.relatedTickets.filter(id => id !== relatedTicketId),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const mergeTickets = useCallback(async (primaryId: string, secondaryId: string) => {
    const secondary = tickets.find(t => t.id === secondaryId)
    if (!secondary) return { success: false, error: 'Ticket not found' }

    setTickets(prev => prev.map(t => t.id === primaryId ? {
      ...t,
      comments: [...t.comments, ...secondary.comments],
      attachments: [...t.attachments, ...secondary.attachments],
      tags: [...new Set([...t.tags, ...secondary.tags])],
      relatedTickets: [...t.relatedTickets, secondaryId],
      updatedAt: new Date().toISOString()
    } : t).filter(t => t.id !== secondaryId))
    return { success: true }
  }, [tickets])

  const searchTickets = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return tickets.filter(t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.number.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [tickets])

  const filterTickets = useCallback((filters: {
    status?: TicketStatus[]
    priority?: TicketPriority[]
    type?: TicketType[]
    category?: string[]
    assigneeId?: string
    reporterId?: string
  }) => {
    return tickets.filter(t => {
      if (filters.status?.length && !filters.status.includes(t.status)) return false
      if (filters.priority?.length && !filters.priority.includes(t.priority)) return false
      if (filters.type?.length && !filters.type.includes(t.type)) return false
      if (filters.category?.length && !filters.category.includes(t.category)) return false
      if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false
      if (filters.reporterId && t.reporterId !== filters.reporterId) return false
      return true
    })
  }, [tickets])

  const getPriorityColor = useCallback((priority: TicketPriority): string => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      case 'low': return '#22c55e'
    }
  }, [])

  const getStatusColor = useCallback((status: TicketStatus): string => {
    switch (status) {
      case 'open': return '#3b82f6'
      case 'in_progress': return '#f59e0b'
      case 'pending': return '#8b5cf6'
      case 'resolved': return '#22c55e'
      case 'closed': return '#6b7280'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchTickets()
  }, [fetchTickets])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const openTickets = useMemo(() => tickets.filter(t => t.status === 'open'), [tickets])
  const inProgressTickets = useMemo(() => tickets.filter(t => t.status === 'in_progress'), [tickets])
  const pendingTickets = useMemo(() => tickets.filter(t => t.status === 'pending'), [tickets])
  const resolvedTickets = useMemo(() => tickets.filter(t => t.status === 'resolved'), [tickets])
  const closedTickets = useMemo(() => tickets.filter(t => t.status === 'closed'), [tickets])
  const urgentTickets = useMemo(() => tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed'), [tickets])
  const unassignedTickets = useMemo(() => tickets.filter(t => !t.assigneeId && t.status !== 'closed'), [tickets])
  const myTickets = useMemo(() => tickets.filter(t => t.assigneeId === 'user-1'), [tickets])
  const overduetTickets = useMemo(() => tickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !['resolved', 'closed'].includes(t.status)), [tickets])

  return {
    tickets, categories, queues, currentTicket, stats,
    openTickets, inProgressTickets, pendingTickets, resolvedTickets, closedTickets,
    urgentTickets, unassignedTickets, myTickets, overduetTickets,
    isLoading, error,
    refresh, createTicket, updateTicket, deleteTicket,
    assignTicket, unassignTicket, changeStatus, changePriority,
    addComment, deleteComment, addAttachment, removeAttachment,
    addTag, removeTag, linkTicket, unlinkTicket, mergeTickets,
    searchTickets, filterTickets, getPriorityColor, getStatusColor,
    setCurrentTicket
  }
}

export default useTickets
