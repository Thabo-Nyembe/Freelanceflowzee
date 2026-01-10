'use client'

/**
 * Extended Rentals Hooks
 * Tables: rentals, rental_items, rental_agreements, rental_payments, rental_returns, rental_inventory
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRental(rentalId?: string) {
  const [rental, setRental] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!rentalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rentals').select('*, rental_items(*), rental_agreements(*), rental_payments(*), users(*), customers(*)').eq('id', rentalId).single(); setRental(data) } finally { setIsLoading(false) }
  }, [rentalId])
  useEffect(() => { fetch() }, [fetch])
  return { rental, isLoading, refresh: fetch }
}

export function useRentals(options?: { customer_id?: string; user_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rentals').select('*, rental_items(count), customers(*), users(*)')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('start_date', options.from_date)
      if (options?.to_date) query = query.lte('end_date', options.to_date)
      if (options?.search) query = query.ilike('rental_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRentals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.user_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rentals, isLoading, refresh: fetch }
}

export function useActiveRentals(options?: { limit?: number }) {
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rentals').select('*, rental_items(*), customers(*)').eq('status', 'active').order('end_date', { ascending: true }).limit(options?.limit || 50)
      setRentals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { rentals, isLoading, refresh: fetch }
}

export function useOverdueRentals(options?: { limit?: number }) {
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('rentals').select('*, rental_items(*), customers(*)').eq('status', 'active').lt('end_date', now).order('end_date', { ascending: true }).limit(options?.limit || 50)
      setRentals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { rentals, isLoading, refresh: fetch }
}

export function useRentalItems(rentalId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!rentalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rental_items').select('*, rental_inventory(*)').eq('rental_id', rentalId); setItems(data || []) } finally { setIsLoading(false) }
  }, [rentalId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useRentalPayments(rentalId?: string) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!rentalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rental_payments').select('*').eq('rental_id', rentalId).order('created_at', { ascending: false }); setPayments(data || []) } finally { setIsLoading(false) }
  }, [rentalId])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}

export function useRentalInventory(options?: { category?: string; is_available?: boolean; search?: string; limit?: number }) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rental_inventory').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setInventory(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_available, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { inventory, isLoading, refresh: fetch }
}

export function useRentalStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; active: number; completed: number; cancelled: number; totalRevenue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rentals').select('status, total_amount')
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const rentals = data || []
      const total = rentals.length
      const active = rentals.filter(r => r.status === 'active').length
      const completed = rentals.filter(r => r.status === 'completed').length
      const cancelled = rentals.filter(r => r.status === 'cancelled').length
      const totalRevenue = rentals.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.total_amount || 0), 0)
      setStats({ total, active, completed, cancelled, totalRevenue })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCustomerRentals(customerId?: string, options?: { status?: string; limit?: number }) {
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('rentals').select('*, rental_items(count)').eq('customer_id', customerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setRentals(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rentals, isLoading, refresh: fetch }
}

export function useUpcomingReturns(options?: { days?: number; limit?: number }) {
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.days || 7) * 24 * 60 * 60 * 1000)
      const { data } = await supabase.from('rentals').select('*, rental_items(*), customers(*)').eq('status', 'active').gte('end_date', now.toISOString()).lte('end_date', futureDate.toISOString()).order('end_date', { ascending: true }).limit(options?.limit || 20)
      setRentals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.days, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rentals, isLoading, refresh: fetch }
}
