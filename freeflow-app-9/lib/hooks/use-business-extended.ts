'use client'

/**
 * Extended Business Hooks - Covers all Business-related tables
 * Tables: business_profiles, business_settings, business_hours, business_reports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBusinessProfile(profileId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('business_profiles').select('*, business_hours(*), business_settings(*)').eq('id', profileId).single()
      setProfile(data)
    } finally { setIsLoading(false) }
  }, [profileId])
  useEffect(() => { loadData() }, [loadData])
  return { profile, isLoading, refresh: loadData }
}

export function useUserBusinessProfiles(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('business_profiles').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useVerifiedBusinessProfiles(options?: { industry?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('business_profiles').select('*').eq('is_verified', true).eq('status', 'active')
      if (options?.industry) query = query.eq('industry', options.industry)
      const { data: result } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.industry, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useBusinessSettings(businessId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!businessId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('business_settings').select('*').eq('business_id', businessId).single()
      setSettings(data)
    } finally { setIsLoading(false) }
  }, [businessId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useBusinessHours(businessId?: string) {
  const [hours, setHours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!businessId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('business_hours').select('*').eq('business_id', businessId).order('day_of_week', { ascending: true })
      setHours(data || [])
    } finally { setIsLoading(false) }
  }, [businessId])
  useEffect(() => { loadData() }, [loadData])
  return { hours, isLoading, refresh: loadData }
}

export function useIsBusinessOpen(businessId?: string) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [nextChange, setNextChange] = useState<{ type: 'open' | 'close'; time: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!businessId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: hours } = await supabase.from('business_hours').select('*').eq('business_id', businessId)
      if (!hours || hours.length === 0) { setIsOpen(true); return }
      const now = new Date()
      const dayOfWeek = now.getDay()
      const currentTime = now.toTimeString().slice(0, 5)
      const todayHours = hours.find(h => h.day_of_week === dayOfWeek)
      if (!todayHours || !todayHours.is_open) { setIsOpen(false); return }
      const open = currentTime >= todayHours.open_time && currentTime < todayHours.close_time
      setIsOpen(open)
      if (open) {
        setNextChange({ type: 'close', time: todayHours.close_time })
      } else if (currentTime < todayHours.open_time) {
        setNextChange({ type: 'open', time: todayHours.open_time })
      }
    } finally { setIsLoading(false) }
  }, [businessId])
  useEffect(() => { check() }, [check])
  return { isOpen, nextChange, isLoading, recheck: check }
}

export function useBusinessReports(businessId?: string, options?: { report_type?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!businessId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('business_reports').select('*').eq('business_id', businessId)
      if (options?.report_type) query = query.eq('report_type', options.report_type)
      const { data: result } = await query.order('generated_at', { ascending: false }).limit(options?.limit || 20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [businessId, options?.report_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useBusinessReport(reportId?: string) {
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('business_reports').select('*').eq('id', reportId).single()
      setReport(data)
    } finally { setIsLoading(false) }
  }, [reportId])
  useEffect(() => { loadData() }, [loadData])
  return { report, isLoading, refresh: loadData }
}

export function useBusinessSearch(searchTerm: string, options?: { industry?: string; business_type?: string; verified_only?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('business_profiles').select('*').or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      if (options?.industry) query = query.eq('industry', options.industry)
      if (options?.business_type) query = query.eq('business_type', options.business_type)
      if (options?.verified_only) query = query.eq('is_verified', true)
      const { data: result } = await query.order('name', { ascending: true }).limit(options?.limit || 20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.industry, options?.business_type, options?.verified_only, options?.limit])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { data, isLoading }
}

export function useBusinessStats(businessId?: string) {
  const [stats, setStats] = useState<{ profile: any; reportsCount: number; isVerified: boolean; status: string; createdAt: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!businessId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [profileRes, reportsRes] = await Promise.all([
        supabase.from('business_profiles').select('*').eq('id', businessId).single(),
        supabase.from('business_reports').select('id').eq('business_id', businessId)
      ])
      const profile = profileRes.data
      if (!profile) { setStats(null); return }
      setStats({
        profile,
        reportsCount: reportsRes.data?.length || 0,
        isVerified: profile.is_verified,
        status: profile.status,
        createdAt: profile.created_at
      })
    } finally { setIsLoading(false) }
  }, [businessId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useBusinessIndustries() {
  const [industries, setIndustries] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('business_profiles').select('industry')
      const uniqueIndustries = [...new Set((data || []).map(item => item.industry).filter(Boolean))]
      setIndustries(uniqueIndustries)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { industries, isLoading, refresh: loadData }
}
