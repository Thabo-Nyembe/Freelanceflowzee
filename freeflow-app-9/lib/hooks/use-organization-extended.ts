'use client'

/**
 * Extended Organization Hooks - Covers all Organization-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOrganization(orgId?: string) {
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orgId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single()
      setOrganization(data)
    } finally { setIsLoading(false) }
  }, [orgId])
  useEffect(() => { fetch() }, [fetch])
  return { organization, isLoading, refresh: fetch }
}

export function useOrganizations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('organization_members').select('organization_id, role, organizations(*)').eq('user_id', userId)
      setData(result?.map(om => ({ ...om.organizations, role: om.role })) || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useOrganizationMembers(orgId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orgId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('organization_members').select('*, users(id, email, full_name, avatar_url)').eq('organization_id', orgId).order('joined_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [orgId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useOrganizationDepartments(orgId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orgId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('organization_departments').select('*').eq('organization_id', orgId).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [orgId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useOrganizationRoles(orgId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orgId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('organization_roles').select('*').eq('organization_id', orgId).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [orgId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
