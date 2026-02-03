'use client'

/**
 * Extended Login Hooks
 * Tables: login_attempts, login_sessions, login_history, login_devices, login_security, login_mfa
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLoginAttempts(email?: string, options?: { limit?: number }) {
  const [attempts, setAttempts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_attempts').select('*').eq('email', email).order('attempted_at', { ascending: false }).limit(options?.limit || 50); setAttempts(data || []) } finally { setIsLoading(false) }
  }, [email, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { attempts, isLoading, refresh: loadData }
}

export function useActiveSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_sessions').select('*, login_devices(*)').eq('user_id', userId).eq('is_active', true).gte('expires_at', new Date().toISOString()).order('created_at', { ascending: false }); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useLoginHistory(userId?: string, options?: { action?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('login_history').select('*').eq('user_id', userId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.action, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useUserDevices(userId?: string) {
  const [devices, setDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_devices').select('*').eq('user_id', userId).order('last_used_at', { ascending: false }); setDevices(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { devices, isLoading, refresh: loadData }
}

export function useTrustedDevices(userId?: string) {
  const [devices, setDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_devices').select('*').eq('user_id', userId).eq('is_trusted', true).order('last_used_at', { ascending: false }); setDevices(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { devices, isLoading, refresh: loadData }
}

export function useLoginSecuritySettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_security').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useSessionValidation(sessionToken?: string) {
  const [isValid, setIsValid] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const validate = useCallback(async () => {
    if (!sessionToken) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('login_sessions').select('*').eq('session_token', sessionToken).eq('is_active', true).gte('expires_at', new Date().toISOString()).single()
      setIsValid(!!data)
      setSession(data)
    } finally { setIsLoading(false) }
  }, [sessionToken])
  useEffect(() => { validate() }, [validate])
  return { isValid, session, isLoading, revalidate: validate }
}

export function useFailedLoginAttempts(email?: string, options?: { minutes?: number }) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const minutes = options?.minutes || 15
      const since = new Date(Date.now() - minutes * 60 * 1000).toISOString()
      const { data } = await supabase.from('login_attempts').select('id').eq('email', email).eq('success', false).gte('attempted_at', since)
      setCount(data?.length || 0)
    } finally { setIsLoading(false) }
  }, [email, options?.minutes])
  useEffect(() => { loadData() }, [loadData])
  return { count, isLoading, refresh: loadData }
}

export function useRecentLoginActivity(userId?: string, options?: { limit?: number }) {
  const [activity, setActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: history } = await supabase.from('login_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 10)
      setActivity(history || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { activity, isLoading, refresh: loadData }
}

export function useMfaSettings(userId?: string) {
  const [mfa, setMfa] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('login_mfa').select('*').eq('user_id', userId).single(); setMfa(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { mfa, isLoading, refresh: loadData }
}
