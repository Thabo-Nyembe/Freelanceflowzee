'use client'

/**
 * Extended Products Hooks
 * Tables: products, product_variants, product_categories, product_images, product_reviews, product_inventory, product_pricing, product_attributes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProduct(productId?: string) {
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('products').select('*, product_variants(*), product_categories(*), product_images(*), product_reviews(count), product_inventory(*), product_pricing(*), product_attributes(*)').eq('id', productId).single(); setProduct(data) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { product, isLoading, refresh: loadData }
}

export function useProductBySlug(slug?: string) {
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('products').select('*, product_variants(*), product_categories(*), product_images(*), product_reviews(count), product_pricing(*)').eq('slug', slug).eq('is_active', true).single(); setProduct(data) } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { loadData() }, [loadData])
  return { product, isLoading, refresh: loadData }
}

export function useProducts(options?: { category_id?: string; organization_id?: string; is_active?: boolean; is_featured?: boolean; min_price?: number; max_price?: number; search?: string; sort_by?: string; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('products').select('*, product_images(*), product_variants(*), product_reviews(count), product_inventory(*)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured)
      if (options?.min_price) query = query.gte('price', options.min_price)
      if (options?.max_price) query = query.lte('price', options.max_price)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      let orderBy = 'created_at'; let ascending = false
      if (options?.sort_by === 'price_asc') { orderBy = 'price'; ascending = true }
      else if (options?.sort_by === 'price_desc') { orderBy = 'price'; ascending = false }
      else if (options?.sort_by === 'name') { orderBy = 'name'; ascending = true }
      const { data } = await query.order(orderBy, { ascending }).limit(options?.limit || 50)
      setProducts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.organization_id, options?.is_active, options?.is_featured, options?.min_price, options?.max_price, options?.search, options?.sort_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useProductVariants(productId?: string) {
  const [variants, setVariants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('product_variants').select('*').eq('product_id', productId).eq('is_active', true).order('name', { ascending: true }); setVariants(data || []) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { variants, isLoading, refresh: loadData }
}

export function useProductImages(productId?: string) {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('order', { ascending: true }); setImages(data || []) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { images, isLoading, refresh: loadData }
}

export function useProductReviews(productId?: string, options?: { is_approved?: boolean; sort_by?: string; limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('product_reviews').select('*, users(*)').eq('product_id', productId)
      if (options?.is_approved !== undefined) query = query.eq('is_approved', options.is_approved)
      let orderBy = 'created_at'
      if (options?.sort_by === 'helpful') orderBy = 'helpful_count'
      const { data } = await query.order(orderBy, { ascending: false }).limit(options?.limit || 50)
      setReviews(data || [])
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
        setAverageRating(Math.round(avg * 10) / 10)
      }
    } finally { setIsLoading(false) }
  }, [productId, options?.is_approved, options?.sort_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { reviews, averageRating, isLoading, refresh: loadData }
}

export function useProductInventory(productId?: string) {
  const [inventory, setInventory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('product_inventory').select('*').eq('product_id', productId).single(); setInventory(data) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { inventory, isLoading, refresh: loadData }
}

export function useProductCategories(options?: { parent_id?: string; is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('product_categories').select('*, products(count)')
      if (options?.parent_id) { query = query.eq('parent_id', options.parent_id) } else { query = query.is('parent_id', null) }
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useFeaturedProducts(options?: { category_id?: string; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('products').select('*, product_images(*), product_reviews(count)').eq('is_active', true).eq('is_featured', true)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setProducts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useProductSearch(searchTerm?: string, options?: { category_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('products').select('*, product_images(*)').eq('is_active', true).or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.category_id, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useProductAttributes(productId?: string) {
  const [attributes, setAttributes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('product_attributes').select('*').eq('product_id', productId).order('name', { ascending: true }); setAttributes(data || []) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { loadData() }, [loadData])
  return { attributes, isLoading, refresh: loadData }
}

export function useLowStockProducts(options?: { threshold?: number; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const threshold = options?.threshold || 10
      const { data } = await supabase.from('product_inventory').select('*, products(*)').lt('quantity', threshold).order('quantity', { ascending: true }).limit(options?.limit || 50)
      setProducts(data?.map(i => ({ ...i.products, inventory: i })) || [])
    } finally { setIsLoading(false) }
  }, [options?.threshold, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}
