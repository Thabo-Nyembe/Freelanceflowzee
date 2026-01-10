'use client'

/**
 * Extended Timeline Hooks
 * Tables: timelines, timeline_events, timeline_milestones, timeline_markers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTimeline(timelineId?: string) {
  const [timeline, setTimeline] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!timelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timelines').select('*, timeline_events(*), timeline_milestones(*)').eq('id', timelineId).single(); setTimeline(data) } finally { setIsLoading(false) }
  }, [timelineId])
  useEffect(() => { fetch() }, [fetch])
  return { timeline, isLoading, refresh: fetch }
}

export function useTimelines(options?: { user_id?: string; project_id?: string; limit?: number }) {
  const [timelines, setTimelines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timelines').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTimelines(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.project_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { timelines, isLoading, refresh: fetch }
}

export function useTimelineEvents(timelineId?: string) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!timelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timeline_events').select('*').eq('timeline_id', timelineId).order('date', { ascending: true }); setEvents(data || []) } finally { setIsLoading(false) }
  }, [timelineId])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useTimelineMilestones(timelineId?: string) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!timelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timeline_milestones').select('*').eq('timeline_id', timelineId).order('date', { ascending: true }); setMilestones(data || []) } finally { setIsLoading(false) }
  }, [timelineId])
  useEffect(() => { fetch() }, [fetch])
  return { milestones, isLoading, refresh: fetch }
}

export function useProjectTimeline(projectId?: string) {
  const [timeline, setTimeline] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timelines').select('*, timeline_events(*), timeline_milestones(*)').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1).single(); setTimeline(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { timeline, isLoading, refresh: fetch }
}
