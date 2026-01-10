'use client'

/**
 * Extended Tenants Hooks
 * Tables: tenants, tenant_users, tenant_settings, tenant_subscriptions, tenant_invitations, tenant_domains
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTenant(tenantId?: string) {
  const [tenant, setTenant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tenants').select('*, tenant_settings(*), tenant_subscriptions(*), tenant_domains(*)').eq('id', tenantId).single(); setTenant(data) } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { fetch() }, [fetch])
  return { tenant, isLoading, refresh: fetch }
}

export function useTenantBySlug(slug?: string) {
  const [tenant, setTenant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tenants').select('*, tenant_settings(*), tenant_domains(*)').eq('slug', slug).single(); setTenant(data) } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { fetch() }, [fetch])
  return { tenant, isLoading, refresh: fetch }
}

export function useTenants(options?: { status?: string; plan?: string; owner_id?: string; search?: string; limit?: number }) {
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tenants').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.plan) query = query.eq('plan', options.plan)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTenants(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.plan, options?.owner_id, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tenants, isLoading, refresh: fetch }
}

export function useTenantUsers(tenantId?: string, options?: { role?: string; is_active?: boolean }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tenant_users').select('*, users(*)').eq('tenant_id', tenantId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('joined_at', { ascending: true })
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [tenantId, options?.role, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { users, isLoading, refresh: fetch }
}

export function useUserTenants(userId?: string, options?: { role?: string; is_active?: boolean }) {
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tenant_users').select('*, tenants(*)').eq('user_id', userId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('joined_at', { ascending: false })
      setTenants((data || []).map(m => ({ ...m.tenants, membership: m })))
    } finally { setIsLoading(false) }
  }, [userId, options?.role, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { tenants, isLoading, refresh: fetch }
}

export function useTenantMembership(tenantId?: string, userId?: string) {
  const [membership, setMembership] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tenant_users').select('*').eq('tenant_id', tenantId).eq('user_id', userId).single(); setMembership(data) } finally { setIsLoading(false) }
  }, [tenantId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { membership, isMember: !!membership, role: membership?.role, isLoading, refresh: fetch }
}

export function useTenantSettings(tenantId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId)
      const settingsMap: Record<string, any> = {}
      data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value })
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useTenantSubscription(tenantId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tenant_subscriptions').select('*').eq('tenant_id', tenantId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single(); setSubscription(data) } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}

export function useTenantInvitations(tenantId?: string, options?: { status?: string }) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tenant_invitations').select('*, users(*)').eq('tenant_id', tenantId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [tenantId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}

export function useTenantDomains(tenantId?: string) {
  const [domains, setDomains] = useState<any[]>([])
  const [primaryDomain, setPrimaryDomain] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tenant_domains').select('*').eq('tenant_id', tenantId).order('is_primary', { ascending: false })
      setDomains(data || [])
      setPrimaryDomain(data?.find(d => d.is_primary) || null)
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { fetch() }, [fetch])
  return { domains, primaryDomain, isLoading, refresh: fetch }
}

export function useMyPendingTenantInvitations(email?: string) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tenant_invitations').select('*, tenants(*)').eq('email', email).eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}
