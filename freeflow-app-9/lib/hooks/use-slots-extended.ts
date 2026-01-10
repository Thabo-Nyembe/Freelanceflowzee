'use client'

/**
 * Extended Slots Hooks
 * Tables: slots, slot_bookings, slot_availability, slot_templates, slot_rules, slot_blocks
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSlot(slotId?: string) {
  const [slot, setSlot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slotId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('slots').select('*, slot_bookings(*), slot_templates(*), slot_rules(*)').eq('id', slotId).single(); setSlot(data) } finally { setIsLoading(false) }
  }, [slotId])
  useEffect(() => { fetch() }, [fetch])
  return { slot, isLoading, refresh: fetch }
}

export function useSlots(options?: { entity_type?: string; entity_id?: string; from_date?: string; to_date?: string; is_available?: boolean; has_capacity?: boolean; limit?: number }) {
  const [slots, setSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('slots').select('*, slot_bookings(count)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      if (options?.has_capacity) query = query.or('capacity.is.null,booked_count.lt.capacity')
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100)
      setSlots(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.from_date, options?.to_date, options?.is_available, options?.has_capacity, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useSlotBookings(slotId?: string, options?: { status?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slotId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('slot_bookings').select('*, users(*)').eq('slot_id', slotId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('booked_at', { ascending: false }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [slotId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useUserSlotBookings(userId?: string, options?: { status?: string; from_date?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('slot_bookings').select('*, slots(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('booked_at', { ascending: false }).limit(options?.limit || 50)
      let bookings = data || []
      if (options?.from_date) {
        bookings = bookings.filter(b => b.slots?.start_time >= options.from_date)
      }
      setBookings(bookings)
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.from_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useAvailableSlots(entityType?: string, entityId?: string, date?: string) {
  const [slots, setSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('slots').select('*').eq('entity_type', entityType).eq('entity_id', entityId).eq('is_available', true).gte('start_time', date).lt('start_time', date + 'T23:59:59').or('capacity.is.null,booked_count.lt.capacity').order('start_time', { ascending: true })
      setSlots(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useSlotTemplates(options?: { entity_type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('slot_templates').select('*')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useSlotBlocks(entityType?: string, entityId?: string, options?: { from_date?: string; to_date?: string }) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('slot_blocks').select('*').eq('entity_type', entityType).eq('entity_id', entityId)
      if (options?.from_date) query = query.gte('end_time', options.from_date)
      if (options?.to_date) query = query.lte('start_time', options.to_date)
      const { data } = await query.order('start_time', { ascending: true })
      setBlocks(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blocks, isLoading, refresh: fetch }
}

export function useSlotStats(entityType?: string, entityId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; available: number; booked: number; bookings: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('slots').select('is_available, booked_count, slot_bookings(count)').eq('entity_type', entityType).eq('entity_id', entityId)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      const { data } = await query
      const slots = data || []
      const total = slots.length
      const available = slots.filter(s => s.is_available).length
      const booked = slots.filter(s => s.booked_count > 0).length
      const bookings = slots.reduce((sum, s) => sum + (s.booked_count || 0), 0)
      setStats({ total, available, booked, bookings })
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

