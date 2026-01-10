'use client'

/**
 * Extended Lights Hooks
 * Tables: lights, light_scenes, light_schedules, light_groups
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLight(lightId?: string) {
  const [light, setLight] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!lightId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('lights').select('*').eq('id', lightId).single(); setLight(data) } finally { setIsLoading(false) }
  }, [lightId])
  useEffect(() => { fetch() }, [fetch])
  return { light, isLoading, refresh: fetch }
}

export function useLights(options?: { user_id?: string; location?: string; is_on?: boolean; limit?: number }) {
  const [lights, setLights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('lights').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.location) query = query.eq('location', options.location)
      if (options?.is_on !== undefined) query = query.eq('is_on', options.is_on)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setLights(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.location, options?.is_on, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { lights, isLoading, refresh: fetch }
}

export function useLightScenes(userId?: string) {
  const [scenes, setScenes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('light_scenes').select('*').eq('user_id', userId).order('name', { ascending: true }); setScenes(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { scenes, isLoading, refresh: fetch }
}

export function useLightSchedules(userId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('light_schedules').select('*').eq('user_id', userId).order('time', { ascending: true }); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useLightGroups(userId?: string) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('light_groups').select('*, lights(*)').eq('user_id', userId).order('name', { ascending: true }); setGroups(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useActiveLights(userId?: string) {
  const [lights, setLights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('lights').select('*').eq('user_id', userId).eq('is_on', true).order('name', { ascending: true }); setLights(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { lights, isLoading, refresh: fetch }
}
