'use client'

/**
 * Extended Meetings Hooks - Covers all Meeting-related tables
 * Tables: meetings, meeting_analytics, meeting_chat_messages, meeting_participants, meeting_polls, meeting_recordings, meeting_stats
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMeeting(meetingId?: string) {
  const [meeting, setMeeting] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('meetings').select('*').eq('id', meetingId).single()
      setMeeting(data)
    } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { loadData() }, [loadData])
  return { meeting, isLoading, refresh: loadData }
}

export function useMeetingByCode(meetingCode?: string) {
  const [meeting, setMeeting] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('meetings').select('*').eq('meeting_code', meetingCode).single()
      setMeeting(data)
    } finally { setIsLoading(false) }
  }, [meetingCode])
  useEffect(() => { loadData() }, [loadData])
  return { meeting, isLoading, refresh: loadData }
}

export function useMeetings(options?: { hostId?: string; status?: string; type?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('meetings').select('*')
      if (options?.hostId) query = query.eq('host_id', options.hostId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data: result } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.hostId, options?.status, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingParticipants(meetingId?: string, options?: { status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('meeting_participants').select('*, users(id, name, email, avatar_url)').eq('meeting_id', meetingId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('joined_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingChatMessages(meetingId?: string, options?: { limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('meeting_chat_messages').select('*, users(id, name, avatar_url)').eq('meeting_id', meetingId).order('created_at', { ascending: true }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingPolls(meetingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('meeting_polls').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingRecordings(meetingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('meeting_recordings').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingAnalytics(meetingId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('meeting_analytics').select('*').eq('meeting_id', meetingId).single()
      setAnalytics(data)
    } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useMeetingStats(hostId?: string, options?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!hostId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('meeting_stats').select('*').eq('host_id', hostId)
      if (options?.startDate) query = query.gte('period_start', options.startDate)
      if (options?.endDate) query = query.lte('period_end', options.endDate)
      const { data: result } = await query.order('period_start', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [hostId, options?.startDate, options?.endDate])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMeetingRealtime(meetingId?: string) {
  const [meeting, setMeeting] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!meetingId) return
    supabase.from('meetings').select('*').eq('id', meetingId).single().then(({ data }) => setMeeting(data))
    supabase.from('meeting_participants').select('*, users(id, name, avatar_url)').eq('meeting_id', meetingId).then(({ data }) => setParticipants(data || []))
    supabase.from('meeting_chat_messages').select('*, users(id, name, avatar_url)').eq('meeting_id', meetingId).order('created_at', { ascending: true }).then(({ data }) => setMessages(data || []))
    const channel = supabase.channel(`meeting_${meetingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meetings', filter: `id=eq.${meetingId}` }, (payload) => setMeeting(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_participants', filter: `meeting_id=eq.${meetingId}` }, () => {
        supabase.from('meeting_participants').select('*, users(id, name, avatar_url)').eq('meeting_id', meetingId).then(({ data }) => setParticipants(data || []))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_chat_messages', filter: `meeting_id=eq.${meetingId}` }, (payload) => setMessages(prev => [...prev, payload.new]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [meetingId])
  return { meeting, participants, messages }
}

export function useUpcomingMeetings(hostId?: string, limit?: number) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!hostId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('meetings').select('*').eq('host_id', hostId).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(limit || 10)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [hostId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
