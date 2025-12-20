'use client'

/**
 * Extended Themes Hooks
 * Tables: themes, theme_settings, theme_customizations, theme_assets, theme_versions, theme_installations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTheme(themeId?: string) {
  const [theme, setTheme] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!themeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('themes').select('*, theme_settings(*), theme_assets(*), theme_versions(*)').eq('id', themeId).single(); setTheme(data) } finally { setIsLoading(false) }
  }, [themeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { theme, isLoading, refresh: fetch }
}

export function useThemes(options?: { category?: string; author_id?: string; status?: string; is_public?: boolean; is_free?: boolean; search?: string; limit?: number }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('themes').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.is_free) query = query.or('price.is.null,price.eq.0')
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.author_id, options?.status, options?.is_public, options?.is_free, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useMyThemes(userId?: string, options?: { status?: string }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('themes').select('*').eq('author_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false })
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}

export function useThemeInstallations(options?: { theme_id?: string; user_id?: string; entity_type?: string; entity_id?: string }) {
  const [installations, setInstallations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('theme_installations').select('*, themes(*)')
      if (options?.theme_id) query = query.eq('theme_id', options.theme_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query.order('installed_at', { ascending: false })
      setInstallations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.theme_id, options?.user_id, options?.entity_type, options?.entity_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { installations, isLoading, refresh: fetch }
}

export function useActiveTheme(entityType?: string, entityId?: string) {
  const [installation, setInstallation] = useState<any>(null)
  const [theme, setTheme] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('theme_installations').select('*, themes(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('status', 'active').single()
      setInstallation(data)
      setTheme(data?.themes || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { installation, theme, isLoading, refresh: fetch }
}

export function useThemeVersions(themeId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [latestVersion, setLatestVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!themeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('theme_versions').select('*, users(*)').eq('theme_id', themeId).order('created_at', { ascending: false })
      setVersions(data || [])
      setLatestVersion(data?.[0] || null)
    } finally { setIsLoading(false) }
  }, [themeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, latestVersion, isLoading, refresh: fetch }
}

export function useThemeAssets(themeId?: string, options?: { asset_type?: string }) {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!themeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('theme_assets').select('*').eq('theme_id', themeId)
      if (options?.asset_type) query = query.eq('asset_type', options.asset_type)
      const { data } = await query.order('name', { ascending: true })
      setAssets(data || [])
    } finally { setIsLoading(false) }
  }, [themeId, options?.asset_type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { assets, isLoading, refresh: fetch }
}

export function useThemeCustomizations(installationId?: string) {
  const [customizations, setCustomizations] = useState<any[]>([])
  const [latestCustomization, setLatestCustomization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!installationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('theme_customizations').select('*, users(*)').eq('installation_id', installationId).order('created_at', { ascending: false })
      setCustomizations(data || [])
      setLatestCustomization(data?.[0] || null)
    } finally { setIsLoading(false) }
  }, [installationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customizations, latestCustomization, isLoading, refresh: fetch }
}

export function useThemeCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('themes').select('category').not('category', 'is', null).eq('status', 'published')
      const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function usePopularThemes(options?: { category?: string; limit?: number }) {
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('themes').select('*').eq('status', 'published').eq('is_public', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 20)
      setThemes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { themes, isLoading, refresh: fetch }
}
