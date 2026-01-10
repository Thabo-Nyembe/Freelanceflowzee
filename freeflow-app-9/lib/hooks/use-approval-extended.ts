'use client'

/**
 * Extended Approval Hooks - Covers all Approval-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useApprovals(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('approvals').select('*').order('created_at', { ascending: false }).limit(50)
      if (userId) query = query.or(`requester_id.eq.${userId},approver_id.eq.${userId}`)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePendingApprovals(approverId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('approvals').select('*').eq('approver_id', approverId).eq('status', 'pending').order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [approverId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePendingApprovalCount(approverId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('approver_id', approverId).eq('status', 'pending')
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [approverId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useApprovalHistory(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('approvals').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
