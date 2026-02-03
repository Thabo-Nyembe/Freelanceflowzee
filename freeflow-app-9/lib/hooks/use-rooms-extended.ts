'use client'

/**
 * Extended Rooms Hooks
 * Tables: rooms, room_bookings, room_amenities, room_types, room_rates, room_availability
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoom(roomId?: string) {
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rooms').select('*, room_types(*), room_amenities(*), room_rates(*), room_availability(*)').eq('id', roomId).single(); setRoom(data) } finally { setIsLoading(false) }
  }, [roomId])
  useEffect(() => { loadData() }, [loadData])
  return { room, isLoading, refresh: loadData }
}

export function useRooms(options?: { type_id?: string; location_id?: string; building?: string; floor?: number; min_capacity?: number; is_available?: boolean; search?: string; limit?: number }) {
  const [rooms, setRooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rooms').select('*, room_types(*), room_amenities(count), room_bookings(count)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      if (options?.building) query = query.eq('building', options.building)
      if (options?.floor) query = query.eq('floor', options.floor)
      if (options?.min_capacity) query = query.gte('capacity', options.min_capacity)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setRooms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.location_id, options?.building, options?.floor, options?.min_capacity, options?.is_available, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { rooms, isLoading, refresh: loadData }
}

export function useRoomTypes(options?: { is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('room_types').select('*, rooms(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useRoomBookings(roomId?: string, options?: { from_date?: string; to_date?: string; status?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('room_bookings').select('*, users(*)').eq('room_id', roomId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [roomId, options?.from_date, options?.to_date, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { bookings, isLoading, refresh: loadData }
}

export function useMyRoomBookings(userId?: string, options?: { status?: string; upcoming_only?: boolean; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('room_bookings').select('*, rooms(*, room_types(*))').eq('booked_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.upcoming_only) query = query.gte('start_time', new Date().toISOString())
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.upcoming_only, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { bookings, isLoading, refresh: loadData }
}

export function useRoomAvailability(roomId?: string, startTime?: string, endTime?: string) {
  const [availability, setAvailability] = useState<{ available: boolean; conflicts: any[] }>({ available: true, conflicts: [] })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roomId || !startTime || !endTime) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: conflicts } = await supabase.from('room_bookings').select('id, title, start_time, end_time').eq('room_id', roomId).neq('status', 'cancelled').or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)
      setAvailability({ available: !conflicts || conflicts.length === 0, conflicts: conflicts || [] })
    } finally { setIsLoading(false) }
  }, [roomId, startTime, endTime])
  useEffect(() => { loadData() }, [loadData])
  return { availability, isLoading, refresh: loadData }
}

export function useAvailableRooms(startTime?: string, endTime?: string, options?: { type_id?: string; min_capacity?: number; location_id?: string }) {
  const [rooms, setRooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!startTime || !endTime) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('rooms').select('*, room_types(*)').eq('is_available', true)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.min_capacity) query = query.gte('capacity', options.min_capacity)
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      const { data: allRooms } = await query.order('name', { ascending: true })
      if (!allRooms) { setRooms([]); return }
      const { data: bookings } = await supabase.from('room_bookings').select('room_id').neq('status', 'cancelled').or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)
      const bookedRoomIds = new Set(bookings?.map(b => b.room_id) || [])
      setRooms(allRooms.filter(r => !bookedRoomIds.has(r.id)))
    } finally { setIsLoading(false) }
  }, [startTime, endTime, options?.type_id, options?.min_capacity, options?.location_id])
  useEffect(() => { loadData() }, [loadData])
  return { rooms, isLoading, refresh: loadData }
}

export function useRoomAmenities(roomId?: string) {
  const [amenities, setAmenities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('room_amenities').select('*, amenities(*)').eq('room_id', roomId); setAmenities(data || []) } finally { setIsLoading(false) }
  }, [roomId])
  useEffect(() => { loadData() }, [loadData])
  return { amenities, isLoading, refresh: loadData }
}

export function useRoomRates(roomId?: string, effectiveDate?: string) {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roomId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('room_rates').select('*').eq('room_id', roomId)
      if (effectiveDate) {
        query = query.lte('effective_from', effectiveDate).or(`effective_until.is.null,effective_until.gte.${effectiveDate}`)
      }
      const { data } = await query.order('effective_from', { ascending: false })
      setRates(data || [])
    } finally { setIsLoading(false) }
  }, [roomId, effectiveDate])
  useEffect(() => { loadData() }, [loadData])
  return { rates, isLoading, refresh: loadData }
}

export function useRoomStats() {
  const [stats, setStats] = useState<{ total: number; available: number; types: number; todayBookings: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [total, available, types, todayBookings] = await Promise.all([
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('is_available', true),
        supabase.from('room_types').select('*', { count: 'exact', head: true }),
        supabase.from('room_bookings').select('*', { count: 'exact', head: true }).gte('start_time', today).lt('start_time', today + 'T23:59:59')
      ])
      setStats({ total: total.count || 0, available: available.count || 0, types: types.count || 0, todayBookings: todayBookings.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

