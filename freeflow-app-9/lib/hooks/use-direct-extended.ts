'use client'

/**
 * Extended Direct Hooks
 * Tables: direct_messages, direct_conversations, direct_message_reactions, direct_message_reads
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDirectConversation(conversationId?: string) {
  const [conversation, setConversation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('direct_conversations').select('*').eq('id', conversationId).single(); setConversation(data) } finally { setIsLoading(false) }
  }, [conversationId])
  useEffect(() => { fetch() }, [fetch])
  return { conversation, isLoading, refresh: fetch }
}

export function useUserConversations(userId?: string) {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('direct_conversations').select('*').contains('participants', [userId]).order('last_message_at', { ascending: false }); setConversations(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { conversations, isLoading, refresh: fetch }
}

export function useDirectMessages(conversationId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('direct_messages').select('*').eq('conversation_id', conversationId).eq('is_deleted', false).order('sent_at', { ascending: true }).limit(options?.limit || 100); setMessages(data || []) } finally { setIsLoading(false) }
  }, [conversationId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useDirectMessagesRealtime(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchInitial = async () => {
      const { data } = await supabase.from('direct_messages').select('*').eq('conversation_id', conversationId).eq('is_deleted', false).order('sent_at', { ascending: true }).limit(100)
      setMessages(data || [])
      setIsLoading(false)
    }
    fetchInitial()

    const channel = supabase.channel(`direct-messages-${conversationId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => { setMessages(prev => [...prev, payload.new]) }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  return { messages, isLoading }
}

export function useMessageReactions(messageId?: string) {
  const [reactions, setReactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('direct_message_reactions').select('*').eq('message_id', messageId); setReactions(data || []) } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, isLoading, refresh: fetch }
}

export function useUnreadCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: conversations } = await supabase.from('direct_conversations').select('id').contains('participants', [userId])
      if (!conversations?.length) { setCount(0); return }
      const { data: reads } = await supabase.from('direct_message_reads').select('conversation_id, last_read_message_id').eq('user_id', userId)
      const readMap = new Map(reads?.map(r => [r.conversation_id, r.last_read_message_id]) || [])
      let totalUnread = 0
      for (const conv of conversations) {
        const lastRead = readMap.get(conv.id)
        let query = supabase.from('direct_messages').select('*', { count: 'exact', head: true }).eq('conversation_id', conv.id).neq('sender_id', userId)
        if (lastRead) query = query.gt('id', lastRead)
        const { count } = await query
        totalUnread += count || 0
      }
      setCount(totalUnread)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useConversationWithUser(currentUserId?: string, otherUserId?: string) {
  const [conversation, setConversation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!currentUserId || !otherUserId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const participants = [currentUserId, otherUserId].sort()
      const { data } = await supabase.from('direct_conversations').select('*').contains('participants', participants).single()
      setConversation(data)
    } finally { setIsLoading(false) }
  }, [currentUserId, otherUserId])
  useEffect(() => { fetch() }, [fetch])
  return { conversation, isLoading, refresh: fetch }
}

export function useLastReadMessage(conversationId?: string, userId?: string) {
  const [lastRead, setLastRead] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!conversationId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('direct_message_reads').select('*').eq('conversation_id', conversationId).eq('user_id', userId).single(); setLastRead(data) } finally { setIsLoading(false) }
  }, [conversationId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { lastRead, isLoading, refresh: fetch }
}
