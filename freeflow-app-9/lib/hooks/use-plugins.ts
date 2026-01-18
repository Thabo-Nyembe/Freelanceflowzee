'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Plugin {
  id: string
  user_id: string
  name: string
  description: string | null
  version: string
  author: string | null
  category: 'productivity' | 'security' | 'analytics' | 'integration' | 'communication' | 'automation' | 'ui-enhancement' | 'developer-tools'
  plugin_type: 'core' | 'premium' | 'community' | 'enterprise' | 'beta'
  status: 'active' | 'inactive' | 'updating' | 'error' | 'disabled'
  installs_count: number
  active_users_count: number
  rating: number
  reviews_count: number
  size: string | null
  compatibility: string | null
  permissions: string[]
  api_calls_count: number
  performance_score: number
  tags: string[]
  icon_url: string | null
  repository_url: string | null
  documentation_url: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PluginStats {
  total: number
  active: number
  inactive: number
  core: number
  premium: number
  community: number
  avgRating: number
  totalInstalls: number
  avgPerformanceScore: number
}

export function usePlugins(initialPlugins: Plugin[] = [], initialStats?: PluginStats) {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins)
  const [stats, setStats] = useState<PluginStats>(initialStats || {
    total: 0,
    active: 0,
    inactive: 0,
    core: 0,
    premium: 0,
    community: 0,
    avgRating: 0,
    totalInstalls: 0,
    avgPerformanceScore: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((pluginsList: Plugin[]) => {
    const totalRating = pluginsList.reduce((sum, p) => sum + (p.rating || 0), 0)
    const totalInstalls = pluginsList.reduce((sum, p) => sum + (p.installs_count || 0), 0)
    const totalPerformance = pluginsList.reduce((sum, p) => sum + (p.performance_score || 0), 0)

    setStats({
      total: pluginsList.length,
      active: pluginsList.filter(p => p.status === 'active').length,
      inactive: pluginsList.filter(p => p.status === 'inactive').length,
      core: pluginsList.filter(p => p.plugin_type === 'core').length,
      premium: pluginsList.filter(p => p.plugin_type === 'premium').length,
      community: pluginsList.filter(p => p.plugin_type === 'community').length,
      avgRating: pluginsList.length > 0 ? totalRating / pluginsList.length : 0,
      totalInstalls,
      avgPerformanceScore: pluginsList.length > 0 ? totalPerformance / pluginsList.length : 0
    })
  }, [])

  const fetchPlugins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('plugins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPlugins(data || [])
      calculateStats(data || [])
    } catch (err: unknown) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  useEffect(() => {
    const channel = supabase
      .channel('plugins_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'plugins' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlugins(prev => {
              const updated = [payload.new as Plugin, ...prev]
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setPlugins(prev => {
              const updated = prev.map(p => p.id === payload.new.id ? payload.new as Plugin : p)
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setPlugins(prev => {
              const updated = prev.filter(p => p.id !== payload.old.id)
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

  const createPlugin = useCallback(async (pluginData: Partial<Plugin>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('plugins')
        .insert([{ ...pluginData, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updatePlugin = useCallback(async (id: string, updates: Partial<Plugin>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('plugins')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const deletePlugin = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('plugins')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const activatePlugin = useCallback(async (id: string) => {
    return updatePlugin(id, { status: 'active' })
  }, [updatePlugin])

  const deactivatePlugin = useCallback(async (id: string) => {
    return updatePlugin(id, { status: 'inactive' })
  }, [updatePlugin])

  const updatePluginVersion = useCallback(async (id: string, newVersion: string) => {
    await updatePlugin(id, { status: 'updating' })
    // Simulate update delay
    setTimeout(async () => {
      await updatePlugin(id, { version: newVersion, status: 'active' })
    }, 2000)
  }, [updatePlugin])

  return {
    plugins,
    stats,
    loading,
    error,
    fetchPlugins,
    createPlugin,
    updatePlugin,
    deletePlugin,
    activatePlugin,
    deactivatePlugin,
    updatePluginVersion
  }
}
