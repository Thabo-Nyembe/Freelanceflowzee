'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface ThirdPartyIntegration {
  id: string
  user_id: string
  name: string
  description: string | null
  provider: string | null
  logo: string | null
  category: 'saas' | 'database' | 'cloud' | 'messaging' | 'ecommerce' | 'collaboration' | 'monitoring' | 'deployment'
  auth_method: 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'custom'
  status: 'active' | 'pending' | 'inactive' | 'error' | 'testing'
  api_calls_count: number
  uptime_percent: number
  response_time_ms: number
  last_sync_at: string | null
  version: string | null
  endpoints_count: number
  rate_limit: string | null
  documentation_url: string | null
  features: string[]
  tags: string[]
  config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ThirdPartyIntegrationStats {
  total: number
  active: number
  pending: number
  inactive: number
  totalApiCalls: number
  avgUptime: number
  avgResponseTime: number
}

export function useThirdPartyIntegrations(initialIntegrations: ThirdPartyIntegration[] = [], initialStats?: ThirdPartyIntegrationStats) {
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(initialIntegrations)
  const [stats, setStats] = useState<ThirdPartyIntegrationStats>(initialStats || {
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalApiCalls: 0,
    avgUptime: 0,
    avgResponseTime: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const calculateStats = useCallback((list: ThirdPartyIntegration[]) => {
    const totalApiCalls = list.reduce((sum, i) => sum + (i.api_calls_count || 0), 0)
    const totalUptime = list.reduce((sum, i) => sum + (i.uptime_percent || 0), 0)
    const totalResponseTime = list.reduce((sum, i) => sum + (i.response_time_ms || 0), 0)

    setStats({
      total: list.length,
      active: list.filter(i => i.status === 'active').length,
      pending: list.filter(i => i.status === 'pending').length,
      inactive: list.filter(i => i.status === 'inactive').length,
      totalApiCalls,
      avgUptime: list.length > 0 ? totalUptime / list.length : 0,
      avgResponseTime: list.length > 0 ? totalResponseTime / list.length : 0
    })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('third_party_integrations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'third_party_integrations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIntegrations(prev => {
              const updated = [payload.new as ThirdPartyIntegration, ...prev]
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setIntegrations(prev => {
              const updated = prev.map(i => i.id === payload.new.id ? payload.new as ThirdPartyIntegration : i)
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

  const createIntegration = useCallback(async (data: Partial<ThirdPartyIntegration>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('third_party_integrations')
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

  const updateIntegration = useCallback(async (id: string, updates: Partial<ThirdPartyIntegration>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('third_party_integrations')
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
        .from('third_party_integrations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const activateIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, { status: 'active' })
  }, [updateIntegration])

  const deactivateIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, { status: 'inactive' })
  }, [updateIntegration])

  const syncIntegration = useCallback(async (id: string) => {
    return updateIntegration(id, { last_sync_at: new Date().toISOString() })
  }, [updateIntegration])

  return {
    integrations,
    stats,
    loading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    activateIntegration,
    deactivateIntegration,
    syncIntegration
  }
}
