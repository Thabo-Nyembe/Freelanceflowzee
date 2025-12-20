'use client'

/**
 * Extended Allowance Hooks - Covers all Allowance-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAllowance(entityId?: string, entityType?: string, allowanceType?: string) {
  const [allowance, setAllowance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityId || !entityType || !allowanceType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single()
      setAllowance(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, allowanceType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { allowance, isLoading, refresh: fetch }
}

export function useAllowances(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAllowanceStatus(entityId?: string, entityType?: string, allowanceType?: string) {
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityId || !entityType || !allowanceType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('allowances').select('remaining, amount, expires_at').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single()
      if (data) {
        setRemaining(data.remaining || 0)
        setTotal(data.amount || 0)
        setIsExpired(data.expires_at ? new Date(data.expires_at) < new Date() : false)
      }
    } finally { setIsLoading(false) }
  }, [entityId, entityType, allowanceType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { remaining, total, percentage: total > 0 ? ((total - remaining) / total) * 100 : 0, isExpired, isLoading, refresh: fetch }
}
