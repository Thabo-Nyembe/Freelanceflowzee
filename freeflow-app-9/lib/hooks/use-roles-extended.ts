'use client'

/**
 * Extended Roles Hooks
 * Tables: roles, role_permissions, role_assignments, role_hierarchies, role_templates, role_groups
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRole(roleId?: string) {
  const [role, setRole] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('roles').select('*, role_permissions(*), role_groups(*)').eq('id', roleId).single(); setRole(data) } finally { setIsLoading(false) }
  }, [roleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { role, isLoading, refresh: fetch }
}

export function useRoles(options?: { group_id?: string; is_active?: boolean; is_system?: boolean; search?: string; limit?: number }) {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('roles').select('*, role_permissions(count), role_assignments(count), role_groups(*)')
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setRoles(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id, options?.is_active, options?.is_system, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { roles, isLoading, refresh: fetch }
}

export function useUserRoles(userId?: string) {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('role_assignments').select('*, roles(*, role_permissions(*))').eq('user_id', userId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      setRoles(data || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { roles, isLoading, refresh: fetch }
}

export function useRoleUsers(roleId?: string, options?: { limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('role_assignments').select('*, users(*)').eq('role_id', roleId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()).limit(options?.limit || 100)
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [roleId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { users, isLoading, refresh: fetch }
}

export function useRolePermissions(roleId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('role_permissions').select('*, permissions(*)').eq('role_id', roleId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [roleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function useRoleGroups(options?: { is_active?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('role_groups').select('*, roles(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useRoleTemplates(options?: { category?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('role_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useUserPermissions(userId?: string) {
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('role_assignments').select('role_id').eq('user_id', userId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      if (!assignments || assignments.length === 0) { setPermissions([]); return }
      const roleIds = assignments.map(a => a.role_id)
      const { data: rolePerms } = await supabase.from('role_permissions').select('permissions(code)').in('role_id', roleIds)
      const permCodes = rolePerms?.map(p => p.permissions?.code).filter(Boolean) as string[] || []
      setPermissions([...new Set(permCodes)])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch, hasPermission: (code: string) => permissions.includes(code) }
}

export function useRoleHierarchy(roleId?: string) {
  const [hierarchy, setHierarchy] = useState<{ parents: any[]; children: any[] }>({ parents: [], children: [] })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [parents, children] = await Promise.all([
        supabase.from('role_hierarchies').select('parent:parent_role_id(*)').eq('child_role_id', roleId),
        supabase.from('role_hierarchies').select('child:child_role_id(*)').eq('parent_role_id', roleId)
      ])
      setHierarchy({
        parents: parents.data?.map(p => p.parent) || [],
        children: children.data?.map(c => c.child) || []
      })
    } finally { setIsLoading(false) }
  }, [roleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { hierarchy, isLoading, refresh: fetch }
}

export function useRoleStats() {
  const [stats, setStats] = useState<{ total: number; active: number; system: number; assignments: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const [total, active, system, assignments] = await Promise.all([
        supabase.from('roles').select('*', { count: 'exact', head: true }),
        supabase.from('roles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('roles').select('*', { count: 'exact', head: true }).eq('is_system', true),
        supabase.from('role_assignments').select('*', { count: 'exact', head: true })
      ])
      setStats({ total: total.count || 0, active: active.count || 0, system: system.count || 0, assignments: assignments.count || 0 })
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

