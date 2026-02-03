'use client'

/**
 * Extended Patch Hooks - Covers all Patch-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePatch(patchId?: string) {
  const [patch, setPatch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!patchId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('patches').select('*').eq('id', patchId).single()
      setPatch(data)
    } finally { setIsLoading(false) }
  }, [patchId])
  useEffect(() => { loadData() }, [loadData])
  return { patch, isLoading, refresh: loadData }
}

export function usePatches(options?: { productId?: string; status?: string; isCritical?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('patches').select('*')
      if (options?.productId) query = query.eq('product_id', options.productId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.isCritical) query = query.eq('is_critical', true)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.productId, options?.status, options?.isCritical])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCriticalPatches(productId?: string) {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('patches').select('*').eq('is_critical', true).eq('status', 'released')
      if (productId) query = query.eq('product_id', productId)
      const { data: result } = await query.order('released_at', { ascending: false })
      setData(result || [])
      setCount(result?.length || 0)
    } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { data, count, isLoading, refresh: loadData }
}

export function usePatchesByVersion(version?: string, productId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!version) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('patches').select('*').eq('target_version', version)
      if (productId) query = query.eq('product_id', productId)
      const { data: result } = await query.order('patch_number', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [version, productId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
