'use client'

/**
 * Extended Phones Hooks
 * Tables: phone_numbers, phone_verifications, phone_calls, phone_sms, phone_settings, phone_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePhoneNumber(phoneId?: string) {
  const [phone, setPhone] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!phoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('phone_numbers').select('*').eq('id', phoneId).single(); setPhone(data) } finally { setIsLoading(false) }
  }, [phoneId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { phone, isLoading, refresh: fetch }
}

export function usePhoneNumbers(userId?: string) {
  const [phones, setPhones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('phone_numbers').select('*').eq('user_id', userId).order('is_primary', { ascending: false }).order('created_at', { ascending: true }); setPhones(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { phones, isLoading, refresh: fetch }
}

export function usePrimaryPhone(userId?: string) {
  const [phone, setPhone] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('phone_numbers').select('*').eq('user_id', userId).eq('is_primary', true).single(); setPhone(data) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { phone, isLoading, refresh: fetch }
}

export function useVerifiedPhones(userId?: string) {
  const [phones, setPhones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('phone_numbers').select('*').eq('user_id', userId).eq('is_verified', true).order('is_primary', { ascending: false }); setPhones(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { phones, isLoading, refresh: fetch }
}

export function usePhoneCalls(phoneId?: string, options?: { direction?: string; status?: string; from_date?: string; limit?: number }) {
  const [calls, setCalls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!phoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('phone_calls').select('*').eq('phone_id', phoneId)
      if (options?.direction) query = query.eq('direction', options.direction)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCalls(data || [])
    } finally { setIsLoading(false) }
  }, [phoneId, options?.direction, options?.status, options?.from_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { calls, isLoading, refresh: fetch }
}

export function usePhoneSms(phoneId?: string, options?: { direction?: string; status?: string; limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!phoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('phone_sms').select('*').eq('phone_id', phoneId)
      if (options?.direction) query = query.eq('direction', options.direction)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [phoneId, options?.direction, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function usePhoneSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('phone_settings').select('*').eq('user_id', userId).single(); setSettings(data || { sms_notifications: true, call_forwarding: false, voicemail_enabled: true }) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function usePhoneLogs(phoneId?: string, options?: { action?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!phoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('phone_logs').select('*').eq('phone_id', phoneId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [phoneId, options?.action, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useRecentCalls(userId?: string, options?: { limit?: number }) {
  const [calls, setCalls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: phones } = await supabase.from('phone_numbers').select('id').eq('user_id', userId)
      const phoneIds = phones?.map(p => p.id) || []
      if (phoneIds.length === 0) { setCalls([]); setIsLoading(false); return }
      const { data } = await supabase.from('phone_calls').select('*, phone_numbers(*)').in('phone_id', phoneIds).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setCalls(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { calls, isLoading, refresh: fetch }
}

export function useCallStats(phoneId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ totalCalls: number; inbound: number; outbound: number; missed: number; totalDuration: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!phoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('phone_calls').select('direction, status, duration').eq('phone_id', phoneId)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const totalCalls = data?.length || 0
      const inbound = data?.filter(c => c.direction === 'inbound').length || 0
      const outbound = data?.filter(c => c.direction === 'outbound').length || 0
      const missed = data?.filter(c => c.status === 'missed').length || 0
      const totalDuration = data?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0
      setStats({ totalCalls, inbound, outbound, missed, totalDuration })
    } finally { setIsLoading(false) }
  }, [phoneId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
