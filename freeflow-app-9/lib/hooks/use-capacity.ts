'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ResourceType = 'team_member' | 'equipment' | 'room' | 'vehicle' | 'tool' | 'service' | 'workspace'
export type CapacityStatus = 'active' | 'inactive' | 'maintenance' | 'unavailable' | 'retired'
export type AvailabilityStatus = 'available' | 'partially_available' | 'fully_booked' | 'unavailable'

export interface Capacity {
  id: string
  user_id: string
  resource_name: string
  resource_type: ResourceType
  total_capacity: number
  available_capacity: number
  allocated_capacity: number
  utilization_percentage: number
  capacity_unit: string
  time_period: string
  working_hours_per_day: number
  working_days_per_week: number
  start_time?: string
  end_time?: string
  current_allocation?: any
  upcoming_allocation?: any
  allocation_history?: any
  available_from?: string
  available_until?: string
  unavailable_dates?: any
  blackout_periods?: any
  skills?: any
  certifications?: string[]
  attributes?: any
  cost_per_hour?: number
  cost_per_day?: number
  total_cost: number
  planned_capacity?: number
  forecast_capacity?: number
  capacity_buffer: number
  peak_utilization?: number
  avg_utilization?: number
  min_utilization?: number
  utilization_trend?: string
  is_overallocated: boolean
  overallocation_percentage?: number
  overallocation_alerts?: any
  efficiency_score?: number
  productivity_score?: number
  quality_score?: number
  schedule?: any
  recurring_schedule?: any
  exceptions?: any
  assigned_to?: string[]
  assigned_projects?: string[]
  assigned_tasks?: string[]
  location?: string
  zone?: string
  region?: string
  status: CapacityStatus
  availability_status: AvailabilityStatus
  max_concurrent_assignments: number
  max_daily_hours?: number
  requires_approval: boolean
  notify_on_low_capacity: boolean
  notify_on_overallocation: boolean
  low_capacity_threshold: number
  tags?: string[]
  category?: string
  priority?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCapacityOptions {
  resourceType?: ResourceType | 'all'
  status?: CapacityStatus | 'all'
  limit?: number
}

export function useCapacity(options: UseCapacityOptions = {}) {
  const { resourceType, status, limit } = options

  const filters: Record<string, any> = {}
  if (resourceType && resourceType !== 'all') filters.resource_type = resourceType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'capacity',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Capacity>(queryOptions)

  const { mutate: createCapacity } = useSupabaseMutation({
    table: 'capacity',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateCapacity } = useSupabaseMutation({
    table: 'capacity',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteCapacity } = useSupabaseMutation({
    table: 'capacity',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    capacity: data,
    loading,
    error,
    createCapacity,
    updateCapacity,
    deleteCapacity,
    refetch
  }
}
