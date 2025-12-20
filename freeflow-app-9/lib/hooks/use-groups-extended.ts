'use client'

/**
 * Extended Groups Hooks
 * Tables: groups, group_members, group_invites, group_posts, group_events, group_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGroup(groupId?: string) {
  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('groups').select('*, group_members(*), group_settings(*)').eq('id', groupId).single(); setGroup(data) } finally { setIsLoading(false) }
  }, [groupId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { group, isLoading, refresh: fetch }
}

export function useGroups(options?: { type?: string; privacy?: string; category?: string; search?: string; limit?: number }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('groups').select('*').eq('is_active', true)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.privacy) query = query.eq('privacy', options.privacy)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('member_count', { ascending: false }).limit(options?.limit || 50)
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.privacy, options?.category, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useUserGroups(userId?: string) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('group_members').select('*, groups(*)').eq('user_id', userId).order('joined_at', { ascending: false }); setGroups(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useGroupMembers(groupId?: string, options?: { role?: string; limit?: number }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('group_members').select('*').eq('group_id', groupId)
      if (options?.role) query = query.eq('role', options.role)
      const { data } = await query.order('joined_at', { ascending: false }).limit(options?.limit || 100)
      setMembers(data || [])
    } finally { setIsLoading(false) }
  }, [groupId, options?.role, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useIsMember(groupId?: string, userId?: string) {
  const [isMember, setIsMember] = useState(false)
  const [memberData, setMemberData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!groupId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('group_members').select('*').eq('group_id', groupId).eq('user_id', userId).single(); setIsMember(!!data); setMemberData(data) } finally { setIsLoading(false) }
  }, [groupId, userId, supabase])
  useEffect(() => { check() }, [check])
  return { isMember, memberData, isLoading, recheck: check }
}

export function useGroupInvites(groupId?: string) {
  const [invites, setInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('group_invites').select('*').eq('group_id', groupId).eq('status', 'pending').order('created_at', { ascending: false }); setInvites(data || []) } finally { setIsLoading(false) }
  }, [groupId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invites, isLoading, refresh: fetch }
}

export function useUserGroupInvites(userId?: string) {
  const [invites, setInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('group_invites').select('*, groups(*)').eq('invited_user', userId).eq('status', 'pending').order('created_at', { ascending: false }); setInvites(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invites, isLoading, refresh: fetch }
}

export function useGroupPosts(groupId?: string, options?: { type?: string; limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('group_posts').select('*').eq('group_id', groupId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [groupId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function useGroupEvents(groupId?: string, options?: { upcoming?: boolean; limit?: number }) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('group_events').select('*').eq('group_id', groupId)
      if (options?.upcoming) query = query.gte('start_time', new Date().toISOString())
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 20)
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [groupId, options?.upcoming, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function usePopularGroups(limit?: number) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('groups').select('*').eq('is_active', true).eq('privacy', 'public').order('member_count', { ascending: false }).limit(limit || 10); setGroups(data || []) } finally { setIsLoading(false) }
  }, [limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useGroupsByCategory() {
  const [byCategory, setByCategory] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('groups').select('*').eq('is_active', true).eq('privacy', 'public')
      const grouped: Record<string, any[]> = {}
      data?.forEach(g => { const cat = g.category || 'Uncategorized'; if (!grouped[cat]) grouped[cat] = []; grouped[cat].push(g) })
      setByCategory(grouped)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { byCategory, isLoading, refresh: fetch }
}
