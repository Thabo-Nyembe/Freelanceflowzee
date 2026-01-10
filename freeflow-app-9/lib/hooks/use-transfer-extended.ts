'use client'

/**
 * Extended Transfer Hooks - Covers all Transfer-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTransfer(transferId?: string) {
  const [transfer, setTransfer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('transfers').select('*').eq('id', transferId).single()
      setTransfer(data)
    } finally { setIsLoading(false) }
  }, [transferId])
  useEffect(() => { fetch() }, [fetch])
  return { transfer, isLoading, refresh: fetch }
}

export function useTransferStatus(transferId?: string) {
  const [status, setStatus] = useState<string>('pending')
  const [progress, setProgress] = useState(0)
  const [transferredCount, setTransferredCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchInitial = async () => {
      const { data } = await supabase.from('transfers').select('status, progress, transferred_count').eq('id', transferId).single()
      if (data) {
        setStatus(data.status)
        setProgress(data.progress || 0)
        setTransferredCount(data.transferred_count || 0)
      }
      setIsLoading(false)
    }

    fetchInitial()

    const channel = supabase.channel(`transfer-${transferId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transfers', filter: `id=eq.${transferId}` }, (payload) => {
      setStatus(payload.new.status)
      setProgress(payload.new.progress || 0)
      setTransferredCount(payload.new.transferred_count || 0)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [transferId])

  return { status, progress, transferredCount, isPending: status === 'pending', isComplete: status === 'completed', isFailed: status === 'failed', isLoading }
}

export function useUserTransfers(userId?: string, options?: { status?: string; direction?: 'sent' | 'received' }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transfers').select('*')
      if (options?.direction === 'sent') {
        query = query.eq('user_id', userId)
      } else if (options?.direction === 'received') {
        query = query.eq('destination_id', userId)
      } else {
        query = query.or(`user_id.eq.${userId},destination_id.eq.${userId}`)
      }
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.direction])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePendingTransfers(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('transfers').select('*').eq('destination_id', userId).eq('status', 'pending').order('created_at', { ascending: true })
      setData(result || [])
      setCount(result?.length || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, count, isLoading, refresh: fetch }
}

export function useTransferHistory(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('transfers').select('*').eq('entity_type', entityType).contains('entity_ids', [entityId]).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
