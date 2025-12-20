'use client'

/**
 * Extended Changelog Hooks - Covers all Changelog-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChangelog(changelogId?: string) {
  const [changelog, setChangelog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!changelogId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('changelogs').select('*').eq('id', changelogId).single()
      setChangelog(data)
    } finally { setIsLoading(false) }
  }, [changelogId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { changelog, isLoading, refresh: fetch }
}

export function useChangelogs(options?: { productId?: string; isPublished?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('changelogs').select('*')
      if (options?.productId) query = query.eq('product_id', options.productId)
      if (options?.isPublished !== undefined) query = query.eq('is_published', options.isPublished)
      const { data: result } = await query.order('release_date', { ascending: false }).limit(options?.limit || 20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.productId, options?.isPublished, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLatestChangelog(productId?: string) {
  const [changelog, setChangelog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('changelogs').select('*').eq('is_published', true)
      if (productId) query = query.eq('product_id', productId)
      const { data } = await query.order('release_date', { ascending: false }).limit(1).single()
      setChangelog(data)
    } finally { setIsLoading(false) }
  }, [productId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { changelog, isLoading, refresh: fetch }
}

export function useChangelogSearch(query?: string, productId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('changelogs').select('*').eq('is_published', true).or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      if (productId) dbQuery = dbQuery.eq('product_id', productId)
      const { data: result } = await dbQuery.order('release_date', { ascending: false }).limit(10)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [query, productId, supabase])
  useEffect(() => { search() }, [search])
  return { data, isLoading, search }
}
