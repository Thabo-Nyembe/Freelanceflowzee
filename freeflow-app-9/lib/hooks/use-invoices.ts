// Hook for Invoices management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded'

export interface Invoice {
  id: string
  user_id: string
  organization_id: string | null
  client_id: string | null
  project_id: string | null
  invoice_number: string
  title: string
  description: string | null
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  discount_percentage: number
  total_amount: number
  amount_paid: number
  amount_due: number
  currency: string
  items: any
  item_count: number
  issue_date: string
  due_date: string
  sent_date: string | null
  paid_date: string | null
  viewed_date: string | null
  payment_terms: string | null
  payment_method: string | null
  payment_reference: string | null
  late_fee_percentage: number
  client_name: string | null
  client_email: string | null
  client_address: string | null
  client_phone: string | null
  billing_address: string | null
  shipping_address: string | null
  notes: string | null
  terms_and_conditions: string | null
  internal_notes: string | null
  attachments: any
  has_attachments: boolean
  is_recurring: boolean
  recurring_schedule: string | null
  parent_invoice_id: string | null
  reminder_sent_count: number
  last_reminder_sent_at: string | null
  metadata: any
  tags: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseInvoicesOptions {
  status?: InvoiceStatus | 'all'
  limit?: number
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const { status, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'invoices',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Invoice>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'invoices',
    onSuccess: refetch
  })

  return {
    invoices: data,
    loading,
    error,
    mutating,
    createInvoice: create,
    updateInvoice: update,
    deleteInvoice: remove,
    refetch
  }
}
