'use client'

/**
 * Extended Proposals Hooks
 * Tables: proposals, proposal_items, proposal_versions, proposal_comments, proposal_signatures, proposal_templates, proposal_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProposal(proposalId?: string) {
  const [proposal, setProposal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!proposalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('proposals').select('*, proposal_items(*), proposal_versions(*), proposal_comments(*), proposal_signatures(*), users(*), clients(*)').eq('id', proposalId).single(); setProposal(data) } finally { setIsLoading(false) }
  }, [proposalId])
  useEffect(() => { fetch() }, [fetch])
  return { proposal, isLoading, refresh: fetch }
}

export function useProposals(options?: { author_id?: string; client_id?: string; organization_id?: string; status?: string; search?: string; limit?: number }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('proposals').select('*, clients(*), proposal_items(count)')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProposals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.client_id, options?.organization_id, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { proposals, isLoading, refresh: fetch }
}

export function useProposalItems(proposalId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!proposalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('proposal_items').select('*').eq('proposal_id', proposalId).order('order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [proposalId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useProposalVersions(proposalId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!proposalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('proposal_versions').select('*, users(*)').eq('proposal_id', proposalId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [proposalId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useProposalComments(proposalId?: string, options?: { is_internal?: boolean }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!proposalId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('proposal_comments').select('*, users(*)').eq('proposal_id', proposalId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: true })
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [proposalId, options?.is_internal, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useProposalSignatures(proposalId?: string) {
  const [signatures, setSignatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!proposalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('proposal_signatures').select('*').eq('proposal_id', proposalId).order('signed_at', { ascending: false }); setSignatures(data || []) } finally { setIsLoading(false) }
  }, [proposalId])
  useEffect(() => { fetch() }, [fetch])
  return { signatures, isLoading, refresh: fetch }
}

export function useProposalTemplates(options?: { category?: string; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('proposal_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useMyProposals(userId?: string, options?: { status?: string; limit?: number }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('proposals').select('*, clients(*), proposal_items(count)').eq('author_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProposals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { proposals, isLoading, refresh: fetch }
}

export function useClientProposals(clientId?: string, options?: { status?: string; limit?: number }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('proposals').select('*, users(*), proposal_items(count)').eq('client_id', clientId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProposals(data || [])
    } finally { setIsLoading(false) }
  }, [clientId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { proposals, isLoading, refresh: fetch }
}

export function usePendingProposals(options?: { author_id?: string; organization_id?: string; limit?: number }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('proposals').select('*, clients(*), proposal_items(count)').eq('status', 'sent')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('sent_at', { ascending: false }).limit(options?.limit || 50)
      setProposals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.organization_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { proposals, isLoading, refresh: fetch }
}

export function useProposalStats(options?: { author_id?: string; organization_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; draft: number; sent: number; accepted: number; declined: number; totalValue: number; acceptedValue: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('proposals').select('status, total')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const proposals = data || []
      const total = proposals.length
      const draft = proposals.filter(p => p.status === 'draft').length
      const sent = proposals.filter(p => p.status === 'sent').length
      const accepted = proposals.filter(p => p.status === 'accepted').length
      const declined = proposals.filter(p => p.status === 'declined').length
      const totalValue = proposals.reduce((sum, p) => sum + (p.total || 0), 0)
      const acceptedValue = proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.total || 0), 0)
      const sentOrResponded = sent + accepted + declined
      const conversionRate = sentOrResponded > 0 ? Math.round((accepted / sentOrResponded) * 100) : 0
      setStats({ total, draft, sent, accepted, declined, totalValue, acceptedValue, conversionRate })
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.organization_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useExpiringProposals(options?: { days?: number; author_id?: string }) {
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.days || 7) * 24 * 60 * 60 * 1000)
      let query = supabase.from('proposals').select('*, clients(*)').eq('status', 'sent').gte('valid_until', now.toISOString()).lte('valid_until', futureDate.toISOString())
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      const { data } = await query.order('valid_until', { ascending: true })
      setProposals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.days, options?.author_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { proposals, isLoading, refresh: fetch }
}
