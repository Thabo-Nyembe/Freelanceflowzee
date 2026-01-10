'use client'

/**
 * Extended Allocations Hooks
 * Tables: allocations, allocation_rules, allocation_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAllocation(allocationId?: string) {
  const [allocation, setAllocation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!allocationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('allocations').select('*').eq('id', allocationId).single(); setAllocation(data) } finally { setIsLoading(false) }
  }, [allocationId])
  useEffect(() => { fetch() }, [fetch])
  return { allocation, isLoading, refresh: fetch }
}

export function useAllocations(options?: { user_id?: string; resource_type?: string; resource_id?: string; allocated_to?: string; status?: string; limit?: number }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('allocations').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.resource_type) query = query.eq('resource_type', options.resource_type)
      if (options?.resource_id) query = query.eq('resource_id', options.resource_id)
      if (options?.allocated_to) query = query.eq('allocated_to', options.allocated_to)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAllocations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.resource_type, options?.resource_id, options?.allocated_to, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useResourceAllocations(resourceType?: string, resourceId?: string) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!resourceType || !resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('allocations').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).eq('status', 'active'); setAllocations(data || []) } finally { setIsLoading(false) }
  }, [resourceType, resourceId])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useUserAllocations(allocatedTo?: string, options?: { resource_type?: string; status?: string; limit?: number }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!allocatedTo) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('allocations').select('*').eq('allocated_to', allocatedTo)
      if (options?.resource_type) query = query.eq('resource_type', options.resource_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50)
      setAllocations(data || [])
    } finally { setIsLoading(false) }
  }, [allocatedTo, options?.resource_type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useActiveAllocations(userId?: string, options?: { resource_type?: string; limit?: number }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('allocations').select('*').eq('user_id', userId).eq('status', 'active')
      if (options?.resource_type) query = query.eq('resource_type', options.resource_type)
      const { data } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50)
      setAllocations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.resource_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useAllocationStats(userId?: string, options?: { resource_type?: string }) {
  const [stats, setStats] = useState<{ total: number; active: number; completed: number; totalQuantity: number; totalAmount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('allocations').select('status, quantity, amount').eq('user_id', userId)
      if (options?.resource_type) query = query.eq('resource_type', options.resource_type)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const active = data.filter(a => a.status === 'active').length
      const completed = data.filter(a => a.status === 'completed').length
      const totalQuantity = data.reduce((sum, a) => sum + (a.quantity || 0), 0)
      const totalAmount = data.reduce((sum, a) => sum + (a.amount || 0), 0)
      setStats({ total, active, completed, totalQuantity, totalAmount })
    } finally { setIsLoading(false) }
  }, [userId, options?.resource_type])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useAllocationsByResourceType(userId?: string) {
  const [byType, setByType] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('allocations').select('resource_type').eq('user_id', userId).eq('status', 'active')
      const counts = (data || []).reduce((acc: Record<string, number>, a) => { acc[a.resource_type || 'unknown'] = (acc[a.resource_type || 'unknown'] || 0) + 1; return acc }, {})
      setByType(counts)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { byType, isLoading, refresh: fetch }
}
