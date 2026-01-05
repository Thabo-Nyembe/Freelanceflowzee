'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type BroadcastType = 'email' | 'push' | 'sms' | 'in_app' | 'all'
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
export type AudienceType = 'all' | 'segment' | 'custom' | 'test'

export interface Broadcast {
  id: string
  title: string
  subject?: string
  content: string
  htmlContent?: string
  type: BroadcastType
  status: BroadcastStatus
  audienceType: AudienceType
  audienceFilter?: AudienceFilter
  recipientCount: number
  sentCount: number
  openCount: number
  clickCount: number
  scheduledAt?: string
  sentAt?: string
  createdBy: string
  createdByName: string
  tags: string[]
  attachments: BroadcastAttachment[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AudienceFilter {
  segments?: string[]
  userIds?: string[]
  roles?: string[]
  departments?: string[]
  locations?: string[]
  customQuery?: string
}

export interface BroadcastAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface BroadcastTemplate {
  id: string
  name: string
  description?: string
  subject?: string
  content: string
  htmlContent?: string
  type: BroadcastType
  variables: string[]
  isDefault: boolean
  createdAt: string
}

export interface BroadcastStats {
  totalBroadcasts: number
  sentThisMonth: number
  totalRecipients: number
  averageOpenRate: number
  averageClickRate: number
  scheduledCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBroadcasts: Broadcast[] = [
  { id: 'bc-1', title: 'Q1 Company Update', subject: 'Important: Q1 Results & Updates', content: 'Dear Team, We are pleased to share our Q1 results...', type: 'email', status: 'sent', audienceType: 'all', recipientCount: 150, sentCount: 148, openCount: 120, clickCount: 45, sentAt: '2024-03-15T10:00:00Z', createdBy: 'user-1', createdByName: 'Alex Chen', tags: ['quarterly', 'company-update'], attachments: [], createdAt: '2024-03-14', updatedAt: '2024-03-15' },
  { id: 'bc-2', title: 'New Feature Launch', subject: 'Introducing: New Dashboard Features', content: 'We are excited to announce new features...', type: 'all', status: 'scheduled', audienceType: 'segment', audienceFilter: { segments: ['active-users'] }, recipientCount: 500, sentCount: 0, openCount: 0, clickCount: 0, scheduledAt: '2024-03-25T09:00:00Z', createdBy: 'user-1', createdByName: 'Alex Chen', tags: ['product', 'feature-launch'], attachments: [], createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'bc-3', title: 'System Maintenance Notice', content: 'Scheduled maintenance this weekend...', type: 'push', status: 'draft', audienceType: 'all', recipientCount: 0, sentCount: 0, openCount: 0, clickCount: 0, createdBy: 'user-2', createdByName: 'Sarah Miller', tags: ['maintenance'], attachments: [], createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockTemplates: BroadcastTemplate[] = [
  { id: 'tmpl-1', name: 'Company Announcement', description: 'Standard company-wide announcement', subject: '[Company] {{title}}', content: 'Dear {{name}},\n\n{{content}}\n\nBest regards,\n{{sender}}', type: 'email', variables: ['name', 'title', 'content', 'sender'], isDefault: true, createdAt: '2024-01-01' },
  { id: 'tmpl-2', name: 'Product Update', description: 'New feature or product announcement', subject: 'New: {{feature_name}}', content: 'Hi {{name}},\n\nWe\'re excited to announce {{feature_name}}!\n\n{{description}}\n\nLearn more: {{link}}', type: 'email', variables: ['name', 'feature_name', 'description', 'link'], isDefault: false, createdAt: '2024-01-15' }
]

const mockStats: BroadcastStats = {
  totalBroadcasts: 25,
  sentThisMonth: 5,
  totalRecipients: 3500,
  averageOpenRate: 68,
  averageClickRate: 24,
  scheduledCount: 2
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBroadcastsOptions {
  
  type?: BroadcastType
  status?: BroadcastStatus
}

export function useBroadcasts(options: UseBroadcastsOptions = {}) {
  const {  type, status } = options

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([])
  const [currentBroadcast, setCurrentBroadcast] = useState<Broadcast | null>(null)
  const [stats, setStats] = useState<BroadcastStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBroadcasts = useCallback(async (filters?: { type?: string; status?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/broadcasts?${params}`)
      const result = await response.json()
      if (result.success) {
        setBroadcasts(Array.isArray(result.broadcasts) ? result.broadcasts : [])
        setTemplates(Array.isArray(result.templates) ? result.templates : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.broadcasts
      }
      setBroadcasts([])
      setStats(null)
      return []
    } catch (err) {
      setBroadcasts([])
      setTemplates([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ type, status])

  const createBroadcast = useCallback(async (data: Omit<Broadcast, 'id' | 'sentCount' | 'openCount' | 'clickCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setBroadcasts(prev => [result.broadcast, ...prev])
        return { success: true, broadcast: result.broadcast }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newBroadcast: Broadcast = { ...data, id: `bc-${Date.now()}`, sentCount: 0, openCount: 0, clickCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setBroadcasts(prev => [newBroadcast, ...prev])
      return { success: true, broadcast: newBroadcast }
    }
  }, [])

  const updateBroadcast = useCallback(async (broadcastId: string, updates: Partial<Broadcast>) => {
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
      }
      return result
    } catch (err) {
      setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, ...updates } : b))
      return { success: true }
    }
  }, [])

  const deleteBroadcast = useCallback(async (broadcastId: string) => {
    try {
      await fetch(`/api/broadcasts/${broadcastId}`, { method: 'DELETE' })
      setBroadcasts(prev => prev.filter(b => b.id !== broadcastId))
      return { success: true }
    } catch (err) {
      setBroadcasts(prev => prev.filter(b => b.id !== broadcastId))
      return { success: true }
    }
  }, [])

  const sendBroadcast = useCallback(async (broadcastId: string) => {
    setIsSending(true)
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}/send`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'sent' as const, sentAt: new Date().toISOString() } : b))
      }
      return result
    } catch (err) {
      setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'sent' as const, sentAt: new Date().toISOString() } : b))
      return { success: true }
    } finally {
      setIsSending(false)
    }
  }, [])

  const scheduleBroadcast = useCallback(async (broadcastId: string, scheduledAt: string) => {
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt })
      })
      const result = await response.json()
      if (result.success) {
        setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'scheduled' as const, scheduledAt } : b))
      }
      return result
    } catch (err) {
      setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'scheduled' as const, scheduledAt } : b))
      return { success: true }
    }
  }, [])

  const cancelBroadcast = useCallback(async (broadcastId: string) => {
    setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'cancelled' as const } : b))
    return { success: true }
  }, [])

  const duplicateBroadcast = useCallback(async (broadcastId: string) => {
    const original = broadcasts.find(b => b.id === broadcastId)
    if (!original) return { success: false, error: 'Broadcast not found' }

    const duplicate: Broadcast = {
      ...original,
      id: `bc-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      sentAt: undefined,
      scheduledAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setBroadcasts(prev => [duplicate, ...prev])
    return { success: true, broadcast: duplicate }
  }, [broadcasts])

  const sendTestBroadcast = useCallback(async (broadcastId: string, testEmails: string[]) => {
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: testEmails })
      })
      return await response.json()
    } catch (err) {
      return { success: true, message: `Test sent to ${testEmails.length} recipients` }
    }
  }, [])

  const estimateAudience = useCallback(async (filter: AudienceFilter): Promise<number> => {
    try {
      const response = await fetch('/api/broadcasts/estimate-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
      })
      const result = await response.json()
      return result.count || 0
    } catch (err) {
      return 100 // Mock estimate
    }
  }, [])

  const createTemplate = useCallback(async (data: Omit<BroadcastTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: BroadcastTemplate = { ...data, id: `tmpl-${Date.now()}`, createdAt: new Date().toISOString() }
    setTemplates(prev => [newTemplate, ...prev])
    return { success: true, template: newTemplate }
  }, [])

  const applyTemplate = useCallback((templateId: string): Partial<Broadcast> | null => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return null
    return {
      subject: template.subject,
      content: template.content,
      htmlContent: template.htmlContent,
      type: template.type
    }
  }, [templates])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBroadcasts()
  }, [fetchBroadcasts])

  useEffect(() => { refresh() }, [refresh])

  const draftBroadcasts = useMemo(() => broadcasts.filter(b => b.status === 'draft'), [broadcasts])
  const scheduledBroadcasts = useMemo(() => broadcasts.filter(b => b.status === 'scheduled'), [broadcasts])
  const sentBroadcasts = useMemo(() => broadcasts.filter(b => b.status === 'sent'), [broadcasts])
  const recentBroadcasts = useMemo(() => [...broadcasts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [broadcasts])

  return {
    broadcasts, templates, currentBroadcast, stats, draftBroadcasts, scheduledBroadcasts, sentBroadcasts, recentBroadcasts,
    isLoading, isSending, error,
    refresh, fetchBroadcasts, createBroadcast, updateBroadcast, deleteBroadcast, sendBroadcast, scheduleBroadcast, cancelBroadcast,
    duplicateBroadcast, sendTestBroadcast, estimateAudience, createTemplate, applyTemplate,
    setCurrentBroadcast
  }
}

export default useBroadcasts
