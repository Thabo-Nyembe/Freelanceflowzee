'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AddOn {
  id: string
  user_id: string
  addon_code: string
  name: string
  description: string | null
  version: string
  provider: string | null
  category: 'feature' | 'integration' | 'theme' | 'tool' | 'analytics' | 'security'
  pricing_type: 'free' | 'paid' | 'freemium' | 'subscription'
  status: 'available' | 'installed' | 'disabled' | 'deprecated'
  price: number
  currency: string
  billing_period: 'monthly' | 'yearly' | 'one_time'
  subscribers: number
  total_sales: number
  rating: number
  reviews_count: number
  downloads: number
  features: string[]
  requirements: string[]
  benefits: string[]
  tags: string[]
  icon_url: string | null
  screenshot_urls: string[]
  trial_days: number
  has_trial: boolean
  release_date: string | null
  last_updated: string
  installed_at: string | null
  trial_ends_at: string | null
  size_bytes: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAddOnsOptions {
  status?: AddOn['status']
  category?: AddOn['category']
  pricingType?: AddOn['pricing_type']
  searchQuery?: string
}

interface AddOnStats {
  total: number
  installed: number
  available: number
  disabled: number
  free: number
  paid: number
  avgRating: number
  totalDownloads: number
}

export function useAddOns(initialAddOns: AddOn[] = [], options: UseAddOnsOptions = {}) {
  const [addOns, setAddOns] = useState<AddOn[]>(initialAddOns)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const stats: AddOnStats = {
    total: addOns.length,
    installed: addOns.filter(a => a.status === 'installed').length,
    available: addOns.filter(a => a.status === 'available').length,
    disabled: addOns.filter(a => a.status === 'disabled').length,
    free: addOns.filter(a => a.pricing_type === 'free').length,
    paid: addOns.filter(a => a.pricing_type === 'paid' || a.pricing_type === 'subscription').length,
    avgRating: addOns.length > 0
      ? addOns.reduce((sum, a) => sum + a.rating, 0) / addOns.length
      : 0,
    totalDownloads: addOns.reduce((sum, a) => sum + a.downloads, 0)
  }

  const fetchAddOns = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('add_ons')
        .select('*')
        .is('deleted_at', null)
        .order('rating', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.category) {
        query = query.eq('category', options.category)
      }
      if (options.pricingType) {
        query = query.eq('pricing_type', options.pricingType)
      }
      if (options.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setAddOns(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch add-ons')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.status, options.category, options.pricingType, options.searchQuery])

  useEffect(() => {
    const channel = supabase
      .channel('add_ons_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'add_ons' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAddOns(prev => [payload.new as AddOn, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAddOns(prev => prev.map(a => a.id === payload.new.id ? payload.new as AddOn : a))
          } else if (payload.eventType === 'DELETE') {
            setAddOns(prev => prev.filter(a => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const installAddOn = useCallback(async (addOnId: string) => {
    const { error } = await supabase
      .from('add_ons')
      .update({
        status: 'installed',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)

    if (error) throw error
    setAddOns(prev => prev.map(a =>
      a.id === addOnId
        ? { ...a, status: 'installed' as const, installed_at: new Date().toISOString() }
        : a
    ))
  }, [supabase])

  const uninstallAddOn = useCallback(async (addOnId: string) => {
    const { error } = await supabase
      .from('add_ons')
      .update({
        status: 'available',
        installed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)

    if (error) throw error
    setAddOns(prev => prev.map(a =>
      a.id === addOnId
        ? { ...a, status: 'available' as const, installed_at: null }
        : a
    ))
  }, [supabase])

  const disableAddOn = useCallback(async (addOnId: string) => {
    const { error } = await supabase
      .from('add_ons')
      .update({
        status: 'disabled',
        updated_at: new Date().toISOString()
      })
      .eq('id', addOnId)

    if (error) throw error
    setAddOns(prev => prev.map(a =>
      a.id === addOnId
        ? { ...a, status: 'disabled' as const }
        : a
    ))
  }, [supabase])

  return {
    addOns,
    stats,
    isLoading,
    error,
    fetchAddOns,
    installAddOn,
    uninstallAddOn,
    disableAddOn
  }
}

export function getAddOnStatusColor(status: AddOn['status']): string {
  switch (status) {
    case 'installed':
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    case 'available':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
    case 'disabled':
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
    case 'deprecated':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
  }
}

export function getCategoryColor(category: AddOn['category']): string {
  switch (category) {
    case 'feature':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'integration':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'theme':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    case 'tool':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'analytics':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'security':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getPricingColor(pricing: AddOn['pricing_type']): string {
  switch (pricing) {
    case 'free':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'paid':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'freemium':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'subscription':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

export function formatDownloads(downloads: number): string {
  if (downloads >= 1000000) {
    return `${(downloads / 1000000).toFixed(1)}M`
  } else if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(1)}K`
  }
  return downloads.toString()
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
