'use client'

/**
 * Extended Announcement Hooks - Covers all Announcement-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAnnouncements(status?: string, targetAudience?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('announcements').select('*').order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      if (targetAudience) query = query.eq('target_audience', targetAudience)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [status, targetAudience])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useActiveAnnouncements(targetAudience?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      let query = supabase.from('announcements').select('*').eq('status', 'active').lte('start_date', now).or(`end_date.is.null,end_date.gte.${now}`).order('priority', { ascending: false })
      if (targetAudience) query = query.or(`target_audience.eq.${targetAudience},target_audience.eq.all`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [targetAudience])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAnnouncementReads(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('announcement_reads').select('announcement_id').eq('user_id', userId)
      setData(result?.map(r => r.announcement_id) || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
