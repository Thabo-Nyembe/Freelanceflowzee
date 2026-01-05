'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error' | 'update' | 'maintenance' | 'feature'
export type AnnouncementStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'expired'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type AnnouncementVisibility = 'all' | 'admins' | 'members' | 'specific'

export interface Announcement {
  id: string
  title: string
  content: string
  htmlContent?: string
  type: AnnouncementType
  status: AnnouncementStatus
  priority: AnnouncementPriority
  visibility: AnnouncementVisibility
  targetRoles?: string[]
  targetDepartments?: string[]
  targetUserIds?: string[]
  icon?: string
  color?: string
  link?: string
  linkText?: string
  image?: string
  isPinned: boolean
  isPopup: boolean
  showBanner: boolean
  requireAcknowledgment: boolean
  acknowledgmentCount: number
  viewCount: number
  publishedAt?: string
  expiresAt?: string
  scheduledAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementStats {
  totalAnnouncements: number
  activeAnnouncements: number
  publishedThisMonth: number
  totalViews: number
  totalAcknowledgments: number
  averageAcknowledgmentRate: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'New Dashboard Features Released', content: 'We are excited to announce new dashboard features including improved analytics, better navigation, and faster performance.', type: 'feature', status: 'published', priority: 'high', visibility: 'all', isPinned: true, isPopup: false, showBanner: true, requireAcknowledgment: false, acknowledgmentCount: 0, viewCount: 245, publishedAt: '2024-03-18T10:00:00Z', createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-17', updatedAt: '2024-03-18' },
  { id: 'ann-2', title: 'Scheduled Maintenance - March 25', content: 'System will be unavailable for maintenance on March 25, 2024 from 2:00 AM to 6:00 AM UTC.', type: 'maintenance', status: 'published', priority: 'urgent', visibility: 'all', icon: '🔧', isPinned: false, isPopup: true, showBanner: true, requireAcknowledgment: true, acknowledgmentCount: 89, viewCount: 150, publishedAt: '2024-03-20T08:00:00Z', expiresAt: '2024-03-26T00:00:00Z', createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-19', updatedAt: '2024-03-20' },
  { id: 'ann-3', title: 'Q1 Performance Review Deadline', content: 'Please complete your Q1 performance reviews by March 31, 2024.', type: 'info', status: 'published', priority: 'normal', visibility: 'members', isPinned: false, isPopup: false, showBanner: false, requireAcknowledgment: false, acknowledgmentCount: 0, viewCount: 78, publishedAt: '2024-03-15T09:00:00Z', expiresAt: '2024-04-01T00:00:00Z', createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-14', updatedAt: '2024-03-15' },
  { id: 'ann-4', title: 'Security Policy Update', content: 'Our security policies have been updated. Please review the changes in the security center.', type: 'warning', status: 'draft', priority: 'high', visibility: 'all', link: '/dashboard/security', linkText: 'View Security Center', isPinned: false, isPopup: false, showBanner: false, requireAcknowledgment: true, acknowledgmentCount: 0, viewCount: 0, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-20', updatedAt: '2024-03-20' }
]

const mockStats: AnnouncementStats = {
  totalAnnouncements: 15,
  activeAnnouncements: 3,
  publishedThisMonth: 4,
  totalViews: 1250,
  totalAcknowledgments: 320,
  averageAcknowledgmentRate: 72
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAnnouncementsOptions {
  status?: AnnouncementStatus
  type?: AnnouncementType
  visibility?: AnnouncementVisibility
}

export function useAnnouncements(options: UseAnnouncementsOptions = {}) {
  const {  status, type, visibility } = options

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
  const [stats, setStats] = useState<AnnouncementStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())

  const fetchAnnouncements = useCallback(async (filters?: { status?: string; type?: string; visibility?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.visibility || visibility) params.set('visibility', filters?.visibility || visibility || '')
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/announcements?${params}`)
      const result = await response.json()
      if (result.success) {
        setAnnouncements(Array.isArray(result.announcements) ? result.announcements : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.announcements
      }
      setAnnouncements([])
      setStats(null)
      return []
    } catch (err) {
      setAnnouncements([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ status, type, visibility])

  const createAnnouncement = useCallback(async (data: Omit<Announcement, 'id' | 'acknowledgmentCount' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setAnnouncements(prev => [result.announcement, ...prev])
        return { success: true, announcement: result.announcement }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newAnnouncement: Announcement = { ...data, id: `ann-${Date.now()}`, acknowledgmentCount: 0, viewCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setAnnouncements(prev => [newAnnouncement, ...prev])
      return { success: true, announcement: newAnnouncement }
    }
  }, [])

  const updateAnnouncement = useCallback(async (announcementId: string, updates: Partial<Announcement>) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
      }
      return result
    } catch (err) {
      setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, ...updates } : a))
      return { success: true }
    }
  }, [])

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    try {
      await fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' })
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      return { success: true }
    } catch (err) {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      return { success: true }
    }
  }, [])

  const publishAnnouncement = useCallback(async (announcementId: string) => {
    const now = new Date().toISOString()
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, status: 'published' as const, publishedAt: now, updatedAt: now } : a))
    return { success: true }
  }, [])

  const unpublishAnnouncement = useCallback(async (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, status: 'draft' as const, publishedAt: undefined } : a))
    return { success: true }
  }, [])

  const scheduleAnnouncement = useCallback(async (announcementId: string, scheduledAt: string) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, status: 'scheduled' as const, scheduledAt } : a))
    return { success: true }
  }, [])

  const archiveAnnouncement = useCallback(async (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, status: 'archived' as const } : a))
    return { success: true }
  }, [])

  const pinAnnouncement = useCallback(async (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a))
    return { success: true }
  }, [])

  const acknowledgeAnnouncement = useCallback(async (announcementId: string) => {
    try {
      await fetch(`/api/announcements/${announcementId}/acknowledge`, { method: 'POST' })
      setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, acknowledgmentCount: a.acknowledgmentCount + 1 } : a))
      setAcknowledgedIds(prev => new Set([...prev, announcementId]))
      return { success: true }
    } catch (err) {
      setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, acknowledgmentCount: a.acknowledgmentCount + 1 } : a))
      setAcknowledgedIds(prev => new Set([...prev, announcementId]))
      return { success: true }
    }
  }, [])

  const recordView = useCallback(async (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, viewCount: a.viewCount + 1 } : a))
  }, [])

  const duplicateAnnouncement = useCallback(async (announcementId: string) => {
    const original = announcements.find(a => a.id === announcementId)
    if (!original) return { success: false, error: 'Announcement not found' }

    const duplicate: Announcement = {
      ...original,
      id: `ann-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      acknowledgmentCount: 0,
      viewCount: 0,
      publishedAt: undefined,
      scheduledAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setAnnouncements(prev => [duplicate, ...prev])
    return { success: true, announcement: duplicate }
  }, [announcements])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchAnnouncements()
  }, [fetchAnnouncements])

  useEffect(() => { refresh() }, [refresh])

  const activeAnnouncements = useMemo(() => announcements.filter(a => a.status === 'published' && (!a.expiresAt || new Date(a.expiresAt) > new Date())), [announcements])
  const draftAnnouncements = useMemo(() => announcements.filter(a => a.status === 'draft'), [announcements])
  const scheduledAnnouncements = useMemo(() => announcements.filter(a => a.status === 'scheduled'), [announcements])
  const archivedAnnouncements = useMemo(() => announcements.filter(a => a.status === 'archived'), [announcements])
  const pinnedAnnouncements = useMemo(() => activeAnnouncements.filter(a => a.isPinned), [activeAnnouncements])
  const bannerAnnouncements = useMemo(() => activeAnnouncements.filter(a => a.showBanner), [activeAnnouncements])
  const popupAnnouncements = useMemo(() => activeAnnouncements.filter(a => a.isPopup && !acknowledgedIds.has(a.id)), [activeAnnouncements, acknowledgedIds])
  const urgentAnnouncements = useMemo(() => activeAnnouncements.filter(a => a.priority === 'urgent'), [activeAnnouncements])
  const unacknowledgedAnnouncements = useMemo(() => activeAnnouncements.filter(a => a.requireAcknowledgment && !acknowledgedIds.has(a.id)), [activeAnnouncements, acknowledgedIds])

  const isAcknowledged = useCallback((announcementId: string) => acknowledgedIds.has(announcementId), [acknowledgedIds])

  return {
    announcements, currentAnnouncement, stats, activeAnnouncements, draftAnnouncements, scheduledAnnouncements, archivedAnnouncements,
    pinnedAnnouncements, bannerAnnouncements, popupAnnouncements, urgentAnnouncements, unacknowledgedAnnouncements,
    isLoading, error,
    refresh, fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    publishAnnouncement, unpublishAnnouncement, scheduleAnnouncement, archiveAnnouncement,
    pinAnnouncement, acknowledgeAnnouncement, recordView, duplicateAnnouncement, isAcknowledged,
    setCurrentAnnouncement
  }
}

export default useAnnouncements
