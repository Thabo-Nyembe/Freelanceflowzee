'use client'

/**
 * Extended Theme Hooks - Covers all Theme-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useThemes(themeType?: string, isPublic?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('themes').select('*').order('name', { ascending: true })
      if (themeType) query = query.eq('theme_type', themeType)
      if (isPublic !== undefined) query = query.eq('is_public', isPublic)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [themeType, isPublic, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserTheme(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('user_themes').select('*, themes(*)').eq('user_id', userId).eq('is_active', true).single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useThemeSettings(themeId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!themeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('theme_settings').select('*').eq('theme_id', themeId).single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [themeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
