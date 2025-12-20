'use client'

/**
 * Extended Conversations Hooks
 * Tables: conversations, conversation_messages, conversation_participants, conversation_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConversation(conversationId?: string) {
  const [conversation, setConversation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('conversations').select('*, conversation_participants(*)').eq('id', conversationId).single(); setConversation(data) } finally { setIsLoading(false) }
  }, [conversationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { conversation, isLoading, refresh: fetch }
}

export function useConversations(userId?: string, options?: { type?: string; limit?: number }) {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participantConvs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId).is('left_at', null)
      if (!participantConvs?.length) { setConversations([]); return }
      let query = supabase.from('conversations').select('*, conversation_participants(*)').in('id', participantConvs.map(p => p.conversation_id))
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50)
      setConversations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { conversations, isLoading, refresh: fetch }
}

export function useConversationMessages(conversationId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('conversation_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(options?.limit || 50); setMessages((data || []).reverse()) } finally { setIsLoading(false) }
  }, [conversationId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useConversationMessagesRealtime(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!conversationId) return
    supabase.from('conversation_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(100).then(({ data }) => setMessages(data || []))
    const channel = supabase.channel(`conv_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])
  return { messages }
}

export function useConversationParticipants(conversationId?: string) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('conversation_participants').select('*').eq('conversation_id', conversationId).is('left_at', null).order('joined_at', { ascending: true }); setParticipants(data || []) } finally { setIsLoading(false) }
  }, [conversationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { participants, isLoading, refresh: fetch }
}

export function useUnreadConversations(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: participantConvs } = await supabase.from('conversation_participants').select('conversation_id, last_read_at').eq('user_id', userId).is('left_at', null)
      if (!participantConvs?.length) { setCount(0); return }
      let unread = 0
      for (const p of participantConvs) {
        const { count: msgCount } = await supabase.from('conversation_messages').select('*', { count: 'exact', head: true }).eq('conversation_id', p.conversation_id).neq('sender_id', userId).gt('created_at', p.last_read_at || '1970-01-01')
        unread += msgCount || 0
      }
      setCount(unread)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useArchivedConversations(userId?: string) {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: archived } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId).eq('is_archived', true)
      if (!archived?.length) { setConversations([]); return }
      const { data } = await supabase.from('conversations').select('*').in('id', archived.map(a => a.conversation_id)).order('last_message_at', { ascending: false })
      setConversations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { conversations, isLoading, refresh: fetch }
}
