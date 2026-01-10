'use client'

/**
 * Extended Audience Hooks
 * Tables: audience_segments, audience_members, audience_rules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAudienceSegment(segmentId?: string) {
  const [segment, setSegment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!segmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('audience_segments').select('*, audience_rules(*)').eq('id', segmentId).single(); setSegment(data) } finally { setIsLoading(false) }
  }, [segmentId])
  useEffect(() => { fetch() }, [fetch])
  return { segment, isLoading, refresh: fetch }
}

export function useAudienceSegments(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('audience_segments').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('member_count', { ascending: false }).limit(options?.limit || 50)
      setSegments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useAudienceMembers(segmentId?: string, options?: { limit?: number }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!segmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('audience_members').select('*').eq('segment_id', segmentId).order('joined_at', { ascending: false }).limit(options?.limit || 50); setMembers(data || []) } finally { setIsLoading(false) }
  }, [segmentId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useAudienceStats(userId?: string) {
  const [stats, setStats] = useState<{ totalSegments: number; totalMembers: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('audience_segments').select('type, member_count').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const totalSegments = data.length
      const totalMembers = data.reduce((sum, s) => sum + (s.member_count || 0), 0)
      const byType = data.reduce((acc: Record<string, number>, s) => { acc[s.type || 'unknown'] = (acc[s.type || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ totalSegments, totalMembers, byType })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useLargestAudienceSegments(userId?: string, options?: { limit?: number }) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('audience_segments').select('*').eq('user_id', userId).eq('status', 'active').order('member_count', { ascending: false }).limit(options?.limit || 10); setSegments(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useIsMemberOfSegment(segmentId?: string, memberId?: string) {
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!segmentId || !memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('audience_members').select('id').eq('segment_id', segmentId).eq('member_id', memberId).single(); setIsMember(!!data) } finally { setIsLoading(false) }
  }, [segmentId, memberId, supabase])
  useEffect(() => { check() }, [check])
  return { isMember, isLoading, recheck: check }
}
