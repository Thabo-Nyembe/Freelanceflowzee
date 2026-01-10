'use client'

/**
 * Extended Transcript Hooks
 * Tables: transcripts, transcript_segments, transcript_speakers, transcript_exports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTranscript(transcriptId?: string) {
  const [transcript, setTranscript] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transcriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transcripts').select('*, transcript_segments(*), transcript_speakers(*)').eq('id', transcriptId).single(); setTranscript(data) } finally { setIsLoading(false) }
  }, [transcriptId])
  useEffect(() => { fetch() }, [fetch])
  return { transcript, isLoading, refresh: fetch }
}

export function useTranscripts(options?: { user_id?: string; status?: string; source_type?: string; limit?: number }) {
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transcripts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.source_type) query = query.eq('source_type', options.source_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTranscripts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.source_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transcripts, isLoading, refresh: fetch }
}

export function useTranscriptSegments(transcriptId?: string) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transcriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transcript_segments').select('*').eq('transcript_id', transcriptId).order('start_time', { ascending: true }); setSegments(data || []) } finally { setIsLoading(false) }
  }, [transcriptId])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useTranscriptSpeakers(transcriptId?: string) {
  const [speakers, setSpeakers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transcriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transcript_speakers').select('*').eq('transcript_id', transcriptId).order('name', { ascending: true }); setSpeakers(data || []) } finally { setIsLoading(false) }
  }, [transcriptId])
  useEffect(() => { fetch() }, [fetch])
  return { speakers, isLoading, refresh: fetch }
}

export function useUserTranscripts(userId?: string) {
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transcripts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setTranscripts(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { transcripts, isLoading, refresh: fetch }
}
