'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Theme {
  id: string
  user_id: string
  name: string
  description: string | null
  designer: string | null
  category: 'minimal' | 'professional' | 'creative' | 'dark' | 'light' | 'colorful' | 'modern' | 'classic'
  pricing: 'free' | 'premium' | 'bundle' | 'enterprise'
  status: 'active' | 'available' | 'installed' | 'preview' | 'deprecated'
  price: string
  downloads_count: number
  active_users: number
  rating: number
  reviews_count: number
  version: string
  file_size: string
  colors_count: number
  layouts_count: number
  components_count: number
  dark_mode: boolean
  responsive: boolean
  customizable: boolean
  preview_url: string | null
  tags: string[]
  last_updated: string
  release_date: string
  created_at: string
  updated_at: string
}

export interface ThemesStats {
  total: number
  installed: number
  active: number
  totalDownloads: number
  avgRating: number
}

export function useThemes(initialThemes: Theme[] = [], initialStats?: ThemesStats) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [stats, setStats] = useState<ThemesStats>(initialStats || {
    total: 0,
    installed: 0,
    active: 0,
    totalDownloads: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((list: Theme[]) => {
    const installed = list.filter(t => t.status === 'installed').length
    const active = list.filter(t => t.status === 'active').length
    const totalDownloads = list.reduce((sum, t) => sum + (t.downloads_count || 0), 0)
    const avgRating = list.length > 0
      ? list.reduce((sum, t) => sum + (t.rating || 0), 0) / list.length
      : 0

    setStats({
      total: list.length,
      installed,
      active,
      totalDownloads,
      avgRating
    })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('themes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'themes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setThemes(prev => {
            const updated = [payload.new as Theme, ...prev]
            calculateStats(updated)
            return updated
          })
        } else if (payload.eventType === 'UPDATE') {
          setThemes(prev => {
            const updated = prev.map(t => t.id === payload.new.id ? payload.new as Theme : t)
            calculateStats(updated)
            return updated
          })
        } else if (payload.eventType === 'DELETE') {
          setThemes(prev => {
            const updated = prev.filter(t => t.id !== payload.old.id)
            calculateStats(updated)
            return updated
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, calculateStats])

  useEffect(() => {
    calculateStats(themes)
  }, [themes, calculateStats])

  // Install a theme
  const installTheme = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create installation record
      const { error: installError } = await supabase
        .from('theme_installations')
        .insert({
          theme_id: themeId,
          user_id: user.id,
          status: 'installed',
          installed_at: new Date().toISOString()
        })

      if (installError && installError.code !== '42P01') throw installError

      // Update theme status locally
      setThemes(prev => prev.map(t =>
        t.id === themeId
          ? { ...t, status: 'installed' as const, downloads_count: (t.downloads_count || 0) + 1 }
          : t
      ))

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Uninstall a theme
  const uninstallTheme = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('theme_installations')
        .delete()
        .eq('theme_id', themeId)
        .eq('user_id', user.id)

      if (deleteError && deleteError.code !== '42P01') throw deleteError

      setThemes(prev => prev.map(t =>
        t.id === themeId
          ? { ...t, status: 'available' as const }
          : t
      ))

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Activate a theme
  const activateTheme = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Deactivate all other themes first
      await supabase
        .from('theme_installations')
        .update({ status: 'installed' })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Activate selected theme
      const { error: activateError } = await supabase
        .from('theme_installations')
        .update({ status: 'active', activated_at: new Date().toISOString() })
        .eq('theme_id', themeId)
        .eq('user_id', user.id)

      if (activateError && activateError.code !== '42P01') throw activateError

      // Update user_settings with active theme
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          active_theme_id: themeId,
          updated_at: new Date().toISOString()
        })

      setThemes(prev => prev.map(t => ({
        ...t,
        status: t.id === themeId ? 'active' as const :
                (t.status === 'active' ? 'installed' as const : t.status)
      })))

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Deactivate a theme
  const deactivateTheme = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deactivateError } = await supabase
        .from('theme_installations')
        .update({ status: 'installed' })
        .eq('theme_id', themeId)
        .eq('user_id', user.id)

      if (deactivateError && deactivateError.code !== '42P01') throw deactivateError

      setThemes(prev => prev.map(t =>
        t.id === themeId
          ? { ...t, status: 'installed' as const }
          : t
      ))

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Add to wishlist
  const addToWishlist = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: wishlistError } = await supabase
        .from('theme_wishlist')
        .insert({
          theme_id: themeId,
          user_id: user.id,
          created_at: new Date().toISOString()
        })

      if (wishlistError && wishlistError.code !== '42P01' && wishlistError.code !== '23505') throw wishlistError

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('theme_wishlist')
        .delete()
        .eq('theme_id', themeId)
        .eq('user_id', user.id)

      if (deleteError && deleteError.code !== '42P01') throw deleteError

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Upload a new theme
  const uploadTheme = useCallback(async (themeData: Partial<Theme>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('themes')
        .insert({
          ...themeData,
          user_id: user.id,
          status: 'preview',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError && insertError.code !== '42P01') throw insertError

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Update theme
  const updateTheme = useCallback(async (themeId: string, updates: Partial<Theme>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('themes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', themeId)
        .select()
        .single()

      if (updateError && updateError.code !== '42P01') throw updateError

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  // Delete theme
  const deleteTheme = useCallback(async (themeId: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId)

      if (deleteError && deleteError.code !== '42P01') throw deleteError

      setThemes(prev => prev.filter(t => t.id !== themeId))

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  return {
    themes,
    stats,
    loading,
    error,
    installTheme,
    uninstallTheme,
    activateTheme,
    deactivateTheme,
    addToWishlist,
    removeFromWishlist,
    uploadTheme,
    updateTheme,
    deleteTheme
  }
}
