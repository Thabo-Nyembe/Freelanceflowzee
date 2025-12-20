'use client'

/**
 * Extended Tax Hooks - Covers all Tax-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTaxRates(country?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tax_rates').select('*').order('name', { ascending: true })
      if (country) query = query.eq('country', country)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [country, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTaxCategories(isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tax_categories').select('*').order('name', { ascending: true })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTaxExemptions(userId?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tax_exemptions').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useApplicableTaxRate(country?: string, state?: string, categoryId?: string) {
  const [rate, setRate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!country) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tax_rates').select('*').eq('country', country).eq('is_active', true)
      if (state) query = query.or(`state.eq.${state},state.is.null`)
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data } = await query.order('state', { ascending: false, nullsFirst: false }).limit(1).single()
      setRate(data)
    } finally { setIsLoading(false) }
  }, [country, state, categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}
