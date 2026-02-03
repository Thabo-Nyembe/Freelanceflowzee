'use client'

/**
 * Extended Digital Hooks
 * Tables: digital_assets, digital_downloads, digital_licenses, digital_products
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDigitalAsset(assetId?: string) {
  const [asset, setAsset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('digital_assets').select('*, digital_licenses(*)').eq('id', assetId).single(); setAsset(data) } finally { setIsLoading(false) }
  }, [assetId])
  useEffect(() => { loadData() }, [loadData])
  return { asset, isLoading, refresh: loadData }
}

export function useDigitalAssets(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('digital_assets').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAssets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { assets, isLoading, refresh: loadData }
}

export function useDownloadHistory(assetId?: string, options?: { limit?: number }) {
  const [downloads, setDownloads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('digital_downloads').select('*').eq('asset_id', assetId).order('downloaded_at', { ascending: false }).limit(options?.limit || 100); setDownloads(data || []) } finally { setIsLoading(false) }
  }, [assetId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { downloads, isLoading, refresh: loadData }
}

export function useUserDownloads(userId?: string, options?: { limit?: number }) {
  const [downloads, setDownloads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('digital_downloads').select('*, digital_assets(*)').eq('user_id', userId).order('downloaded_at', { ascending: false }).limit(options?.limit || 50); setDownloads(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { downloads, isLoading, refresh: loadData }
}

export function useDigitalLicenses(userId?: string, options?: { status?: string }) {
  const [licenses, setLicenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('digital_licenses').select('*, digital_assets(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setLicenses(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { licenses, isLoading, refresh: loadData }
}

export function useDigitalProducts(options?: { category?: string; is_active?: boolean; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('digital_products').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProducts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useAssetLicense(assetId?: string, userId?: string) {
  const [license, setLicense] = useState<any>(null)
  const [hasLicense, setHasLicense] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!assetId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('digital_licenses').select('*').eq('asset_id', assetId).eq('user_id', userId).eq('status', 'active').single(); setLicense(data); setHasLicense(!!data) } finally { setIsLoading(false) }
  }, [assetId, userId])
  useEffect(() => { loadData() }, [loadData])
  return { license, hasLicense, isLoading, refresh: loadData }
}

export function useDigitalAssetStats(userId?: string) {
  const [stats, setStats] = useState<{ totalAssets: number; totalDownloads: number; totalLicenses: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assets } = await supabase.from('digital_assets').select('type, download_count').eq('user_id', userId)
      const { count: licenses } = await supabase.from('digital_licenses').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      const totalAssets = assets?.length || 0
      const totalDownloads = assets?.reduce((sum, a) => sum + (a.download_count || 0), 0) || 0
      const byType = assets?.reduce((acc: Record<string, number>, a) => { if (a.type) acc[a.type] = (acc[a.type] || 0) + 1; return acc }, {}) || {}
      setStats({ totalAssets, totalDownloads, totalLicenses: licenses || 0, byType })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
