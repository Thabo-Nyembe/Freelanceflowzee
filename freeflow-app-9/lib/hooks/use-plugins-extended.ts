'use client'

/**
 * Extended Plugins Hooks
 * Tables: plugins, plugin_installs, plugin_settings, plugin_hooks
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlugin(pluginId?: string) {
  const [plugin, setPlugin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pluginId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plugins').select('*').eq('id', pluginId).single(); setPlugin(data) } finally { setIsLoading(false) }
  }, [pluginId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plugin, isLoading, refresh: fetch }
}

export function usePlugins(options?: { category?: string; status?: string; limit?: number }) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('plugins').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setPlugins(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plugins, isLoading, refresh: fetch }
}

export function useUserPlugins(userId?: string, options?: { is_active?: boolean }) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('plugin_installs').select('*, plugins(*)').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('installed_at', { ascending: false })
      setPlugins(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plugins, isLoading, refresh: fetch }
}

export function useActivePlugins(userId?: string) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plugin_installs').select('*, plugins(*)').eq('user_id', userId).eq('is_active', true).order('installed_at', { ascending: false }); setPlugins(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plugins, isLoading, refresh: fetch }
}

export function usePluginsByCategory(category?: string) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!category) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plugins').select('*').eq('category', category).eq('status', 'active').order('name', { ascending: true }); setPlugins(data || []) } finally { setIsLoading(false) }
  }, [category, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plugins, isLoading, refresh: fetch }
}
