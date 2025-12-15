'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Extension {
  id: string
  user_id: string
  name: string
  description: string | null
  version: string
  developer: string | null
  category: 'browser' | 'desktop' | 'mobile' | 'api' | 'workflow' | 'integration' | 'utility' | 'enhancement'
  extension_type: 'official' | 'verified' | 'third-party' | 'experimental' | 'legacy'
  status: 'enabled' | 'disabled' | 'installing' | 'updating' | 'error'
  users_count: number
  downloads_count: number
  rating: number
  total_reviews: number
  size: string | null
  platform: string | null
  permissions: string[]
  features: string[]
  compatibility: string[]
  tags: string[]
  icon_url: string | null
  download_url: string | null
  documentation_url: string | null
  release_date: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ExtensionStats {
  total: number
  enabled: number
  disabled: number
  official: number
  verified: number
  thirdParty: number
  avgRating: number
  totalDownloads: number
}

export function useExtensions(initialExtensions: Extension[] = [], initialStats?: ExtensionStats) {
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions)
  const [stats, setStats] = useState<ExtensionStats>(initialStats || {
    total: 0,
    enabled: 0,
    disabled: 0,
    official: 0,
    verified: 0,
    thirdParty: 0,
    avgRating: 0,
    totalDownloads: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const calculateStats = useCallback((extensionsList: Extension[]) => {
    const totalRating = extensionsList.reduce((sum, e) => sum + (e.rating || 0), 0)
    const totalDownloads = extensionsList.reduce((sum, e) => sum + (e.downloads_count || 0), 0)

    setStats({
      total: extensionsList.length,
      enabled: extensionsList.filter(e => e.status === 'enabled').length,
      disabled: extensionsList.filter(e => e.status === 'disabled').length,
      official: extensionsList.filter(e => e.extension_type === 'official').length,
      verified: extensionsList.filter(e => e.extension_type === 'verified').length,
      thirdParty: extensionsList.filter(e => e.extension_type === 'third-party').length,
      avgRating: extensionsList.length > 0 ? totalRating / extensionsList.length : 0,
      totalDownloads
    })
  }, [])

  const fetchExtensions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('extensions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setExtensions(data || [])
      calculateStats(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  useEffect(() => {
    const channel = supabase
      .channel('extensions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'extensions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExtensions(prev => {
              const updated = [payload.new as Extension, ...prev]
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setExtensions(prev => {
              const updated = prev.map(e => e.id === payload.new.id ? payload.new as Extension : e)
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setExtensions(prev => {
              const updated = prev.filter(e => e.id !== payload.old.id)
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

  const createExtension = useCallback(async (extensionData: Partial<Extension>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('extensions')
        .insert([{ ...extensionData, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updateExtension = useCallback(async (id: string, updates: Partial<Extension>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('extensions')
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

  const deleteExtension = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('extensions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const enableExtension = useCallback(async (id: string) => {
    return updateExtension(id, { status: 'enabled' })
  }, [updateExtension])

  const disableExtension = useCallback(async (id: string) => {
    return updateExtension(id, { status: 'disabled' })
  }, [updateExtension])

  const installExtension = useCallback(async (id: string) => {
    await updateExtension(id, { status: 'installing' })
    // Simulate installation delay
    setTimeout(async () => {
      await updateExtension(id, { status: 'enabled' })
    }, 2000)
  }, [updateExtension])

  return {
    extensions,
    stats,
    loading,
    error,
    fetchExtensions,
    createExtension,
    updateExtension,
    deleteExtension,
    enableExtension,
    disableExtension,
    installExtension
  }
}
