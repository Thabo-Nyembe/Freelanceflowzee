'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface UIComponent {
  id: string
  user_id: string
  name: string
  description?: string
  category: 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'media' | 'buttons' | 'overlays'
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
  status: 'published' | 'draft' | 'deprecated' | 'beta' | 'archived'
  version?: string
  author?: string
  downloads_count?: number
  usage_count?: number
  rating?: number
  reviews_count?: number
  file_size?: string
  dependencies_count?: number
  props_count?: number
  examples_count?: number
  accessibility_level?: string
  is_responsive?: boolean
  code_snippet?: string
  preview_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UIComponentStats {
  total: number
  published: number
  beta: number
  draft: number
  totalDownloads: number
  avgRating: number
}

export function useUIComponents(initialComponents: UIComponent[] = [], initialStats?: UIComponentStats) {
  const [components, setComponents] = useState<UIComponent[]>(initialComponents)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const defaultStats: UIComponentStats = {
    total: 0,
    published: 0,
    beta: 0,
    draft: 0,
    totalDownloads: 0,
    avgRating: 0
  }

  const calculateStats = useCallback((componentList: UIComponent[]): UIComponentStats => {
    const ratedComponents = componentList.filter(c => c.rating && c.rating > 0)
    return {
      total: componentList.length,
      published: componentList.filter(c => c.status === 'published').length,
      beta: componentList.filter(c => c.status === 'beta').length,
      draft: componentList.filter(c => c.status === 'draft').length,
      totalDownloads: componentList.reduce((sum, c) => sum + (c.downloads_count || 0), 0),
      avgRating: ratedComponents.length > 0
        ? ratedComponents.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedComponents.length
        : 0
    }
  }, [])

  const [stats, setStats] = useState<UIComponentStats>(initialStats || calculateStats(initialComponents))

  useEffect(() => {
    const channel = supabase
      .channel('ui_components_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ui_components' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComponents(prev => {
              const updated = [payload.new as UIComponent, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setComponents(prev => {
              const updated = prev.map(c => c.id === payload.new.id ? payload.new as UIComponent : c)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setComponents(prev => {
              const updated = prev.filter(c => c.id !== payload.old.id)
              setStats(calculateStats(updated))
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

  return { components, stats, loading }
}
