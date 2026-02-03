'use client'

/**
 * Extended Quota Hooks - Covers all Quota-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQuota(entityId?: string, entityType?: string, quotaType?: string) {
  const [quota, setQuota] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !quotaType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).single()
      setQuota(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, quotaType])
  useEffect(() => { loadData() }, [loadData])
  return { quota, isLoading, refresh: loadData }
}

export function useQuotas(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useQuotaStatus(entityId?: string, entityType?: string, quotaType?: string) {
  const [remaining, setRemaining] = useState(0)
  const [used, setUsed] = useState(0)
  const [limit, setLimit] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !quotaType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('quotas').select('used, limit_value').eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).single()
      if (data) {
        setUsed(data.used || 0)
        setLimit(data.limit_value || 0)
        setRemaining(Math.max(0, (data.limit_value || 0) - (data.used || 0)))
      }
    } finally { setIsLoading(false) }
  }, [entityId, entityType, quotaType])
  useEffect(() => { loadData() }, [loadData])
  return { remaining, used, limit, percentage: limit > 0 ? (used / limit) * 100 : 0, isLoading, refresh: loadData }
}
