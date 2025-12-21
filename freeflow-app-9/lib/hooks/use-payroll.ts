'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface PayrollRun {
  id: string
  user_id: string
  run_code: string
  period: string
  pay_date: string
  status: string
  total_employees: number
  total_amount: number
  processed_count: number
  pending_count: number
  failed_count: number
  department: string | null
  approved_by: string | null
  approved_date: string | null
  currency: string
  notes: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EmployeePayroll {
  id: string
  user_id: string
  run_id: string
  employee_code: string
  employee_name: string
  department: string | null
  role: string | null
  status: string
  base_salary: number
  bonuses: number
  deductions: number
  taxes: number
  net_pay: number
  payment_method: string
  tax_rate: number
  bank_account: string | null
  payment_status: string
  payment_date: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PayrollFilters {
  status?: string
  department?: string
}

export interface PayrollStats {
  totalRuns: number
  processing: number
  completed: number
  failed: number
  totalAmount: number
  totalEmployees: number
  avgPayroll: number
}

export function usePayrollRuns(initialRuns: PayrollRun[] = [], filters: PayrollFilters = {}) {
  const queryKey = ['payroll-runs', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('payroll_runs')
      .select('*')
      .is('deleted_at', null)
      .order('pay_date', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as PayrollRun[]
  }, [filters])

  const { data: runs, isLoading, error, refetch } = useSupabaseQuery<PayrollRun[]>(
    queryKey,
    queryFn,
    { initialData: initialRuns }
  )

  const stats: PayrollStats = useMemo(() => {
    const runList = runs || []
    const completedRuns = runList.filter(r => r.status === 'completed')

    return {
      totalRuns: runList.length,
      processing: runList.filter(r => r.status === 'processing').length,
      completed: completedRuns.length,
      failed: runList.filter(r => r.status === 'failed').length,
      totalAmount: runList.reduce((sum, r) => sum + Number(r.total_amount), 0),
      totalEmployees: runList.reduce((sum, r) => sum + r.total_employees, 0),
      avgPayroll: completedRuns.length > 0
        ? completedRuns.reduce((sum, r) => sum + Number(r.total_amount), 0) / completedRuns.length
        : 0
    }
  }, [runs])

  return { runs: runs || [], stats, isLoading, error, refetch }
}

export function useEmployeePayroll(runId: string, initialPayroll: EmployeePayroll[] = []) {
  const queryKey = ['employee-payroll', runId]

  const queryFn = useCallback(async (supabase: any) => {
    const { data, error } = await supabase
      .from('employee_payroll')
      .select('*')
      .eq('run_id', runId)
      .order('employee_name', { ascending: true })

    if (error) throw error
    return data as EmployeePayroll[]
  }, [runId])

  const { data: payroll, isLoading, error, refetch } = useSupabaseQuery<EmployeePayroll[]>(
    queryKey,
    queryFn,
    { initialData: initialPayroll }
  )

  return { payroll: payroll || [], isLoading, error, refetch }
}

export function usePayrollMutations() {
  const createRunMutation = useSupabaseMutation<Partial<PayrollRun>, PayrollRun>(
    async (supabase, runData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const runCode = `PAY-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('payroll_runs')
        .insert({
          ...runData,
          user_id: user.id,
          run_code: runCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['payroll-runs']] }
  )

  const updateRunMutation = useSupabaseMutation<{ id: string; updates: Partial<PayrollRun> }, PayrollRun>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['payroll-runs']] }
  )

  const deleteRunMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('payroll_runs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['payroll-runs']] }
  )

  const processPayrollMutation = useSupabaseMutation<string, PayrollRun>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .update({ status: 'processing' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['payroll-runs']] }
  )

  const approvePayrollMutation = useSupabaseMutation<{ id: string; approverName: string }, PayrollRun>(
    async (supabase, { id, approverName }) => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .update({
          status: 'completed',
          approved_by: approverName,
          approved_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['payroll-runs']] }
  )

  return {
    createRun: createRunMutation.mutate,
    updateRun: updateRunMutation.mutate,
    deleteRun: deleteRunMutation.mutate,
    processPayroll: processPayrollMutation.mutate,
    approvePayroll: approvePayrollMutation.mutate,
    isCreating: createRunMutation.isPending,
    isUpdating: updateRunMutation.isPending,
    isDeleting: deleteRunMutation.isPending,
    isProcessing: processPayrollMutation.isPending,
    isApproving: approvePayrollMutation.isPending
  }
}

export function getPayrollStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'failed': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'failed': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getEmployeeStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'terminated': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function getPaymentMethodColor(method: string): string {
  switch (method) {
    case 'bank_transfer': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'check': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'cash': return 'bg-green-100 text-green-800 border-green-200'
    case 'direct_deposit': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
