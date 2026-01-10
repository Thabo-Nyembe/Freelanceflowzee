'use client'

/**
 * Extended Link Hooks - Covers all Link-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLink(linkId?: string) {
  const [link, setLink] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('links').select('*').eq('id', linkId).single()
      setLink(data)
    } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { fetch() }, [fetch])
  return { link, isLoading, refresh: fetch }
}

export function useLinkBySlug(slug?: string) {
  const [link, setLink] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('links').select('*').eq('slug', slug).single()
      setLink(data)
    } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { fetch() }, [fetch])
  return { link, isLoading, refresh: fetch }
}

export function useUserLinks(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('links').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLinkClicks(linkId?: string) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('link_clicks').select('*').eq('link_id', linkId).order('clicked_at', { ascending: false }).limit(100)
      setData(result || [])
      setTotal(result?.length || 0)
    } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}
