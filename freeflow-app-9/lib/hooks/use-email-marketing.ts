'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface EmailCampaign {
  id: string
  user_id: string
  campaign_code: string
  title: string
  subject: string
  preview_text: string | null
  content_html: string | null
  content_text: string | null
  template_id: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  campaign_type: string
  sender_name: string | null
  sender_email: string | null
  reply_to: string | null
  list_ids: string[]
  segment_ids: string[]
  total_recipients: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  unsubscribed_count: number
  complained_count: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  unsubscribe_rate: number
  scheduled_at: string | null
  sent_at: string | null
  completed_at: string | null
  tags: string[]
  ab_test_enabled: boolean
  ab_test_config: Record<string, any>
  tracking_enabled: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EmailSubscriber {
  id: string
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained' | 'pending'
  source: string | null
  ip_address: string | null
  list_ids: string[]
  tags: string[]
  custom_fields: Record<string, any>
  last_open_at: string | null
  last_click_at: string | null
  total_opens: number
  total_clicks: number
  subscribed_at: string
  unsubscribed_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailList {
  id: string
  user_id: string
  name: string
  description: string | null
  subscriber_count: number
  is_default: boolean
  double_optin: boolean
  welcome_email_enabled: boolean
  welcome_email_id: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  subject: string | null
  content_html: string | null
  content_text: string | null
  thumbnail_url: string | null
  is_default: boolean
  variables: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailMarketingStats {
  totalCampaigns: number
  totalSent: number
  totalSubscribers: number
  avgOpenRate: number
  avgClickRate: number
  totalLists: number
  totalTemplates: number
}

export function useEmailCampaigns() {
  const supabase = createClient()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch campaigns', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createCampaign = async (campaign: Partial<EmailCampaign>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([{ ...campaign, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setCampaigns(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Campaign created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateCampaign = async (id: string, updates: Partial<EmailCampaign>) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCampaigns(prev => prev.map(c => c.id === id ? data : c))
      toast({ title: 'Success', description: 'Campaign updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast({ title: 'Success', description: 'Campaign deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const scheduleCampaign = async (id: string, scheduledAt: string) => {
    return updateCampaign(id, { status: 'scheduled', scheduled_at: scheduledAt })
  }

  const sendCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'sending', sent_at: new Date().toISOString() })
  }

  const pauseCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'paused' })
  }

  const getStats = useCallback((): EmailMarketingStats => {
    const sentCampaigns = campaigns.filter(c => c.status === 'sent')
    return {
      totalCampaigns: campaigns.length,
      totalSent: sentCampaigns.reduce((sum, c) => sum + c.sent_count, 0),
      totalSubscribers: 0, // Will be calculated from subscribers
      avgOpenRate: sentCampaigns.length > 0
        ? sentCampaigns.reduce((sum, c) => sum + c.open_rate, 0) / sentCampaigns.length
        : 0,
      avgClickRate: sentCampaigns.length > 0
        ? sentCampaigns.reduce((sum, c) => sum + c.click_rate, 0) / sentCampaigns.length
        : 0,
      totalLists: 0,
      totalTemplates: 0
    }
  }, [campaigns])

  useEffect(() => {
    fetchCampaigns()

    const channel = supabase
      .channel('email-campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_campaigns' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [payload.new as EmailCampaign, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new as EmailCampaign : c))
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
    scheduleCampaign,
    sendCampaign,
    pauseCampaign,
    getStats
  }
}

export function useEmailSubscribers() {
  const supabase = createClient()
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('user_id', user.id)
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (err) {
      console.error('Failed to fetch subscribers:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createSubscriber = async (subscriber: Partial<EmailSubscriber>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('email_subscribers')
        .insert([{ ...subscriber, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setSubscribers(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Subscriber added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const unsubscribe = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setSubscribers(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Subscriber unsubscribed' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  return { subscribers, loading, createSubscriber, unsubscribe }
}

export function useEmailLists() {
  const supabase = createClient()
  const { toast } = useToast()
  const [lists, setLists] = useState<EmailList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('email_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLists(data || [])
    } catch (err) {
      console.error('Failed to fetch lists:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createList = async (list: Partial<EmailList>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('email_lists')
        .insert([{ ...list, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setLists(prev => [data, ...prev])
      toast({ title: 'Success', description: 'List created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  return { lists, loading, createList }
}

export function useEmailTemplates() {
  const supabase = createClient()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('email_templates')
        .insert([{ ...template, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setTemplates(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Template created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { templates, loading, createTemplate }
}
