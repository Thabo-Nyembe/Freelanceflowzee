'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useMemo } from 'react'

export type CustomerSegment = 'vip' | 'active' | 'new' | 'inactive' | 'churned' | 'at_risk' | 'prospect'
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'deleted' | 'pending' | 'verified'

export interface Customer {
  id: string
  user_id: string
  customer_name: string
  email?: string
  phone?: string
  segment: CustomerSegment
  status: CustomerStatus

  first_name?: string
  last_name?: string
  avatar_url?: string
  date_of_birth?: string

  location_name?: string
  city?: string
  state?: string
  country?: string

  total_orders: number
  total_spent: number
  lifetime_value: number
  avg_order_value: number

  join_date: string
  first_purchase_date?: string
  last_purchase_date?: string
  last_activity_date?: string

  loyalty_points: number
  loyalty_tier?: string
  referral_count: number

  email_opt_in: boolean
  sms_opt_in: boolean

  churn_risk_score: number
  satisfaction_score?: number
  nps_score?: number

  support_ticket_count: number

  tags?: string[]
  notes?: string

  company_name?: string
  job_title?: string

  created_at: string
  updated_at: string
  deleted_at?: string

  metadata?: any
}

export interface CustomerFilters {
  segment?: CustomerSegment | 'all'
  status?: CustomerStatus | 'all'
}

export function useCustomers(filters?: CustomerFilters) {
  const query = useSupabaseQuery<Customer>({
    table: 'customers',
    select: '*',
    filters: {
      ...(filters?.segment && filters.segment !== 'all' ? { segment: filters.segment } : {}),
      ...(filters?.status && filters.status !== 'all' ? { status: filters.status } : {})
    },
    orderBy: { column: 'lifetime_value', ascending: false }
  })

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      active: 0,
      inactive: 0,
      vip: 0,
      new: 0,
      churned: 0,
      atRisk: 0,
      prospect: 0,
      totalLifetimeValue: 0,
      avgLifetimeValue: 0,
      totalOrders: 0
    }

    const active = query.data.filter(c => c.status === 'active').length
    const inactive = query.data.filter(c => c.status === 'inactive').length
    const vip = query.data.filter(c => c.segment === 'vip').length
    const newCustomers = query.data.filter(c => c.segment === 'new').length
    const churned = query.data.filter(c => c.segment === 'churned').length
    const atRisk = query.data.filter(c => c.segment === 'at_risk').length
    const prospect = query.data.filter(c => c.segment === 'prospect').length
    const totalLifetimeValue = query.data.reduce((sum, c) => sum + (c.lifetime_value || 0), 0)
    const totalOrders = query.data.reduce((sum, c) => sum + (c.total_orders || 0), 0)

    return {
      total: query.data.length,
      active,
      inactive,
      vip,
      new: newCustomers,
      churned,
      atRisk,
      prospect,
      totalLifetimeValue,
      avgLifetimeValue: query.data.length > 0 ? totalLifetimeValue / query.data.length : 0,
      totalOrders
    }
  }, [query.data])

  return {
    ...query,
    customers: query.data,
    stats,
    isLoading: query.loading
  }
}

export function useCustomerMutations() {
  const customerMutation = useSupabaseMutation<Customer>({
    table: 'customers'
  })

  return {
    createCustomer: (data: Partial<Customer>) => customerMutation.mutate(data),
    updateCustomer: (data: Partial<Customer> & { id: string }) => customerMutation.mutate(data, data.id),
    deleteCustomer: (id: string) => customerMutation.remove(id),
    updateCustomerSegment: (id: string, segment: CustomerSegment) =>
      customerMutation.mutate({ segment }, id),
    updateCustomerStatus: (id: string, status: CustomerStatus) =>
      customerMutation.mutate({ status }, id),
    isCreating: customerMutation.loading,
    isUpdating: customerMutation.loading,
    isDeleting: customerMutation.loading,
    loading: customerMutation.loading,
    error: customerMutation.error
  }
}

// Backwards compatibility exports
export function useCreateCustomer() {
  const mutations = useCustomerMutations()
  return {
    mutate: mutations.createCustomer,
    loading: mutations.isCreating
  }
}

export function useUpdateCustomer() {
  const mutations = useCustomerMutations()
  return {
    mutate: mutations.updateCustomer,
    loading: mutations.isUpdating
  }
}

export function useDeleteCustomer() {
  const mutations = useCustomerMutations()
  return {
    remove: mutations.deleteCustomer,
    loading: mutations.isDeleting
  }
}
