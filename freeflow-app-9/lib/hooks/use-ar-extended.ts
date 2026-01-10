'use client'

/**
 * Extended AR (Augmented Reality) Hooks - Covers all 10 AR-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useARAnalytics(sessionId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_analytics').select('*').eq('session_id', sessionId).single(); setData(result) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARAnnotations(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_annotations').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARInteractions(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_interactions').select('*').eq('session_id', sessionId).order('timestamp', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARObjects(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_objects').select('*').eq('session_id', sessionId); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARParticipants(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_participants').select('*').eq('session_id', sessionId); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARRecordings(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_recordings').select('*').eq('session_id', sessionId).order('started_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARSessionMetrics(sessionId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_session_metrics').select('*').eq('session_id', sessionId).single(); setData(result) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARSessions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_sessions').select('*').eq('host_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARWhiteboardStrokes(whiteboardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!whiteboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_whiteboard_strokes').select('*').eq('whiteboard_id', whiteboardId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [whiteboardId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useARWhiteboards(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('ar_whiteboards').select('*').eq('session_id', sessionId); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
