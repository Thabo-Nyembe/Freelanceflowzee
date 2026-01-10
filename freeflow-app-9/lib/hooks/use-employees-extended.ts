'use client'

/**
 * Extended Employees Hooks
 * Tables: employees, employee_profiles, employee_documents, employee_performance, employee_leave
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEmployee(employeeId?: string) {
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('employees').select('*, employee_profiles(*), employee_documents(*)').eq('id', employeeId).single(); setEmployee(data) } finally { setIsLoading(false) }
  }, [employeeId])
  useEffect(() => { fetch() }, [fetch])
  return { employee, isLoading, refresh: fetch }
}

export function useEmployees(options?: { department_id?: string; status?: string; manager_id?: string; search?: string; limit?: number }) {
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('employees').select('*, employee_profiles(*)')
      if (options?.department_id) query = query.eq('department_id', options.department_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.manager_id) query = query.eq('manager_id', options.manager_id)
      if (options?.search) query = query.ilike('employee_number', `%${options.search}%`)
      const { data } = await query.order('hire_date', { ascending: false }).limit(options?.limit || 50)
      setEmployees(data || [])
    } finally { setIsLoading(false) }
  }, [options?.department_id, options?.status, options?.manager_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { employees, isLoading, refresh: fetch }
}

export function useEmployeeProfile(employeeId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('employee_profiles').select('*').eq('employee_id', employeeId).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [employeeId])
  useEffect(() => { fetch() }, [fetch])
  return { profile, isLoading, refresh: fetch }
}

export function useEmployeeDocuments(employeeId?: string, options?: { type?: string }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('employee_documents').select('*').eq('employee_id', employeeId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('uploaded_at', { ascending: false })
      setDocuments(data || [])
    } finally { setIsLoading(false) }
  }, [employeeId, options?.type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { documents, isLoading, refresh: fetch }
}

export function useEmployeePerformance(employeeId?: string, options?: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('employee_performance').select('*').eq('employee_id', employeeId).order('review_date', { ascending: false }).limit(options?.limit || 10); setReviews(data || []) } finally { setIsLoading(false) }
  }, [employeeId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useEmployeeLeave(employeeId?: string, options?: { status?: string; year?: number }) {
  const [leaves, setLeaves] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('employee_leave').select('*').eq('employee_id', employeeId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.year) { const startOfYear = `${options.year}-01-01`; const endOfYear = `${options.year}-12-31`; query = query.gte('start_date', startOfYear).lte('start_date', endOfYear) }
      const { data } = await query.order('start_date', { ascending: false })
      setLeaves(data || [])
    } finally { setIsLoading(false) }
  }, [employeeId, options?.status, options?.year, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { leaves, isLoading, refresh: fetch }
}

export function usePendingLeaveRequests(managerId?: string) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!managerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: employees } = await supabase.from('employees').select('id').eq('manager_id', managerId)
      if (!employees?.length) { setRequests([]); return }
      const { data } = await supabase.from('employee_leave').select('*, employees(*, employee_profiles(*))').in('employee_id', employees.map(e => e.id)).eq('status', 'pending').order('requested_at', { ascending: false })
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [managerId])
  useEffect(() => { fetch() }, [fetch])
  return { requests, isLoading, refresh: fetch }
}

export function useDirectReports(managerId?: string) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!managerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('employees').select('*, employee_profiles(*)').eq('manager_id', managerId).eq('status', 'active').order('hire_date', { ascending: true }); setReports(data || []) } finally { setIsLoading(false) }
  }, [managerId])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useEmployeeStats(options?: { department_id?: string }) {
  const [stats, setStats] = useState<{ total: number; active: number; onLeave: number; byDepartment: Record<string, number>; avgTenure: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('employees').select('status, department_id, hire_date')
      if (options?.department_id) query = query.eq('department_id', options.department_id)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const active = data.filter(e => e.status === 'active').length
      const onLeave = data.filter(e => e.status === 'on_leave').length
      const byDepartment = data.reduce((acc: Record<string, number>, e) => { const key = e.department_id || 'unassigned'; acc[key] = (acc[key] || 0) + 1; return acc }, {})
      const now = new Date()
      const avgTenure = data.length > 0 ? data.reduce((sum, e) => sum + (now.getTime() - new Date(e.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365), 0) / data.length : 0
      setStats({ total, active, onLeave, byDepartment, avgTenure })
    } finally { setIsLoading(false) }
  }, [options?.department_id])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
