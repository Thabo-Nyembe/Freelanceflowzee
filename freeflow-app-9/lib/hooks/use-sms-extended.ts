'use client'

/**
 * Extended SMS Hooks
 * Tables: sms_messages, sms_templates, sms_campaigns, sms_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSmsMessage(messageId?: string) {
  const [message, setMessage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sms_messages').select('*').eq('id', messageId).single(); setMessage(data) } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { message, isLoading, refresh: fetch }
}

export function useSmsMessages(options?: { status?: string; to?: string; campaign_id?: string; limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sms_messages').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.to) query = query.eq('to', options.to)
      if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.to, options?.campaign_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useSmsTemplates(options?: { is_active?: boolean; category?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sms_templates').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.category])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useSmsCampaigns(options?: { status?: string; is_active?: boolean; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sms_campaigns').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function useSmsLogs(options?: { message_id?: string; status?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sms_logs').select('*')
      if (options?.message_id) query = query.eq('message_id', options.message_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.message_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}
