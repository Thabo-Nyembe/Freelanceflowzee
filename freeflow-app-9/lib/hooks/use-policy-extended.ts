'use client'

/**
 * Extended Policy Hooks - Covers all Policy-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePolicy(policyId?: string) {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!policyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('policies').select('*').eq('id', policyId).single()
      setPolicy(data)
    } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { fetch() }, [fetch])
  return { policy, isLoading, refresh: fetch }
}

export function usePolicies(options?: { policyType?: string; resourceType?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('policies').select('*')
      if (options?.policyType) query = query.eq('policy_type', options.policyType)
      if (options?.resourceType) query = query.eq('resource_type', options.resourceType)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.policyType, options?.resourceType, options?.isActive])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRolePolicies(roleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!roleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('role_policies').select('policy_id, policies(*)').eq('role_id', roleId)
      setData(result?.map(rp => rp.policies) || [])
    } finally { setIsLoading(false) }
  }, [roleId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActivePolicies(resourceType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('policies').select('*').eq('is_active', true)
      if (resourceType) query = query.eq('resource_type', resourceType)
      const { data: result } = await query.order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [resourceType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
