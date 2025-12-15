'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface Allocation {
  id: string
  user_id: string
  allocation_code: string
  resource_id: string | null
  resource_name: string
  resource_role: string | null
  project_name: string
  project_id: string | null
  allocation_type: string
  status: string
  priority: string
  hours_per_week: number
  allocated_hours: number
  utilization: number
  start_date: string | null
  end_date: string | null
  weeks_remaining: number
  billable_rate: number
  project_value: number
  currency: string
  manager_name: string | null
  manager_email: string | null
  skills: string[]
  notes: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AllocationFilters {
  status?: string
  allocationType?: string
  priority?: string
  projectName?: string
  resourceName?: string
}

export interface AllocationStats {
  total: number
  active: number
  pending: number
  completed: number
  cancelled: number
  totalHours: number
  totalValue: number
  avgUtilization: number
}

export function useAllocations(initialAllocations: Allocation[] = [], filters: AllocationFilters = {}) {
  const queryKey = ['allocations', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('allocations')
      .select('*')
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.allocationType) {
      query = query.eq('allocation_type', filters.allocationType)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.projectName) {
      query = query.ilike('project_name', `%${filters.projectName}%`)
    }
    if (filters.resourceName) {
      query = query.ilike('resource_name', `%${filters.resourceName}%`)
    }

    const { data, error } = await query.limit(200)
    if (error) throw error
    return data as Allocation[]
  }, [filters])

  const { data: allocations, isLoading, error, refetch } = useSupabaseQuery<Allocation[]>(
    queryKey,
    queryFn,
    { initialData: initialAllocations }
  )

  const stats: AllocationStats = useMemo(() => {
    const list = allocations || []

    return {
      total: list.length,
      active: list.filter(a => a.status === 'active').length,
      pending: list.filter(a => a.status === 'pending').length,
      completed: list.filter(a => a.status === 'completed').length,
      cancelled: list.filter(a => a.status === 'cancelled').length,
      totalHours: list.reduce((sum, a) => sum + a.allocated_hours, 0),
      totalValue: list.reduce((sum, a) => sum + Number(a.project_value), 0),
      avgUtilization: list.length > 0
        ? list.reduce((sum, a) => sum + Number(a.utilization), 0) / list.length
        : 0
    }
  }, [allocations])

  return { allocations: allocations || [], stats, isLoading, error, refetch }
}

export function useAllocationMutations() {
  const createMutation = useSupabaseMutation<Partial<Allocation>, Allocation>(
    async (supabase, data) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const allocationCode = `ALL-${Date.now().toString(36).toUpperCase()}`

      // Calculate utilization
      const utilization = data.hours_per_week && data.hours_per_week > 0
        ? ((data.allocated_hours || 0) / data.hours_per_week) * 100
        : 0

      // Calculate weeks remaining
      let weeksRemaining = 0
      if (data.end_date) {
        const end = new Date(data.end_date)
        const now = new Date()
        weeksRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)))
      }

      // Calculate project value
      const projectValue = (data.allocated_hours || 0) * (data.billable_rate || 0) * weeksRemaining

      const { data: result, error } = await supabase
        .from('allocations')
        .insert({
          ...data,
          user_id: user.id,
          allocation_code: allocationCode,
          utilization,
          weeks_remaining: weeksRemaining,
          project_value: projectValue
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    { invalidateKeys: [['allocations']] }
  )

  const updateMutation = useSupabaseMutation<{ id: string; updates: Partial<Allocation> }, Allocation>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('allocations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['allocations']] }
  )

  const deleteMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('allocations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['allocations']] }
  )

  const activateMutation = useSupabaseMutation<string, Allocation>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('allocations')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['allocations']] }
  )

  const completeMutation = useSupabaseMutation<string, Allocation>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('allocations')
        .update({
          status: 'completed',
          end_date: new Date().toISOString().split('T')[0],
          weeks_remaining: 0
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['allocations']] }
  )

  const cancelMutation = useSupabaseMutation<string, Allocation>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('allocations')
        .update({
          status: 'cancelled',
          project_value: 0
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['allocations']] }
  )

  return {
    createAllocation: createMutation.mutate,
    updateAllocation: updateMutation.mutate,
    deleteAllocation: deleteMutation.mutate,
    activateAllocation: activateMutation.mutate,
    completeAllocation: completeMutation.mutate,
    cancelAllocation: cancelMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

export function getAllocationStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getAllocationTypeColor(type: string): string {
  switch (type) {
    case 'full-time': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'part-time': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'temporary': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'contract': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getAllocationPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
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

export function calculateWeeksRemaining(endDate: string | null): number {
  if (!endDate) return 0
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)))
}
