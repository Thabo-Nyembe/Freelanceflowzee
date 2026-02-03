'use client'

/**
 * Extended Webhook Hooks - Covers all Webhook-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWebhooks(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('webhooks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useWebhookLogs(webhookId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!webhookId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('webhook_logs').select('*').eq('webhook_id', webhookId).order('timestamp', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [webhookId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useWebhookEvents() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('webhook_events').select('*').order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
