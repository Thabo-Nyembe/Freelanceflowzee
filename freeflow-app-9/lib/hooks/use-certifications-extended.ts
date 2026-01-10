'use client'

/**
 * Extended Certifications Hooks
 * Tables: certifications, certification_courses, certification_exams, certification_badges
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCertification(certificationId?: string) {
  const [certification, setCertification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!certificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('certifications').select('*').eq('id', certificationId).single(); setCertification(data) } finally { setIsLoading(false) }
  }, [certificationId])
  useEffect(() => { fetch() }, [fetch])
  return { certification, isLoading, refresh: fetch }
}

export function useCertifications(options?: { user_id?: string; issuer?: string; status?: string; limit?: number }) {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('certifications').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.issuer) query = query.eq('issuer', options.issuer)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('issued_date', { ascending: false }).limit(options?.limit || 50)
      setCertifications(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.issuer, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { certifications, isLoading, refresh: fetch }
}

export function useExpiringCertifications(userId?: string, daysAhead?: number) {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + (daysAhead || 30))
      const { data } = await supabase.from('certifications').select('*').eq('user_id', userId).eq('status', 'active').not('expiry_date', 'is', null).lte('expiry_date', futureDate.toISOString()).order('expiry_date', { ascending: true })
      setCertifications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, daysAhead])
  useEffect(() => { fetch() }, [fetch])
  return { certifications, isLoading, refresh: fetch }
}

export function useActiveCertifications(userId?: string) {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('certifications').select('*').eq('user_id', userId).eq('status', 'active').order('issued_date', { ascending: false }); setCertifications(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { certifications, isLoading, refresh: fetch }
}

export function useCertificationCourses(options?: { issuer?: string; is_active?: boolean; limit?: number }) {
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('certification_courses').select('*')
      if (options?.issuer) query = query.eq('issuer', options.issuer)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setCourses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.issuer, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { courses, isLoading, refresh: fetch }
}

export function useCertificationBadges(userId?: string) {
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('certification_badges').select('*').eq('user_id', userId).order('awarded_at', { ascending: false }); setBadges(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { badges, isLoading, refresh: fetch }
}

export function useCertificationStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; expired: number; expiringSoon: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('certifications').select('status, expiry_date').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const now = new Date()
      const thirtyDays = new Date()
      thirtyDays.setDate(now.getDate() + 30)
      setStats({
        total: data.length,
        active: data.filter(c => c.status === 'active').length,
        expired: data.filter(c => c.status === 'expired').length,
        expiringSoon: data.filter(c => c.status === 'active' && c.expiry_date && new Date(c.expiry_date) <= thirtyDays && new Date(c.expiry_date) > now).length
      })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
