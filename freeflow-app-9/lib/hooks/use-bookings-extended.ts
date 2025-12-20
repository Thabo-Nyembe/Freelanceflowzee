'use client'

/**
 * Extended Bookings Hooks
 * Tables: bookings, booking_slots, booking_services, booking_reminders
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBooking(bookingId?: string) {
  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!bookingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('bookings').select('*, booking_services(*)').eq('id', bookingId).single(); setBooking(data) } finally { setIsLoading(false) }
  }, [bookingId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { booking, isLoading, refresh: fetch }
}

export function useBookings(options?: { user_id?: string; provider_id?: string; status?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('bookings').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.provider_id) query = query.eq('provider_id', options.provider_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.provider_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useUpcomingBookings(userId?: string, options?: { as_provider?: boolean; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      let query = supabase.from('bookings').select('*')
      if (options?.as_provider) { query = query.eq('provider_id', userId) } else { query = query.eq('user_id', userId) }
      const { data } = await query.gte('start_time', now).in('status', ['pending', 'confirmed']).order('start_time', { ascending: true }).limit(options?.limit || 10)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.as_provider, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useAvailableSlots(providerId?: string, date?: string, serviceId?: string) {
  const [slots, setSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!providerId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('booking_slots').select('*').eq('provider_id', providerId).eq('date', date).eq('is_available', true)
      if (serviceId) query = query.eq('service_id', serviceId)
      const { data } = await query.order('start_time', { ascending: true })
      setSlots(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, date, serviceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useBookingServices(providerId?: string) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('booking_services').select('*').eq('provider_id', providerId).eq('is_active', true).order('name', { ascending: true }); setServices(data || []) } finally { setIsLoading(false) }
  }, [providerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useBookingStats(providerId?: string, options?: { date_from?: string; date_to?: string }) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('bookings').select('status').eq('provider_id', providerId)
      if (options?.date_from) query = query.gte('start_time', options.date_from)
      if (options?.date_to) query = query.lte('start_time', options.date_to)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, byStatus })
    } finally { setIsLoading(false) }
  }, [providerId, options?.date_from, options?.date_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useBookingsForDate(providerId?: string, date?: string) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!providerId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const startOfDay = `${date}T00:00:00`
      const endOfDay = `${date}T23:59:59`
      const { data } = await supabase.from('bookings').select('*').eq('provider_id', providerId).gte('start_time', startOfDay).lte('start_time', endOfDay).order('start_time', { ascending: true })
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}
