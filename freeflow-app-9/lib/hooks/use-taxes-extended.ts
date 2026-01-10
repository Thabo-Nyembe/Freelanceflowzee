'use client'

/**
 * Extended Taxes Hooks
 * Tables: taxes, tax_rates, tax_rules, tax_exemptions, tax_filings, tax_calculations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTax(taxId?: string) {
  const [tax, setTax] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!taxId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('taxes').select('*, tax_rates(*), tax_rules(*), tax_exemptions(*)').eq('id', taxId).single(); setTax(data) } finally { setIsLoading(false) }
  }, [taxId])
  useEffect(() => { fetch() }, [fetch])
  return { tax, isLoading, refresh: fetch }
}

export function useTaxes(options?: { tax_type?: string; jurisdiction?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [taxes, setTaxes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('taxes').select('*, tax_rates(*)')
      if (options?.tax_type) query = query.eq('tax_type', options.tax_type)
      if (options?.jurisdiction) query = query.eq('jurisdiction', options.jurisdiction)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTaxes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tax_type, options?.jurisdiction, options?.is_active, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { taxes, isLoading, refresh: fetch }
}

export function useTaxRates(taxId?: string, options?: { effective_date?: string; category?: string }) {
  const [rates, setRates] = useState<any[]>([])
  const [currentRate, setCurrentRate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!taxId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const effectiveDate = options?.effective_date || new Date().toISOString()
      let query = supabase.from('tax_rates').select('*').eq('tax_id', taxId)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('effective_from', { ascending: false })
      const rateList = data || []
      setRates(rateList)
      const current = rateList.find(r => {
        const fromValid = r.effective_from <= effectiveDate
        const toValid = !r.effective_to || r.effective_to >= effectiveDate
        return fromValid && toValid
      })
      setCurrentRate(current || null)
    } finally { setIsLoading(false) }
  }, [taxId, options?.effective_date, options?.category])
  useEffect(() => { fetch() }, [fetch])
  return { rates, currentRate, isLoading, refresh: fetch }
}

export function useTaxRules(taxId?: string, options?: { rule_type?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!taxId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tax_rules').select('*').eq('tax_id', taxId)
      if (options?.rule_type) query = query.eq('rule_type', options.rule_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('priority', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [taxId, options?.rule_type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useTaxExemptions(options?: { entity_type?: string; entity_id?: string; tax_id?: string; status?: string }) {
  const [exemptions, setExemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tax_exemptions').select('*, taxes(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.tax_id) query = query.eq('tax_id', options.tax_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('valid_from', { ascending: false })
      setExemptions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.tax_id, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { exemptions, isLoading, refresh: fetch }
}

export function useTaxFilings(options?: { tax_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [filings, setFilings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tax_filings').select('*, taxes(*)')
      if (options?.tax_id) query = query.eq('tax_id', options.tax_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('period_start', options.from_date)
      if (options?.to_date) query = query.lte('period_end', options.to_date)
      const { data } = await query.order('period_end', { ascending: false }).limit(options?.limit || 50)
      setFilings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tax_id, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { filings, isLoading, refresh: fetch }
}

export function useApplicableTaxes(params?: { jurisdiction?: string; category?: string; entity_type?: string; entity_id?: string }) {
  const [taxes, setTaxes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('taxes').select('*, tax_rates(*)').eq('is_active', true)
      if (params?.jurisdiction) query = query.eq('jurisdiction', params.jurisdiction)
      const { data } = await query.order('name', { ascending: true })
      let result = data || []
      if (params?.entity_type && params?.entity_id) {
        const now = new Date().toISOString()
        const { data: exemptions } = await supabase.from('tax_exemptions').select('tax_id').eq('entity_type', params.entity_type).eq('entity_id', params.entity_id).eq('status', 'active').lte('valid_from', now).or(`valid_until.is.null,valid_until.gte.${now}`)
        const exemptTaxIds = exemptions?.map(e => e.tax_id) || []
        result = result.filter(t => !exemptTaxIds.includes(t.id))
      }
      setTaxes(result)
    } finally { setIsLoading(false) }
  }, [params?.jurisdiction, params?.category, params?.entity_type, params?.entity_id])
  useEffect(() => { fetch() }, [fetch])
  return { taxes, isLoading, refresh: fetch }
}

export function useJurisdictions() {
  const [jurisdictions, setJurisdictions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('taxes').select('jurisdiction').not('jurisdiction', 'is', null)
      const unique = [...new Set(data?.map(t => t.jurisdiction).filter(Boolean))]
      setJurisdictions(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { jurisdictions, isLoading, refresh: fetch }
}

