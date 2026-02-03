'use client'

/**
 * Extended Dispute Hooks
 * Tables: disputes, dispute_messages, dispute_evidence, dispute_resolutions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDispute(disputeId?: string) {
  const [dispute, setDispute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!disputeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('disputes').select('*, dispute_messages(*), dispute_evidence(*), dispute_resolutions(*)').eq('id', disputeId).single(); setDispute(data) } finally { setIsLoading(false) }
  }, [disputeId])
  useEffect(() => { loadData() }, [loadData])
  return { dispute, isLoading, refresh: loadData }
}

export function useDisputes(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('disputes').select('*')
      if (options?.user_id) query = query.or(`initiated_by.eq.${options.user_id},against_user_id.eq.${options.user_id}`)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setDisputes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { disputes, isLoading, refresh: loadData }
}

export function useDisputeMessages(disputeId?: string, options?: { include_internal?: boolean }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!disputeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('dispute_messages').select('*').eq('dispute_id', disputeId)
      if (!options?.include_internal) query = query.eq('is_internal', false)
      const { data } = await query.order('sent_at', { ascending: true })
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [disputeId, options?.include_internal])
  useEffect(() => { loadData() }, [loadData])
  return { messages, isLoading, refresh: loadData }
}

export function useDisputeEvidence(disputeId?: string) {
  const [evidence, setEvidence] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!disputeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dispute_evidence').select('*').eq('dispute_id', disputeId).order('submitted_at', { ascending: true }); setEvidence(data || []) } finally { setIsLoading(false) }
  }, [disputeId])
  useEffect(() => { loadData() }, [loadData])
  return { evidence, isLoading, refresh: loadData }
}

export function useDisputeResolution(disputeId?: string) {
  const [resolution, setResolution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!disputeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dispute_resolutions').select('*').eq('dispute_id', disputeId).single(); setResolution(data) } finally { setIsLoading(false) }
  }, [disputeId])
  useEffect(() => { loadData() }, [loadData])
  return { resolution, isLoading, refresh: loadData }
}

export function useOpenDisputes(userId?: string) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('disputes').select('*').or(`initiated_by.eq.${userId},against_user_id.eq.${userId}`).in('status', ['open', 'in_review', 'escalated']).order('created_at', { ascending: false }); setDisputes(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { disputes, isLoading, refresh: loadData }
}

export function useDisputeStats(options?: { user_id?: string }) {
  const [stats, setStats] = useState<{ total: number; open: number; resolved: number; escalated: number; byType: Record<string, number>; avgResolutionDays: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('disputes').select('status, type, created_at, resolved_at')
      if (options?.user_id) query = query.or(`initiated_by.eq.${options.user_id},against_user_id.eq.${options.user_id}`)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const open = data.filter(d => d.status === 'open').length
      const resolved = data.filter(d => d.status === 'resolved').length
      const escalated = data.filter(d => d.status === 'escalated').length
      const byType = data.reduce((acc: Record<string, number>, d) => { if (d.type) acc[d.type] = (acc[d.type] || 0) + 1; return acc }, {})
      const resolvedDisputes = data.filter(d => d.resolved_at && d.created_at)
      const avgResolutionDays = resolvedDisputes.length > 0 ? resolvedDisputes.reduce((sum, d) => sum + (new Date(d.resolved_at).getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24), 0) / resolvedDisputes.length : 0
      setStats({ total, open, resolved, escalated, byType, avgResolutionDays })
    } finally { setIsLoading(false) }
  }, [options?.user_id])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useEscalatedDisputes(limit?: number) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('disputes').select('*').eq('status', 'escalated').order('escalated_at', { ascending: false }).limit(limit || 20); setDisputes(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { loadData() }, [loadData])
  return { disputes, isLoading, refresh: loadData }
}
