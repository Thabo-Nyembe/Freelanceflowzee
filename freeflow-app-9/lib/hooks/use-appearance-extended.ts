'use client'

/**
 * Extended Appearance Hooks
 * Tables: appearance_settings, appearance_themes, appearance_presets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAppearanceSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('appearance_settings').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useAppearanceThemes(options?: { category?: string; is_public?: boolean }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('appearance_themes').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('name', { ascending: true })
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_public])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useAppearanceTheme(themeId?: string) {
  const [theme, setTheme] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!themeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('appearance_themes').select('*').eq('id', themeId).single(); setTheme(data) } finally { setIsLoading(false) }
  }, [themeId])
  useEffect(() => { fetch() }, [fetch])
  return { theme, isLoading, refresh: fetch }
}

export function usePublicThemes(options?: { category?: string; limit?: number }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('appearance_themes').select('*').eq('is_public', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useUserThemes(userId?: string) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('appearance_themes').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setThemes(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useThemeCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('appearance_themes').select('category').eq('is_public', true); const unique = [...new Set((data || []).map(t => t.category).filter(Boolean))]; setCategories(unique) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}
