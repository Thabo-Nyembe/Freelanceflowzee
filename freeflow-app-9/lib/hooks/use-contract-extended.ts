'use client'

/**
 * Extended Contract Hooks - Covers all Contract-related tables
 * Tables: contracts, contract_templates, contract_signatures, contract_revisions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useContract(contractId?: string) {
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contracts').select('*, contract_signatures(*), contract_revisions(*)').eq('id', contractId).single()
      setContract(data)
    } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { loadData() }, [loadData])
  return { contract, isLoading, refresh: loadData }
}

export function useContracts(userId?: string, options?: { status?: string; client_id?: string; project_id?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('contracts').select('*, contract_signatures(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.client_id, options?.project_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePendingContracts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('contracts').select('*, contract_signatures(*)').eq('user_id', userId).eq('status', 'pending_signature').order('sent_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useContractSignatures(contractId?: string) {
  const [signatures, setSignatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contract_signatures').select('*').eq('contract_id', contractId).order('order', { ascending: true })
      setSignatures(data || [])
    } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { loadData() }, [loadData])
  return { signatures, isLoading, refresh: loadData }
}

export function useContractRevisions(contractId?: string) {
  const [revisions, setRevisions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contract_revisions').select('*').eq('contract_id', contractId).order('version', { ascending: false })
      setRevisions(data || [])
    } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { loadData() }, [loadData])
  return { revisions, isLoading, refresh: loadData }
}

export function useContractTemplates(userId?: string, options?: { category?: string; include_public?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('contract_templates').select('*')
      if (options?.include_public) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      } else {
        query = query.eq('user_id', userId)
      }
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.category, options?.include_public])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useContractTemplate(templateId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contract_templates').select('*').eq('id', templateId).single()
      setTemplate(data)
    } finally { setIsLoading(false) }
  }, [templateId])
  useEffect(() => { loadData() }, [loadData])
  return { template, isLoading, refresh: loadData }
}

export function useContractStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; draft: number; pending: number; signed: number; declined: number; totalValue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: contracts } = await supabase.from('contracts').select('status, value').eq('user_id', userId)
      if (!contracts) { setStats(null); return }
      const total = contracts.length
      const draft = contracts.filter(c => c.status === 'draft').length
      const pending = contracts.filter(c => c.status === 'pending_signature').length
      const signed = contracts.filter(c => c.status === 'signed').length
      const declined = contracts.filter(c => c.status === 'declined').length
      const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0)
      setStats({ total, draft, pending, signed, declined, totalValue })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useContractRealtime(contractId?: string) {
  const [contract, setContract] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!contractId) return
    supabase.from('contracts').select('*, contract_signatures(*)').eq('id', contractId).single().then(({ data }) => setContract(data))
    const channel = supabase.channel(`contract_${contractId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contracts', filter: `id=eq.${contractId}` }, (payload) => setContract((prev: any) => ({ ...prev, ...payload.new })))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contract_signatures', filter: `contract_id=eq.${contractId}` }, async () => {
        const { data } = await supabase.from('contracts').select('*, contract_signatures(*)').eq('id', contractId).single()
        setContract(data)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [contractId])
  return { contract }
}

export function useContractsAwaitingSignature(email?: string) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: signatures } = await supabase.from('contract_signatures').select('contract_id').eq('signer_email', email).eq('status', 'pending')
      if (!signatures || signatures.length === 0) { setContracts([]); return }
      const contractIds = signatures.map(s => s.contract_id)
      const { data } = await supabase.from('contracts').select('*, contract_signatures(*)').in('id', contractIds).order('sent_at', { ascending: false })
      setContracts(data || [])
    } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { loadData() }, [loadData])
  return { contracts, isLoading, refresh: loadData }
}

export function useExpiringContracts(userId?: string, daysAhead: number = 30) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)
      const { data } = await supabase.from('contracts').select('*').eq('user_id', userId).eq('status', 'signed').lte('end_date', futureDate.toISOString().split('T')[0]).gte('end_date', new Date().toISOString().split('T')[0]).order('end_date', { ascending: true })
      setContracts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, daysAhead])
  useEffect(() => { loadData() }, [loadData])
  return { contracts, isLoading, refresh: loadData }
}
