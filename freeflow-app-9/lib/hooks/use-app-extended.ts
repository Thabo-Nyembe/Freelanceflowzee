'use client'

/**
 * Extended App Hooks
 * Tables: app_settings, app_configs, app_versions, app_features
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAppSettings(appId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('app_settings').select('*')
      if (appId) query = query.eq('app_id', appId)
      const { data } = await query.single()
      setSettings(data?.settings || {})
    } finally { setIsLoading(false) }
  }, [appId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useAppConfig(configKey?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!configKey) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('app_configs').select('*').eq('key', configKey).single(); setConfig(data) } finally { setIsLoading(false) }
  }, [configKey])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}

export function useAppConfigs(options?: { is_public?: boolean }) {
  const [configs, setConfigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('app_configs').select('*')
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('key', { ascending: true })
      setConfigs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_public])
  useEffect(() => { fetch() }, [fetch])
  return { configs, isLoading, refresh: fetch }
}

export function useAppVersion(versionId?: string) {
  const [version, setVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!versionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('app_versions').select('*').eq('id', versionId).single(); setVersion(data) } finally { setIsLoading(false) }
  }, [versionId])
  useEffect(() => { fetch() }, [fetch])
  return { version, isLoading, refresh: fetch }
}

export function useLatestAppVersion(platform?: string) {
  const [version, setVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('app_versions').select('*').eq('status', 'published')
      if (platform) query = query.eq('platform', platform)
      const { data } = await query.order('published_at', { ascending: false }).limit(1).single()
      setVersion(data)
    } finally { setIsLoading(false) }
  }, [platform])
  useEffect(() => { fetch() }, [fetch])
  return { version, isLoading, refresh: fetch }
}

export function useAppVersions(options?: { platform?: string; status?: string; limit?: number }) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('app_versions').select('*')
      if (options?.platform) query = query.eq('platform', options.platform)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setVersions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.platform, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useAppFeatures(options?: { is_enabled?: boolean }) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('app_features').select('*')
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('name', { ascending: true })
      setFeatures(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_enabled])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useAppFeature(featureKey?: string) {
  const [feature, setFeature] = useState<any>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!featureKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('app_features').select('*').eq('key', featureKey).single()
      setFeature(data)
      setIsEnabled(data?.is_enabled ?? false)
    } finally { setIsLoading(false) }
  }, [featureKey])
  useEffect(() => { fetch() }, [fetch])
  return { feature, isEnabled, isLoading, refresh: fetch }
}
