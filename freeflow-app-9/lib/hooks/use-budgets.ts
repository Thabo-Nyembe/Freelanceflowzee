import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type BudgetType = 'operational' | 'project' | 'department' | 'campaign' | 'capital' | 'discretionary' | 'emergency' | 'annual' | 'quarterly' | 'monthly'
export type BudgetStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'on_hold' | 'exceeded' | 'closed' | 'cancelled'
export type BudgetPeriodType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'multi_year' | 'project_based' | 'ongoing'

export interface Budget {
  id: string
  user_id: string
  budget_number: string
  name: string
  description?: string
  budget_type: BudgetType
  total_amount: number
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  committed_amount: number
  available_amount: number
  utilization_percent: number
  allocation_percent: number
  currency: string
  status: BudgetStatus
  period_type: BudgetPeriodType
  start_date: string
  end_date: string
  fiscal_year?: number
  fiscal_quarter?: number
  category?: string
  subcategory?: string
  department?: string
  cost_center?: string
  project_id?: string
  line_items: any
  breakdown: any
  alert_threshold: number
  warning_threshold: number
  is_exceeded: boolean
  exceeded_at?: string
  alerts_enabled: boolean
  submitted_by?: string
  submitted_at?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  owner_id?: string
  manager_id?: string
  stakeholders?: string[]
  last_reviewed_at?: string
  next_review_date?: string
  review_frequency?: string
  allows_rollover: boolean
  rollover_amount: number
  previous_budget_id?: string
  notes?: string
  tags?: string[]
  attachments: any
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseBudgetsOptions {
  budgetType?: BudgetType | 'all'
  status?: BudgetStatus | 'all'
  fiscalYear?: number
  category?: string | 'all'
  limit?: number
}

export function useBudgets(options: UseBudgetsOptions = {}) {
  const { budgetType, status, fiscalYear, category, limit } = options

  const filters: Record<string, any> = {}
  if (budgetType && budgetType !== 'all') filters.budget_type = budgetType
  if (status && status !== 'all') filters.status = status
  if (fiscalYear) filters.fiscal_year = fiscalYear
  if (category && category !== 'all') filters.category = category

  const queryOptions: any = {
    table: 'budgets',
    filters,
    orderBy: { column: 'start_date', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Budget>(queryOptions)

  const { mutate: create } = useSupabaseMutation<Budget>({
    table: 'budgets',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<Budget>({
    table: 'budgets',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<Budget>({
    table: 'budgets',
    operation: 'delete'
  })

  return {
    budgets: data,
    loading,
    error,
    createBudget: create,
    updateBudget: update,
    deleteBudget: remove,
    refetch
  }
}
