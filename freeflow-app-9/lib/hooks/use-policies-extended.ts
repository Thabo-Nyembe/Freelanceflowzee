'use client'

/**
 * Extended Policies Hooks
 * Tables: policies, policy_versions, policy_acknowledgments, policy_categories, policy_attachments, policy_exceptions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePolicy(policyId?: string) {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policies').select('*, policy_versions(*), policy_categories(*), policy_attachments(*)').eq('id', policyId).single(); setPolicy(data) } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { loadData() }, [loadData])
  return { policy, isLoading, refresh: loadData }
}

export function usePolicies(options?: { organization_id?: string; category_id?: string; status?: string; requires_acknowledgment?: boolean; search?: string; limit?: number }) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('policies').select('*, policy_categories(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.requires_acknowledgment !== undefined) query = query.eq('requires_acknowledgment', options.requires_acknowledgment)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('title', { ascending: true }).limit(options?.limit || 50)
      setPolicies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.category_id, options?.status, options?.requires_acknowledgment, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { policies, isLoading, refresh: loadData }
}

export function usePolicyVersions(policyId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policy_versions').select('*').eq('policy_id', policyId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function usePolicyAcknowledgments(policyId?: string, options?: { limit?: number }) {
  const [acknowledgments, setAcknowledgments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policy_acknowledgments').select('*, users(*)').eq('policy_id', policyId).order('acknowledged_at', { ascending: false }).limit(options?.limit || 100); setAcknowledgments(data || []) } finally { setIsLoading(false) }
  }, [policyId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { acknowledgments, isLoading, refresh: loadData }
}

export function useUserAcknowledgments(userId?: string) {
  const [acknowledgments, setAcknowledgments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policy_acknowledgments').select('*, policies(*)').eq('user_id', userId).order('acknowledged_at', { ascending: false }); setAcknowledgments(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { acknowledgments, isLoading, refresh: loadData }
}

export function useHasAcknowledged(policyId?: string, userId?: string) {
  const [hasAcknowledged, setHasAcknowledged] = useState(false)
  const [acknowledgment, setAcknowledgment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: policy } = await supabase.from('policies').select('version').eq('id', policyId).single()
      const { data } = await supabase.from('policy_acknowledgments').select('*').eq('policy_id', policyId).eq('user_id', userId).eq('policy_version', policy?.version).single()
      setHasAcknowledged(!!data)
      setAcknowledgment(data)
    } finally { setIsLoading(false) }
  }, [policyId, userId])
  useEffect(() => { loadData() }, [loadData])
  return { hasAcknowledged, acknowledgment, isLoading, refresh: loadData }
}

export function usePolicyCategories(organizationId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('policy_categories').select('*, policies(count)')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function usePolicyAttachments(policyId?: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policy_attachments').select('*').eq('policy_id', policyId).order('uploaded_at', { ascending: false }); setAttachments(data || []) } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { loadData() }, [loadData])
  return { attachments, isLoading, refresh: loadData }
}

export function usePolicyExceptions(policyId?: string) {
  const [exceptions, setExceptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('policy_exceptions').select('*, users(*)').eq('policy_id', policyId).eq('status', 'active').order('created_at', { ascending: false }); setExceptions(data || []) } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { loadData() }, [loadData])
  return { exceptions, isLoading, refresh: loadData }
}

export function usePendingAcknowledgments(userId?: string, organizationId?: string) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('policies').select('*').eq('status', 'published').eq('requires_acknowledgment', true)
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data: allPolicies } = await query
      const { data: acknowledged } = await supabase.from('policy_acknowledgments').select('policy_id, policy_version').eq('user_id', userId)
      const acknowledgedMap = new Map(acknowledged?.map(a => [`${a.policy_id}-${a.policy_version}`, true]) || [])
      const pending = allPolicies?.filter(p => !acknowledgedMap.has(`${p.id}-${p.version}`)) || []
      setPolicies(pending)
    } finally { setIsLoading(false) }
  }, [userId, organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { policies, isLoading, refresh: loadData }
}

export function usePoliciesNeedingReview(organizationId?: string) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('policies').select('*, policy_categories(*)').eq('status', 'published').lte('review_date', new Date().toISOString())
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('review_date', { ascending: true })
      setPolicies(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { policies, isLoading, refresh: loadData }
}
