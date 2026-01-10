'use client'

/**
 * Extended Newsletter Hooks
 * Tables: newsletters, newsletter_subscribers, newsletter_campaigns, newsletter_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNewsletter(newsletterId?: string) {
  const [newsletter, setNewsletter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletters').select('*').eq('id', newsletterId).single(); setNewsletter(data) } finally { setIsLoading(false) }
  }, [newsletterId])
  useEffect(() => { fetch() }, [fetch])
  return { newsletter, isLoading, refresh: fetch }
}

export function useNewsletters(options?: { user_id?: string; status?: string; limit?: number }) {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('newsletters').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNewsletters(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { newsletters, isLoading, refresh: fetch }
}

export function useNewsletterSubscribers(options?: { user_id?: string; status?: string; limit?: number }) {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('newsletter_subscribers').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('subscribed_at', { ascending: false }).limit(options?.limit || 100)
      setSubscribers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { subscribers, isLoading, refresh: fetch }
}

export function useNewsletterAnalytics(newsletterId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletter_analytics').select('*').eq('newsletter_id', newsletterId).single(); setAnalytics(data) } finally { setIsLoading(false) }
  }, [newsletterId])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useActiveSubscribers(userId?: string) {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletter_subscribers').select('*').eq('user_id', userId).eq('status', 'active').order('subscribed_at', { ascending: false }); setSubscribers(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { subscribers, isLoading, refresh: fetch }
}

export function useDraftNewsletters(userId?: string) {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletters').select('*').eq('user_id', userId).eq('status', 'draft').order('updated_at', { ascending: false }); setNewsletters(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { newsletters, isLoading, refresh: fetch }
}
