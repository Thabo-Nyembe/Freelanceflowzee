'use client'

/**
 * Extended Update Hooks - Covers all Update-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUpdate(updateId?: string) {
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('updates').select('*').eq('id', updateId).single()
      setUpdate(data)
    } finally { setIsLoading(false) }
  }, [updateId])
  useEffect(() => { fetch() }, [fetch])
  return { update, isLoading, refresh: fetch }
}

export function useUpdates(options?: { productId?: string; status?: string; updateType?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*')
      if (options?.productId) query = query.eq('product_id', options.productId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.updateType) query = query.eq('update_type', options.updateType)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.productId, options?.status, options?.updateType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLatestUpdate(productId?: string) {
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*').eq('status', 'published')
      if (productId) query = query.eq('product_id', productId)
      const { data } = await query.order('published_at', { ascending: false }).limit(1).single()
      setUpdate(data)
    } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { fetch() }, [fetch])
  return { update, isLoading, refresh: fetch }
}

export function useUpdateCheck(currentVersion?: string, productId?: string) {
  const [hasUpdates, setHasUpdates] = useState(false)
  const [hasMandatory, setHasMandatory] = useState(false)
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!currentVersion) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*').eq('status', 'published').gt('version_to', currentVersion)
      if (productId) query = query.eq('product_id', productId)
      const { data } = await query.order('version_to', { ascending: false })
      setUpdates(data || [])
      setHasUpdates(data && data.length > 0)
      setHasMandatory(data?.some(u => u.is_mandatory) || false)
    } finally { setIsLoading(false) }
  }, [currentVersion, productId])
  useEffect(() => { check() }, [check])
  return { hasUpdates, hasMandatory, updates, isLoading, check }
}
