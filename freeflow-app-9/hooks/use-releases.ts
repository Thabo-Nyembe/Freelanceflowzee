'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ReleaseStatus = 'draft' | 'planned' | 'in_progress' | 'testing' | 'released' | 'cancelled'
export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix'

export interface Release {
  id: string
  version: string
  name: string
  description: string
  type: ReleaseType
  status: ReleaseStatus
  targetDate: string
  releaseDate?: string
  changelog: ChangelogEntry[]
  features: ReleaseItem[]
  bugFixes: ReleaseItem[]
  improvements: ReleaseItem[]
  breakingChanges: string[]
  knownIssues: string[]
  dependencies: ReleaseDependency[]
  artifacts: ReleaseArtifact[]
  environment: string
  branch: string
  commitHash?: string
  approvals: ReleaseApproval[]
  requiredApprovals: number
  notes: string
  tags: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ChangelogEntry {
  id: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security' | 'performance'
  title: string
  description?: string
  issueId?: string
  prId?: string
}

export interface ReleaseItem {
  id: string
  title: string
  description?: string
  issueId?: string
  prId?: string
  assignee?: string
  status: 'pending' | 'completed' | 'blocked'
}

export interface ReleaseDependency {
  id: string
  name: string
  version: string
  type: 'required' | 'optional'
  notes?: string
}

export interface ReleaseArtifact {
  id: string
  name: string
  type: string
  url: string
  size: number
  checksum?: string
  uploadedAt: string
}

export interface ReleaseApproval {
  id: string
  approverId: string
  approverName: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  approvedAt?: string
}

export interface ReleaseStats {
  totalReleases: number
  releasedThisMonth: number
  upcomingReleases: number
  avgReleaseTime: number // days
  releasesByType: Record<ReleaseType, number>
  releasesByMonth: { month: string; count: number }[]
  recentReleases: { version: string; date: string; type: ReleaseType }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockReleases: Release[] = [
  {
    id: 'rel-1',
    version: '2.2.0',
    name: 'Summer Update',
    description: 'Major feature release with new dashboard and improved performance.',
    type: 'minor',
    status: 'in_progress',
    targetDate: '2024-04-01',
    changelog: [
      { id: 'cl-1', type: 'feature', title: 'New dashboard widgets', description: 'Added 10 new customizable widgets' },
      { id: 'cl-2', type: 'improvement', title: 'Performance improvements', description: '50% faster page loads' },
      { id: 'cl-3', type: 'fix', title: 'Fixed file upload crash', issueId: 'bug-1' }
    ],
    features: [
      { id: 'feat-1', title: 'Custom dashboard widgets', status: 'completed', assignee: 'Alex Chen' },
      { id: 'feat-2', title: 'Real-time collaboration', status: 'pending', assignee: 'Sarah Miller' }
    ],
    bugFixes: [
      { id: 'fix-1', title: 'File upload crash fix', status: 'completed', issueId: 'bug-1' }
    ],
    improvements: [
      { id: 'imp-1', title: 'Database query optimization', status: 'completed' }
    ],
    breakingChanges: ['API v1 endpoints deprecated'],
    knownIssues: [],
    dependencies: [
      { id: 'dep-1', name: 'React', version: '18.2.0', type: 'required' }
    ],
    artifacts: [],
    environment: 'production',
    branch: 'release/2.2.0',
    approvals: [
      { id: 'apr-1', approverId: 'user-2', approverName: 'Sarah Miller', status: 'approved', approvedAt: '2024-03-20' },
      { id: 'apr-2', approverId: 'user-3', approverName: 'Mike Johnson', status: 'pending' }
    ],
    requiredApprovals: 2,
    notes: 'Ensure database migration runs before deployment',
    tags: ['major', 'dashboard', 'performance'],
    createdBy: 'user-1',
    createdByName: 'Alex Chen',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-20'
  },
  {
    id: 'rel-2',
    version: '2.1.1',
    name: 'Security Patch',
    description: 'Critical security fixes and minor improvements.',
    type: 'patch',
    status: 'released',
    targetDate: '2024-03-15',
    releaseDate: '2024-03-15',
    changelog: [
      { id: 'cl-4', type: 'security', title: 'XSS vulnerability fix' },
      { id: 'cl-5', type: 'fix', title: 'Session timeout issue resolved' }
    ],
    features: [],
    bugFixes: [
      { id: 'fix-2', title: 'XSS vulnerability', status: 'completed' },
      { id: 'fix-3', title: 'Session timeout', status: 'completed' }
    ],
    improvements: [],
    breakingChanges: [],
    knownIssues: [],
    dependencies: [],
    artifacts: [
      { id: 'art-1', name: 'freeflow-2.1.1.tar.gz', type: 'application/gzip', url: '/releases/2.1.1.tar.gz', size: 25000000, checksum: 'sha256:abc123', uploadedAt: '2024-03-15' }
    ],
    environment: 'production',
    branch: 'release/2.1.1',
    commitHash: 'a1b2c3d4',
    approvals: [
      { id: 'apr-3', approverId: 'user-2', approverName: 'Sarah Miller', status: 'approved', approvedAt: '2024-03-14' },
      { id: 'apr-4', approverId: 'user-3', approverName: 'Mike Johnson', status: 'approved', approvedAt: '2024-03-14' }
    ],
    requiredApprovals: 2,
    notes: '',
    tags: ['security', 'hotfix'],
    createdBy: 'user-1',
    createdByName: 'Alex Chen',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15'
  }
]

const mockStats: ReleaseStats = {
  totalReleases: 45,
  releasedThisMonth: 3,
  upcomingReleases: 2,
  avgReleaseTime: 14,
  releasesByType: { major: 8, minor: 22, patch: 12, hotfix: 3 },
  releasesByMonth: [
    { month: '2024-01', count: 4 },
    { month: '2024-02', count: 5 },
    { month: '2024-03', count: 3 }
  ],
  recentReleases: [
    { version: '2.1.1', date: '2024-03-15', type: 'patch' },
    { version: '2.1.0', date: '2024-02-28', type: 'minor' },
    { version: '2.0.5', date: '2024-02-15', type: 'patch' }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseReleasesOptions {
  
}

export function useReleases(options: UseReleasesOptions = {}) {
  const {  } = options

  const [releases, setReleases] = useState<Release[]>([])
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null)
  const [stats, setStats] = useState<ReleaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReleases = useCallback(async () => {
    }, [])

  const updateRelease = useCallback(async (releaseId: string, updates: Partial<Release>) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      ...updates,
      updatedAt: new Date().toISOString()
    } : r))
    return { success: true }
  }, [])

  const deleteRelease = useCallback(async (releaseId: string) => {
    setReleases(prev => prev.filter(r => r.id !== releaseId))
    return { success: true }
  }, [])

  const changeStatus = useCallback(async (releaseId: string, status: ReleaseStatus) => {
    const updates: Partial<Release> = { status }
    if (status === 'released') updates.releaseDate = new Date().toISOString().split('T')[0]
    return updateRelease(releaseId, updates)
  }, [updateRelease])

  const addChangelogEntry = useCallback(async (releaseId: string, entry: Omit<ChangelogEntry, 'id'>) => {
    const newEntry: ChangelogEntry = { id: `cl-${Date.now()}`, ...entry }
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      changelog: [...r.changelog, newEntry]
    } : r))
    return { success: true, entry: newEntry }
  }, [])

  const removeChangelogEntry = useCallback(async (releaseId: string, entryId: string) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      changelog: r.changelog.filter(e => e.id !== entryId)
    } : r))
    return { success: true }
  }, [])

  const addFeature = useCallback(async (releaseId: string, feature: Omit<ReleaseItem, 'id'>) => {
    const newFeature: ReleaseItem = { id: `feat-${Date.now()}`, ...feature }
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      features: [...r.features, newFeature]
    } : r))
    return { success: true, feature: newFeature }
  }, [])

  const addBugFix = useCallback(async (releaseId: string, bugFix: Omit<ReleaseItem, 'id'>) => {
    const newBugFix: ReleaseItem = { id: `fix-${Date.now()}`, ...bugFix }
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      bugFixes: [...r.bugFixes, newBugFix]
    } : r))
    return { success: true, bugFix: newBugFix }
  }, [])

  const updateItemStatus = useCallback(async (releaseId: string, itemId: string, status: ReleaseItem['status']) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      features: r.features.map(f => f.id === itemId ? { ...f, status } : f),
      bugFixes: r.bugFixes.map(b => b.id === itemId ? { ...b, status } : b),
      improvements: r.improvements.map(i => i.id === itemId ? { ...i, status } : i)
    } : r))
    return { success: true }
  }, [])

  const addArtifact = useCallback(async (releaseId: string, file: File) => {
    const artifact: ReleaseArtifact = {
      id: `art-${Date.now()}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date().toISOString()
    }
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      artifacts: [...r.artifacts, artifact]
    } : r))
    return { success: true, artifact }
  }, [])

  const removeArtifact = useCallback(async (releaseId: string, artifactId: string) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      artifacts: r.artifacts.filter(a => a.id !== artifactId)
    } : r))
    return { success: true }
  }, [])

  const requestApproval = useCallback(async (releaseId: string, approverIds: string[]) => {
    const newApprovals: ReleaseApproval[] = approverIds.map(id => ({
      id: `apr-${Date.now()}-${id}`,
      approverId: id,
      approverName: `User ${id}`,
      status: 'pending' as const
    }))
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      approvals: [...r.approvals, ...newApprovals]
    } : r))
    return { success: true }
  }, [])

  const approveRelease = useCallback(async (releaseId: string, comment?: string) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      approvals: r.approvals.map(a => a.approverId === 'user-1' ? {
        ...a,
        status: 'approved' as const,
        comment,
        approvedAt: new Date().toISOString()
      } : a)
    } : r))
    return { success: true }
  }, [])

  const rejectRelease = useCallback(async (releaseId: string, comment: string) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? {
      ...r,
      approvals: r.approvals.map(a => a.approverId === 'user-1' ? {
        ...a,
        status: 'rejected' as const,
        comment
      } : a)
    } : r))
    return { success: true }
  }, [])

  const publishRelease = useCallback(async (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId)
    if (!release) return { success: false, error: 'Release not found' }

    const approvedCount = release.approvals.filter(a => a.status === 'approved').length
    if (approvedCount < release.requiredApprovals) {
      return { success: false, error: `Requires ${release.requiredApprovals} approvals, only ${approvedCount} received` }
    }

    return changeStatus(releaseId, 'released')
  }, [releases, changeStatus])

  const generateChangelog = useCallback((releaseId: string): string => {
    const release = releases.find(r => r.id === releaseId)
    if (!release) return ''

    let changelog = `# ${release.name} (${release.version})\n\n`
    changelog += `Released: ${release.releaseDate || release.targetDate}\n\n`

    if (release.changelog.filter(e => e.type === 'feature').length > 0) {
      changelog += '## Features\n\n'
      release.changelog.filter(e => e.type === 'feature').forEach(e => {
        changelog += `- ${e.title}${e.description ? `: ${e.description}` : ''}\n`
      })
      changelog += '\n'
    }

    if (release.changelog.filter(e => e.type === 'fix').length > 0) {
      changelog += '## Bug Fixes\n\n'
      release.changelog.filter(e => e.type === 'fix').forEach(e => {
        changelog += `- ${e.title}\n`
      })
      changelog += '\n'
    }

    if (release.breakingChanges.length > 0) {
      changelog += '## Breaking Changes\n\n'
      release.breakingChanges.forEach(bc => {
        changelog += `- ${bc}\n`
      })
    }

    return changelog
  }, [releases])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchReleases()
  }, [fetchReleases])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const upcomingReleases = useMemo(() => releases.filter(r => ['draft', 'planned', 'in_progress', 'testing'].includes(r.status)).sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()), [releases])
  const releasedReleases = useMemo(() => releases.filter(r => r.status === 'released').sort((a, b) => new Date(b.releaseDate || b.targetDate).getTime() - new Date(a.releaseDate || a.targetDate).getTime()), [releases])
  const draftReleases = useMemo(() => releases.filter(r => r.status === 'draft'), [releases])
  const pendingApproval = useMemo(() => releases.filter(r => r.status === 'testing' && r.approvals.some(a => a.status === 'pending')), [releases])
  const latestRelease = useMemo(() => releasedReleases[0] || null, [releasedReleases])

  return {
    releases, currentRelease, stats,
    upcomingReleases, releasedReleases, draftReleases, pendingApproval, latestRelease,
    isLoading, error,
    refresh, createRelease, updateRelease, deleteRelease, changeStatus,
    addChangelogEntry, removeChangelogEntry,
    addFeature, addBugFix, updateItemStatus,
    addArtifact, removeArtifact,
    requestApproval, approveRelease, rejectRelease, publishRelease,
    generateChangelog, setCurrentRelease
  }
}

export default useReleases
