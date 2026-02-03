'use client'

/**
 * Extended Tenant Hooks - Covers all Tenant-related tables (Multi-tenancy)
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTenant(tenantId?: string) {
  const [tenant, setTenant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tenants').select('*').eq('id', tenantId).single()
      setTenant(data)
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { loadData() }, [loadData])
  return { tenant, isLoading, refresh: loadData }
}

export function useTenants(options?: { status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tenants').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTenantUsers(tenantId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('tenant_users').select('*, users(id, email, full_name, avatar_url)').eq('tenant_id', tenantId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTenantSettings(tenantId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tenant_settings').select('key, value').eq('tenant_id', tenantId)
      const settingsMap = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useTenantUsage(tenantId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!tenantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('tenant_usage').select('*').eq('tenant_id', tenantId).order('period_start', { ascending: false }).limit(12)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [tenantId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
