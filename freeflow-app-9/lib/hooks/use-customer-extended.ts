'use client'

/**
 * Extended Customer Hooks - Covers all Customer-related tables
 * Tables: customers, customer_segments, customer_notes, customer_activities
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCustomer(customerId?: string) {
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customers').select('*, customer_notes(*), customer_activities(*)').eq('id', customerId).single()
      setCustomer(data)
    } finally { setIsLoading(false) }
  }, [customerId])
  useEffect(() => { fetch() }, [fetch])
  return { customer, isLoading, refresh: fetch }
}

export function useCustomers(userId?: string, options?: { status?: string; segment_id?: string; tag?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('customers').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.segment_id) query = query.eq('segment_id', options.segment_id)
      if (options?.tag) query = query.contains('tags', [options.tag])
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.segment_id, options?.tag, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCustomerSearch(userId: string, searchTerm: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customers').select('*').eq('user_id', userId).or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`).limit(20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [userId, searchTerm, supabase])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}

export function useCustomerNotes(customerId?: string, options?: { limit?: number }) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNotes(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useCustomerActivities(customerId?: string, options?: { activity_type?: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('customer_activities').select('*').eq('customer_id', customerId)
      if (options?.activity_type) query = query.eq('activity_type', options.activity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setActivities(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.activity_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { activities, isLoading, refresh: fetch }
}

export function useCustomerSegments(userId?: string) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customer_segments').select('*').eq('user_id', userId).order('name', { ascending: true })
      setSegments(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useCustomerSegment(segmentId?: string) {
  const [segment, setSegment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!segmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customer_segments').select('*').eq('id', segmentId).single()
      setSegment(data)
    } finally { setIsLoading(false) }
  }, [segmentId])
  useEffect(() => { fetch() }, [fetch])
  return { segment, isLoading, refresh: fetch }
}

export function useCustomerStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; totalLifetimeValue: number; totalOrders: number; avgLifetimeValue: number; newThisMonth: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: customers } = await supabase.from('customers').select('status, lifetime_value, total_orders, created_at').eq('user_id', userId)
      if (!customers) { setStats(null); return }
      const total = customers.length
      const active = customers.filter(c => c.status === 'active').length
      const inactive = customers.filter(c => c.status === 'inactive').length
      const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0)
      const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0)
      const avgLifetimeValue = total > 0 ? totalLifetimeValue / total : 0
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const newThisMonth = customers.filter(c => new Date(c.created_at) >= thisMonth).length
      setStats({ total, active, inactive, totalLifetimeValue, totalOrders, avgLifetimeValue, newThisMonth })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTopCustomers(userId?: string, options?: { by?: 'lifetime_value' | 'total_orders'; limit?: number }) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const orderBy = options?.by || 'lifetime_value'
      const { data } = await supabase.from('customers').select('*').eq('user_id', userId).eq('status', 'active').order(orderBy, { ascending: false }).limit(options?.limit || 10)
      setCustomers(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.by, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}

export function useRecentCustomers(userId?: string, options?: { limit?: number }) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 10)
      setCustomers(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}

export function useCustomersBySegment(userId?: string) {
  const [bySegment, setBySegment] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [customersRes, segmentsRes] = await Promise.all([
        supabase.from('customers').select('segment_id').eq('user_id', userId),
        supabase.from('customer_segments').select('id, name').eq('user_id', userId)
      ])
      const customers = customersRes.data || []
      const segments = segmentsRes.data || []
      const segmentMap = segments.reduce((acc: Record<string, string>, s) => { acc[s.id] = s.name; return acc }, {})
      const counts = customers.reduce((acc: Record<string, number>, c) => {
        const segmentName = c.segment_id ? segmentMap[c.segment_id] || 'Unknown' : 'Unsegmented'
        acc[segmentName] = (acc[segmentName] || 0) + 1
        return acc
      }, {})
      setBySegment(counts)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { bySegment, isLoading, refresh: fetch }
}
