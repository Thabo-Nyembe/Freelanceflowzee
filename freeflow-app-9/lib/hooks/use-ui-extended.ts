'use client'

/**
 * Extended UI Hooks
 * Tables: ui_components, ui_themes, ui_layouts, ui_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUiComponent(componentId?: string) {
  const [component, setComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!componentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ui_components').select('*').eq('id', componentId).single(); setComponent(data) } finally { setIsLoading(false) }
  }, [componentId])
  useEffect(() => { loadData() }, [loadData])
  return { component, isLoading, refresh: loadData }
}

export function useUiComponents(options?: { type?: string; is_active?: boolean; limit?: number }) {
  const [components, setComponents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ui_components').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setComponents(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { components, isLoading, refresh: loadData }
}

export function useUiThemes(options?: { is_active?: boolean; is_default?: boolean }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ui_themes').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default)
      const { data } = await query.order('name', { ascending: true })
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.is_default])
  useEffect(() => { loadData() }, [loadData])
  return { themes, isLoading, refresh: loadData }
}

export function useUiLayouts(options?: { type?: string; is_active?: boolean }) {
  const [layouts, setLayouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ui_layouts').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setLayouts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { layouts, isLoading, refresh: loadData }
}

export function useUiPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ui_preferences').select('*').eq('user_id', userId).single(); setPreferences(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { preferences, isLoading, refresh: loadData }
}
