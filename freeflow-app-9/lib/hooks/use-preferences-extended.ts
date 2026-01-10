'use client'

/**
 * Extended Preferences Hooks
 * Tables: preferences, preference_categories, preference_options, preference_defaults, preference_overrides, preference_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePreference(preferenceId?: string) {
  const [preference, setPreference] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!preferenceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('preferences').select('*, preference_categories(*), preference_options(*)').eq('id', preferenceId).single(); setPreference(data) } finally { setIsLoading(false) }
  }, [preferenceId])
  useEffect(() => { fetch() }, [fetch])
  return { preference, isLoading, refresh: fetch }
}

export function useUserPreferences(userId?: string, categoryId?: string) {
  const [preferences, setPreferences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('preferences').select('*, preference_categories(*), preference_options(*)').eq('user_id', userId)
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data } = await query.order('created_at', { ascending: true })
      setPreferences(data || [])
    } finally { setIsLoading(false) }
  }, [userId, categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}

export function usePreferenceValue(userId?: string, key?: string) {
  const [value, setValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('preferences').select('value').eq('user_id', userId).eq('key', key).single()
      if (data) { setValue(data.value) } else {
        const { data: defaultData } = await supabase.from('preference_defaults').select('default_value').eq('key', key).single()
        setValue(defaultData?.default_value ?? null)
      }
    } finally { setIsLoading(false) }
  }, [userId, key, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { value, isLoading, refresh: fetch }
}

export function usePreferenceCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('preference_categories').select('*, preference_options(count)').order('order', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function usePreferenceOptions(key?: string) {
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('preference_options').select('*').eq('preference_key', key).order('order', { ascending: true }); setOptions(data || []) } finally { setIsLoading(false) }
  }, [key])
  useEffect(() => { fetch() }, [fetch])
  return { options, isLoading, refresh: fetch }
}

export function usePreferenceDefaults(categoryId?: string) {
  const [defaults, setDefaults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('preference_defaults').select('*, preference_categories(*)')
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data } = await query.order('key', { ascending: true })
      setDefaults(data || [])
    } finally { setIsLoading(false) }
  }, [categoryId])
  useEffect(() => { fetch() }, [fetch])
  return { defaults, isLoading, refresh: fetch }
}

export function usePreferenceOverrides(userId?: string) {
  const [overrides, setOverrides] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('preference_overrides').select('*').eq('user_id', userId).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`); setOverrides(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { overrides, isLoading, refresh: fetch }
}

export function usePreferenceHistory(preferenceId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!preferenceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('preference_history').select('*').eq('preference_id', preferenceId).order('changed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [preferenceId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePreferencesByCategory(userId?: string) {
  const [preferencesByCategory, setPreferencesByCategory] = useState<{ [categoryId: string]: any[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('preferences').select('*, preference_categories(*)').eq('user_id', userId)
      const grouped: { [key: string]: any[] } = {}
      data?.forEach(pref => {
        const catId = pref.category_id || 'uncategorized'
        if (!grouped[catId]) grouped[catId] = []
        grouped[catId].push(pref)
      })
      setPreferencesByCategory(grouped)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { preferencesByCategory, isLoading, refresh: fetch }
}

export function useThemePreference(userId?: string) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('preferences').select('value').eq('user_id', userId).eq('key', 'theme').single()
      setTheme(data?.value || 'system')
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { theme, isLoading, refresh: fetch }
}

export function useNotificationPreferences(userId?: string) {
  const [notifications, setNotifications] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('preferences').select('key, value').eq('user_id', userId).like('key', 'notification.%')
      const prefs: any = {}
      data?.forEach(p => { prefs[p.key.replace('notification.', '')] = p.value })
      setNotifications(prefs)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { notifications, isLoading, refresh: fetch }
}
