'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface StoreApp {
  id: string
  user_id: string
  app_code: string
  name: string
  tagline: string | null
  description: string | null
  developer: string | null
  icon_url: string | null
  banner_url: string | null
  screenshots: string[]
  category: 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social'
  subcategory: string | null
  pricing_type: 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'
  price: number
  price_currency: string
  trial_days: number
  status: 'installed' | 'available' | 'updating' | 'trial' | 'suspended'
  installed_at: string | null
  trial_expires_at: string | null
  version: string
  min_version: string | null
  size_bytes: number
  release_date: string | null
  last_updated: string | null
  downloads: number
  active_users: number
  rating: number
  reviews_count: number
  features: string[]
  permissions: string[]
  compatibility: string[]
  languages: number
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseStoreAppsOptions {
  category?: StoreApp['category']
  status?: StoreApp['status']
  pricing?: StoreApp['pricing_type']
}

interface StoreAppStats {
  total: number
  installed: number
  available: number
  trial: number
  totalDownloads: number
  avgRating: number
}

export function useStoreApps(initialApps: StoreApp[] = [], options: UseStoreAppsOptions = {}) {
  const [apps, setApps] = useState<StoreApp[]>(initialApps)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const stats: StoreAppStats = {
    total: apps.length,
    installed: apps.filter(a => a.status === 'installed').length,
    available: apps.filter(a => a.status === 'available').length,
    trial: apps.filter(a => a.status === 'trial').length,
    totalDownloads: apps.reduce((sum, a) => sum + a.downloads, 0),
    avgRating: apps.length > 0
      ? apps.reduce((sum, a) => sum + a.rating, 0) / apps.length
      : 0
  }

  const fetchApps = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('store_apps')
        .select('*')
        .is('deleted_at', null)
        .order('downloads', { ascending: false })

      if (options.category) {
        query = query.eq('category', options.category)
      }
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.pricing) {
        query = query.eq('pricing_type', options.pricing)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setApps(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch apps')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.category, options.status, options.pricing])

  useEffect(() => {
    const channel = supabase
      .channel('store_apps_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_apps' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setApps(prev => [payload.new as StoreApp, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setApps(prev => prev.map(a =>
              a.id === payload.new.id ? payload.new as StoreApp : a
            ))
          } else if (payload.eventType === 'DELETE') {
            setApps(prev => prev.filter(a => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const installApp = useCallback(async (appId: string) => {
    const { error } = await supabase
      .from('store_apps')
      .update({
        status: 'installed',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)

    if (error) throw error
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: 'installed' as const, installed_at: new Date().toISOString() } : a
    ))
  }, [supabase])

  const uninstallApp = useCallback(async (appId: string) => {
    const { error } = await supabase
      .from('store_apps')
      .update({
        status: 'available',
        installed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)

    if (error) throw error
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: 'available' as const, installed_at: null } : a
    ))
  }, [supabase])

  const startTrial = useCallback(async (appId: string, trialDays: number = 14) => {
    const trialExpires = new Date()
    trialExpires.setDate(trialExpires.getDate() + trialDays)

    const { error } = await supabase
      .from('store_apps')
      .update({
        status: 'trial',
        trial_expires_at: trialExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)

    if (error) throw error
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: 'trial' as const, trial_expires_at: trialExpires.toISOString() } : a
    ))
  }, [supabase])

  const updateApp = useCallback(async (appId: string) => {
    const { error } = await supabase
      .from('store_apps')
      .update({
        status: 'updating',
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)

    if (error) throw error
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: 'updating' as const } : a
    ))

    // Simulate update completion
    setTimeout(async () => {
      await supabase
        .from('store_apps')
        .update({
          status: 'installed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appId)

      setApps(prev => prev.map(a =>
        a.id === appId ? { ...a, status: 'installed' as const } : a
      ))
    }, 3000)
  }, [supabase])

  return {
    apps,
    stats,
    isLoading,
    error,
    fetchApps,
    installApp,
    uninstallApp,
    startTrial,
    updateApp
  }
}

export function getStatusColor(status: StoreApp['status']): string {
  switch (status) {
    case 'installed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'available':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'updating':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'trial':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'suspended':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function getCategoryColor(category: StoreApp['category']): string {
  switch (category) {
    case 'business':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'productivity':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'creative':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'finance':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'education':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'utilities':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'developer':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    case 'social':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function getPricingColor(pricing: StoreApp['pricing_type']): string {
  switch (pricing) {
    case 'free':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'freemium':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'paid':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'subscription':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'enterprise':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`
  } else if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function formatDownloads(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
