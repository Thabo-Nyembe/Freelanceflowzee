'use client'

/**
 * Extended Region Hooks - Covers all Region-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRegion(regionId?: string) {
  const [region, setRegion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('regions').select('*').eq('id', regionId).single()
      setRegion(data)
    } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { region, isLoading, refresh: fetch }
}

export function useRegions(options?: { regionType?: string; countryCode?: string; parentId?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('regions').select('*')
      if (options?.regionType) query = query.eq('region_type', options.regionType)
      if (options?.countryCode) query = query.eq('country_code', options.countryCode)
      if (options?.parentId) query = query.eq('parent_id', options.parentId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.regionType, options?.countryCode, options?.parentId, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSubRegions(parentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('regions').select('*').eq('parent_id', parentId).eq('is_active', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRegionSettings(regionId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('region_settings').select('key, value').eq('region_id', regionId)
      const settingsMap = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}
