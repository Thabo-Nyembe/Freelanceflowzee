'use client'

/**
 * Extended Review Hooks - Covers all 6 Review-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReviewApprovals(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('review_approvals').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReviewCollaborators(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('review_collaborators').select('*').eq('session_id', sessionId); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReviewNotifications(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('review_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReviewSessions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('review_sessions').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReviewStages(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('review_stages').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReviewTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('review_templates').select('*').order('name', { ascending: true })
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
