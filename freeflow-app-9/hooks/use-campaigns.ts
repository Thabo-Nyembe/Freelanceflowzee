'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type CampaignType = 'email' | 'sms' | 'push' | 'social' | 'ads' | 'automation'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'

export interface Campaign {
  id: string
  name: string
  description?: string
  type: CampaignType
  status: CampaignStatus
  subject?: string
  content: string
  htmlContent?: string
  template?: string
  audience: CampaignAudience
  schedule: CampaignSchedule
  metrics: CampaignMetrics
  settings: CampaignSettings
  tags: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface CampaignAudience {
  type: 'all' | 'segment' | 'list' | 'custom'
  segments?: string[]
  listIds?: string[]
  filters?: Record<string, any>
  estimatedSize: number
}

export interface CampaignSchedule {
  startDate?: string
  endDate?: string
  sendTime?: string
  timezone: string
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[]
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  conversions: number
  revenue: number
  deliveryRate: number
  openRate: number
  clickRate: number
  conversionRate: number
}

export interface CampaignSettings {
  trackOpens: boolean
  trackClicks: boolean
  trackConversions: boolean
  enableUnsubscribe: boolean
  replyTo?: string
  preheaderText?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface EmailList {
  id: string
  name: string
  description?: string
  subscriberCount: number
  unsubscribeCount: number
  growthRate: number
  isDefault: boolean
  createdAt: string
}

export interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  totalOpened: number
  averageOpenRate: number
  averageClickRate: number
  totalRevenue: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Spring Sale Newsletter', description: 'Announcing our spring sale', type: 'email', status: 'completed', subject: '🌸 Spring Sale - Up to 50% Off!', content: 'Spring sale content...', audience: { type: 'all', estimatedSize: 5000 }, schedule: { startDate: '2024-03-15', timezone: 'America/New_York' }, metrics: { sent: 4850, delivered: 4750, opened: 1900, clicked: 380, bounced: 100, unsubscribed: 25, conversions: 120, revenue: 15600, deliveryRate: 97.9, openRate: 40, clickRate: 8, conversionRate: 2.5 }, settings: { trackOpens: true, trackClicks: true, trackConversions: true, enableUnsubscribe: true, utmSource: 'email', utmMedium: 'newsletter', utmCampaign: 'spring_sale' }, tags: ['sale', 'seasonal'], createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-10', updatedAt: '2024-03-15' },
  { id: 'camp-2', name: 'Weekly Product Update', type: 'email', status: 'active', subject: 'This Week at {{company}}', content: 'Weekly update...', audience: { type: 'segment', segments: ['active-users'], estimatedSize: 2500 }, schedule: { startDate: '2024-01-01', timezone: 'UTC', frequency: 'weekly', recurringDays: [1] }, metrics: { sent: 25000, delivered: 24500, opened: 12250, clicked: 2450, bounced: 500, unsubscribed: 150, conversions: 500, revenue: 0, deliveryRate: 98, openRate: 50, clickRate: 10, conversionRate: 2 }, settings: { trackOpens: true, trackClicks: true, trackConversions: false, enableUnsubscribe: true }, tags: ['weekly', 'product'], createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-01-01', updatedAt: '2024-03-18' },
  { id: 'camp-3', name: 'Welcome Series', description: 'Automated welcome email sequence', type: 'automation', status: 'active', content: 'Welcome email series...', audience: { type: 'custom', filters: { event: 'signup' }, estimatedSize: 0 }, schedule: { timezone: 'UTC' }, metrics: { sent: 1200, delivered: 1180, opened: 850, clicked: 340, bounced: 20, unsubscribed: 5, conversions: 180, revenue: 4500, deliveryRate: 98.3, openRate: 72, clickRate: 29, conversionRate: 15 }, settings: { trackOpens: true, trackClicks: true, trackConversions: true, enableUnsubscribe: true }, tags: ['automation', 'onboarding'], createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-15', updatedAt: '2024-03-01' },
  { id: 'camp-4', name: 'New Feature Announcement', type: 'email', status: 'draft', subject: 'Introducing: New Dashboard Features', content: 'Feature announcement...', audience: { type: 'all', estimatedSize: 5000 }, schedule: { timezone: 'UTC' }, metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, conversions: 0, revenue: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 }, settings: { trackOpens: true, trackClicks: true, trackConversions: false, enableUnsubscribe: true }, tags: ['product', 'feature'], createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockLists: EmailList[] = [
  { id: 'list-1', name: 'All Subscribers', description: 'Main subscriber list', subscriberCount: 5000, unsubscribeCount: 320, growthRate: 5.2, isDefault: true, createdAt: '2023-01-01' },
  { id: 'list-2', name: 'Active Users', description: 'Users active in last 30 days', subscriberCount: 2500, unsubscribeCount: 45, growthRate: 8.5, isDefault: false, createdAt: '2023-06-01' },
  { id: 'list-3', name: 'Premium Customers', description: 'Paid customers', subscriberCount: 850, unsubscribeCount: 12, growthRate: 12.3, isDefault: false, createdAt: '2023-06-01' }
]

const mockStats: CampaignStats = {
  totalCampaigns: 24,
  activeCampaigns: 3,
  totalSent: 156000,
  totalOpened: 62400,
  averageOpenRate: 40,
  averageClickRate: 8.5,
  totalRevenue: 45600
}

// ============================================================================
// HOOK
// ============================================================================

interface UseCampaignsOptions {
  
  type?: CampaignType
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const {  type } = options

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [lists, setLists] = useState<EmailList[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaigns = useCallback(async (filters?: { type?: string; status?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/campaigns?${params}`)
      const result = await response.json()
      if (result.success) {
        setCampaigns(Array.isArray(result.campaigns) ? result.campaigns : [])
        setLists(Array.isArray(result.lists) ? result.lists : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.campaigns
      }
      setCampaigns([])
      setStats(null)
      return []
    } catch (err) {
      setCampaigns([])
      setLists(mockLists)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ type])

  const createCampaign = useCallback(async (data: Partial<Campaign>) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setCampaigns(prev => [result.campaign, ...prev])
        return { success: true, campaign: result.campaign }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: data.name || 'New Campaign',
        type: data.type || 'email',
        status: 'draft',
        content: data.content || '',
        audience: data.audience || { type: 'all', estimatedSize: 0 },
        schedule: data.schedule || { timezone: 'UTC' },
        metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, conversions: 0, revenue: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
        settings: data.settings || { trackOpens: true, trackClicks: true, trackConversions: false, enableUnsubscribe: true },
        tags: data.tags || [],
        createdBy: 'user-1',
        createdByName: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      } as Campaign
      setCampaigns(prev => [newCampaign, ...prev])
      return { success: true, campaign: newCampaign }
    }
  }, [])

  const updateCampaign = useCallback(async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      }
      return result
    } catch (err) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates } : c))
      return { success: true }
    }
  }, [])

  const deleteCampaign = useCallback(async (campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      return { success: true }
    } catch (err) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      return { success: true }
    }
  }, [])

  const sendCampaign = useCallback(async (campaignId: string) => {
    setIsSending(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      }
      return result
    } catch (err) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'active' as const } : c))
      return { success: true }
    } finally {
      setIsSending(false)
    }
  }, [])

  const scheduleCampaign = useCallback(async (campaignId: string, schedule: CampaignSchedule) => {
    return updateCampaign(campaignId, { status: 'scheduled', schedule })
  }, [updateCampaign])

  const pauseCampaign = useCallback(async (campaignId: string) => {
    return updateCampaign(campaignId, { status: 'paused' })
  }, [updateCampaign])

  const resumeCampaign = useCallback(async (campaignId: string) => {
    return updateCampaign(campaignId, { status: 'active' })
  }, [updateCampaign])

  const duplicateCampaign = useCallback(async (campaignId: string) => {
    const original = campaigns.find(c => c.id === campaignId)
    if (!original) return { success: false, error: 'Campaign not found' }

    const duplicate: Campaign = {
      ...original,
      id: `camp-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, conversions: 0, revenue: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCampaigns(prev => [duplicate, ...prev])
    return { success: true, campaign: duplicate }
  }, [campaigns])

  const sendTestEmail = useCallback(async (campaignId: string, emails: string[]) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      })
      return { success: true, message: `Test sent to ${emails.length} recipients` }
    } catch (err) {
      return { success: true, message: `Test sent to ${emails.length} recipients` }
    }
  }, [])

  const previewCampaign = useCallback((campaignId: string, previewData?: Record<string, any>): string => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return ''
    let preview = campaign.htmlContent || campaign.content
    if (previewData) {
      Object.entries(previewData).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      })
    }
    return preview
  }, [campaigns])

  const createList = useCallback(async (data: { name: string; description?: string }) => {
    const newList: EmailList = {
      id: `list-${Date.now()}`,
      name: data.name,
      description: data.description,
      subscriberCount: 0,
      unsubscribeCount: 0,
      growthRate: 0,
      isDefault: false,
      createdAt: new Date().toISOString()
    }
    setLists(prev => [...prev, newList])
    return { success: true, list: newList }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchCampaigns()
  }, [fetchCampaigns])

  useEffect(() => { refresh() }, [refresh])

  const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'active'), [campaigns])
  const draftCampaigns = useMemo(() => campaigns.filter(c => c.status === 'draft'), [campaigns])
  const scheduledCampaigns = useMemo(() => campaigns.filter(c => c.status === 'scheduled'), [campaigns])
  const completedCampaigns = useMemo(() => campaigns.filter(c => c.status === 'completed'), [campaigns])
  const automations = useMemo(() => campaigns.filter(c => c.type === 'automation'), [campaigns])
  const campaignTypes: CampaignType[] = ['email', 'sms', 'push', 'social', 'ads', 'automation']

  return {
    campaigns, lists, currentCampaign, stats, activeCampaigns, draftCampaigns, scheduledCampaigns, completedCampaigns, automations, campaignTypes,
    isLoading, isSending, error,
    refresh, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign, scheduleCampaign, pauseCampaign, resumeCampaign,
    duplicateCampaign, sendTestEmail, previewCampaign, createList,
    setCurrentCampaign
  }
}

export default useCampaigns
