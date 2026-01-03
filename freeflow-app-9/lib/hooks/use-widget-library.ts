'use client'

/**
 * Widget Library Hook - Comprehensive CRUD operations for widget library
 * Tables: widgets, widget_bookmarks, widget_collections, widget_settings, widget_installations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LibraryWidget {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  status: 'stable' | 'beta' | 'deprecated' | 'experimental' | 'archived'
  version: string
  author_name: string | null
  author_avatar: string | null
  author_verified: boolean
  installs_count: number
  downloads_count: number
  stars_count: number
  rating: number
  reviews_count: number
  size_kb: number
  dependencies: string[]
  tags: string[]
  preview_url: string | null
  demo_url: string | null
  docs_url: string | null
  github_url: string | null
  license: string | null
  is_featured: boolean
  is_official: boolean
  code_snippet: string | null
  compatibility: Record<string, string>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WidgetCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  widget_ids: string[]
  is_official: boolean
  cover_image: string | null
  created_at: string
  updated_at: string
}

export interface WidgetInstallation {
  id: string
  user_id: string
  widget_id: string
  installed_at: string
  version: string
  is_active: boolean
}

export interface WidgetLibrarySettings {
  id: string
  user_id: string
  default_view_mode: 'grid' | 'list' | 'compact'
  widgets_per_page: number
  show_featured: boolean
  show_ratings: boolean
  show_install_count: boolean
  auto_update: boolean
  default_sort: 'popular' | 'recent' | 'rating' | 'name'
  default_category: string
  show_beta: boolean
  show_experimental: boolean
  theme: 'light' | 'dark' | 'system'
  card_style: 'flat' | 'elevated' | 'bordered'
  notifications_new_releases: boolean
  notifications_updates: boolean
  notifications_security: boolean
  notifications_weekly_digest: boolean
  notifications_deprecation: boolean
  created_at: string
  updated_at: string
}

export interface WidgetLibraryStats {
  totalWidgets: number
  totalInstalls: number
  totalDownloads: number
  avgRating: number
  officialCount: number
  featuredCount: number
}

export function useWidgetLibrary() {
  const [widgets, setWidgets] = useState<LibraryWidget[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set())
  const [collections, setCollections] = useState<WidgetCollection[]>([])
  const [settings, setSettings] = useState<WidgetLibrarySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const supabase = createClient()

  // Calculate stats from widgets
  const stats: WidgetLibraryStats = {
    totalWidgets: widgets.length,
    totalInstalls: widgets.reduce((sum, w) => sum + (w.installs_count || 0), 0),
    totalDownloads: widgets.reduce((sum, w) => sum + (w.downloads_count || 0), 0),
    avgRating: widgets.length > 0
      ? Number((widgets.reduce((sum, w) => sum + (w.rating || 0), 0) / widgets.length).toFixed(1))
      : 0,
    officialCount: widgets.filter(w => w.is_official).length,
    featuredCount: widgets.filter(w => w.is_featured).length
  }

  // Fetch all widgets
  const fetchWidgets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .order('installs_count', { ascending: false })

      if (error) throw error
      setWidgets(data || [])
    } catch (error) {
      console.error('Error fetching widgets:', error)
    }
  }, [supabase])

  // Fetch user's bookmarked widget IDs
  const fetchBookmarks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bookmarks')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'widget')

      if (error) throw error
      setBookmarkedIds(new Set((data || []).map(b => b.item_id)))
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }, [supabase])

  // Fetch user's installed widget IDs
  const fetchInstallations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('widget_installations')
        .select('widget_id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error && error.code !== 'PGRST116') throw error
      setInstalledIds(new Set((data || []).map(i => i.widget_id)))
    } catch (error) {
      console.error('Error fetching installations:', error)
    }
  }, [supabase])

  // Fetch user's collections
  const fetchCollections = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('widget_collections')
        .select('*')
        .or(`user_id.eq.${user.id},is_official.eq.true`)
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') throw error
      setCollections(data || [])
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }, [supabase])

  // Fetch user's settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('widget_library_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }, [supabase])

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([
        fetchWidgets(),
        fetchBookmarks(),
        fetchInstallations(),
        fetchCollections(),
        fetchSettings()
      ])
      setLoading(false)
    }
    fetchAll()
  }, [fetchWidgets, fetchBookmarks, fetchInstallations, fetchCollections, fetchSettings])

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('widget-library-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'widgets' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWidgets(prev => [payload.new as LibraryWidget, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setWidgets(prev => prev.map(w => w.id === payload.new.id ? payload.new as LibraryWidget : w))
        } else if (payload.eventType === 'DELETE') {
          setWidgets(prev => prev.filter(w => w.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Install a widget
  const installWidget = useCallback(async (widgetId: string) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const widget = widgets.find(w => w.id === widgetId)
      if (!widget) throw new Error('Widget not found')

      // Create installation record
      const { error: installError } = await supabase
        .from('widget_installations')
        .upsert({
          user_id: user.id,
          widget_id: widgetId,
          version: widget.version,
          is_active: true,
          installed_at: new Date().toISOString()
        }, { onConflict: 'user_id,widget_id' })

      if (installError) throw installError

      // Increment install count on widget
      const { error: updateError } = await supabase
        .from('widgets')
        .update({
          installs_count: (widget.installs_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', widgetId)

      if (updateError) throw updateError

      setInstalledIds(prev => new Set([...prev, widgetId]))
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase, widgets])

  // Uninstall a widget
  const uninstallWidget = useCallback(async (widgetId: string) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('widget_installations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('widget_id', widgetId)

      if (error) throw error

      setInstalledIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(widgetId)
        return newSet
      })
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Toggle bookmark
  const toggleBookmark = useCallback(async (widgetId: string) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const isCurrentlyBookmarked = bookmarkedIds.has(widgetId)

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', widgetId)
          .eq('item_type', 'widget')

        if (error) throw error

        setBookmarkedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(widgetId)
          return newSet
        })
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            item_id: widgetId,
            item_type: 'widget'
          })

        if (error) throw error

        setBookmarkedIds(prev => new Set([...prev, widgetId]))
      }

      return { success: true, isBookmarked: !isCurrentlyBookmarked, error: null }
    } catch (error: any) {
      return { success: false, isBookmarked: bookmarkedIds.has(widgetId), error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase, bookmarkedIds])

  // Create a new widget (publish)
  const createWidget = useCallback(async (input: Partial<LibraryWidget>) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('widgets')
        .insert({
          ...input,
          user_id: user.id,
          author_name: input.author_name || user.email?.split('@')[0],
          installs_count: 0,
          downloads_count: 0,
          stars_count: 0,
          rating: 0,
          reviews_count: 0,
          is_featured: false,
          is_official: false
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Update a widget
  const updateWidget = useCallback(async (id: string, input: Partial<LibraryWidget>) => {
    setOperationLoading(true)
    try {
      const { data, error } = await supabase
        .from('widgets')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Delete a widget
  const deleteWidget = useCallback(async (id: string) => {
    setOperationLoading(true)
    try {
      const { error } = await supabase.from('widgets').delete().eq('id', id)
      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Create a collection
  const createCollection = useCallback(async (input: { name: string; description?: string; widget_ids?: string[] }) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('widget_collections')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          widget_ids: input.widget_ids || [],
          is_official: false
        })
        .select()
        .single()

      if (error) throw error
      setCollections(prev => [data, ...prev])
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Update settings
  const updateSettings = useCallback(async (input: Partial<WidgetLibrarySettings>) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('widget_library_settings')
        .upsert({
          user_id: user.id,
          ...input,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) throw error
      setSettings(data)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Rate a widget
  const rateWidget = useCallback(async (widgetId: string, rating: number) => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upsert user's rating
      const { error: ratingError } = await supabase
        .from('widget_ratings')
        .upsert({
          user_id: user.id,
          widget_id: widgetId,
          rating,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,widget_id' })

      if (ratingError) throw ratingError

      // Recalculate average rating for the widget
      const { data: ratings } = await supabase
        .from('widget_ratings')
        .select('rating')
        .eq('widget_id', widgetId)

      if (ratings && ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        await supabase
          .from('widgets')
          .update({
            rating: Number(avgRating.toFixed(1)),
            reviews_count: ratings.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', widgetId)
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Export widget config
  const exportWidgetConfig = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const config = {
        settings,
        bookmarks: Array.from(bookmarkedIds),
        installations: Array.from(installedIds),
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `widget-library-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [settings, bookmarkedIds, installedIds, supabase])

  // Clear cache (reset local state and refetch)
  const clearCache = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchWidgets(),
      fetchBookmarks(),
      fetchInstallations(),
      fetchCollections(),
      fetchSettings()
    ])
    setLoading(false)
    return { success: true }
  }, [fetchWidgets, fetchBookmarks, fetchInstallations, fetchCollections, fetchSettings])

  // Reset all settings to defaults
  const resetSettings = useCallback(async () => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('widget_library_settings')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setSettings(null)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  // Uninstall all widgets
  const uninstallAllWidgets = useCallback(async () => {
    setOperationLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('widget_installations')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (error) throw error
      setInstalledIds(new Set())
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setOperationLoading(false)
    }
  }, [supabase])

  return {
    // Data
    widgets,
    bookmarkedIds,
    installedIds,
    collections,
    settings,
    stats,

    // Loading states
    loading,
    operationLoading,

    // Widget operations
    installWidget,
    uninstallWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    rateWidget,

    // Bookmark operations
    toggleBookmark,

    // Collection operations
    createCollection,

    // Settings operations
    updateSettings,
    resetSettings,

    // Utility operations
    exportWidgetConfig,
    clearCache,
    uninstallAllWidgets,

    // Refresh functions
    refresh: clearCache
  }
}
