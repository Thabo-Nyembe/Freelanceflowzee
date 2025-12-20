'use client'

/**
 * Extended Timezone Hooks - Covers all Timezone-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTimezone(timezoneId?: string) {
  const [timezone, setTimezone] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!timezoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('timezones').select('*').eq('id', timezoneId).single()
      setTimezone(data)
    } finally { setIsLoading(false) }
  }, [timezoneId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { timezone, isLoading, refresh: fetch }
}

export function useTimezones(options?: { region?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('timezones').select('*').eq('is_active', true)
      if (options?.region) query = query.eq('region', options.region)
      const { data: result } = await query.order('utc_offset', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.region, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTimezoneRegions() {
  const [regions, setRegions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('timezones').select('region').eq('is_active', true)
      const uniqueRegions = [...new Set(data?.map(t => t.region) || [])].sort()
      setRegions(uniqueRegions)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { regions, isLoading, refresh: fetch }
}

export function useUserTimezone(userId?: string) {
  const [timezone, setTimezone] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('user_timezones').select('timezone_id, timezones(*)').eq('user_id', userId).single()
      setTimezone(data?.timezones || null)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { timezone, isLoading, refresh: fetch }
}

export function useTimezoneSearch(query?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('timezones').select('*').eq('is_active', true).or(`name.ilike.%${query}%,display_name.ilike.%${query}%`).order('name', { ascending: true }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [query, supabase])
  useEffect(() => { search() }, [search])
  return { data, isLoading, search }
}
