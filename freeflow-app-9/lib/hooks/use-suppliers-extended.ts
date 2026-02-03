'use client'

/**
 * Extended Suppliers Hooks
 * Tables: suppliers, supplier_contacts, supplier_products, supplier_orders, supplier_ratings, supplier_documents
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSupplier(supplierId?: string) {
  const [supplier, setSupplier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('suppliers').select('*, supplier_contacts(*), supplier_products(count), supplier_ratings(*)').eq('id', supplierId).single(); setSupplier(data) } finally { setIsLoading(false) }
  }, [supplierId])
  useEffect(() => { loadData() }, [loadData])
  return { supplier, isLoading, refresh: loadData }
}

export function useSuppliers(options?: { category?: string; is_active?: boolean; min_rating?: number; search?: string; limit?: number }) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('suppliers').select('*, supplier_contacts(*), supplier_products(count)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      let result = data || []
      if (options?.min_rating) {
        result = result.filter(s => (s.average_rating || 0) >= options.min_rating!)
      }
      setSuppliers(result)
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, options?.min_rating, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { suppliers, isLoading, refresh: loadData }
}

export function useSupplierContacts(supplierId?: string) {
  const [contacts, setContacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('supplier_contacts').select('*').eq('supplier_id', supplierId).order('is_primary', { ascending: false }); setContacts(data || []) } finally { setIsLoading(false) }
  }, [supplierId])
  useEffect(() => { loadData() }, [loadData])
  return { contacts, isLoading, refresh: loadData }
}

export function useSupplierProducts(supplierId?: string, options?: { is_preferred?: boolean }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('supplier_products').select('*, products(*)').eq('supplier_id', supplierId)
      if (options?.is_preferred !== undefined) query = query.eq('is_preferred', options.is_preferred)
      const { data } = await query.order('created_at', { ascending: false })
      setProducts(data || [])
    } finally { setIsLoading(false) }
  }, [supplierId, options?.is_preferred])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useSupplierOrders(supplierId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('supplier_orders').select('*').eq('supplier_id', supplierId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('ordered_at', options.from_date)
      if (options?.to_date) query = query.lte('ordered_at', options.to_date)
      const { data } = await query.order('ordered_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [supplierId, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { orders, isLoading, refresh: loadData }
}

export function useSupplierRatings(supplierId?: string, options?: { category?: string; limit?: number }) {
  const [ratings, setRatings] = useState<any[]>([])
  const [average, setAverage] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('supplier_ratings').select('*, users(*)').eq('supplier_id', supplierId)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('rated_at', { ascending: false }).limit(options?.limit || 50)
      const ratingList = data || []
      setRatings(ratingList)
      if (ratingList.length > 0) {
        setAverage(ratingList.reduce((sum, r) => sum + r.rating, 0) / ratingList.length)
      }
    } finally { setIsLoading(false) }
  }, [supplierId, options?.category, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { ratings, average, isLoading, refresh: loadData }
}

export function useSupplierDocuments(supplierId?: string, options?: { document_type?: string }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!supplierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('supplier_documents').select('*').eq('supplier_id', supplierId)
      if (options?.document_type) query = query.eq('document_type', options.document_type)
      const { data } = await query.order('uploaded_at', { ascending: false })
      setDocuments(data || [])
    } finally { setIsLoading(false) }
  }, [supplierId, options?.document_type])
  useEffect(() => { loadData() }, [loadData])
  return { documents, isLoading, refresh: loadData }
}

export function useProductSuppliers(productId?: string) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('supplier_products').select('*, suppliers(*)').eq('product_id', productId).order('is_preferred', { ascending: false })
      setSuppliers((data || []).map(sp => ({ ...sp.suppliers, supplierProduct: sp })))
    } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { suppliers, isLoading, refresh: loadData }
}

export function useSupplierCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('suppliers').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function usePendingOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('supplier_orders').select('*, suppliers(*)').in('status', ['pending', 'confirmed', 'shipped']).order('expected_delivery', { ascending: true })
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { orders, isLoading, refresh: loadData }
}

