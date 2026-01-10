'use client'

/**
 * Extended Webhooks Hooks
 * Tables: webhooks, webhook_events, webhook_deliveries, webhook_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWebhook(webhookId?: string) {
  const [webhook, setWebhook] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webhookId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('webhooks').select('*').eq('id', webhookId).single(); setWebhook(data) } finally { setIsLoading(false) }
  }, [webhookId])
  useEffect(() => { fetch() }, [fetch])
  return { webhook, isLoading, refresh: fetch }
}

export function useWebhooks(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('webhooks').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setWebhooks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { webhooks, isLoading, refresh: fetch }
}

export function useWebhookEvents(options?: { event_type?: string; limit?: number }) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('webhook_events').select('*')
      if (options?.event_type) query = query.eq('event_type', options.event_type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [options?.event_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useWebhookDeliveries(webhookId?: string, options?: { status?: string; limit?: number }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webhookId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('webhook_deliveries').select('*').eq('webhook_id', webhookId); if (options?.status) query = query.eq('status', options.status); const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); setDeliveries(data || []) } finally { setIsLoading(false) }
  }, [webhookId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { deliveries, isLoading, refresh: fetch }
}

export function useWebhookLogs(webhookId?: string, options?: { limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webhookId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('webhook_logs').select('*').eq('webhook_id', webhookId).order('created_at', { ascending: false }).limit(options?.limit || 100); setLogs(data || []) } finally { setIsLoading(false) }
  }, [webhookId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useUserWebhooks(userId?: string) {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('webhooks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setWebhooks(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { webhooks, isLoading, refresh: fetch }
}
