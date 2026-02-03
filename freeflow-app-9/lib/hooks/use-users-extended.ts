'use client'

/**
 * Extended Users Hooks
 * Tables: users, user_profiles, user_preferences, user_sessions, user_devices, user_verifications
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUser(userId?: string) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('users').select('*, user_profiles(*), user_preferences(*)').eq('id', userId).single(); setUser(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { user, isLoading, refresh: loadData }
}

export function useUsers(options?: { role?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('users').select('*, user_profiles(*)')
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.role, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { users, isLoading, refresh: loadData }
}

export function useUserByEmail(email?: string) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('users').select('*, user_profiles(*)').eq('email', email).single(); setUser(data) } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { loadData() }, [loadData])
  return { user, isLoading, refresh: loadData }
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { profile, isLoading, refresh: loadData }
}

export function useUserPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single(); setPreferences(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { preferences, isLoading, refresh: loadData }
}

export function useUserSessions(userId?: string, options?: { is_active?: boolean; limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [activeSessions, setActiveSessions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('user_sessions').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 20)
      setSessions(data || [])
      setActiveSessions(data?.filter(s => s.is_active).length || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, activeSessions, isLoading, refresh: loadData }
}

export function useUserDevices(userId?: string, options?: { is_active?: boolean }) {
  const [devices, setDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('user_devices').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('last_active_at', { ascending: false })
      setDevices(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { devices, isLoading, refresh: loadData }
}

export function useUserSearch(query?: string, options?: { exclude_ids?: string[]; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('users').select('id, email, full_name, avatar_url').eq('is_active', true).or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      if (options?.exclude_ids && options.exclude_ids.length > 0) {
        dbQuery = dbQuery.not('id', 'in', `(${options.exclude_ids.join(',')})`)
      }
      const { data } = await dbQuery.limit(options?.limit || 10)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.exclude_ids, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useOnlineUsers(options?: { limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const fiveMinutesAgo = new Date()
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)
      const { data: activeSessions } = await supabase.from('user_sessions').select('user_id').eq('is_active', true).gte('started_at', fiveMinutesAgo.toISOString())
      if (!activeSessions || activeSessions.length === 0) { setUsers([]); return }
      const userIds = [...new Set(activeSessions.map(s => s.user_id))]
      const { data } = await supabase.from('users').select('id, email, full_name, avatar_url').in('id', userIds).limit(options?.limit || 50)
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { users, count: users.length, isLoading, refresh: loadData }
}

export function useRecentUsers(options?: { days?: number; limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const days = options?.days || 7
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days)
      const { data } = await supabase.from('users').select('*, user_profiles(*)').gte('created_at', sinceDate.toISOString()).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.days, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { users, isLoading, refresh: loadData }
}

export function useUserStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data, count } = await supabase.from('users').select('is_active, role', { count: 'exact' })
      const users = data || []
      const byRole: Record<string, number> = {}
      users.forEach(u => {
        if (u.role) byRole[u.role] = (byRole[u.role] || 0) + 1
      })
      setStats({
        total: count || 0,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        by_role: byRole
      })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useUserVerifications(userId?: string, options?: { verification_type?: string; is_used?: boolean; limit?: number }) {
  const [verifications, setVerifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('user_verifications').select('*').eq('user_id', userId)
      if (options?.verification_type) query = query.eq('verification_type', options.verification_type)
      if (options?.is_used !== undefined) query = query.eq('is_used', options.is_used)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setVerifications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.verification_type, options?.is_used, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { verifications, isLoading, refresh: loadData }
}
