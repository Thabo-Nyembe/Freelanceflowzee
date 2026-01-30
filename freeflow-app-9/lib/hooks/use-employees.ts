'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Employees')

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

// ============================================================================
// TYPES
// ============================================================================

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern' | 'temporary'
export type EmployeeStatus = 'active' | 'inactive' | 'on-leave' | 'terminated' | 'suspended'

export interface Employee {
  id: string
  user_id: string
  employee_name: string
  employee_id: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  position: string | null
  job_title: string | null
  department: string | null
  team: string | null
  level: string | null
  employment_type: EmploymentType
  status: EmployeeStatus
  is_remote: boolean
  manager_id: string | null
  manager_name: string | null
  direct_reports: number
  reports_to: string | null
  office_location: string | null
  work_location: string | null
  country: string | null
  city: string | null
  state: string | null
  timezone: string | null
  salary: number
  hourly_rate: number
  currency: string
  bonus_eligible: boolean
  commission_rate: number
  health_insurance: boolean
  retirement_plan: boolean
  stock_options: number
  pto_days: number
  sick_days: number
  used_pto_days: number
  used_sick_days: number
  hire_date: string | null
  start_date: string | null
  termination_date: string | null
  probation_end_date: string | null
  last_promotion_date: string | null
  performance_rating: number
  performance_score: number
  last_review_date: string | null
  next_review_date: string | null
  goals_completed: number
  goals_total: number
  projects_count: number
  tasks_completed: number
  hours_logged: number
  productivity_score: number
  skills: string[] | null
  certifications: string[] | null
  languages: string[] | null
  education_level: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  contract_url: string | null
  resume_url: string | null
  id_document_url: string | null
  photo_url: string | null
  onboarding_completed: boolean
  onboarding_progress: number
  orientation_date: string | null
  notes: string | null
  tags: string[] | null
  custom_fields: Record<string, unknown> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EmployeeStats {
  total: number
  active: number
  onLeave: number
  terminated: number
  onboarding: number
  avgPerformance: number
  avgTenure: number
  totalPayroll: number
  departmentCounts: Record<string, number>
}

export interface CreateEmployeeInput {
  employee_name: string
  email?: string | null
  phone?: string | null
  position?: string | null
  job_title?: string | null
  department?: string | null
  team?: string | null
  level?: string | null
  employment_type?: EmploymentType
  status?: EmployeeStatus
  is_remote?: boolean
  manager_id?: string | null
  salary?: number
  hourly_rate?: number
  currency?: string
  hire_date?: string | null
  start_date?: string | null
  office_location?: string | null
  work_location?: string | null
  country?: string | null
  city?: string | null
  skills?: string[] | null
  notes?: string | null
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  avatar_url?: string | null
  termination_date?: string | null
  performance_score?: number
  performance_rating?: number
  onboarding_completed?: boolean
  onboarding_progress?: number
}

// ============================================================================
// MAIN HOOK WITH REAL-TIME SUBSCRIPTIONS
// ============================================================================

interface UseEmployeesOptions {
  department?: string | 'all'
  status?: EmployeeStatus | 'all'
  search?: string
  enableRealtime?: boolean
  limit?: number
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { department, status, search, enableRealtime = true, limit = 100 } = options

  const [data, setData] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Create supabase client once with useMemo to avoid re-renders
  const supabase = useMemo(() => createClient(), [])

  // Fetch employees from database
  const fetchEmployees = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setData([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)

      // Apply filters
      if (department && department !== 'all') {
        query = query.ilike('department', department)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      if (search) {
        query = query.or(`employee_name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`)
      }

      // Apply ordering and limit
      query = query
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data: employees, error: queryError } = await query

      if (queryError) {
        throw new Error(queryError.message)
      }

      setData(employees || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch employees')
      setError(error)
      logger.error('Error fetching employees', { error })
    } finally {
      setLoading(false)
    }
  }, [department, status, search, limit, supabase])

  // Set up real-time subscription
  useEffect(() => {
    fetchEmployees()

    let channel: RealtimeChannel | null = null

    if (enableRealtime) {
      channel = supabase
        .channel('employees-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'employees' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new as Employee, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(emp =>
                emp.id === payload.new.id ? payload.new as Employee : emp
              ))
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(emp => emp.id !== payload.old.id))
            }
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchEmployees, enableRealtime, supabase])

  // Computed statistics
  const stats = useMemo((): EmployeeStats => {
    const now = new Date()
    const activeEmployees = data.filter(e => e.status === 'active')

    // Calculate average tenure in years
    const avgTenure = activeEmployees.length > 0
      ? activeEmployees.reduce((sum, emp) => {
          if (!emp.hire_date) return sum
          const hireDate = new Date(emp.hire_date)
          const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
          return sum + years
        }, 0) / activeEmployees.filter(e => e.hire_date).length || 0
      : 0

    // Calculate department counts
    const departmentCounts = data.reduce((acc: Record<string, number>, emp) => {
      const dept = emp.department || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})

    // Calculate average performance
    const employeesWithPerformance = data.filter(e => e.performance_score > 0)
    const avgPerformance = employeesWithPerformance.length > 0
      ? employeesWithPerformance.reduce((sum, e) => sum + e.performance_score, 0) / employeesWithPerformance.length
      : 0

    return {
      total: data.length,
      active: data.filter(e => e.status === 'active').length,
      onLeave: data.filter(e => e.status === 'on-leave').length,
      terminated: data.filter(e => e.status === 'terminated').length,
      onboarding: data.filter(e => !e.onboarding_completed && e.status === 'active').length,
      avgPerformance: Math.round(avgPerformance),
      avgTenure: Number(avgTenure.toFixed(1)),
      totalPayroll: data.reduce((sum, e) => sum + (e.salary || 0), 0),
      departmentCounts
    }
  }, [data])

  // Filter by department helper
  const employeesByDepartment = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    data.forEach(emp => {
      const dept = emp.department || 'Unassigned'
      if (!grouped[dept]) grouped[dept] = []
      grouped[dept].push(emp)
    })
    return grouped
  }, [data])

  // Get unique departments
  const departments = useMemo(() =>
    [...new Set(data.map(e => e.department).filter(Boolean) as string[])],
    [data]
  )

  return {
    data,
    loading,
    error,
    stats,
    employeesByDepartment,
    departments,
    refetch: fetchEmployees
  }
}

// ============================================================================
// CREATE EMPLOYEE HOOK
// ============================================================================

export function useCreateEmployee() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const mutate = useCallback(async (input: CreateEmployeeInput): Promise<Employee | null> => {
    if (isDemoModeEnabled()) { setLoading(false); return null }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data: employee, error: insertError } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          employee_name: input.employee_name,
          email: input.email || null,
          phone: input.phone || null,
          position: input.position || null,
          job_title: input.job_title || input.position || null,
          department: input.department || null,
          team: input.team || null,
          level: input.level || null,
          employment_type: input.employment_type || 'full-time',
          status: input.status || 'active',
          is_remote: input.is_remote || false,
          manager_id: input.manager_id || null,
          salary: input.salary || 0,
          hourly_rate: input.hourly_rate || 0,
          currency: input.currency || 'USD',
          hire_date: input.hire_date || null,
          start_date: input.start_date || input.hire_date || null,
          office_location: input.office_location || null,
          work_location: input.work_location || null,
          country: input.country || null,
          city: input.city || null,
          skills: input.skills || null,
          notes: input.notes || null,
          onboarding_completed: false,
          onboarding_progress: 0,
          performance_score: 0,
          performance_rating: 0,
          projects_count: 0,
          tasks_completed: 0,
          hours_logged: 0,
          productivity_score: 0,
          direct_reports: 0,
          pto_days: 20,
          sick_days: 10,
          used_pto_days: 0,
          used_sick_days: 0,
          goals_completed: 0,
          goals_total: 0
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      return employee as Employee
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create employee')
      setError(error)
      logger.error('Error creating employee', { error })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { mutate, loading, error }
}

// ============================================================================
// UPDATE EMPLOYEE HOOK
// ============================================================================

export function useUpdateEmployee() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const mutate = useCallback(async (
    updates: UpdateEmployeeInput,
    employeeId: string
  ): Promise<Employee | null> => {
    if (isDemoModeEnabled()) { setLoading(false); return null }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data: employee, error: updateError } = await supabase
        .from('employees')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      return employee as Employee
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update employee')
      setError(error)
      logger.error('Error updating employee', { error })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { mutate, loading, error }
}

// ============================================================================
// DELETE EMPLOYEE HOOK (Soft Delete)
// ============================================================================

export function useDeleteEmployee() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const mutate = useCallback(async (employeeId: string): Promise<boolean> => {
    if (isDemoModeEnabled()) { setLoading(false); return false }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Soft delete by setting deleted_at
      const { error: deleteError } = await supabase
        .from('employees')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', employeeId)
        .eq('user_id', user.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete employee')
      setError(error)
      logger.error('Error deleting employee', { error })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { mutate, loading, error }
}

// ============================================================================
// TOGGLE EMPLOYEE STATUS HOOK
// ============================================================================

export function useToggleEmployeeStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const toggle = useCallback(async (
    employeeId: string,
    newStatus: EmployeeStatus
  ): Promise<Employee | null> => {
    if (isDemoModeEnabled()) { setLoading(false); return null }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const updates: Partial<Employee> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // If terminating, set termination date
      if (newStatus === 'terminated') {
        updates.termination_date = new Date().toISOString().split('T')[0]
      }

      const { data: employee, error: updateError } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      return employee as Employee
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle employee status')
      setError(error)
      logger.error('Error toggling employee status', { error })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { toggle, loading, error }
}

// ============================================================================
// GET SINGLE EMPLOYEE HOOK
// ============================================================================

export function useEmployee(employeeId?: string) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchEmployee = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    if (!employeeId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data, error: queryError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (queryError) {
        throw new Error(queryError.message)
      }

      setEmployee(data as Employee)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch employee')
      setError(error)
      logger.error('Error fetching employee', { error })
    } finally {
      setLoading(false)
    }
  }, [employeeId, supabase])

  useEffect(() => {
    fetchEmployee()
  }, [fetchEmployee])

  return { employee, loading, error, refetch: fetchEmployee }
}

export default useEmployees
