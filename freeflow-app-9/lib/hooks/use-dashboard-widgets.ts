'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export interface DashboardWidget {
  id: string
  user_id: string
  widget_type: string
  title: string
  position: number
  width: string
  height: string
  config: Record<string, JsonValue>
  is_visible: boolean
  created_at: string
  updated_at: string
}

export function useDashboardWidgets(initialWidgets: DashboardWidget[] = []) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchWidgets = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      setWidgets(data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createWidget = async (widget: Partial<DashboardWidget>) => {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert([widget])
      .select()
      .single()

    if (error) throw error
    setWidgets(prev => [...prev, data])
    return data
  }

  const updateWidget = async (id: string, updates: Partial<DashboardWidget>) => {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setWidgets(prev => prev.map(w => w.id === id ? data : w))
    return data
  }

  const deleteWidget = async (id: string) => {
    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id)

    if (error) throw error
    setWidgets(prev => prev.filter(w => w.id !== id))
  }

  const reorderWidgets = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, position: index }))

    for (const update of updates) {
      await supabase
        .from('dashboard_widgets')
        .update({ position: update.position })
        .eq('id', update.id)
    }

    setWidgets(prev => {
      const sorted = [...prev].sort((a, b) =>
        orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
      )
      return sorted
    })
  }

  useEffect(() => {
    const channel = supabase
      .channel('dashboard_widgets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_widgets' },
        () => fetchWidgets()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchWidgets])

  return {
    widgets,
    isLoading,
    error,
    fetchWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
    reorderWidgets
  }
}
