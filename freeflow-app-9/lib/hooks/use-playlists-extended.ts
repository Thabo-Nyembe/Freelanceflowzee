'use client'

/**
 * Extended Playlists Hooks
 * Tables: playlists, playlist_items, playlist_shares, playlist_collaborators, playlist_followers, playlist_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlaylist(playlistId?: string) {
  const [playlist, setPlaylist] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlists').select('*, playlist_items(*, media(*)), playlist_collaborators(*, users(*))').eq('id', playlistId).single(); setPlaylist(data) } finally { setIsLoading(false) }
  }, [playlistId])
  useEffect(() => { fetch() }, [fetch])
  return { playlist, isLoading, refresh: fetch }
}

export function usePlaylists(options?: { owner_id?: string; visibility?: string; type?: string; search?: string; limit?: number }) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('playlists').select('*, playlist_items(count)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setPlaylists(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.visibility, options?.type, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { playlists, isLoading, refresh: fetch }
}

export function useUserPlaylists(userId?: string) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlists').select('*, playlist_items(count)').eq('owner_id', userId).order('updated_at', { ascending: false }); setPlaylists(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { playlists, isLoading, refresh: fetch }
}

export function usePlaylistItems(playlistId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlist_items').select('*, media(*)').eq('playlist_id', playlistId).order('position', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [playlistId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePlaylistShares(playlistId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlist_shares').select('*, users(*)').eq('playlist_id', playlistId).order('created_at', { ascending: false }); setShares(data || []) } finally { setIsLoading(false) }
  }, [playlistId])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function usePlaylistCollaborators(playlistId?: string) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlist_collaborators').select('*, users(*)').eq('playlist_id', playlistId).order('added_at', { ascending: false }); setCollaborators(data || []) } finally { setIsLoading(false) }
  }, [playlistId])
  useEffect(() => { fetch() }, [fetch])
  return { collaborators, isLoading, refresh: fetch }
}

export function usePlaylistFollowers(playlistId?: string, options?: { limit?: number }) {
  const [followers, setFollowers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlist_followers').select('*, users(*)').eq('playlist_id', playlistId).order('followed_at', { ascending: false }).limit(options?.limit || 50); setFollowers(data || []) } finally { setIsLoading(false) }
  }, [playlistId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { followers, isLoading, refresh: fetch }
}

export function useIsFollowing(playlistId?: string, userId?: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('playlist_followers').select('id').eq('playlist_id', playlistId).eq('user_id', userId).single(); setIsFollowing(!!data) } finally { setIsLoading(false) }
  }, [playlistId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { isFollowing, isLoading, refresh: fetch }
}

export function useFollowedPlaylists(userId?: string, options?: { limit?: number }) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: follows } = await supabase.from('playlist_followers').select('playlist_id').eq('user_id', userId)
      const playlistIds = follows?.map(f => f.playlist_id) || []
      if (playlistIds.length === 0) { setPlaylists([]); setIsLoading(false); return }
      const { data } = await supabase.from('playlists').select('*, playlist_items(count)').in('id', playlistIds).limit(options?.limit || 50)
      setPlaylists(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { playlists, isLoading, refresh: fetch }
}

export function usePublicPlaylists(options?: { type?: string; search?: string; limit?: number }) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('playlists').select('*, playlist_items(count)').eq('visibility', 'public')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('follower_count', { ascending: false }).limit(options?.limit || 50)
      setPlaylists(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { playlists, isLoading, refresh: fetch }
}

export function usePlaylistAnalytics(playlistId?: string, options?: { from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<{ plays: number; uniqueListeners: number; shares: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!playlistId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('playlist_analytics').select('action, user_id').eq('playlist_id', playlistId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query
      const plays = data?.filter(a => a.action === 'play').length || 0
      const uniqueListeners = new Set(data?.filter(a => a.action === 'play' && a.user_id).map(a => a.user_id)).size
      const shares = data?.filter(a => a.action === 'share').length || 0
      setAnalytics({ plays, uniqueListeners, shares })
    } finally { setIsLoading(false) }
  }, [playlistId, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}
