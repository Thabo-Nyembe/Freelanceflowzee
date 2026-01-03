'use client'

import { useState, useEffect } from 'react'
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

export function useThemes(initialThemes: Theme[], initialStats: ThemesStats) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [stats, setStats] = useState<ThemesStats>(initialStats)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('themes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'themes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setThemes(prev => [payload.new as Theme, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setThemes(prev => prev.map(t => t.id === payload.new.id ? payload.new as Theme : t))
        } else if (payload.eventType === 'DELETE') {
          setThemes(prev => prev.filter(t => t.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    const installed = themes.filter(t => t.status === 'installed').length
    const active = themes.filter(t => t.status === 'active').length
    const totalDownloads = themes.reduce((sum, t) => sum + (t.downloads_count || 0), 0)
    const avgRating = themes.length > 0
      ? themes.reduce((sum, t) => sum + (t.rating || 0), 0) / themes.length
      : 0

    setStats({
      total: themes.length,
      installed,
      active,
      totalDownloads,
      avgRating
    })
  }, [themes])

  return { themes, stats }
}
