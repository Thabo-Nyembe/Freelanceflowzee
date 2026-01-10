'use client'

/**
 * Extended Renewals Hooks
 * Tables: renewals, renewal_reminders, renewal_history, renewal_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRenewal(renewalId?: string) {
  const [renewal, setRenewal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!renewalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('renewals').select('*').eq('id', renewalId).single(); setRenewal(data) } finally { setIsLoading(false) }
  }, [renewalId])
  useEffect(() => { fetch() }, [fetch])
  return { renewal, isLoading, refresh: fetch }
}

export function useRenewals(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  const [renewals, setRenewals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('renewals').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('renewal_date', { ascending: true }).limit(options?.limit || 50)
      setRenewals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { renewals, isLoading, refresh: fetch }
}

export function useUpcomingRenewals(userId?: string, daysAhead?: number) {
  const [renewals, setRenewals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + (daysAhead || 30)); const { data } = await supabase.from('renewals').select('*').eq('user_id', userId).eq('status', 'pending').lte('renewal_date', futureDate.toISOString()).gte('renewal_date', new Date().toISOString()).order('renewal_date', { ascending: true }); setRenewals(data || []) } finally { setIsLoading(false) }
  }, [userId, daysAhead, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { renewals, isLoading, refresh: fetch }
}

export function useRenewalReminders(renewalId?: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!renewalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('renewal_reminders').select('*').eq('renewal_id', renewalId).order('reminder_date', { ascending: true }); setReminders(data || []) } finally { setIsLoading(false) }
  }, [renewalId])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useRenewalHistory(renewalId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!renewalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('renewal_history').select('*').eq('renewal_id', renewalId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [renewalId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useOverdueRenewals(userId?: string) {
  const [renewals, setRenewals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('renewals').select('*').eq('user_id', userId).eq('status', 'pending').lt('renewal_date', new Date().toISOString()).order('renewal_date', { ascending: true }); setRenewals(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { renewals, isLoading, refresh: fetch }
}
