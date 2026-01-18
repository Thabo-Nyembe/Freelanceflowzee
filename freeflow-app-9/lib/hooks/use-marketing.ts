'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface MarketingCampaign {
  id: string
  user_id: string
  campaign_code: string
  name: string
  description: string | null
  channel: string
  campaign_type: string
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  target_audience: string | null
  target_segments: string[]
  target_locations: string[]
  target_demographics: Record<string, any>
  budget: number
  spent: number
  cost_per_click: number | null
  cost_per_acquisition: number | null
  reach: number
  impressions: number
  clicks: number
  engagement_rate: number
  conversions: number
  conversion_rate: number
  roi: number | null
  start_date: string | null
  end_date: string | null
  content_ids: string[]
  landing_page_url: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MarketingChannel {
  id: string
  user_id: string
  name: string
  channel_type: string
  is_active: boolean
  total_reach: number
  total_engagement: number
  total_conversions: number
  total_cost: number
  avg_engagement_rate: number
  avg_conversion_rate: number
  api_credentials: Record<string, any>
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MarketingStats {
  totalCampaigns: number
  activeCampaigns: number
  totalReach: number
  totalEngagement: number
  totalConversions: number
  totalSpent: number
  avgEngagementRate: number
  avgConversionRate: number
  avgROI: number
}

export function useMarketingCampaigns() {
  const supabase = createClient()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (err: unknown) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch campaigns', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createCampaign = async (campaign: Partial<MarketingCampaign>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert([{ ...campaign, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setCampaigns(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Campaign created successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateCampaign = async (id: string, updates: Partial<MarketingCampaign>) => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCampaigns(prev => prev.map(c => c.id === id ? data : c))
      toast({ title: 'Success', description: 'Campaign updated' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast({ title: 'Success', description: 'Campaign deleted' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const startCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'active', start_date: new Date().toISOString() })
  }

  const pauseCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'paused' })
  }

  const completeCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'completed', end_date: new Date().toISOString() })
  }

  const getStats = useCallback((): MarketingStats => {
    const active = campaigns.filter(c => c.status === 'active')
    const withROI = campaigns.filter(c => c.roi !== null && c.roi > 0)

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active.length,
      totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
      totalEngagement: campaigns.reduce((sum, c) => sum + (c.reach * c.engagement_rate / 100), 0),
      totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
      totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
      avgEngagementRate: campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.engagement_rate, 0) / campaigns.length
        : 0,
      avgConversionRate: campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) / campaigns.length
        : 0,
      avgROI: withROI.length > 0
        ? withROI.reduce((sum, c) => sum + (c.roi || 0), 0) / withROI.length
        : 0
    }
  }, [campaigns])

  useEffect(() => {
    fetchCampaigns()

    const channel = supabase
      .channel('marketing-campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketing_campaigns' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [payload.new as MarketingCampaign, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new as MarketingCampaign : c))
        } else if (payload.eventType === 'DELETE') {
          setCampaigns(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCampaigns, supabase])

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    completeCampaign,
    getStats
  }
}

export function useMarketingChannels() {
  const supabase = createClient()
  const { toast } = useToast()
  const [channels, setChannels] = useState<MarketingChannel[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('marketing_channels')
        .select('*')
        .eq('user_id', user.id)
        .order('total_reach', { ascending: false })

      if (error) throw error
      setChannels(data || [])
    } catch (err) {
      console.error('Failed to fetch channels:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createChannel = async (channel: Partial<MarketingChannel>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('marketing_channels')
        .insert([{ ...channel, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setChannels(prev => [...prev, data])
      toast({ title: 'Success', description: 'Channel added' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateChannel = async (id: string, updates: Partial<MarketingChannel>) => {
    try {
      const { data, error } = await supabase
        .from('marketing_channels')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setChannels(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  return { channels, loading, createChannel, updateChannel }
}
