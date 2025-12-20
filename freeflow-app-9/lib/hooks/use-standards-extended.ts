'use client'

/**
 * Extended Standards Hooks
 * Tables: standards, standard_requirements, standard_compliance, standard_audits, standard_certifications, standard_documents
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStandard(standardId?: string) {
  const [standard, setStandard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!standardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('standards').select('*, standard_requirements(*), standard_documents(*)').eq('id', standardId).single(); setStandard(data) } finally { setIsLoading(false) }
  }, [standardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { standard, isLoading, refresh: fetch }
}

export function useStandards(options?: { category?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [standards, setStandards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('standards').select('*, standard_requirements(count)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setStandards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { standards, isLoading, refresh: fetch }
}

export function useStandardRequirements(standardId?: string) {
  const [requirements, setRequirements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!standardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('standard_requirements').select('*').eq('standard_id', standardId).order('order_index', { ascending: true }); setRequirements(data || []) } finally { setIsLoading(false) }
  }, [standardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { requirements, isLoading, refresh: fetch }
}

export function useComplianceStatus(entityType?: string, entityId?: string, standardId?: string) {
  const [compliance, setCompliance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !standardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('standard_compliance').select('*, standards(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('standard_id', standardId).order('assessed_at', { ascending: false }).limit(1).single()
      setCompliance(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, standardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { compliance, isLoading, refresh: fetch }
}

export function useComplianceHistory(entityType?: string, entityId?: string, options?: { standard_id?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('standard_compliance').select('*, standards(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId)
      if (options?.standard_id) query = query.eq('standard_id', options.standard_id)
      const { data } = await query.order('assessed_at', { ascending: false }).limit(options?.limit || 20)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.standard_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useCertifications(options?: { entity_type?: string; entity_id?: string; standard_id?: string; status?: string; limit?: number }) {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('standard_certifications').select('*, standards(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.standard_id) query = query.eq('standard_id', options.standard_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50)
      setCertifications(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.standard_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { certifications, isLoading, refresh: fetch }
}

export function useActiveCertification(entityType?: string, entityId?: string, standardId?: string) {
  const [certification, setCertification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !standardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('standard_certifications').select('*, standards(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('standard_id', standardId).eq('status', 'active').lte('valid_from', now).gte('valid_until', now).single()
      setCertification(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, standardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { certification, isValid: !!certification, isLoading, refresh: fetch }
}

export function useUpcomingAudits(options?: { entity_type?: string; entity_id?: string; auditor_id?: string; limit?: number }) {
  const [audits, setAudits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('standard_audits').select('*, standards(*)').eq('status', 'scheduled').gte('scheduled_date', new Date().toISOString())
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.auditor_id) query = query.eq('auditor_id', options.auditor_id)
      const { data } = await query.order('scheduled_date', { ascending: true }).limit(options?.limit || 20)
      setAudits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.auditor_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { audits, isLoading, refresh: fetch }
}

export function useStandardCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('standards').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

