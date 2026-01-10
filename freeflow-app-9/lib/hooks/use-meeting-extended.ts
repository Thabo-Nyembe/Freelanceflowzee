'use client'

/**
 * Extended Meeting Hooks
 * Tables: meetings, meeting_participants, meeting_recordings, meeting_notes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMeeting(meetingId?: string) {
  const [meeting, setMeeting] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('meetings').select('*, meeting_participants(*)').eq('id', meetingId).single(); setMeeting(data) } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { fetch() }, [fetch])
  return { meeting, isLoading, refresh: fetch }
}

export function useMeetings(options?: { user_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('meetings').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.date_from) query = query.gte('start_time', options.date_from)
      if (options?.date_to) query = query.lte('start_time', options.date_to)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setMeetings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.date_from, options?.date_to, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { meetings, isLoading, refresh: fetch }
}

export function useMeetingParticipants(meetingId?: string) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('meeting_participants').select('*').eq('meeting_id', meetingId); setParticipants(data || []) } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { fetch() }, [fetch])
  return { participants, isLoading, refresh: fetch }
}

export function useMeetingNotes(meetingId?: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('meeting_notes').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: true }); setNotes(data || []) } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useUpcomingMeetings(userId?: string, options?: { limit?: number }) {
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('meetings').select('*').eq('user_id', userId).eq('status', 'scheduled').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(options?.limit || 10); setMeetings(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { meetings, isLoading, refresh: fetch }
}

export function useTodaysMeetings(userId?: string) {
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const today = new Date(); const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString(); const endOfDay = new Date(today.setHours(23,59,59,999)).toISOString(); const { data } = await supabase.from('meetings').select('*').eq('user_id', userId).gte('start_time', startOfDay).lte('start_time', endOfDay).order('start_time', { ascending: true }); setMeetings(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { meetings, isLoading, refresh: fetch }
}
