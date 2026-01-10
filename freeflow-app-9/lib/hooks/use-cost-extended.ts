'use client'

/**
 * Extended Cost Hooks
 * Tables: costs, cost_centers, cost_categories, cost_allocations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCost(costId?: string) {
  const [cost, setCost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!costId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('costs').select('*, cost_allocations(*)').eq('id', costId).single(); setCost(data) } finally { setIsLoading(false) }
  }, [costId])
  useEffect(() => { fetch() }, [fetch])
  return { cost, isLoading, refresh: fetch }
}

export function useCosts(options?: { user_id?: string; category_id?: string; cost_center_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  const [costs, setCosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('costs').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.cost_center_id) query = query.eq('cost_center_id', options.cost_center_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: false }).limit(options?.limit || 50)
      setCosts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.category_id, options?.cost_center_id, options?.status, options?.date_from, options?.date_to, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { costs, isLoading, refresh: fetch }
}

export function useCostCenters(options?: { is_active?: boolean }) {
  const [centers, setCenters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cost_centers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCenters(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { centers, isLoading, refresh: fetch }
}

export function useCostCategories(options?: { is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cost_categories').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function usePendingCosts(userId?: string) {
  const [costs, setCosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('costs').select('*').eq('user_id', userId).eq('status', 'pending').order('date', { ascending: false }); setCosts(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { costs, isLoading, refresh: fetch }
}

export function useCostSummary(options?: { user_id?: string; date_from?: string; date_to?: string }) {
  const [summary, setSummary] = useState<{ total: number; byCategory: Record<string, number>; byCostCenter: Record<string, number>; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('costs').select('amount, category_id, cost_center_id, status')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query
      if (!data) { setSummary(null); return }
      const total = data.reduce((sum, c) => sum + (c.amount || 0), 0)
      const byCategory = data.reduce((acc: Record<string, number>, c) => { const key = c.category_id || 'uncategorized'; acc[key] = (acc[key] || 0) + (c.amount || 0); return acc }, {})
      const byCostCenter = data.reduce((acc: Record<string, number>, c) => { const key = c.cost_center_id || 'unassigned'; acc[key] = (acc[key] || 0) + (c.amount || 0); return acc }, {})
      const byStatus = data.reduce((acc: Record<string, number>, c) => { acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1; return acc }, {})
      setSummary({ total, byCategory, byCostCenter, byStatus })
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.date_from, options?.date_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useCostAllocations(costId?: string) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!costId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cost_allocations').select('*').eq('cost_id', costId).order('created_at', { ascending: true }); setAllocations(data || []) } finally { setIsLoading(false) }
  }, [costId])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}
