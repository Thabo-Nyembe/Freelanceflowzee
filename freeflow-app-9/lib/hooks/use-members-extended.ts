'use client'

/**
 * Extended Members Hooks
 * Tables: members, member_roles, member_permissions, member_invitations, member_activities, member_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMember(memberId?: string) {
  const [member, setMember] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('members').select('*, member_roles(*), member_permissions(*), member_preferences(*)').eq('id', memberId).single(); setMember(data) } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { fetch() }, [fetch])
  return { member, isLoading, refresh: fetch }
}

export function useMembers(organizationId?: string, options?: { status?: string; role_id?: string; department?: string; limit?: number }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('members').select('*, member_roles(*)').eq('organization_id', organizationId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.role_id) query = query.eq('role_id', options.role_id)
      if (options?.department) query = query.eq('department', options.department)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setMembers(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.status, options?.role_id, options?.department, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useMemberRoles(organizationId?: string) {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('member_roles').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); setRoles(data || []) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { roles, isLoading, refresh: fetch }
}

export function useMemberInvitations(organizationId?: string, options?: { status?: string }) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('member_invitations').select('*').eq('organization_id', organizationId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}

export function useMemberActivities(memberId?: string, options?: { limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('member_activities').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(options?.limit || 50); setActivities(data || []) } finally { setIsLoading(false) }
  }, [memberId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { activities, isLoading, refresh: fetch }
}

export function useMemberPreferences(memberId?: string) {
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('member_preferences').select('*').eq('member_id', memberId).single(); setPreferences(data) } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}

export function useUserMemberships(userId?: string) {
  const [memberships, setMemberships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('members').select('*, member_roles(*)').eq('user_id', userId).eq('status', 'active'); setMemberships(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { memberships, isLoading, refresh: fetch }
}

export function useOrganizationStats(organizationId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; byDepartment: Record<string, number>; byRole: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('members').select('status, department, member_roles(name)').eq('organization_id', organizationId)
      const total = data?.length || 0
      const active = data?.filter(m => m.status === 'active').length || 0
      const byDepartment: Record<string, number> = {}
      const byRole: Record<string, number> = {}
      data?.forEach(m => { if (m.department) byDepartment[m.department] = (byDepartment[m.department] || 0) + 1; if (m.member_roles?.name) byRole[m.member_roles.name] = (byRole[m.member_roles.name] || 0) + 1 })
      setStats({ total, active, byDepartment, byRole })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingInvitations(email?: string) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('member_invitations').select('*').eq('email', email).eq('status', 'pending').gte('expires_at', new Date().toISOString()); setInvitations(data || []) } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}
