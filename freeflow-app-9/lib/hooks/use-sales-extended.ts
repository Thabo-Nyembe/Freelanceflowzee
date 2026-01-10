'use client'

/**
 * Extended Sales Hooks
 * Tables: sales, sales_orders, sales_targets, sales_pipeline
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSale(saleId?: string) {
  const [sale, setSale] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!saleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sales').select('*').eq('id', saleId).single(); setSale(data) } finally { setIsLoading(false) }
  }, [saleId])
  useEffect(() => { fetch() }, [fetch])
  return { sale, isLoading, refresh: fetch }
}

export function useSales(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  const [sales, setSales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sales').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSales(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.client_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sales, isLoading, refresh: fetch }
}

export function useSalesOrders(options?: { user_id?: string; status?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sales_orders').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useSalesTargets(options?: { user_id?: string; period?: string; year?: number }) {
  const [targets, setTargets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sales_targets').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.period) query = query.eq('period', options.period)
      if (options?.year) query = query.eq('year', options.year)
      const { data } = await query.order('created_at', { ascending: false })
      setTargets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.period, options?.year, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { targets, isLoading, refresh: fetch }
}

export function useSalesPipeline(options?: { user_id?: string; stage?: string }) {
  const [pipeline, setPipeline] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sales_pipeline').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.stage) query = query.eq('stage', options.stage)
      const { data } = await query.order('value', { ascending: false })
      setPipeline(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.stage, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { pipeline, isLoading, refresh: fetch }
}
