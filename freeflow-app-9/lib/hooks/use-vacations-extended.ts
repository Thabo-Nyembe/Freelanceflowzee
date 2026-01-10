'use client'

/**
 * Extended Vacations Hooks
 * Tables: vacations, vacation_types, vacation_balances, vacation_requests, vacation_approvals, vacation_policies
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVacation(vacationId?: string) {
  const [vacation, setVacation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vacationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vacations').select('*, vacation_types(*), users(*), vacation_approvals(*, approver:users(*))').eq('id', vacationId).single(); setVacation(data) } finally { setIsLoading(false) }
  }, [vacationId])
  useEffect(() => { fetch() }, [fetch])
  return { vacation, isLoading, refresh: fetch }
}

export function useVacations(options?: { user_id?: string; vacation_type_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vacations').select('*, vacation_types(*), users(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.vacation_type_id) query = query.eq('vacation_type_id', options.vacation_type_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('start_date', options.from_date)
      if (options?.to_date) query = query.lte('end_date', options.to_date)
      const { data } = await query.order('start_date', { ascending: false }).limit(options?.limit || 50)
      setVacations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.vacation_type_id, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { vacations, isLoading, refresh: fetch }
}

export function useMyVacations(userId?: string, options?: { status?: string; year?: number; limit?: number }) {
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('vacations').select('*, vacation_types(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.year) {
        query = query.gte('start_date', `${options.year}-01-01`).lte('start_date', `${options.year}-12-31`)
      }
      const { data } = await query.order('start_date', { ascending: false }).limit(options?.limit || 50)
      setVacations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.year, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { vacations, isLoading, refresh: fetch }
}

export function useVacationTypes(options?: { is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vacation_types').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useVacationBalance(userId?: string, year?: number) {
  const [balances, setBalances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const targetYear = year || new Date().getFullYear()
      const { data } = await supabase.from('vacation_balances').select('*, vacation_types(*)').eq('user_id', userId).eq('year', targetYear)
      setBalances(data || [])
    } finally { setIsLoading(false) }
  }, [userId, year])
  useEffect(() => { fetch() }, [fetch])
  return { balances, isLoading, refresh: fetch }
}

export function useVacationBalanceByType(userId?: string, vacationTypeId?: string, year?: number) {
  const [balance, setBalance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !vacationTypeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const targetYear = year || new Date().getFullYear()
      const { data } = await supabase.from('vacation_balances').select('*, vacation_types(*)').eq('user_id', userId).eq('vacation_type_id', vacationTypeId).eq('year', targetYear).single()
      setBalance(data)
    } finally { setIsLoading(false) }
  }, [userId, vacationTypeId, year])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function usePendingApprovals(approverId?: string, options?: { limit?: number }) {
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vacations').select('*, vacation_types(*), users(*)').eq('status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 50); setVacations(data || []) } finally { setIsLoading(false) }
  }, [approverId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { vacations, count: vacations.length, isLoading, refresh: fetch }
}

export function useTeamCalendar(teamMemberIds?: string[], fromDate?: string, toDate?: string) {
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!teamMemberIds || teamMemberIds.length === 0 || !fromDate || !toDate) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vacations').select('*, users(*), vacation_types(*)').in('user_id', teamMemberIds).in('status', ['approved', 'pending']).gte('start_date', fromDate).lte('end_date', toDate).order('start_date', { ascending: true }); setVacations(data || []) } finally { setIsLoading(false) }
  }, [teamMemberIds, fromDate, toDate])
  useEffect(() => { fetch() }, [fetch])
  return { vacations, isLoading, refresh: fetch }
}

export function useVacationApprovals(vacationId?: string) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vacationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vacation_approvals').select('*, approver:users(*)').eq('vacation_id', vacationId).order('created_at', { ascending: false }); setApprovals(data || []) } finally { setIsLoading(false) }
  }, [vacationId])
  useEffect(() => { fetch() }, [fetch])
  return { approvals, isLoading, refresh: fetch }
}

export function useUpcomingVacations(userId?: string, options?: { days?: number; limit?: number }) {
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + (options?.days || 30))
      const { data } = await supabase.from('vacations').select('*, vacation_types(*)').eq('user_id', userId).eq('status', 'approved').gte('start_date', now.toISOString().split('T')[0]).lte('start_date', futureDate.toISOString().split('T')[0]).order('start_date', { ascending: true }).limit(options?.limit || 10)
      setVacations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.days, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { vacations, isLoading, refresh: fetch }
}

export function useVacationStats(userId?: string, year?: number) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const targetYear = year || new Date().getFullYear()
      const { data: vacations } = await supabase.from('vacations').select('status, days_count').eq('user_id', userId).gte('start_date', `${targetYear}-01-01`).lte('start_date', `${targetYear}-12-31`)
      const { data: balances } = await supabase.from('vacation_balances').select('allocated, used, available').eq('user_id', userId).eq('year', targetYear)
      const allVacations = vacations || []
      const allBalances = balances || []
      setStats({
        total_requests: allVacations.length,
        approved: allVacations.filter(v => v.status === 'approved').length,
        pending: allVacations.filter(v => v.status === 'pending').length,
        rejected: allVacations.filter(v => v.status === 'rejected').length,
        days_used: allBalances.reduce((sum, b) => sum + (b.used || 0), 0),
        days_available: allBalances.reduce((sum, b) => sum + (b.available || 0), 0),
        total_allocated: allBalances.reduce((sum, b) => sum + (b.allocated || 0), 0)
      })
    } finally { setIsLoading(false) }
  }, [userId, year])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useVacationPolicy(policyId?: string) {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      if (policyId) {
        const { data } = await supabase.from('vacation_policies').select('*').eq('id', policyId).single()
        setPolicy(data)
      } else {
        const { data } = await supabase.from('vacation_policies').select('*').eq('is_default', true).single()
        setPolicy(data)
      }
    } finally { setIsLoading(false) }
  }, [policyId])
  useEffect(() => { fetch() }, [fetch])
  return { policy, isLoading, refresh: fetch }
}
