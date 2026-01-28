'use client'

/**
 * Extended User Hooks - Covers all 11 User-related tables
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

export function useUserActivityLogs(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserAnalytics(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_analytics').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserCohorts() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_cohorts').select('*').order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserDataExports(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_data_exports').select('*').eq('user_id', userId).order('requested_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserKnownDevices(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_known_devices').select('*').eq('user_id', userId).order('last_used_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserMetrics(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_metrics').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserMetricsAggregate() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_metrics_aggregate').select('*').order('date', { ascending: false }).limit(30); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserPermissions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_permissions').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserPreferences(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserSecurityPreferences(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_security_preferences').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserTypeProfiles(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_type_profiles').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
