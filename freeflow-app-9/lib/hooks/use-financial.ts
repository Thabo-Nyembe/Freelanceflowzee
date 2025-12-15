import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type FinancialRecordType = 'general' | 'revenue' | 'expense' | 'investment' | 'loan' | 'grant' | 'tax' | 'payroll' | 'dividend' | 'asset' | 'liability' | 'equity'
export type FinancialStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'processed' | 'completed' | 'cancelled' | 'on_hold' | 'under_review'
export type FinancialPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PaymentMethod = 'cash' | 'check' | 'wire_transfer' | 'ach' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'crypto' | 'other'

export interface FinancialRecord {
  id: string
  user_id: string
  record_number: string
  record_type: FinancialRecordType
  category: string
  subcategory?: string
  title: string
  description?: string
  amount: number
  currency: string
  exchange_rate?: number
  base_amount?: number
  status: FinancialStatus
  priority: FinancialPriority
  record_date: string
  due_date?: string
  completed_date?: string
  fiscal_year?: number
  fiscal_quarter?: number
  fiscal_month?: number
  account_code?: string
  cost_center?: string
  department?: string
  project_id?: string
  gl_account?: string
  payment_method?: PaymentMethod
  bank_account?: string
  transaction_reference?: string
  is_taxable: boolean
  tax_rate?: number
  tax_amount?: number
  tax_category?: string
  submitted_by?: string
  submitted_at?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  attachments: any
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

export interface UseFinancialOptions {
  recordType?: FinancialRecordType | 'all'
  status?: FinancialStatus | 'all'
  category?: string | 'all'
  fiscalYear?: number
  limit?: number
}

export function useFinancial(options: UseFinancialOptions = {}) {
  const { recordType, status, category, fiscalYear, limit } = options

  const filters: Record<string, any> = {}
  if (recordType && recordType !== 'all') filters.record_type = recordType
  if (status && status !== 'all') filters.status = status
  if (category && category !== 'all') filters.category = category
  if (fiscalYear) filters.fiscal_year = fiscalYear

  const queryOptions: any = {
    table: 'financial',
    filters,
    orderBy: { column: 'record_date', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<FinancialRecord>(queryOptions)

  const { mutate: create } = useSupabaseMutation<FinancialRecord>({
    table: 'financial',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<FinancialRecord>({
    table: 'financial',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<FinancialRecord>({
    table: 'financial',
    operation: 'delete'
  })

  return {
    records: data,
    loading,
    error,
    createRecord: create,
    updateRecord: update,
    deleteRecord: remove,
    refetch
  }
}
