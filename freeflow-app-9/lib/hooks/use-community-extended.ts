'use client'

/**
 * Extended Community Hooks - Covers all 12 Community-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useCommunityAnalytics(communityId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!communityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_analytics').select('*').eq('community_id', communityId).single(); setData(result) } finally { setIsLoading(false) }
  }, [communityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityComments(postId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityConnections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_connections').select('*').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`).eq('status', 'accepted'); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityEventAttendees(eventId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_event_attendees').select('*').eq('event_id', eventId); setData(result || []) } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityEvents(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('community_events').select('*').order('start_date', { ascending: true })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityGroupMembers(groupId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_group_members').select('*').eq('group_id', groupId); setData(result || []) } finally { setIsLoading(false) }
  }, [groupId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityGroups(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('community_groups').select('*').order('name', { ascending: true })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityLikes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_likes').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityMembers(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!communityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_members').select('*').eq('community_id', communityId); setData(result || []) } finally { setIsLoading(false) }
  }, [communityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityPostLikes(postId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_post_likes').select('*').eq('post_id', postId); setData(result || []) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityPosts(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityShares(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_shares').select('*').eq('user_id', userId).order('shared_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
