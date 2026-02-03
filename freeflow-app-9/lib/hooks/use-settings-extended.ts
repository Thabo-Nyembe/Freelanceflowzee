'use client'

/**
 * Extended Settings Hooks
 * Tables: settings, setting_categories, setting_values, setting_history, setting_presets, setting_overrides
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSetting(key?: string, scope?: { type: string; id: string }) {
  const [setting, setSetting] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      if (scope) {
        const { data: override } = await supabase.from('setting_overrides').select('value').eq('setting_key', key).eq('scope_type', scope.type).eq('scope_id', scope.id).single()
        if (override) { setSetting({ key, value: override.value, isOverride: true }); return }
      }
      const { data } = await supabase.from('settings').select('*, setting_categories(*)').eq('key', key).single()
      setSetting(data)
    } finally { setIsLoading(false) }
  }, [key, scope?.type, scope?.id])
  useEffect(() => { loadData() }, [loadData])
  return { setting, isLoading, refresh: loadData }
}

export function useSettings(options?: { category_id?: string; is_public?: boolean; search?: string; keys?: string[] }) {
  const [settings, setSettings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('settings').select('*, setting_categories(*)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.keys && options.keys.length > 0) query = query.in('key', options.keys)
      if (options?.search) query = query.or(`key.ilike.%${options.search}%,label.ilike.%${options.search}%`)
      const { data } = await query.order('key', { ascending: true })
      setSettings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.is_public, options?.search, JSON.stringify(options?.keys)])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useSettingsMap(keys: string[], scope?: { type: string; id: string }) {
  const [settingsMap, setSettingsMap] = useState<{ [key: string]: any }>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (keys.length === 0) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: settings } = await supabase.from('settings').select('key, value').in('key', keys)
      const map: { [key: string]: any } = {}
      ;(settings || []).forEach(s => { map[s.key] = s.value })
      if (scope) {
        const { data: overrides } = await supabase.from('setting_overrides').select('setting_key, value').in('setting_key', keys).eq('scope_type', scope.type).eq('scope_id', scope.id)
        ;(overrides || []).forEach(o => { map[o.setting_key] = o.value })
      }
      setSettingsMap(map)
    } finally { setIsLoading(false) }
  }, [JSON.stringify(keys), scope?.type, scope?.id])
  useEffect(() => { loadData() }, [loadData])
  return { settingsMap, isLoading, refresh: loadData, getValue: (key: string) => settingsMap[key] }
}

export function useSettingCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('setting_categories').select('*, settings(count)')
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useSettingHistory(settingKey?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!settingKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: setting } = await supabase.from('settings').select('id').eq('key', settingKey).single()
      if (!setting) { setHistory([]); return }
      let query = supabase.from('setting_history').select('*, users(*)').eq('setting_id', setting.id)
      if (options?.from_date) query = query.gte('changed_at', options.from_date)
      if (options?.to_date) query = query.lte('changed_at', options.to_date)
      const { data } = await query.order('changed_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [settingKey, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useSettingPresets(options?: { category?: string; is_active?: boolean }) {
  const [presets, setPresets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('setting_presets').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPresets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { presets, isLoading, refresh: loadData }
}

export function useSettingOverrides(scope?: { type: string; id: string }) {
  const [overrides, setOverrides] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!scope) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('setting_overrides').select('*, settings(*)').eq('scope_type', scope.type).eq('scope_id', scope.id)
      setOverrides(data || [])
    } finally { setIsLoading(false) }
  }, [scope?.type, scope?.id])
  useEffect(() => { loadData() }, [loadData])
  return { overrides, isLoading, refresh: loadData }
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('settings').select('key, value, label, description').eq('is_public', true).order('key', { ascending: true })
      setSettings(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useSettingStats() {
  const [stats, setStats] = useState<{ total: number; categories: number; presets: number; overrides: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const [total, categories, presets, overrides] = await Promise.all([
        supabase.from('settings').select('*', { count: 'exact', head: true }),
        supabase.from('setting_categories').select('*', { count: 'exact', head: true }),
        supabase.from('setting_presets').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('setting_overrides').select('*', { count: 'exact', head: true })
      ])
      setStats({ total: total.count || 0, categories: categories.count || 0, presets: presets.count || 0, overrides: overrides.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

