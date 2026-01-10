'use client'

/**
 * Extended Add-ons Hooks
 * Tables: add_ons, add_on_installations, add_on_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAddOn(addOnId?: string) {
  const [addOn, setAddOn] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!addOnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('add_ons').select('*').eq('id', addOnId).single(); setAddOn(data) } finally { setIsLoading(false) }
  }, [addOnId])
  useEffect(() => { fetch() }, [fetch])
  return { addOn, isLoading, refresh: fetch }
}

export function useAddOns(options?: { category?: string; status?: string; pricing_type?: string; search?: string; limit?: number }) {
  const [addOns, setAddOns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('add_ons').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.pricing_type) query = query.eq('pricing_type', options.pricing_type)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50)
      setAddOns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.status, options?.pricing_type, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { addOns, isLoading, refresh: fetch }
}

export function useUserAddOns(userId?: string) {
  const [installations, setInstallations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('add_on_installations').select('*, add_ons(*)').eq('user_id', userId).eq('is_active', true); setInstallations(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { installations, isLoading, refresh: fetch }
}

export function useIsAddOnInstalled(userId?: string, addOnId?: string) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !addOnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('add_on_installations').select('id').eq('user_id', userId).eq('add_on_id', addOnId).single(); setIsInstalled(!!data) } finally { setIsLoading(false) }
  }, [userId, addOnId])
  useEffect(() => { check() }, [check])
  return { isInstalled, isLoading, recheck: check }
}

export function usePopularAddOns(options?: { limit?: number }) {
  const [addOns, setAddOns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('add_ons').select('*').eq('status', 'published').order('install_count', { ascending: false }).limit(options?.limit || 10); setAddOns(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { addOns, isLoading, refresh: fetch }
}

export function useAddOnCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('add_ons').select('category').eq('status', 'published'); const unique = [...new Set((data || []).map(a => a.category).filter(Boolean))]; setCategories(unique) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}
