'use client'

/**
 * Extended Installed Apps Hooks
 * Tables: installed_apps, installed_plugins, installed_extensions, installed_themes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInstalledApp(installId?: string) {
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!installId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('installed_apps').select('*').eq('id', installId).single(); setApp(data) } finally { setIsLoading(false) }
  }, [installId])
  useEffect(() => { fetch() }, [fetch])
  return { app, isLoading, refresh: fetch }
}

export function useInstalledApps(userId?: string, options?: { is_active?: boolean; limit?: number }) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('installed_apps').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100)
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { apps, isLoading, refresh: fetch }
}

export function useInstalledPlugins(userId?: string, options?: { is_active?: boolean; limit?: number }) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('installed_plugins').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100)
      setPlugins(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { plugins, isLoading, refresh: fetch }
}

export function useInstalledExtensions(userId?: string, options?: { is_active?: boolean; limit?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('installed_extensions').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useInstalledThemes(userId?: string) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('installed_themes').select('*').eq('user_id', userId).order('installed_at', { ascending: false }); setThemes(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useActiveApps(userId?: string) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('installed_apps').select('*').eq('user_id', userId).eq('is_active', true).order('installed_at', { ascending: false }); setApps(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { apps, isLoading, refresh: fetch }
}
