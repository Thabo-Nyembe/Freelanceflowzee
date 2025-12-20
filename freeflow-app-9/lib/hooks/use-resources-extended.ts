'use client'

/**
 * Extended Resources Hooks
 * Tables: resources, resource_types, resource_allocations, resource_availability, resource_bookings, resource_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useResource(resourceId?: string) {
  const [resource, setResource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('resources').select('*, resource_types(*), resource_allocations(*), resource_availability(*), users(*)').eq('id', resourceId).single(); setResource(data) } finally { setIsLoading(false) }
  }, [resourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resource, isLoading, refresh: fetch }
}

export function useResources(options?: { type_id?: string; category?: string; status?: string; location?: string; owner_id?: string; organization_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('resources').select('*, resource_types(*), users(*)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.location) query = query.eq('location', options.location)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.category, options?.status, options?.location, options?.owner_id, options?.organization_id, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}

export function useResourceTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('resource_types').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useResourceAllocations(resourceId?: string, options?: { status?: string; limit?: number }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('resource_allocations').select('*, users(*)').eq('resource_id', resourceId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAllocations(data || [])
    } finally { setIsLoading(false) }
  }, [resourceId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useResourceAvailability(resourceId?: string, options?: { from_date?: string; to_date?: string }) {
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('resource_availability').select('*').eq('resource_id', resourceId)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: true })
      setAvailability(data || [])
    } finally { setIsLoading(false) }
  }, [resourceId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { availability, isLoading, refresh: fetch }
}

export function useResourceUsage(resourceId?: string, options?: { from_date?: string; to_date?: string; user_id?: string; limit?: number }) {
  const [usage, setUsage] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('resource_usage').select('*, users(*)').eq('resource_id', resourceId)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('start_time', options.to_date)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('start_time', { ascending: false }).limit(options?.limit || 100)
      setUsage(data || [])
    } finally { setIsLoading(false) }
  }, [resourceId, options?.from_date, options?.to_date, options?.user_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useAvailableResources(options?: { type_id?: string; category?: string }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('resources').select('*, resource_types(*)').eq('status', 'available').eq('is_active', true)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.category, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}

export function useResourceStats(options?: { organization_id?: string }) {
  const [stats, setStats] = useState<{ total: number; available: number; allocated: number; maintenance: number; byCategory: { [key: string]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('resources').select('status, category')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query
      const resources = data || []
      const total = resources.length
      const available = resources.filter(r => r.status === 'available').length
      const allocated = resources.filter(r => r.status === 'allocated').length
      const maintenance = resources.filter(r => r.status === 'maintenance').length
      const byCategory: { [key: string]: number } = {}
      resources.forEach(r => { byCategory[r.category || 'other'] = (byCategory[r.category || 'other'] || 0) + 1 })
      setStats({ total, available, allocated, maintenance, byCategory })
    } finally { setIsLoading(false) }
  }, [options?.organization_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useMyAllocatedResources(userId?: string, options?: { status?: string; limit?: number }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('resource_allocations').select('*, resources(*, resource_types(*))').eq('allocated_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}
