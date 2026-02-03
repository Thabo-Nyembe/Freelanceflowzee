'use client'

/**
 * Extended Transfers Hooks
 * Tables: transfers, transfer_items, transfer_approvals, transfer_history, transfer_schedules, transfer_batches
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTransfer(transferId?: string) {
  const [transfer, setTransfer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transfers').select('*, transfer_items(*), transfer_approvals(*, users(*))').eq('id', transferId).single(); setTransfer(data) } finally { setIsLoading(false) }
  }, [transferId])
  useEffect(() => { loadData() }, [loadData])
  return { transfer, isLoading, refresh: loadData }
}

export function useTransfers(options?: { transfer_type?: string; status?: string; from_id?: string; to_id?: string; initiated_by?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transfers').select('*, transfer_items(count)')
      if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_id) query = query.eq('from_id', options.from_id)
      if (options?.to_id) query = query.eq('to_id', options.to_id)
      if (options?.initiated_by) query = query.eq('initiated_by', options.initiated_by)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setTransfers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.transfer_type, options?.status, options?.from_id, options?.to_id, options?.initiated_by, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { transfers, isLoading, refresh: loadData }
}

export function useMyTransfers(userId?: string, options?: { role?: 'from' | 'to' | 'initiated' | 'all'; status?: string; limit?: number }) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transfers').select('*, transfer_items(count)')
      const role = options?.role || 'all'
      if (role === 'from') query = query.eq('from_id', userId)
      else if (role === 'to') query = query.eq('to_id', userId)
      else if (role === 'initiated') query = query.eq('initiated_by', userId)
      else query = query.or(`from_id.eq.${userId},to_id.eq.${userId},initiated_by.eq.${userId}`)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransfers(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.role, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { transfers, isLoading, refresh: loadData }
}

export function useTransferItems(transferId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transfer_items').select('*').eq('transfer_id', transferId).order('created_at', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [transferId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useTransferApprovals(transferId?: string) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transfer_approvals').select('*, users(*)').eq('transfer_id', transferId).order('created_at', { ascending: false }); setApprovals(data || []) } finally { setIsLoading(false) }
  }, [transferId])
  useEffect(() => { loadData() }, [loadData])
  return { approvals, isLoading, refresh: loadData }
}

export function useTransferHistory(transferId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!transferId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transfer_history').select('*, users(*)').eq('transfer_id', transferId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [transferId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function usePendingApprovals(approverId?: string, options?: { transfer_type?: string; limit?: number }) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transfers').select('*, transfer_items(count)').eq('status', 'pending_approval').eq('requires_approval', true)
      if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50)
      setTransfers(data || [])
    } finally { setIsLoading(false) }
  }, [approverId, options?.transfer_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { transfers, isLoading, refresh: loadData }
}

export function useTransferSchedules(options?: { transfer_type?: string; status?: string; from_id?: string; to_id?: string; limit?: number }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transfer_schedules').select('*')
      if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_id) query = query.eq('from_id', options.from_id)
      if (options?.to_id) query = query.eq('to_id', options.to_id)
      const { data } = await query.order('next_run', { ascending: true }).limit(options?.limit || 50)
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.transfer_type, options?.status, options?.from_id, options?.to_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useTransferBatches(options?: { transfer_type?: string; status?: string; created_by?: string; limit?: number }) {
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transfer_batches').select('*')
      if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBatches(data || [])
    } finally { setIsLoading(false) }
  }, [options?.transfer_type, options?.status, options?.created_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { batches, isLoading, refresh: loadData }
}

export function useTransferBatch(batchId?: string) {
  const [batch, setBatch] = useState<any>(null)
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!batchId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [batchRes, transfersRes] = await Promise.all([
        supabase.from('transfer_batches').select('*').eq('id', batchId).single(),
        supabase.from('transfers').select('*').eq('batch_id', batchId).order('created_at', { ascending: true })
      ])
      setBatch(batchRes.data)
      setTransfers(transfersRes.data || [])
    } finally { setIsLoading(false) }
  }, [batchId])
  useEffect(() => { loadData() }, [loadData])
  return { batch, transfers, isLoading, refresh: loadData }
}
