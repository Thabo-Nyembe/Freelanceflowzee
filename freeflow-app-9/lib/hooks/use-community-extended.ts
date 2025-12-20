'use client'

/**
 * Extended Community Hooks - Covers all 12 Community-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCommunityAnalytics(communityId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!communityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_analytics').select('*').eq('community_id', communityId).single(); setData(result) } finally { setIsLoading(false) }
  }, [communityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityComments(postId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [postId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityConnections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_connections').select('*').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`).eq('status', 'accepted'); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityEventAttendees(eventId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_event_attendees').select('*').eq('event_id', eventId); setData(result || []) } finally { setIsLoading(false) }
  }, [eventId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityEvents(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('community_events').select('*').order('start_date', { ascending: true })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityGroupMembers(groupId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_group_members').select('*').eq('group_id', groupId); setData(result || []) } finally { setIsLoading(false) }
  }, [groupId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityGroups(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('community_groups').select('*').order('name', { ascending: true })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityLikes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_likes').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityMembers(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!communityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_members').select('*').eq('community_id', communityId); setData(result || []) } finally { setIsLoading(false) }
  }, [communityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityPostLikes(postId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_post_likes').select('*').eq('post_id', postId); setData(result || []) } finally { setIsLoading(false) }
  }, [postId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityPosts(communityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false })
      if (communityId) query = query.eq('community_id', communityId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [communityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommunityShares(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('community_shares').select('*').eq('user_id', userId).order('shared_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
