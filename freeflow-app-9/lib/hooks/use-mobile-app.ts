'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MobileAppFeature {
  id: string
  user_id: string
  title: string
  description: string | null
  feature_type: 'core' | 'standard' | 'premium' | 'beta' | 'experimental'
  status: 'active' | 'inactive' | 'beta' | 'deprecated' | 'coming-soon'
  platform: 'all' | 'ios' | 'android'
  users_count: number
  engagement_percent: number
  downloads_count: number
  rating: number
  version: string | null
  release_date: string | null
  icon_color: string | null
  tags: string[]
  config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MobileAppVersion {
  id: string
  user_id: string
  version: string
  platform: 'all' | 'ios' | 'android'
  status: 'stable' | 'beta' | 'deprecated' | 'archived'
  downloads_count: number
  active_users_count: number
  crash_free_rate: number
  release_notes: string | null
  features: string[]
  release_date: string | null
  min_os_version: string | null
  size_mb: number | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MobileAppStats {
  totalFeatures: number
  activeFeatures: number
  totalDownloads: number
  totalUsers: number
  avgEngagement: number
  avgRating: number
  totalVersions: number
  latestVersion: string | null
}

export function useMobileApp(
  initialFeatures: MobileAppFeature[] = [],
  initialVersions: MobileAppVersion[] = [],
  initialStats?: MobileAppStats
) {
  const [features, setFeatures] = useState<MobileAppFeature[]>(initialFeatures)
  const [versions, setVersions] = useState<MobileAppVersion[]>(initialVersions)
  const [stats, setStats] = useState<MobileAppStats>(initialStats || {
    totalFeatures: 0,
    activeFeatures: 0,
    totalDownloads: 0,
    totalUsers: 0,
    avgEngagement: 0,
    avgRating: 0,
    totalVersions: 0,
    latestVersion: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((featuresList: MobileAppFeature[], versionsList: MobileAppVersion[]) => {
    const totalDownloads = featuresList.reduce((sum, f) => sum + (f.downloads_count || 0), 0)
    const totalUsers = featuresList.reduce((sum, f) => sum + (f.users_count || 0), 0)
    const totalEngagement = featuresList.reduce((sum, f) => sum + (f.engagement_percent || 0), 0)
    const totalRating = featuresList.reduce((sum, f) => sum + (f.rating || 0), 0)
    const latestVersion = versionsList.length > 0 ? versionsList[0].version : null

    setStats({
      totalFeatures: featuresList.length,
      activeFeatures: featuresList.filter(f => f.status === 'active').length,
      totalDownloads,
      totalUsers,
      avgEngagement: featuresList.length > 0 ? totalEngagement / featuresList.length : 0,
      avgRating: featuresList.length > 0 ? totalRating / featuresList.length : 0,
      totalVersions: versionsList.length,
      latestVersion
    })
  }, [])

  useEffect(() => {
    const featuresChannel = supabase
      .channel('mobile_app_features_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mobile_app_features' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFeatures(prev => {
              const updated = [payload.new as MobileAppFeature, ...prev]
              calculateStats(updated, versions)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setFeatures(prev => {
              const updated = prev.map(f => f.id === payload.new.id ? payload.new as MobileAppFeature : f)
              calculateStats(updated, versions)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setFeatures(prev => {
              const updated = prev.filter(f => f.id !== payload.old.id)
              calculateStats(updated, versions)
              return updated
            })
          }
        }
      )
      .subscribe()

    const versionsChannel = supabase
      .channel('mobile_app_versions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mobile_app_versions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVersions(prev => {
              const updated = [payload.new as MobileAppVersion, ...prev]
              calculateStats(features, updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setVersions(prev => {
              const updated = prev.map(v => v.id === payload.new.id ? payload.new as MobileAppVersion : v)
              calculateStats(features, updated)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setVersions(prev => {
              const updated = prev.filter(v => v.id !== payload.old.id)
              calculateStats(features, updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(featuresChannel)
      supabase.removeChannel(versionsChannel)
    }
  }, [supabase, calculateStats, features, versions])

  const createFeature = useCallback(async (data: Partial<MobileAppFeature>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('mobile_app_features')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return result
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updateFeature = useCallback(async (id: string, updates: Partial<MobileAppFeature>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('mobile_app_features')
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

  const deleteFeature = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('mobile_app_features')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const createVersion = useCallback(async (data: Partial<MobileAppVersion>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('mobile_app_versions')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return result
    } catch (err: unknown) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updateVersion = useCallback(async (id: string, updates: Partial<MobileAppVersion>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('mobile_app_versions')
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

  return {
    features,
    versions,
    stats,
    loading,
    error,
    createFeature,
    updateFeature,
    deleteFeature,
    createVersion,
    updateVersion
  }
}
