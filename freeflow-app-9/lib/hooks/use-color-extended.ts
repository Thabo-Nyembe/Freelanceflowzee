'use client'

/**
 * Extended Color Hooks
 * Tables: color_palettes, color_schemes, color_history, color_favorites
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useColorPalette(paletteId?: string) {
  const [palette, setPalette] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!paletteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('color_palettes').select('*').eq('id', paletteId).single(); setPalette(data) } finally { setIsLoading(false) }
  }, [paletteId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { palette, isLoading, refresh: fetch }
}

export function useColorPalettes(options?: { user_id?: string; is_public?: boolean; tag?: string; limit?: number }) {
  const [palettes, setPalettes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('color_palettes').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.tag) query = query.contains('tags', [options.tag])
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPalettes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_public, options?.tag, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { palettes, isLoading, refresh: fetch }
}

export function useColorSchemes(options?: { user_id?: string; type?: string; limit?: number }) {
  const [schemes, setSchemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('color_schemes').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSchemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schemes, isLoading, refresh: fetch }
}

export function useColorHistory(userId?: string, limit?: number) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('color_history').select('*').eq('user_id', userId).order('used_at', { ascending: false }).limit(limit || 20); setHistory(data || []) } finally { setIsLoading(false) }
  }, [userId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useFavoriteColors(userId?: string) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('color_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setFavorites(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { favorites, isLoading, refresh: fetch }
}

export function usePublicPalettes(options?: { tag?: string; limit?: number }) {
  const [palettes, setPalettes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('color_palettes').select('*').eq('is_public', true)
      if (options?.tag) query = query.contains('tags', [options.tag])
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPalettes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tag, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { palettes, isLoading, refresh: fetch }
}

export function useRecentColors(userId?: string) {
  const [colors, setColors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('color_history').select('color').eq('user_id', userId).order('used_at', { ascending: false }).limit(10)
      const uniqueColors = [...new Set(data?.map(c => c.color) || [])]
      setColors(uniqueColors)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { colors, isLoading, refresh: fetch }
}

export function useColorStats(userId?: string) {
  const [stats, setStats] = useState<{ palettes: number; favorites: number; history: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [palettes, favorites, history] = await Promise.all([
        supabase.from('color_palettes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('color_favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('color_history').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ])
      setStats({ palettes: palettes.count || 0, favorites: favorites.count || 0, history: history.count || 0 })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
