'use client'

/**
 * Extended Communication Hooks
 * Tables: communication_channels, communication_messages, communication_templates, communication_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCommunicationChannel(channelId?: string) {
  const [channel, setChannel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('communication_channels').select('*').eq('id', channelId).single(); setChannel(data) } finally { setIsLoading(false) }
  }, [channelId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { channel, isLoading, refresh: fetch }
}

export function useCommunicationChannels(options?: { type?: string; is_active?: boolean }) {
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('communication_channels').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setChannels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { channels, isLoading, refresh: fetch }
}

export function useCommunicationMessages(options?: { channel_id?: string; recipient_id?: string; status?: string; limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('communication_messages').select('*')
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.recipient_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useCommunicationTemplates(options?: { channel_type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('communication_templates').select('*')
      if (options?.channel_type) query = query.eq('channel_type', options.channel_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useCommunicationPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('communication_preferences').select('preferences').eq('user_id', userId).single(); setPreferences(data?.preferences || {}) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}

export function useMessageStats(options?: { channel_id?: string; date_from?: string; date_to?: string }) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('communication_messages').select('status')
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      if (options?.date_from) query = query.gte('created_at', options.date_from)
      if (options?.date_to) query = query.lte('created_at', options.date_to)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, m) => { acc[m.status || 'unknown'] = (acc[m.status || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, byStatus })
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.date_from, options?.date_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingMessages(limit?: number) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('communication_messages').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(limit || 50); setMessages(data || []) } finally { setIsLoading(false) }
  }, [limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}
