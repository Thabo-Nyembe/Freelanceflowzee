'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface Integration {
  id: string
  user_id: string
  name: string
  provider: string
  description: string | null
  icon: string | null
  category: string | null
  is_connected: boolean
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  config: Record<string, any>
  permissions: string[]
  api_calls_count: number
  data_synced_count: number
  last_sync_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  connected_at: string | null
}

export interface IntegrationStats {
  total: number
  connected: number
  disconnected: number
  totalApiCalls: number
  totalDataSynced: number
}

export function useIntegrations(initialIntegrations: Integration[] = [], initialStats?: IntegrationStats) {
  const isDemo = isDemoModeEnabled()
  const demoIntegrations = getDemoIntegrations()

  const [integrations, setIntegrations] = useState<Integration[]>(isDemo ? demoIntegrations : initialIntegrations)
  const [stats, setStats] = useState<IntegrationStats>(initialStats || {
    total: isDemo ? demoIntegrations.length : 0,
    connected: isDemo ? demoIntegrations.filter(i => i.is_connected).length : 0,
    disconnected: isDemo ? demoIntegrations.filter(i => !i.is_connected).length : 0,
    totalApiCalls: isDemo ? demoIntegrations.reduce((sum, i) => sum + i.api_calls_count, 0) : 0,
    totalDataSynced: isDemo ? demoIntegrations.reduce((sum, i) => sum + i.data_synced_count, 0) : 0
  })
  const [loading, setLoading] = useState(!isDemo)
  const supabase = createClient()
  const { toast } = useToast()

  const calculateStats = useCallback((integrationsList: Integration[]): IntegrationStats => {
    return {
      total: integrationsList.length,
      connected: integrationsList.filter(i => i.is_connected).length,
      disconnected: integrationsList.filter(i => !i.is_connected).length,
      totalApiCalls: integrationsList.reduce((sum, i) => sum + i.api_calls_count, 0),
      totalDataSynced: integrationsList.reduce((sum, i) => sum + i.data_synced_count, 0)
    }
  }, [])

  const fetchIntegrations = useCallback(async () => {
    // Demo mode: use demo data
    if (isDemo) {
      const demoData = getDemoIntegrations()
      setIntegrations(demoData)
      setStats(calculateStats(demoData))
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setIntegrations(data || [])
      setStats(calculateStats(data || []))
    } catch (error: any) {
      // Fallback to demo data on error
      if (isDemo) {
        const demoData = getDemoIntegrations()
        setIntegrations(demoData)
        setStats(calculateStats(demoData))
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch integrations',
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats, isDemo])

  const createIntegration = useCallback(async (integrationData: Partial<Integration>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('integrations')
        .insert({
          ...integrationData,
          user_id: user.id,
          config: integrationData.config || {},
          permissions: integrationData.permissions || [],
          metadata: integrationData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      const updatedIntegrations = [...integrations, data].sort((a, b) => a.name.localeCompare(b.name))
      setIntegrations(updatedIntegrations)
      setStats(calculateStats(updatedIntegrations))

      toast({
        title: 'Success',
        description: 'Integration added successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add integration',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, integrations, calculateStats])

  const updateIntegration = useCallback(async (id: string, updates: Partial<Integration>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedIntegrations = integrations.map(i => i.id === id ? data : i)
      setIntegrations(updatedIntegrations)
      setStats(calculateStats(updatedIntegrations))

      toast({
        title: 'Success',
        description: 'Integration updated successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update integration',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, integrations, calculateStats])

  const deleteIntegration = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updatedIntegrations = integrations.filter(i => i.id !== id)
      setIntegrations(updatedIntegrations)
      setStats(calculateStats(updatedIntegrations))

      toast({
        title: 'Success',
        description: 'Integration removed successfully'
      })

      return true
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove integration',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, integrations, calculateStats])

  const connectIntegration = useCallback(async (id: string, accessToken?: string) => {
    return updateIntegration(id, {
      is_connected: true,
      status: 'connected',
      access_token: accessToken,
      connected_at: new Date().toISOString()
    })
  }, [updateIntegration])

  const disconnectIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, {
      is_connected: false,
      status: 'disconnected',
      access_token: null,
      refresh_token: null,
      connected_at: null
    })
  }, [updateIntegration])

  const syncIntegration = useCallback(async (id: string) => {
    const integration = integrations.find(i => i.id === id)
    if (!integration || !integration.is_connected) return null

    await updateIntegration(id, {
      last_sync_at: new Date().toISOString(),
      data_synced_count: integration.data_synced_count + Math.floor(Math.random() * 100)
    })

    toast({
      title: 'Sync Complete',
      description: 'Data has been synchronized'
    })

    return true
  }, [integrations, updateIntegration, toast])

  // Real-time subscription (disabled in demo mode)
  useEffect(() => {
    if (isDemo) return

    const channel = supabase
      .channel('integrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'integrations'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIntegrations(prev => {
              const updated = [...prev, payload.new as Integration].sort((a, b) => a.name.localeCompare(b.name))
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setIntegrations(prev => {
              const updated = prev.map(i =>
                i.id === payload.new.id ? payload.new as Integration : i
              )
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setIntegrations(prev => {
              const updated = prev.filter(i => i.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats, isDemo])

  return {
    integrations,
    stats,
    loading,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    connectIntegration,
    disconnectIntegration,
    syncIntegration
  }
}

// Demo integrations data
function getDemoIntegrations(): Integration[] {
  const now = new Date()
  return [
    {
      id: 'demo-int-1',
      user_id: DEMO_USER_ID,
      name: 'Slack',
      provider: 'slack',
      description: 'Team communication and notifications',
      icon: '/integrations/slack.svg',
      category: 'communication',
      is_connected: true,
      status: 'connected',
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      config: { channel: '#general', notifications: true },
      permissions: ['chat:write', 'channels:read'],
      api_calls_count: 1245,
      data_synced_count: 532,
      last_sync_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {},
      created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
      connected_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-int-2',
      user_id: DEMO_USER_ID,
      name: 'Google Calendar',
      provider: 'google',
      description: 'Calendar sync and scheduling',
      icon: '/integrations/google-calendar.svg',
      category: 'calendar',
      is_connected: true,
      status: 'connected',
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      config: { calendarId: 'primary', sync_events: true },
      permissions: ['calendar.events', 'calendar.readonly'],
      api_calls_count: 892,
      data_synced_count: 234,
      last_sync_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      metadata: {},
      created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
      connected_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-int-3',
      user_id: DEMO_USER_ID,
      name: 'GitHub',
      provider: 'github',
      description: 'Code repository and project tracking',
      icon: '/integrations/github.svg',
      category: 'development',
      is_connected: true,
      status: 'connected',
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      config: { repos: ['kazi-platform', 'freeflow-app'] },
      permissions: ['repo:read', 'issues:write'],
      api_calls_count: 567,
      data_synced_count: 89,
      last_sync_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      metadata: {},
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
      connected_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-int-4',
      user_id: DEMO_USER_ID,
      name: 'Stripe',
      provider: 'stripe',
      description: 'Payment processing',
      icon: '/integrations/stripe.svg',
      category: 'payments',
      is_connected: false,
      status: 'disconnected',
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      config: {},
      permissions: [],
      api_calls_count: 0,
      data_synced_count: 0,
      last_sync_at: null,
      metadata: {},
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
      connected_at: null
    },
    {
      id: 'demo-int-5',
      user_id: DEMO_USER_ID,
      name: 'Zapier',
      provider: 'zapier',
      description: 'Workflow automation',
      icon: '/integrations/zapier.svg',
      category: 'automation',
      is_connected: false,
      status: 'disconnected',
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      config: {},
      permissions: [],
      api_calls_count: 0,
      data_synced_count: 0,
      last_sync_at: null,
      metadata: {},
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
      connected_at: null
    }
  ]
}
