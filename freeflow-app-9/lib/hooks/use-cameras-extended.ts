'use client'

/**
 * Extended Cameras Hooks
 * Tables: cameras, camera_feeds, camera_recordings, camera_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCamera(cameraId?: string) {
  const [camera, setCamera] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!cameraId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cameras').select('*').eq('id', cameraId).single(); setCamera(data) } finally { setIsLoading(false) }
  }, [cameraId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { camera, isLoading, refresh: fetch }
}

export function useCameras(options?: { user_id?: string; status?: string; is_active?: boolean; limit?: number }) {
  const [cameras, setCameras] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('cameras').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setCameras(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cameras, isLoading, refresh: fetch }
}

export function useCameraRecordings(cameraId?: string, options?: { date_from?: string; date_to?: string; limit?: number }) {
  const [recordings, setRecordings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!cameraId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('camera_recordings').select('*').eq('camera_id', cameraId)
      if (options?.date_from) query = query.gte('started_at', options.date_from)
      if (options?.date_to) query = query.lte('started_at', options.date_to)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setRecordings(data || [])
    } finally { setIsLoading(false) }
  }, [cameraId, options?.date_from, options?.date_to, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { recordings, isLoading, refresh: fetch }
}

export function useCameraAlerts(cameraId?: string, options?: { is_acknowledged?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!cameraId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('camera_alerts').select('*').eq('camera_id', cameraId)
      if (options?.is_acknowledged !== undefined) query = query.eq('is_acknowledged', options.is_acknowledged)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [cameraId, options?.is_acknowledged, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useOnlineCameras(userId?: string) {
  const [cameras, setCameras] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cameras').select('*').eq('user_id', userId).eq('status', 'online').eq('is_active', true).order('name', { ascending: true }); setCameras(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cameras, isLoading, refresh: fetch }
}

export function useCameraStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; online: number; recording: number; alerts: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: cameras } = await supabase.from('cameras').select('status, is_recording').eq('user_id', userId).eq('is_active', true)
      const { count: alertCount } = await supabase.from('camera_alerts').select('*', { count: 'exact', head: true }).eq('is_acknowledged', false)
      if (!cameras) { setStats(null); return }
      setStats({
        total: cameras.length,
        online: cameras.filter(c => c.status === 'online').length,
        recording: cameras.filter(c => c.is_recording).length,
        alerts: alertCount || 0
      })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCameraRealtime(cameraId?: string) {
  const [camera, setCamera] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!cameraId) return
    supabase.from('cameras').select('*').eq('id', cameraId).single().then(({ data }) => setCamera(data))
    const channel = supabase.channel(`camera_${cameraId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras', filter: `id=eq.${cameraId}` }, (payload) => {
        setCamera(payload.new)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [cameraId, supabase])
  return { camera }
}
