'use client'

/**
 * Extended Terms Hooks
 * Tables: terms, term_versions, term_acceptances, term_categories, term_translations, term_requirements
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTerm(termId?: string) {
  const [term, setTerm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!termId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('terms').select('*, term_versions(*), term_categories(*), term_translations(*)').eq('id', termId).single(); setTerm(data) } finally { setIsLoading(false) }
  }, [termId])
  useEffect(() => { loadData() }, [loadData])
  return { term, isLoading, refresh: loadData }
}

export function useTermBySlug(slug?: string) {
  const [term, setTerm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('terms').select('*, term_versions(*), term_categories(*)').eq('slug', slug).eq('status', 'published').single(); setTerm(data) } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { loadData() }, [loadData])
  return { term, isLoading, refresh: loadData }
}

export function useTerms(options?: { term_type?: string; category_id?: string; status?: string; is_required?: boolean; search?: string; limit?: number }) {
  const [terms, setTerms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('terms').select('*, term_categories(*)')
      if (options?.term_type) query = query.eq('term_type', options.term_type)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_required !== undefined) query = query.eq('is_required', options.is_required)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('title', { ascending: true }).limit(options?.limit || 50)
      setTerms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.term_type, options?.category_id, options?.status, options?.is_required, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { terms, isLoading, refresh: loadData }
}

export function useTermVersions(termId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [currentVersion, setCurrentVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!termId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('term_versions').select('*, users(*)').eq('term_id', termId).order('version', { ascending: false })
      setVersions(data || [])
      setCurrentVersion(data?.[0] || null)
    } finally { setIsLoading(false) }
  }, [termId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, currentVersion, isLoading, refresh: loadData }
}

export function useTermAcceptance(termId?: string, userId?: string) {
  const [acceptance, setAcceptance] = useState<any>(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!termId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [termRes, acceptanceRes] = await Promise.all([
        supabase.from('terms').select('version').eq('id', termId).single(),
        supabase.from('term_acceptances').select('*').eq('term_id', termId).eq('user_id', userId).order('version', { ascending: false }).limit(1).single()
      ])
      const currentVersion = termRes.data?.version || 1
      const acceptedVersion = acceptanceRes.data?.version
      setAcceptance(acceptanceRes.data)
      setIsAccepted(!!acceptedVersion && acceptedVersion >= currentVersion)
      setNeedsUpdate(!!acceptedVersion && acceptedVersion < currentVersion)
    } finally { setIsLoading(false) }
  }, [termId, userId])
  useEffect(() => { loadData() }, [loadData])
  return { acceptance, isAccepted, needsUpdate, isLoading, refresh: loadData }
}

export function useTermAcceptances(termId?: string, options?: { version?: number; limit?: number }) {
  const [acceptances, setAcceptances] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!termId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('term_acceptances').select('*, users(*)', { count: 'exact' }).eq('term_id', termId)
      if (options?.version) query = query.eq('version', options.version)
      const { data, count } = await query.order('accepted_at', { ascending: false }).limit(options?.limit || 100)
      setAcceptances(data || [])
      setTotalCount(count || 0)
    } finally { setIsLoading(false) }
  }, [termId, options?.version, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { acceptances, totalCount, isLoading, refresh: loadData }
}

export function useRequiredTerms(userId?: string) {
  const [pendingTerms, setPendingTerms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: terms } = await supabase.from('terms').select('*').eq('status', 'published').eq('requires_acceptance', true).lte('effective_from', new Date().toISOString())
      if (!terms || terms.length === 0) { setPendingTerms([]); return }
      const termIds = terms.map(t => t.id)
      const { data: acceptances } = await supabase.from('term_acceptances').select('term_id, version').eq('user_id', userId).in('term_id', termIds)
      const acceptedMap = new Map(acceptances?.map(a => [a.term_id, a.version]) || [])
      const pending = terms.filter(t => {
        const acceptedVersion = acceptedMap.get(t.id)
        return !acceptedVersion || acceptedVersion < t.version
      })
      setPendingTerms(pending)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { pendingTerms, hasPending: pendingTerms.length > 0, isLoading, refresh: loadData }
}

export function useTermTranslations(termId?: string) {
  const [translations, setTranslations] = useState<any[]>([])
  const [availableLocales, setAvailableLocales] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!termId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('term_translations').select('*').eq('term_id', termId).order('locale', { ascending: true })
      setTranslations(data || [])
      setAvailableLocales((data || []).map(t => t.locale))
    } finally { setIsLoading(false) }
  }, [termId])
  useEffect(() => { loadData() }, [loadData])
  return { translations, availableLocales, isLoading, refresh: loadData }
}

export function useTermCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('term_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useUserTermAcceptances(userId?: string, options?: { term_type?: string }) {
  const [acceptances, setAcceptances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const query = supabase.from('term_acceptances').select('*, terms(*)').eq('user_id', userId)
      const { data } = await query.order('accepted_at', { ascending: false })
      let result = data || []
      if (options?.term_type) {
        result = result.filter(a => a.terms?.term_type === options.term_type)
      }
      setAcceptances(result)
    } finally { setIsLoading(false) }
  }, [userId, options?.term_type])
  useEffect(() => { loadData() }, [loadData])
  return { acceptances, isLoading, refresh: loadData }
}
