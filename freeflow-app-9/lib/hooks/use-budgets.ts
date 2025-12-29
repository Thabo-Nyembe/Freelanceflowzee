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

// Generate a unique budget number
function generateBudgetNumber(): string {
  const prefix = 'BUD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
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

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation({
    table: 'budgets',
    onSuccess: () => refetch()
  })

  // Create a new budget with proper defaults
  const createBudget = async (budgetData: Partial<Budget>) => {
    const newBudget = {
      budget_number: generateBudgetNumber(),
      name: budgetData.name || 'New Budget',
      description: budgetData.description || '',
      budget_type: budgetData.budget_type || 'monthly',
      total_amount: budgetData.total_amount || 0,
      allocated_amount: budgetData.allocated_amount || 0,
      spent_amount: 0,
      remaining_amount: budgetData.total_amount || 0,
      committed_amount: 0,
      available_amount: budgetData.total_amount || 0,
      utilization_percent: 0,
      allocation_percent: 0,
      currency: budgetData.currency || 'USD',
      status: budgetData.status || 'draft',
      period_type: budgetData.period_type || 'monthly',
      start_date: budgetData.start_date || new Date().toISOString(),
      end_date: budgetData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      fiscal_year: budgetData.fiscal_year || new Date().getFullYear(),
      category: budgetData.category || 'general',
      department: budgetData.department,
      alert_threshold: budgetData.alert_threshold || 90,
      warning_threshold: budgetData.warning_threshold || 75,
      is_exceeded: false,
      alerts_enabled: budgetData.alerts_enabled ?? true,
      allows_rollover: budgetData.allows_rollover ?? false,
      rollover_amount: 0,
      line_items: budgetData.line_items || [],
      breakdown: budgetData.breakdown || {},
      attachments: budgetData.attachments || [],
      metadata: budgetData.metadata || {},
      tags: budgetData.tags || [],
      notes: budgetData.notes || ''
    }
    return create(newBudget)
  }

  // Update an existing budget
  const updateBudget = async (id: string, budgetData: Partial<Budget>) => {
    // Recalculate derived fields
    const total = budgetData.total_amount
    const spent = budgetData.spent_amount
    const allocated = budgetData.allocated_amount

    const updates: Partial<Budget> = {
      ...budgetData,
    }

    if (total !== undefined && spent !== undefined) {
      updates.remaining_amount = total - spent
      updates.available_amount = total - spent
      updates.utilization_percent = total > 0 ? Math.round((spent / total) * 100) : 0
      updates.is_exceeded = spent > total
      if (updates.is_exceeded && !budgetData.exceeded_at) {
        updates.exceeded_at = new Date().toISOString()
      }
    }

    if (total !== undefined && allocated !== undefined) {
      updates.allocation_percent = total > 0 ? Math.round((allocated / total) * 100) : 0
    }

    return update(id, updates)
  }

  // Delete a budget (soft delete)
  const deleteBudget = async (id: string, hardDelete = false) => {
    return remove(id, hardDelete)
  }

  return {
    budgets: data,
    loading: loading || mutationLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch
  }
}
