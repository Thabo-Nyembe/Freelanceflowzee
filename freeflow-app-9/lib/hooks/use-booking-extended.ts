'use client'

/**
 * Extended Booking Hooks - Covers all 16 Booking-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useBookingAttendees(bookingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!bookingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_attendees').select('*').eq('booking_id', bookingId); setData(result || []) } finally { setIsLoading(false) }
  }, [bookingId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingAvailability(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_availability').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingBlockedTimes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_blocked_times').select('*').eq('user_id', userId).order('start_time', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingClients(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_clients').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingCouponUsage(couponId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!couponId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_coupon_usage').select('*').eq('coupon_id', couponId).order('used_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [couponId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingCoupons(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_coupons').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingIntegrations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_integrations').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingPackageServices(packageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!packageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_package_services').select('*').eq('package_id', packageId); setData(result || []) } finally { setIsLoading(false) }
  }, [packageId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingPackages(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_packages').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingPayments(bookingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!bookingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_payments').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [bookingId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingReminders(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_reminders').select('*').eq('user_id', userId).order('remind_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingServices(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_services').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingSettings(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_settings').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingSlots(serviceId?: string, date?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('booking_slots').select('*').eq('service_id', serviceId).eq('is_available', true)
      if (date) query = query.eq('date', date)
      const { data: result } = await query.order('start_time', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [serviceId, date])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingStats(userId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_stats').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBookingTypes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('booking_types').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
