'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface MarketplaceIntegration {
  id: string
  user_id: string
  name: string
  description: string | null
  provider: string | null
  logo: string | null
  category: 'crm' | 'marketing' | 'productivity' | 'communication' | 'analytics' | 'payment' | 'storage' | 'social'
  integration_type: 'native' | 'api' | 'webhook' | 'oauth' | 'zapier'
  status: 'connected' | 'available' | 'disconnected' | 'configuring' | 'error'
  users_count: number
  installs_count: number
  rating: number
  reviews_count: number
  version: string | null
  pricing: string
  sync_frequency: string | null
  data_direction: string | null
  setup_time: string | null
  features: string[]
  tags: string[]
  config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MarketplaceStats {
  total: number
  connected: number
  available: number
  disconnected: number
  totalUsers: number
  avgRating: number
  totalInstalls: number
}

export function useMarketplaceIntegrations(initialIntegrations: MarketplaceIntegration[] = [], initialStats?: MarketplaceStats) {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>(initialIntegrations)
  const [stats, setStats] = useState<MarketplaceStats>(initialStats || {
    total: 0,
    connected: 0,
    available: 0,
    disconnected: 0,
    totalUsers: 0,
    avgRating: 0,
    totalInstalls: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const calculateStats = useCallback((list: MarketplaceIntegration[]) => {
    const totalUsers = list.reduce((sum, i) => sum + (i.users_count || 0), 0)
    const totalRating = list.reduce((sum, i) => sum + (i.rating || 0), 0)
    const totalInstalls = list.reduce((sum, i) => sum + (i.installs_count || 0), 0)

    setStats({
      total: list.length,
      connected: list.filter(i => i.status === 'connected').length,
      available: list.filter(i => i.status === 'available').length,
      disconnected: list.filter(i => i.status === 'disconnected').length,
      totalUsers,
      avgRating: list.length > 0 ? totalRating / list.length : 0,
      totalInstalls
    })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('marketplace_integrations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_integrations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIntegrations(prev => {
              const updated = [payload.new as MarketplaceIntegration, ...prev]
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setIntegrations(prev => {
              const updated = prev.map(i => i.id === payload.new.id ? payload.new as MarketplaceIntegration : i)
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setIntegrations(prev => {
              const updated = prev.filter(i => i.id !== payload.old.id)
              calculateStats(updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  const createIntegration = useCallback(async (data: Partial<MarketplaceIntegration>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('marketplace_integrations')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updateIntegration = useCallback(async (id: string, updates: Partial<MarketplaceIntegration>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('marketplace_integrations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const deleteIntegration = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('marketplace_integrations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const connectIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, { status: 'connected' })
  }, [updateIntegration])

  const disconnectIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, { status: 'disconnected' })
  }, [updateIntegration])

  return {
    integrations,
    stats,
    loading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    connectIntegration,
    disconnectIntegration
  }
}
