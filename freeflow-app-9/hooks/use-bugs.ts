'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low'
export type BugStatus = 'open' | 'confirmed' | 'in_progress' | 'testing' | 'resolved' | 'closed' | 'wont_fix'
export type BugType = 'bug' | 'crash' | 'performance' | 'security' | 'ui' | 'data'

export interface Bug {
  id: string
  title: string
  description: string
  type: BugType
  severity: BugSeverity
  status: BugStatus
  priority: number
  stepsToReproduce: string[]
  expectedBehavior: string
  actualBehavior: string
  environment: BugEnvironment
  affectedVersions: string[]
  fixedInVersion?: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  assigneeId?: string
  assigneeName?: string
  projectId?: string
  projectName?: string
  component?: string
  labels: string[]
  attachments: BugAttachment[]
  comments: BugComment[]
  linkedIssues: string[]
  duplicateOf?: string
  regression: boolean
  rootCause?: string
  resolution?: string
  timeEstimate?: number // hours
  timeSpent?: number // hours
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
}

export interface BugEnvironment {
  os?: string
  browser?: string
  browserVersion?: string
  device?: string
  appVersion?: string
  screenResolution?: string
  additionalInfo?: string
}

export interface BugAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface BugComment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
}

export interface BugStats {
  totalBugs: number
  openBugs: number
  criticalBugs: number
  resolvedThisWeek: number
  avgResolutionTime: number // hours
  bugsBySeverity: Record<BugSeverity, number>
  bugsByStatus: Record<BugStatus, number>
  bugsByComponent: { component: string; count: number }[]
  trendData: { date: string; opened: number; resolved: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBugs: Bug[] = [
  {
    id: 'bug-1',
    title: 'Application crashes on file upload',
    description: 'The application crashes when uploading files larger than 10MB.',
    type: 'crash',
    severity: 'critical',
    status: 'in_progress',
    priority: 1,
    stepsToReproduce: ['Navigate to Files page', 'Click Upload button', 'Select a file larger than 10MB', 'App crashes'],
    expectedBehavior: 'File should upload with progress indicator',
    actualBehavior: 'Application crashes with white screen',
    environment: { os: 'macOS 14.0', browser: 'Chrome', browserVersion: '120', appVersion: '2.1.0' },
    affectedVersions: ['2.1.0', '2.0.9'],
    reporterId: 'user-3',
    reporterName: 'Emily Johnson',
    reporterEmail: 'emily@example.com',
    assigneeId: 'user-1',
    assigneeName: 'Alex Chen',
    projectId: 'proj-1',
    projectName: 'FreeFlow App',
    component: 'File Upload',
    labels: ['crash', 'urgent', 'file-upload'],
    attachments: [{ id: 'att-1', name: 'crash-log.txt', url: '/logs/crash.txt', type: 'text/plain', size: 15000, uploadedBy: 'user-3', uploadedAt: '2024-03-20' }],
    comments: [
      { id: 'cmt-1', content: 'Investigating the issue. Looks like a memory leak.', authorId: 'user-1', authorName: 'Alex Chen', isInternal: true, createdAt: '2024-03-20T10:00:00Z', updatedAt: '2024-03-20T10:00:00Z' }
    ],
    linkedIssues: [],
    regression: false,
    timeEstimate: 4,
    timeSpent: 2,
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'bug-2',
    title: 'Incorrect date format in reports',
    description: 'Reports show dates in US format instead of user locale.',
    type: 'ui',
    severity: 'low',
    status: 'open',
    priority: 3,
    stepsToReproduce: ['Generate any report', 'Check date columns'],
    expectedBehavior: 'Dates should follow user locale settings',
    actualBehavior: 'All dates show in MM/DD/YYYY format',
    environment: { browser: 'Firefox', browserVersion: '121', appVersion: '2.1.0' },
    affectedVersions: ['2.1.0'],
    reporterId: 'user-4',
    reporterName: 'Michael Brown',
    reporterEmail: 'michael@example.com',
    projectId: 'proj-1',
    projectName: 'FreeFlow App',
    component: 'Reports',
    labels: ['i18n', 'reports'],
    attachments: [],
    comments: [],
    linkedIssues: [],
    regression: false,
    createdAt: '2024-03-19T14:00:00Z',
    updatedAt: '2024-03-19T14:00:00Z'
  },
  {
    id: 'bug-3',
    title: 'Performance degradation on dashboard',
    description: 'Dashboard takes 5+ seconds to load with more than 100 widgets.',
    type: 'performance',
    severity: 'high',
    status: 'confirmed',
    priority: 2,
    stepsToReproduce: ['Add 100+ widgets to dashboard', 'Refresh the page', 'Observe load time'],
    expectedBehavior: 'Dashboard should load within 2 seconds',
    actualBehavior: 'Dashboard takes 5-8 seconds to load',
    environment: { browser: 'Chrome', browserVersion: '120', appVersion: '2.1.0' },
    affectedVersions: ['2.1.0', '2.0.8'],
    reporterId: 'user-5',
    reporterName: 'Lisa Chen',
    reporterEmail: 'lisa@example.com',
    projectId: 'proj-1',
    projectName: 'FreeFlow App',
    component: 'Dashboard',
    labels: ['performance', 'dashboard'],
    attachments: [],
    comments: [],
    linkedIssues: [],
    regression: true,
    rootCause: 'N+1 query issue in widget loading',
    createdAt: '2024-03-18T09:00:00Z',
    updatedAt: '2024-03-19T11:00:00Z'
  }
]

const mockStats: BugStats = {
  totalBugs: 156,
  openBugs: 42,
  criticalBugs: 3,
  resolvedThisWeek: 18,
  avgResolutionTime: 24,
  bugsBySeverity: { critical: 3, high: 12, medium: 45, low: 96 },
  bugsByStatus: { open: 25, confirmed: 8, in_progress: 9, testing: 5, resolved: 85, closed: 20, wont_fix: 4 },
  bugsByComponent: [
    { component: 'Dashboard', count: 28 },
    { component: 'File Upload', count: 22 },
    { component: 'Reports', count: 18 }
  ],
  trendData: [
    { date: '2024-03-14', opened: 5, resolved: 8 },
    { date: '2024-03-15', opened: 3, resolved: 4 },
    { date: '2024-03-16', opened: 7, resolved: 5 },
    { date: '2024-03-17', opened: 4, resolved: 6 },
    { date: '2024-03-18', opened: 6, resolved: 7 },
    { date: '2024-03-19', opened: 3, resolved: 5 },
    { date: '2024-03-20', opened: 2, resolved: 3 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBugsOptions {
  
}

export function useBugs(options: UseBugsOptions = {}) {
  const {  } = options

  const [bugs, setBugs] = useState<Bug[]>([])
  const [currentBug, setCurrentBug] = useState<Bug | null>(null)
  const [stats, setStats] = useState<BugStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBugs = useCallback(async () => {
    }, [])

  const updateBug = useCallback(async (bugId: string, updates: Partial<Bug>) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      ...updates,
      updatedAt: new Date().toISOString()
    } : b))
    return { success: true }
  }, [])

  const deleteBug = useCallback(async (bugId: string) => {
    setBugs(prev => prev.filter(b => b.id !== bugId))
    return { success: true }
  }, [])

  const changeStatus = useCallback(async (bugId: string, status: BugStatus, resolution?: string) => {
    const updates: Partial<Bug> = { status }
    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString()
      if (resolution) updates.resolution = resolution
    }
    if (status === 'closed') updates.closedAt = new Date().toISOString()
    return updateBug(bugId, updates)
  }, [updateBug])

  const assignBug = useCallback(async (bugId: string, assigneeId: string, assigneeName: string) => {
    return updateBug(bugId, { assigneeId, assigneeName })
  }, [updateBug])

  const unassignBug = useCallback(async (bugId: string) => {
    return updateBug(bugId, { assigneeId: undefined, assigneeName: undefined })
  }, [updateBug])

  const changeSeverity = useCallback(async (bugId: string, severity: BugSeverity) => {
    return updateBug(bugId, { severity })
  }, [updateBug])

  const addComment = useCallback(async (bugId: string, content: string, isInternal = false) => {
    const comment: BugComment = {
      id: `cmt-${Date.now()}`,
      content,
      authorId: 'user-1',
      authorName: 'You',
      isInternal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      comments: [...b.comments, comment],
      updatedAt: new Date().toISOString()
    } : b))
    return { success: true, comment }
  }, [])

  const deleteComment = useCallback(async (bugId: string, commentId: string) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      comments: b.comments.filter(c => c.id !== commentId)
    } : b))
    return { success: true }
  }, [])

  const addAttachment = useCallback(async (bugId: string, file: File) => {
    const attachment: BugAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedBy: 'user-1',
      uploadedAt: new Date().toISOString()
    }
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      attachments: [...b.attachments, attachment]
    } : b))
    return { success: true, attachment }
  }, [])

  const removeAttachment = useCallback(async (bugId: string, attachmentId: string) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      attachments: b.attachments.filter(a => a.id !== attachmentId)
    } : b))
    return { success: true }
  }, [])

  const addLabel = useCallback(async (bugId: string, label: string) => {
    setBugs(prev => prev.map(b => b.id === bugId && !b.labels.includes(label) ? {
      ...b,
      labels: [...b.labels, label]
    } : b))
    return { success: true }
  }, [])

  const removeLabel = useCallback(async (bugId: string, label: string) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      labels: b.labels.filter(l => l !== label)
    } : b))
    return { success: true }
  }, [])

  const linkBug = useCallback(async (bugId: string, linkedBugId: string) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      linkedIssues: [...b.linkedIssues, linkedBugId]
    } : b))
    return { success: true }
  }, [])

  const markAsDuplicate = useCallback(async (bugId: string, originalBugId: string) => {
    return updateBug(bugId, { duplicateOf: originalBugId, status: 'closed', resolution: `Duplicate of ${originalBugId}` })
  }, [updateBug])

  const logTime = useCallback(async (bugId: string, hours: number) => {
    setBugs(prev => prev.map(b => b.id === bugId ? {
      ...b,
      timeSpent: (b.timeSpent || 0) + hours
    } : b))
    return { success: true }
  }, [])

  const searchBugs = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return bugs.filter(b =>
      b.title.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.id.toLowerCase().includes(lowerQuery)
    )
  }, [bugs])

  const filterBugs = useCallback((filters: {
    severity?: BugSeverity[]
    status?: BugStatus[]
    type?: BugType[]
    assigneeId?: string
    component?: string
    projectId?: string
  }) => {
    return bugs.filter(b => {
      if (filters.severity?.length && !filters.severity.includes(b.severity)) return false
      if (filters.status?.length && !filters.status.includes(b.status)) return false
      if (filters.type?.length && !filters.type.includes(b.type)) return false
      if (filters.assigneeId && b.assigneeId !== filters.assigneeId) return false
      if (filters.component && b.component !== filters.component) return false
      if (filters.projectId && b.projectId !== filters.projectId) return false
      return true
    })
  }, [bugs])

  const getSeverityColor = useCallback((severity: BugSeverity): string => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      case 'low': return '#22c55e'
    }
  }, [])

  const getStatusColor = useCallback((status: BugStatus): string => {
    switch (status) {
      case 'open': return '#3b82f6'
      case 'confirmed': return '#8b5cf6'
      case 'in_progress': return '#f59e0b'
      case 'testing': return '#06b6d4'
      case 'resolved': return '#22c55e'
      case 'closed': return '#6b7280'
      case 'wont_fix': return '#9ca3af'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBugs()
  }, [fetchBugs])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const openBugs = useMemo(() => bugs.filter(b => ['open', 'confirmed', 'in_progress'].includes(b.status)), [bugs])
  const criticalBugs = useMemo(() => bugs.filter(b => b.severity === 'critical' && !['resolved', 'closed', 'wont_fix'].includes(b.status)), [bugs])
  const myBugs = useMemo(() => bugs.filter(b => b.assigneeId === 'user-1'), [bugs])
  const unassignedBugs = useMemo(() => bugs.filter(b => !b.assigneeId && !['resolved', 'closed', 'wont_fix'].includes(b.status)), [bugs])
  const regressions = useMemo(() => bugs.filter(b => b.regression), [bugs])
  const recentlyResolved = useMemo(() => bugs.filter(b => b.status === 'resolved').sort((a, b) => new Date(b.resolvedAt || 0).getTime() - new Date(a.resolvedAt || 0).getTime()).slice(0, 10), [bugs])

  return {
    bugs, currentBug, stats,
    openBugs, criticalBugs, myBugs, unassignedBugs, regressions, recentlyResolved,
    isLoading, error,
    refresh, createBug, updateBug, deleteBug,
    changeStatus, assignBug, unassignBug, changeSeverity,
    addComment, deleteComment, addAttachment, removeAttachment,
    addLabel, removeLabel, linkBug, markAsDuplicate, logTime,
    searchBugs, filterBugs, getSeverityColor, getStatusColor,
    setCurrentBug
  }
}

export default useBugs
