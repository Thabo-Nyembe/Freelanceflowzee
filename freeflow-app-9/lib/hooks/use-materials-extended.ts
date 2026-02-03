'use client'

/**
 * Extended Materials Hooks
 * Tables: materials, material_categories, material_inventory, material_suppliers, material_orders, material_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMaterial(materialId?: string) {
  const [material, setMaterial] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!materialId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('materials').select('*, material_categories(*), material_inventory(*), material_suppliers(*)').eq('id', materialId).single(); setMaterial(data) } finally { setIsLoading(false) }
  }, [materialId])
  useEffect(() => { loadData() }, [loadData])
  return { material, isLoading, refresh: loadData }
}

export function useMaterials(options?: { category_id?: string; status?: string; organization_id?: string; search?: string; limit?: number }) {
  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('materials').select('*, material_categories(*), material_inventory(*)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setMaterials(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.status, options?.organization_id, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { materials, isLoading, refresh: loadData }
}

export function useMaterialCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('material_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useMaterialInventory(materialId?: string) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!materialId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('material_inventory').select('*').eq('material_id', materialId); setInventory(data || []) } finally { setIsLoading(false) }
  }, [materialId])
  useEffect(() => { loadData() }, [loadData])
  return { inventory, isLoading, refresh: loadData }
}

export function useMaterialSuppliers(options?: { status?: string }) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('material_suppliers').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setSuppliers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { suppliers, isLoading, refresh: loadData }
}

export function useMaterialOrders(options?: { supplier_id?: string; status?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('material_orders').select('*, material_suppliers(*)')
      if (options?.supplier_id) query = query.eq('supplier_id', options.supplier_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.supplier_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { orders, isLoading, refresh: loadData }
}

export function useMaterialUsage(materialId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [usage, setUsage] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!materialId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('material_usage').select('*').eq('material_id', materialId)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setUsage(data || [])
    } finally { setIsLoading(false) }
  }, [materialId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { usage, isLoading, refresh: loadData }
}

export function useLowStockMaterials(options?: { organization_id?: string }) {
  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('materials').select('*, material_inventory(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query
      const lowStock = data?.filter(m => {
        const totalQty = m.material_inventory?.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0) || 0
        return totalQty <= (m.min_stock || 0)
      }) || []
      setMaterials(lowStock)
    } finally { setIsLoading(false) }
  }, [options?.organization_id])
  useEffect(() => { loadData() }, [loadData])
  return { materials, isLoading, refresh: loadData }
}

export function useMaterialStats(organizationId?: string) {
  const [stats, setStats] = useState<{ totalMaterials: number; lowStock: number; totalValue: number; pendingOrders: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('materials').select('*, material_inventory(*)')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data: materials } = await query
      const { data: orders } = await supabase.from('material_orders').select('*').eq('status', 'pending')
      const totalMaterials = materials?.length || 0
      const lowStock = materials?.filter(m => {
        const qty = m.material_inventory?.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0) || 0
        return qty <= (m.min_stock || 0)
      }).length || 0
      const totalValue = materials?.reduce((sum, m) => {
        const qty = m.material_inventory?.reduce((s: number, inv: any) => s + (inv.quantity || 0), 0) || 0
        return sum + qty * (m.unit_cost || 0)
      }, 0) || 0
      setStats({ totalMaterials, lowStock, totalValue, pendingOrders: orders?.length || 0 })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
