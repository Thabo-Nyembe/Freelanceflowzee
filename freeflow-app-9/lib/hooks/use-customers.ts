import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

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

export function useCustomers(filters?: {
  segment?: CustomerSegment | 'all'
  status?: CustomerStatus | 'all'
}) {
  let query = useSupabaseQuery<Customer>('customers')

  if (filters?.segment && filters.segment !== 'all') {
    query = query.eq('segment', filters.segment)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  return query.order('lifetime_value', { ascending: false })
}

export function useCreateCustomer() {
  return useSupabaseMutation<Customer>('customers', 'insert')
}

export function useUpdateCustomer() {
  return useSupabaseMutation<Customer>('customers', 'update')
}

export function useDeleteCustomer() {
  return useSupabaseMutation<Customer>('customers', 'delete')
}
