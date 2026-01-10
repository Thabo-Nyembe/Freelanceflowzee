'use client'

/**
 * Extended Reservations Hooks
 * Tables: reservations, reservation_items, reservation_slots, reservation_resources, reservation_rules, reservation_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReservation(reservationId?: string) {
  const [reservation, setReservation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reservationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reservations').select('*, reservation_items(*), reservation_resources(*), users(*), reservation_history(*)').eq('id', reservationId).single(); setReservation(data) } finally { setIsLoading(false) }
  }, [reservationId])
  useEffect(() => { fetch() }, [fetch])
  return { reservation, isLoading, refresh: fetch }
}

export function useReservations(options?: { resource_id?: string; user_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reservations').select('*, reservation_resources(*), users(*), reservation_items(count)')
      if (options?.resource_id) query = query.eq('resource_id', options.resource_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,confirmation_code.ilike.%${options.search}%`)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setReservations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.resource_id, options?.user_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reservations, isLoading, refresh: fetch }
}

export function useMyReservations(userId?: string, options?: { status?: string; upcoming_only?: boolean; limit?: number }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reservations').select('*, reservation_resources(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.upcoming_only) query = query.gte('start_time', new Date().toISOString())
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setReservations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.upcoming_only, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reservations, isLoading, refresh: fetch }
}

export function useReservationByCode(confirmationCode?: string) {
  const [reservation, setReservation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!confirmationCode) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reservations').select('*, reservation_resources(*), users(*), reservation_items(*)').eq('confirmation_code', confirmationCode.toUpperCase()).single(); setReservation(data) } finally { setIsLoading(false) }
  }, [confirmationCode])
  useEffect(() => { fetch() }, [fetch])
  return { reservation, isLoading, refresh: fetch }
}

export function useReservationResources(options?: { category?: string; is_available?: boolean; location?: string }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reservation_resources').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      if (options?.location) query = query.eq('location', options.location)
      const { data } = await query.order('name', { ascending: true })
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_available, options?.location, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}

export function useAvailableSlots(resourceId?: string, date?: string, options?: { duration?: number }) {
  const [slots, setSlots] = useState<{ start: string; end: string; available: boolean }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!resourceId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      const { data: reservations } = await supabase.from('reservations').select('start_time, end_time').eq('resource_id', resourceId).in('status', ['pending', 'confirmed', 'checked_in']).gte('start_time', startOfDay.toISOString()).lte('end_time', endOfDay.toISOString()).order('start_time', { ascending: true })
      const { data: resource } = await supabase.from('reservation_resources').select('operating_hours, slot_duration').eq('id', resourceId).single()
      const duration = options?.duration || resource?.slot_duration || 60
      const operatingHours = resource?.operating_hours || { start: '09:00', end: '17:00' }
      const [startHour, startMin] = operatingHours.start.split(':').map(Number)
      const [endHour, endMin] = operatingHours.end.split(':').map(Number)
      const generatedSlots: { start: string; end: string; available: boolean }[] = []
      let current = new Date(startOfDay)
      current.setHours(startHour, startMin, 0, 0)
      const dayEnd = new Date(startOfDay)
      dayEnd.setHours(endHour, endMin, 0, 0)
      while (current < dayEnd) {
        const slotEnd = new Date(current.getTime() + duration * 60000)
        const isBooked = reservations?.some(r => {
          const rStart = new Date(r.start_time)
          const rEnd = new Date(r.end_time)
          return current < rEnd && slotEnd > rStart
        })
        generatedSlots.push({ start: current.toISOString(), end: slotEnd.toISOString(), available: !isBooked })
        current = slotEnd
      }
      setSlots(generatedSlots)
    } finally { setIsLoading(false) }
  }, [resourceId, date, options?.duration, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useReservationHistory(reservationId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reservationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reservation_history').select('*, users(*)').eq('reservation_id', reservationId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [reservationId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useTodayReservations(resourceId?: string) {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      let query = supabase.from('reservations').select('*, reservation_resources(*), users(*)').gte('start_time', startOfDay).lt('end_time', endOfDay).in('status', ['pending', 'confirmed', 'checked_in'])
      if (resourceId) query = query.eq('resource_id', resourceId)
      const { data } = await query.order('start_time', { ascending: true })
      setReservations(data || [])
    } finally { setIsLoading(false) }
  }, [resourceId])
  useEffect(() => { fetch() }, [fetch])
  return { reservations, isLoading, refresh: fetch }
}

export function useUpcomingReservations(options?: { resource_id?: string; days?: number; limit?: number }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.days || 7) * 24 * 60 * 60 * 1000)
      let query = supabase.from('reservations').select('*, reservation_resources(*), users(*)').gte('start_time', now.toISOString()).lte('start_time', futureDate.toISOString()).in('status', ['pending', 'confirmed'])
      if (options?.resource_id) query = query.eq('resource_id', options.resource_id)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setReservations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.resource_id, options?.days, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reservations, isLoading, refresh: fetch }
}

export function useReservationStats(options?: { resource_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; pending: number; confirmed: number; completed: number; cancelled: number; totalGuests: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reservations').select('status, guests')
      if (options?.resource_id) query = query.eq('resource_id', options.resource_id)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      const { data } = await query
      const reservations = data || []
      const total = reservations.length
      const pending = reservations.filter(r => r.status === 'pending').length
      const confirmed = reservations.filter(r => r.status === 'confirmed').length
      const completed = reservations.filter(r => r.status === 'completed').length
      const cancelled = reservations.filter(r => r.status === 'cancelled').length
      const totalGuests = reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.guests || 1), 0)
      setStats({ total, pending, confirmed, completed, cancelled, totalGuests })
    } finally { setIsLoading(false) }
  }, [options?.resource_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
