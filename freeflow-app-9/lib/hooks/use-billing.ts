// Hook for Billing management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type TransactionType = 'charge' | 'payment' | 'refund' | 'adjustment' | 'credit' | 'debit'
export type BillingStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'disputed'
export type PaymentMethod = 'card' | 'bank-transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'crypto' | 'other'

export interface BillingTransaction {
  id: string
  user_id: string
  organization_id: string | null
  customer_id: string | null
  invoice_id: string | null
  transaction_id: string | null
  transaction_type: TransactionType
  status: BillingStatus
  amount: number
  currency: string
  fee_amount: number
  net_amount: number | null
  tax_amount: number
  payment_method: PaymentMethod
  payment_provider: string | null
  card_last4: string | null
  card_brand: string | null
  card_exp_month: number | null
  card_exp_year: number | null
  bank_name: string | null
  account_last4: string | null
  billing_name: string | null
  billing_email: string | null
  billing_address: string | null
  billing_city: string | null
  billing_state: string | null
  billing_postal_code: string | null
  billing_country: string | null
  description: string | null
  notes: string | null
  internal_notes: string | null
  transaction_date: string
  settled_date: string | null
  refunded_date: string | null
  receipt_number: string | null
  receipt_url: string | null
  invoice_number: string | null
  subscription_id: string | null
  subscription_period_start: string | null
  subscription_period_end: string | null
  dispute_reason: string | null
  dispute_date: string | null
  refund_reason: string | null
  refund_amount: number | null
  provider_response: any
  error_code: string | null
  error_message: string | null
  metadata: any
  tags: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseBillingOptions {
  status?: BillingStatus | 'all'
  transactionType?: TransactionType | 'all'
  paymentMethod?: PaymentMethod | 'all'
  limit?: number
}

export function useBilling(options: UseBillingOptions = {}) {
  const { status, transactionType, paymentMethod, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (transactionType && transactionType !== 'all') filters.transaction_type = transactionType
  if (paymentMethod && paymentMethod !== 'all') filters.payment_method = paymentMethod

  const queryOptions: any = {
    table: 'billing',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<BillingTransaction>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'billing',
    onSuccess: refetch
  })

  return {
    transactions: data,
    loading,
    error,
    mutating,
    createTransaction: create,
    updateTransaction: update,
    deleteTransaction: remove,
    refetch
  }
}
