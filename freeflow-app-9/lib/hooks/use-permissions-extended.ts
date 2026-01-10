'use client'

/**
 * Extended Permissions Hooks
 * Tables: permissions, permission_groups, permission_assignments, permission_overrides, permission_templates, permission_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePermission(permissionId?: string) {
  const [permission, setPermission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!permissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('permissions').select('*').eq('id', permissionId).single(); setPermission(data) } finally { setIsLoading(false) }
  }, [permissionId])
  useEffect(() => { fetch() }, [fetch])
  return { permission, isLoading, refresh: fetch }
}

export function usePermissions(options?: { resource?: string; organization_id?: string; is_active?: boolean; limit?: number }) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('permissions').select('*')
      if (options?.resource) query = query.eq('resource', options.resource)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('resource', { ascending: true }).order('name', { ascending: true }).limit(options?.limit || 100)
      setPermissions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.resource, options?.organization_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function usePermissionGroups(options?: { organization_id?: string; is_active?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('permission_groups').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useUserPermissions(userId?: string, options?: { organization_id?: string }) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('permission_assignments').select('*, permissions(*), permission_groups(*)').eq('user_id', userId)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query
      setPermissions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.organization_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function useRolePermissions(roleId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('permission_assignments').select('*, permissions(*), permission_groups(*)').eq('role_id', roleId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [roleId])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function usePermissionOverrides(userId?: string) {
  const [overrides, setOverrides] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('permission_overrides').select('*, permissions(*)').eq('user_id', userId).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`); setOverrides(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { overrides, isLoading, refresh: fetch }
}

export function usePermissionTemplates(options?: { organization_id?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('permission_templates').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function usePermissionCheck(userId?: string, permissionSlug?: string, resourceId?: string) {
  const [isAllowed, setIsAllowed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !permissionSlug) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: override } = await supabase.from('permission_overrides').select('allowed').eq('user_id', userId).eq('permission_id', permissionSlug).eq('resource_id', resourceId || null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).single()
      if (override) { setIsAllowed(override.allowed); setIsLoading(false); return }
      const { data: assignment } = await supabase.from('permission_assignments').select('id').eq('user_id', userId).eq('permission_id', permissionSlug).single()
      setIsAllowed(!!assignment)
    } finally { setIsLoading(false) }
  }, [userId, permissionSlug, resourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { isAllowed, isLoading, refresh: fetch }
}

export function usePermissionLogs(options?: { user_id?: string; action?: string; from_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('permission_logs').select('*')
      if (options?.action) query = query.eq('action', options.action)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.action, options?.from_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useResourcePermissions(resource?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!resource) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('permissions').select('*').eq('resource', resource).eq('is_active', true).order('action', { ascending: true }); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [resource])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}
