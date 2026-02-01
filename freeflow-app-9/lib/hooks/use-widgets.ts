'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Widget {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  widget_type: 'chart' | 'form' | 'display' | 'interactive' | 'data-input' | 'visualization' | 'embed'
  status: 'active' | 'beta' | 'deprecated' | 'maintenance' | 'coming-soon'
  version: string
  author: string | null
  installs_count: number
  active_users_count: number
  rating: number
  total_ratings: number
  downloads_count: number
  size: string | null
  dependencies_count: number
  documentation_url: string | null
  demo_url: string | null
  tags: string[]
  config: Record<string, any>
  metadata: Record<string, any>
  released_at: string | null
  created_at: string
  updated_at: string
}

export interface WidgetStats {
  total: number
  active: number
  beta: number
  totalInstalls: number
  totalActiveUsers: number
  avgRating: number
}

export function useWidgets(initialWidgets: Widget[] = [], initialStats: WidgetStats = {
  total: 0, active: 0, beta: 0, totalInstalls: 0, totalActiveUsers: 0, avgRating: 0
}) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [stats, setStats] = useState<WidgetStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const calculateStats = useCallback((widgetList: Widget[]) => {
    const totalRatings = widgetList.reduce((sum, w) => sum + (w.rating * w.total_ratings), 0)
    const totalReviews = widgetList.reduce((sum, w) => sum + w.total_ratings, 0)
    return {
      total: widgetList.length,
      active: widgetList.filter(w => w.status === 'active').length,
      beta: widgetList.filter(w => w.status === 'beta').length,
      totalInstalls: widgetList.reduce((sum, w) => sum + w.installs_count, 0),
      totalActiveUsers: widgetList.reduce((sum, w) => sum + w.active_users_count, 0),
      avgRating: totalReviews > 0 ? Number((totalRatings / totalReviews).toFixed(1)) : 0
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('widgets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'widgets' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWidgets(prev => {
            const updated = [payload.new as Widget, ...prev]
            setStats(calculateStats(updated))
            return updated
          })
        } else if (payload.eventType === 'UPDATE') {
          setWidgets(prev => {
            const updated = prev.map(w => w.id === payload.new.id ? payload.new as Widget : w)
            setStats(calculateStats(updated))
            return updated
          })
        } else if (payload.eventType === 'DELETE') {
          setWidgets(prev => {
            const updated = prev.filter(w => w.id !== payload.old.id)
            setStats(calculateStats(updated))
            return updated
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, calculateStats])

  const createWidget = useCallback(async (input: Partial<Widget>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('widgets')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateWidget = useCallback(async (id: string, input: Partial<Widget>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('widgets')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteWidget = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('widgets').delete().eq('id', id)
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const installWidget = useCallback(async (id: string) => {
    const widget = widgets.find(w => w.id === id)
    if (!widget) return { data: null, error: 'Widget not found' }
    return updateWidget(id, {
      installs_count: widget.installs_count + 1,
      active_users_count: widget.active_users_count + 1
    })
  }, [widgets, updateWidget])

  return {
    widgets,
    stats,
    loading,
    createWidget,
    updateWidget,
    deleteWidget,
    installWidget
  }
}
