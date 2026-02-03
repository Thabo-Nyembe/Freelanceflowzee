'use client'

/**
 * Extended Purchases Hooks
 * Tables: purchases, purchase_items, purchase_orders, purchase_invoices, purchase_receipts, purchase_returns, purchase_vendors
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePurchase(purchaseId?: string) {
  const [purchase, setPurchase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!purchaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('purchases').select('*, purchase_items(*), purchase_orders(*), purchase_invoices(*), purchase_receipts(*), purchase_vendors(*)').eq('id', purchaseId).single(); setPurchase(data) } finally { setIsLoading(false) }
  }, [purchaseId])
  useEffect(() => { loadData() }, [loadData])
  return { purchase, isLoading, refresh: loadData }
}

export function usePurchases(options?: { vendor_id?: string; organization_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchases').select('*, purchase_vendors(*), purchase_items(count)')
      if (options?.vendor_id) query = query.eq('vendor_id', options.vendor_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      if (options?.search) query = query.ilike('reference_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPurchases(data || [])
    } finally { setIsLoading(false) }
  }, [options?.vendor_id, options?.organization_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { purchases, isLoading, refresh: loadData }
}

export function usePurchaseItems(purchaseId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!purchaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('purchase_items').select('*, products(*)').eq('purchase_id', purchaseId).order('order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [purchaseId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function usePurchaseOrders(options?: { vendor_id?: string; status?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchase_orders').select('*, purchases(*), purchase_vendors(*)')
      if (options?.vendor_id) query = query.eq('vendor_id', options.vendor_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.vendor_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { orders, isLoading, refresh: loadData }
}

export function usePurchaseInvoices(options?: { purchase_id?: string; vendor_id?: string; status?: string; limit?: number }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchase_invoices').select('*, purchases(*)')
      if (options?.purchase_id) query = query.eq('purchase_id', options.purchase_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInvoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.purchase_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { invoices, isLoading, refresh: loadData }
}

export function usePurchaseReceipts(purchaseId?: string) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!purchaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('purchase_receipts').select('*, users(*)').eq('purchase_id', purchaseId).order('received_at', { ascending: false }); setReceipts(data || []) } finally { setIsLoading(false) }
  }, [purchaseId])
  useEffect(() => { loadData() }, [loadData])
  return { receipts, isLoading, refresh: loadData }
}

export function usePurchaseReturns(options?: { purchase_id?: string; vendor_id?: string; status?: string; limit?: number }) {
  const [returns, setReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchase_returns').select('*, purchases(*)')
      if (options?.purchase_id) query = query.eq('purchase_id', options.purchase_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReturns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.purchase_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { returns, isLoading, refresh: loadData }
}

export function usePurchaseVendors(options?: { is_active?: boolean; search?: string; limit?: number }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchase_vendors').select('*, purchases(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setVendors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { vendors, isLoading, refresh: loadData }
}

export function useVendor(vendorId?: string) {
  const [vendor, setVendor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('purchase_vendors').select('*, purchases(count)').eq('id', vendorId).single(); setVendor(data) } finally { setIsLoading(false) }
  }, [vendorId])
  useEffect(() => { loadData() }, [loadData])
  return { vendor, isLoading, refresh: loadData }
}

export function usePendingPurchases(options?: { organization_id?: string; limit?: number }) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchases').select('*, purchase_vendors(*), purchase_items(count)').in('status', ['draft', 'pending', 'approved'])
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPurchases(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { purchases, isLoading, refresh: loadData }
}

export function useOverdueInvoices(options?: { organization_id?: string; limit?: number }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const query = supabase.from('purchase_invoices').select('*, purchases(*, purchase_vendors(*))').eq('status', 'unpaid').lt('due_date', now)
      const { data } = await query.order('due_date', { ascending: true }).limit(options?.limit || 50)
      setInvoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { invoices, isLoading, refresh: loadData }
}

export function usePurchaseStats(options?: { organization_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ totalPurchases: number; totalSpent: number; pendingAmount: number; vendorCount: number; averageOrderValue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('purchases').select('total, status, vendor_id')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const purchases = data || []
      const totalPurchases = purchases.length
      const totalSpent = purchases.filter(p => p.status === 'received' || p.status === 'completed').reduce((sum, p) => sum + (p.total || 0), 0)
      const pendingAmount = purchases.filter(p => p.status === 'ordered' || p.status === 'approved').reduce((sum, p) => sum + (p.total || 0), 0)
      const vendorCount = new Set(purchases.map(p => p.vendor_id)).size
      const averageOrderValue = totalPurchases > 0 ? Math.round(purchases.reduce((sum, p) => sum + (p.total || 0), 0) / totalPurchases) : 0
      setStats({ totalPurchases, totalSpent, pendingAmount, vendorCount, averageOrderValue })
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useVendorPurchases(vendorId?: string, options?: { status?: string; limit?: number }) {
  const [purchases, setPurchases] = useState<any[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!vendorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('purchases').select('*, purchase_items(count)').eq('vendor_id', vendorId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPurchases(data || [])
      setTotalSpent(data?.reduce((sum, p) => sum + (p.total || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [vendorId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { purchases, totalSpent, isLoading, refresh: loadData }
}
