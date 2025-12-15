import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type TransactionType = 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal' | 'charge' | 'credit' | 'debit' | 'adjustment' | 'fee' | 'reversal' | 'settlement'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed' | 'on_hold' | 'authorized' | 'captured' | 'voided'
export type TransactionPaymentMethod = 'cash' | 'check' | 'wire_transfer' | 'ach' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'square' | 'venmo' | 'crypto' | 'other'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Transaction {
  id: string
  user_id: string
  transaction_number: string
  transaction_type: TransactionType
  title: string
  description?: string
  amount: number
  currency: string
  exchange_rate?: number
  base_amount?: number
  fee_amount: number
  net_amount?: number
  status: TransactionStatus
  processing_status?: string
  error_code?: string
  error_message?: string
  payment_method: TransactionPaymentMethod
  payment_gateway?: string
  gateway_transaction_id?: string
  card_last4?: string
  card_brand?: string
  card_type?: string
  bank_name?: string
  account_last4?: string
  routing_number?: string
  payer_id?: string
  payer_name?: string
  payer_email?: string
  payee_id?: string
  payee_name?: string
  payee_email?: string
  invoice_id?: string
  order_id?: string
  contract_id?: string
  subscription_id?: string
  transaction_date: string
  processed_at?: string
  settled_at?: string
  refunded_at?: string
  receipt_url?: string
  receipt_number?: string
  attachments: any
  risk_score?: number
  risk_level?: RiskLevel
  is_flagged: boolean
  flagged_reason?: string
  ip_address?: string
  user_agent?: string
  is_reconciled: boolean
  reconciled_at?: string
  reconciled_by?: string
  notes?: string
  tags?: string[]
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseTransactionsOptions {
  transactionType?: TransactionType | 'all'
  status?: TransactionStatus | 'all'
  paymentMethod?: TransactionPaymentMethod | 'all'
  limit?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { transactionType, status, paymentMethod, limit } = options

  const filters: Record<string, any> = {}
  if (transactionType && transactionType !== 'all') filters.transaction_type = transactionType
  if (status && status !== 'all') filters.status = status
  if (paymentMethod && paymentMethod !== 'all') filters.payment_method = paymentMethod

  const queryOptions: any = {
    table: 'transactions',
    filters,
    orderBy: { column: 'transaction_date', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Transaction>(queryOptions)

  const { mutate: create } = useSupabaseMutation<Transaction>({
    table: 'transactions',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<Transaction>({
    table: 'transactions',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<Transaction>({
    table: 'transactions',
    operation: 'delete'
  })

  return {
    transactions: data,
    loading,
    error,
    createTransaction: create,
    updateTransaction: update,
    deleteTransaction: remove,
    refetch
  }
}
