'use client'

/**
 * Extended Message Hooks - Covers all Message-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMessages(conversationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('sent_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [conversationId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMessageAttachments(messageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('message_attachments').select('*').eq('message_id', messageId); setData(result || []) } finally { setIsLoading(false) }
  }, [messageId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
