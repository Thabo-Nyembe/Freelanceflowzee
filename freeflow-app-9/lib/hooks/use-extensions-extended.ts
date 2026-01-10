'use client'

/**
 * Extended Extensions Hooks
 * Tables: extensions, extension_installs, extension_settings, extension_versions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExtension(extensionId?: string) {
  const [extension, setExtension] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('extensions').select('*, extension_versions(*)').eq('id', extensionId).single(); setExtension(data) } finally { setIsLoading(false) }
  }, [extensionId])
  useEffect(() => { fetch() }, [fetch])
  return { extension, isLoading, refresh: fetch }
}

export function useExtensions(options?: { category?: string; status?: string; developer_id?: string; search?: string; limit?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('extensions').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.developer_id) query = query.eq('developer_id', options.developer_id)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.status, options?.developer_id, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useUserExtensions(userId?: string, options?: { is_active?: boolean }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('extension_installs').select('*, extensions(*)').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('installed_at', { ascending: false })
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useIsExtensionInstalled(extensionId?: string, userId?: string) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [install, setInstall] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!extensionId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('extension_installs').select('*').eq('extension_id', extensionId).eq('user_id', userId).single(); setIsInstalled(!!data); setInstall(data) } finally { setIsLoading(false) }
  }, [extensionId, userId])
  useEffect(() => { check() }, [check])
  return { isInstalled, install, isLoading, recheck: check }
}

export function useExtensionSettings(extensionId?: string, userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!extensionId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('extension_settings').select('*').eq('extension_id', extensionId).eq('user_id', userId).single(); setSettings(data?.settings || null) } finally { setIsLoading(false) }
  }, [extensionId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useExtensionVersions(extensionId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('extension_versions').select('*').eq('extension_id', extensionId).order('published_at', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [extensionId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function usePopularExtensions(limit?: number) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('extensions').select('*').eq('status', 'published').order('install_count', { ascending: false }).limit(limit || 10); setExtensions(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useExtensionCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('category').eq('status', 'published')
      const uniqueCategories = [...new Set(data?.map(e => e.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useDeveloperExtensions(developerId?: string) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!developerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('extensions').select('*').eq('developer_id', developerId).order('created_at', { ascending: false }); setExtensions(data || []) } finally { setIsLoading(false) }
  }, [developerId])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}
