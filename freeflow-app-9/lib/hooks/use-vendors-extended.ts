'use client'

/**
 * Extended Vendors Hooks
 * Tables: vendors, vendor_contracts, vendor_payments, vendor_products
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVendor(vendorId?: string) {
  const [vendor, setVendor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vendors').select('*').eq('id', vendorId).single(); setVendor(data) } finally { setIsLoading(false) }
  }, [vendorId])
  useEffect(() => { loadData() }, [loadData])
  return { vendor, isLoading, refresh: loadData }
}

export function useVendors(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vendors').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setVendors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { vendors, isLoading, refresh: loadData }
}

export function useVendorContracts(vendorId?: string) {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vendor_contracts').select('*').eq('vendor_id', vendorId).order('start_date', { ascending: false }); setContracts(data || []) } finally { setIsLoading(false) }
  }, [vendorId])
  useEffect(() => { loadData() }, [loadData])
  return { contracts, isLoading, refresh: loadData }
}

export function useVendorPayments(vendorId?: string, options?: { date_from?: string; date_to?: string }) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('vendor_payments').select('*').eq('vendor_id', vendorId)
      if (options?.date_from) query = query.gte('payment_date', options.date_from)
      if (options?.date_to) query = query.lte('payment_date', options.date_to)
      const { data } = await query.order('payment_date', { ascending: false })
      setPayments(data || [])
    } finally { setIsLoading(false) }
  }, [vendorId, options?.date_from, options?.date_to])
  useEffect(() => { loadData() }, [loadData])
  return { payments, isLoading, refresh: loadData }
}

export function useVendorProducts(vendorId?: string) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vendor_products').select('*').eq('vendor_id', vendorId).order('name', { ascending: true }); setProducts(data || []) } finally { setIsLoading(false) }
  }, [vendorId])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useActiveVendors(options?: { type?: string; limit?: number }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vendors').select('*').eq('status', 'active')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setVendors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { vendors, isLoading, refresh: loadData }
}

export function useTopVendors(options?: { limit?: number }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('vendors').select('*').eq('status', 'active').order('rating', { ascending: false }).limit(options?.limit || 10); setVendors(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { vendors, isLoading, refresh: loadData }
}
