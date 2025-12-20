'use client'

/**
 * Extended Extension Hooks - Covers all Extension-related tables
 * Tables: extensions, extension_installations, extension_settings, extension_permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExtension(extensionId?: string) {
  const [extension, setExtension] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('*, extension_permissions(*)').eq('id', extensionId).single()
      setExtension(data)
    } finally { setIsLoading(false) }
  }, [extensionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extension, isLoading, refresh: fetch }
}

export function useExtensions(options?: { category?: string; pricing_type?: string; search?: string; limit?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('extensions').select('*').eq('status', 'published')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.pricing_type) query = query.eq('pricing_type', options.pricing_type)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.pricing_type, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function usePopularExtensions(options?: { limit?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('*').eq('status', 'published').order('install_count', { ascending: false }).limit(options?.limit || 10)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useTopRatedExtensions(options?: { limit?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('*').eq('status', 'published').gt('rating_count', 0).order('rating', { ascending: false }).limit(options?.limit || 10)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useDeveloperExtensions(developerId?: string) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!developerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('*').eq('developer_id', developerId).order('created_at', { ascending: false })
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [developerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}

export function useUserInstalledExtensions(userId?: string, options?: { is_enabled?: boolean }) {
  const [installations, setInstallations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('extension_installations').select('*, extensions(*)').eq('user_id', userId)
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('installed_at', { ascending: false })
      setInstallations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_enabled, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { installations, isLoading, refresh: fetch }
}

export function useIsExtensionInstalled(extensionId?: string, userId?: string) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [installation, setInstallation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!extensionId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extension_installations').select('*').eq('extension_id', extensionId).eq('user_id', userId).single()
      setIsInstalled(!!data)
      setInstallation(data)
    } finally { setIsLoading(false) }
  }, [extensionId, userId, supabase])
  useEffect(() => { check() }, [check])
  return { isInstalled, installation, isLoading, recheck: check }
}

export function useExtensionSettings(extensionId?: string, userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!extensionId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extension_settings').select('*').eq('extension_id', extensionId).eq('user_id', userId).single()
      setSettings(data?.settings || {})
    } finally { setIsLoading(false) }
  }, [extensionId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useExtensionPermissions(extensionId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extension_permissions').select('*').eq('extension_id', extensionId).order('name', { ascending: true })
      setPermissions(data || [])
    } finally { setIsLoading(false) }
  }, [extensionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function useExtensionReviews(extensionId?: string, options?: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extension_reviews').select('*').eq('extension_id', extensionId).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setReviews(data || [])
    } finally { setIsLoading(false) }
  }, [extensionId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useExtensionCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('extensions').select('category').eq('status', 'published')
      const uniqueCategories = [...new Set((data || []).map(e => e.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useExtensionSearch(searchTerm: string, options?: { category?: string; pricing_type?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('extensions').select('*').eq('status', 'published').or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.pricing_type) query = query.eq('pricing_type', options.pricing_type)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.category, options?.pricing_type, options?.limit, supabase])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}

export function useNewExtensions(options?: { limit?: number; days?: number }) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - (options?.days || 30))
      const { data } = await supabase.from('extensions').select('*').eq('status', 'published').gte('published_at', daysAgo.toISOString()).order('published_at', { ascending: false }).limit(options?.limit || 10)
      setExtensions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, options?.days, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { extensions, isLoading, refresh: fetch }
}
