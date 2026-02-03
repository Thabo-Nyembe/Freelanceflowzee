'use client'

/**
 * Extended Organizations Hooks
 * Tables: organizations, organization_members, organization_roles, organization_invitations, organization_settings, organization_departments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useOrganization(organizationId?: string) {
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('organizations').select('*, organization_members(*, users(*)), organization_roles(*), organization_departments(*)').eq('id', organizationId).single(); setOrganization(data) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { organization, isLoading, refresh: loadData }
}

export function useOrganizations(options?: { owner_id?: string; status?: string; type?: string; search?: string; limit?: number }) {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('organizations').select('*, organization_members(count)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrganizations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.status, options?.type, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { organizations, isLoading, refresh: loadData }
}

export function useUserOrganizations(userId?: string) {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: memberships } = await supabase.from('organization_members').select('organization_id, role').eq('user_id', userId).eq('status', 'active')
      const orgIds = memberships?.map(m => m.organization_id) || []
      if (orgIds.length === 0) { setOrganizations([]); setIsLoading(false); return }
      const { data } = await supabase.from('organizations').select('*').in('id', orgIds)
      const orgsWithRoles = data?.map(org => ({ ...org, userRole: memberships?.find(m => m.organization_id === org.id)?.role })) || []
      setOrganizations(orgsWithRoles)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { organizations, isLoading, refresh: loadData }
}

export function useOrganizationMembers(organizationId?: string, options?: { role?: string; department_id?: string; status?: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('organization_members').select('*, users(*)').eq('organization_id', organizationId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.department_id) query = query.eq('department_id', options.department_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('joined_at', { ascending: false })
      setMembers(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.role, options?.department_id, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { members, isLoading, refresh: loadData }
}

export function useOrganizationRoles(organizationId?: string) {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('organization_roles').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); setRoles(data || []) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { roles, isLoading, refresh: loadData }
}

export function useOrganizationInvitations(organizationId?: string, options?: { status?: string }) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('organization_invitations').select('*').eq('organization_id', organizationId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { invitations, isLoading, refresh: loadData }
}

export function useOrganizationSettings(organizationId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('organization_settings').select('*').eq('organization_id', organizationId).single(); setSettings(data?.settings || {}) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useOrganizationDepartments(organizationId?: string, options?: { parent_id?: string | null }) {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('organization_departments').select('*, organization_members(count)').eq('organization_id', organizationId)
      if (options?.parent_id !== undefined) { options.parent_id ? query = query.eq('parent_id', options.parent_id) : query = query.is('parent_id', null) }
      const { data } = await query.order('name', { ascending: true })
      setDepartments(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.parent_id])
  useEffect(() => { loadData() }, [loadData])
  return { departments, isLoading, refresh: loadData }
}

export function usePendingInvitations(email?: string) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('organization_invitations').select('*, organizations(*)').eq('email', email).eq('status', 'pending').gt('expires_at', new Date().toISOString()); setInvitations(data || []) } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { loadData() }, [loadData])
  return { invitations, isLoading, refresh: loadData }
}

export function useOrganizationStats(organizationId?: string) {
  const [stats, setStats] = useState<{ memberCount: number; departmentCount: number; pendingInvitations: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [membersRes, deptsRes, invitesRes] = await Promise.all([
        supabase.from('organization_members').select('id', { count: 'exact' }).eq('organization_id', organizationId).eq('status', 'active'),
        supabase.from('organization_departments').select('id', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('organization_invitations').select('id', { count: 'exact' }).eq('organization_id', organizationId).eq('status', 'pending')
      ])
      setStats({
        memberCount: membersRes.count || 0,
        departmentCount: deptsRes.count || 0,
        pendingInvitations: invitesRes.count || 0
      })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
