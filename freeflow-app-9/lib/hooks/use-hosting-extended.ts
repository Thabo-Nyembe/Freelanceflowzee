'use client'

/**
 * Extended Hosting Hooks
 * Tables: hosting_sites, hosting_deployments, hosting_domains, hosting_ssl, hosting_analytics, hosting_plans
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSite(siteId?: string) {
  const [site, setSite] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_sites').select('*, hosting_domains(*), hosting_deployments(*), hosting_ssl(*)').eq('id', siteId).single(); setSite(data) } finally { setIsLoading(false) }
  }, [siteId])
  useEffect(() => { fetch() }, [fetch])
  return { site, isLoading, refresh: fetch }
}

export function useSites(options?: { owner_id?: string; status?: string; framework?: string; limit?: number }) {
  const [sites, setSites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('hosting_sites').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.framework) query = query.eq('framework', options.framework)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSites(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.status, options?.framework, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sites, isLoading, refresh: fetch }
}

export function useUserSites(userId?: string) {
  const [sites, setSites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_sites').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); setSites(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { sites, isLoading, refresh: fetch }
}

export function useDeployments(siteId?: string, options?: { status?: string; limit?: number }) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('hosting_deployments').select('*').eq('site_id', siteId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 20)
      setDeployments(data || [])
    } finally { setIsLoading(false) }
  }, [siteId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { deployments, isLoading, refresh: fetch }
}

export function useLatestDeployment(siteId?: string) {
  const [deployment, setDeployment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_deployments').select('*').eq('site_id', siteId).order('started_at', { ascending: false }).limit(1).single(); setDeployment(data) } finally { setIsLoading(false) }
  }, [siteId])
  useEffect(() => { fetch() }, [fetch])
  return { deployment, isLoading, refresh: fetch }
}

export function useDomains(siteId?: string) {
  const [domains, setDomains] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_domains').select('*').eq('site_id', siteId).order('is_primary', { ascending: false }); setDomains(data || []) } finally { setIsLoading(false) }
  }, [siteId])
  useEffect(() => { fetch() }, [fetch])
  return { domains, isLoading, refresh: fetch }
}

export function useSSLCertificates(siteId?: string) {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_ssl').select('*').eq('site_id', siteId).order('created_at', { ascending: false }); setCertificates(data || []) } finally { setIsLoading(false) }
  }, [siteId])
  useEffect(() => { fetch() }, [fetch])
  return { certificates, isLoading, refresh: fetch }
}

export function useSiteAnalytics(siteId?: string, options?: { from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!siteId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('hosting_analytics').select('*').eq('site_id', siteId)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: false }).limit(30)
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [siteId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useHostingPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_plans').select('*').eq('is_active', true).order('price', { ascending: true }); setPlans(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}

export function useLiveSites(userId?: string) {
  const [sites, setSites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('hosting_sites').select('*').eq('owner_id', userId).eq('status', 'live').order('updated_at', { ascending: false }); setSites(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { sites, isLoading, refresh: fetch }
}
