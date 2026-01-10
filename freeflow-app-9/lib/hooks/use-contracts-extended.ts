'use client'

/**
 * Extended Contracts Hooks
 * Tables: contracts, contract_versions, contract_signatures, contract_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useContract(contractId?: string) {
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('contracts').select('*, contract_versions(*), contract_signatures(*)').eq('id', contractId).single(); setContract(data) } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { fetch() }, [fetch])
  return { contract, isLoading, refresh: fetch }
}

export function useContracts(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('contracts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setContracts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { contracts, isLoading, refresh: fetch }
}

export function useContractVersions(contractId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('contract_versions').select('*').eq('contract_id', contractId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useContractSignatures(contractId?: string) {
  const [signatures, setSignatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!contractId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('contract_signatures').select('*').eq('contract_id', contractId).order('signed_at', { ascending: true }); setSignatures(data || []) } finally { setIsLoading(false) }
  }, [contractId])
  useEffect(() => { fetch() }, [fetch])
  return { signatures, isLoading, refresh: fetch }
}

export function useContractTemplates(options?: { type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('contract_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function usePendingSignatures(userId?: string) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contracts').select('*').eq('status', 'pending_signature').contains('parties', [userId])
      const { data: signed } = await supabase.from('contract_signatures').select('contract_id').eq('signer_id', userId)
      const signedIds = new Set(signed?.map(s => s.contract_id) || [])
      setContracts(data?.filter(c => !signedIds.has(c.id)) || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { contracts, isLoading, refresh: fetch }
}

export function useContractStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; totalValue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('contracts').select('status, value').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, c) => { acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1; return acc }, {})
      const totalValue = data.reduce((sum, c) => sum + (c.value || 0), 0)
      setStats({ total, byStatus, totalValue })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useExpiringContracts(userId?: string, daysAhead?: number) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + (daysAhead || 30))
      const { data } = await supabase.from('contracts').select('*').eq('user_id', userId).eq('status', 'signed').not('end_date', 'is', null).lte('end_date', futureDate.toISOString()).gte('end_date', new Date().toISOString()).order('end_date', { ascending: true })
      setContracts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, daysAhead])
  useEffect(() => { fetch() }, [fetch])
  return { contracts, isLoading, refresh: fetch }
}
