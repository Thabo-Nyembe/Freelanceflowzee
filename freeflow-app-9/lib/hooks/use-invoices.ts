// Hook for Invoices management
// Created: December 14, 2024

import { useState, useEffect, useCallback } from 'react'
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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Build query params
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      if (limit) params.set('limit', String(limit))

      // Fetch via API (uses service role key, bypasses RLS)
      const response = await fetch(`/api/invoices?${params.toString()}`, {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch invoices')
      }

      // Handle demo mode - use demo invoices from API
      if (result.demo) {
        setInvoices(result.data?.invoices || [])
        return
      }

      setInvoices(result.data?.invoices || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }, [status, limit])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'invoices',
    onSuccess: fetchInvoices
  })

  return {
    invoices,
    loading,
    error,
    mutating,
    createInvoice: create,
    updateInvoice: update,
    deleteInvoice: remove,
    refetch: fetchInvoices
  }
}
