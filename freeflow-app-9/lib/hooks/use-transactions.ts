import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

// Types matching the financial_transactions table schema
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category: string
  description: string
  amount: number
  currency: string
  transaction_date: string
  client_id?: string
  client_name?: string
  project_id?: string
  project_name?: string
  vendor_name?: string
  invoice_id?: string
  invoice_number?: string
  is_recurring: boolean
  recurring_frequency?: string
  next_due_date?: string
  tags?: string[]
  notes?: string
  receipt_url?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface UseTransactionsOptions {
  type?: TransactionType | 'all'
  category?: string | 'all'
  limit?: number
}

// Generate a unique transaction reference
function generateTransactionRef(): string {
  const prefix = 'TXN'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { type, category, limit } = options

  const filters: Record<string, any> = {}
  if (type && type !== 'all') filters.type = type
  if (category && category !== 'all') filters.category = category

  const queryOptions: any = {
    table: 'financial_transactions',
    filters,
    orderBy: { column: 'transaction_date', ascending: false },
    limit: limit || 50,
    realtime: true,
    softDelete: false // financial_transactions table doesn't have deleted_at column
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Transaction>(queryOptions)

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation({
    table: 'financial_transactions',
    onSuccess: () => refetch()
  })

  // Create a new transaction with proper defaults
  const createTransaction = async (txnData: Partial<Transaction>) => {
    const newTransaction = {
      type: txnData.type || 'expense',
      category: txnData.category || 'General',
      description: txnData.description || 'New Transaction',
      amount: txnData.amount || 0,
      currency: txnData.currency || 'USD',
      transaction_date: txnData.transaction_date || new Date().toISOString(),
      client_id: txnData.client_id,
      client_name: txnData.client_name,
      project_id: txnData.project_id,
      project_name: txnData.project_name,
      vendor_name: txnData.vendor_name,
      invoice_id: txnData.invoice_id,
      invoice_number: txnData.invoice_number,
      is_recurring: txnData.is_recurring || false,
      recurring_frequency: txnData.recurring_frequency,
      next_due_date: txnData.next_due_date,
      tags: txnData.tags || [],
      notes: txnData.notes || '',
      receipt_url: txnData.receipt_url
    }
    return create(newTransaction)
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, txnData: Partial<Transaction>) => {
    return update(id, txnData)
  }

  // Delete a transaction (hard delete since table doesn't have deleted_at)
  const deleteTransaction = async (id: string) => {
    return remove(id, true) // Always hard delete for financial_transactions
  }

  // Calculate summary stats
  const stats = {
    totalIncome: data.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalExpenses: data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    transactionCount: data.length,
    pendingCount: 0 // financial_transactions doesn't have status field
  }

  return {
    transactions: data,
    loading: loading || mutationLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch,
    stats
  }
}
