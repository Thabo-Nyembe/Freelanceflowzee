'use client'

/**
 * Extended Support Hooks - Covers all 5 Support-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSupportAgents() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('support_agents').select('*').eq('is_active', true).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSupportChannels() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('support_channels').select('*').eq('is_active', true).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSupportConversations(ticketId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('support_conversations').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [ticketId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSupportTicketReplies(ticketId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('support_ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [ticketId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSupportTickets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
