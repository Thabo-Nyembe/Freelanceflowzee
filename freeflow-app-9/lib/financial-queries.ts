// Financial Queries - Supabase integration for financial management
// Handles transactions, insights, goals, and financial analytics

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('financial')

// ============================================================================
// Types
// ============================================================================

export type TransactionType = 'income' | 'expense'
export type TransactionCategory =
  | 'project_payment'
  | 'consulting'
  | 'subscription'
  | 'software'
  | 'hardware'
  | 'marketing'
  | 'office_expenses'
  | 'professional_services'
  | 'taxes'
  | 'other'
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled'
export type PaymentMethodType = 'bank_transfer' | 'credit_card' | 'paypal' | 'platform' | 'cash' | 'crypto' | 'check'
export type InsightType = 'revenue_optimization' | 'cash_flow' | 'cost_reduction' | 'risk_alert'
export type InsightImpact = 'high' | 'medium' | 'low'

export interface FinancialTransaction {
  id: string
  user_id: string
  type: TransactionType
  category: TransactionCategory
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
  status: TransactionStatus
  payment_method: PaymentMethodType
  is_recurring: boolean
  recurring_frequency?: string
  next_due_date?: string
  tags: string[]
  notes?: string
  receipt_url?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface FinancialInsight {
  id: string
  user_id: string
  type: InsightType
  title: string
  description: string
  impact: InsightImpact
  potential_value: number
  confidence: number
  is_actionable: boolean
  category: string
  action_steps: any[]
  status: 'active' | 'implemented' | 'dismissed' | 'archived'
  implemented_at?: string
  dismissed_at?: string
  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  description?: string
  goal_type: 'monthly_revenue' | 'quarterly_growth' | 'profit_margin' | 'client_acquisition' | 'emergency_fund' | 'custom'
  target_amount: number
  current_amount: number
  progress_percentage: number
  start_date: string
  target_date: string
  completed_at?: string
  status: 'active' | 'completed' | 'cancelled' | 'overdue'
  created_at: string
  updated_at: string
}

export interface FinancialOverview {
  total_revenue: number
  total_expenses: number
  net_profit: number
  profit_margin: number
  transaction_count: number
}

export interface CategoryBreakdown {
  category: TransactionCategory
  total_amount: number
  transaction_count: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  revenue: number
  expenses: number
  profit: number
  profit_margin: number
}

// ============================================================================
// Transaction Management
// ============================================================================

/**
 * Get all transactions for a user with optional filtering
 */
export async function getTransactions(
  userId: string,
  filters?: {
    type?: TransactionType
    category?: TransactionCategory
    status?: TransactionStatus
    startDate?: string
    endDate?: string
    search?: string
  }
): Promise<{ data: FinancialTransaction[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    let query = supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate)
    }
    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,vendor_name.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching transactions', { error: error.message, userId, filters, duration })
      return { data: [], error }
    }

    logger.info('Transactions fetched successfully', { userId, count: data.length, filters, duration })
    return { data: data as FinancialTransaction[], error: null }
  } catch (error: any) {
    logger.error('Exception in getTransactions', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(transactionId: string, userId: string): Promise<{ data: FinancialTransaction | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching transaction', { error: error.message, transactionId, userId, duration })
      return { data: null, error }
    }

    logger.info('Transaction fetched successfully', { transactionId, userId, duration })
    return { data: data as FinancialTransaction, error: null }
  } catch (error: any) {
    logger.error('Exception in getTransaction', { error: error.message, transactionId, userId })
    return { data: null, error }
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  transaction: {
    type: TransactionType
    category: TransactionCategory
    description: string
    amount: number
    currency?: string
    transaction_date?: string
    client_id?: string
    client_name?: string
    project_id?: string
    project_name?: string
    vendor_name?: string
    invoice_id?: string
    invoice_number?: string
    status?: TransactionStatus
    payment_method: PaymentMethodType
    is_recurring?: boolean
    recurring_frequency?: string
    next_due_date?: string
    tags?: string[]
    notes?: string
    receipt_url?: string
    created_by?: string
  }
): Promise<{ data: FinancialTransaction | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: userId,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency || 'USD',
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        client_id: transaction.client_id,
        client_name: transaction.client_name,
        project_id: transaction.project_id,
        project_name: transaction.project_name,
        vendor_name: transaction.vendor_name,
        invoice_id: transaction.invoice_id,
        invoice_number: transaction.invoice_number,
        status: transaction.status || 'completed',
        payment_method: transaction.payment_method,
        is_recurring: transaction.is_recurring || false,
        recurring_frequency: transaction.recurring_frequency,
        next_due_date: transaction.next_due_date,
        tags: transaction.tags || [],
        notes: transaction.notes,
        receipt_url: transaction.receipt_url,
        created_by: transaction.created_by,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating transaction', { error: error.message, userId, duration })
      return { data: null, error }
    }

    logger.info('Transaction created successfully', { transactionId: data.id, userId, type: transaction.type, amount: transaction.amount, duration })
    return { data: data as FinancialTransaction, error: null }
  } catch (error: any) {
    logger.error('Exception in createTransaction', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  updates: Partial<Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: FinancialTransaction | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating transaction', { error: error.message, transactionId, userId, duration })
      return { data: null, error }
    }

    logger.info('Transaction updated successfully', { transactionId, userId, updates: Object.keys(updates), duration })
    return { data: data as FinancialTransaction, error: null }
  } catch (error: any) {
    logger.error('Exception in updateTransaction', { error: error.message, transactionId, userId })
    return { data: null, error }
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string, userId: string): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error deleting transaction', { error: error.message, transactionId, userId, duration })
      return { success: false, error }
    }

    logger.info('Transaction deleted successfully', { transactionId, userId, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in deleteTransaction', { error: error.message, transactionId, userId })
    return { success: false, error }
  }
}

// ============================================================================
// Financial Analytics
// ============================================================================

/**
 * Get financial overview
 */
export async function getFinancialOverview(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: FinancialOverview | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_financial_overview', {
      p_user_id: userId,
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching financial overview', { error: error.message, userId, duration })
      return { data: null, error }
    }

    const overview = data[0] as FinancialOverview
    logger.info('Financial overview fetched successfully', { userId, overview, duration })
    return { data: overview, error: null }
  } catch (error: any) {
    logger.error('Exception in getFinancialOverview', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get category breakdown
 */
export async function getCategoryBreakdown(
  userId: string,
  type: TransactionType,
  startDate?: string,
  endDate?: string
): Promise<{ data: CategoryBreakdown[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_category_breakdown', {
      p_user_id: userId,
      p_type: type,
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching category breakdown', { error: error.message, userId, type, duration })
      return { data: [], error }
    }

    logger.info('Category breakdown fetched successfully', { userId, type, count: data.length, duration })
    return { data: data as CategoryBreakdown[], error: null }
  } catch (error: any) {
    logger.error('Exception in getCategoryBreakdown', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get monthly trend
 */
export async function getMonthlyTrend(
  userId: string,
  months: number = 6
): Promise<{ data: MonthlyTrend[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_monthly_trend', {
      p_user_id: userId,
      p_months: months
    })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching monthly trend', { error: error.message, userId, months, duration })
      return { data: [], error }
    }

    logger.info('Monthly trend fetched successfully', { userId, months, count: data.length, duration })
    return { data: data as MonthlyTrend[], error: null }
  } catch (error: any) {
    logger.error('Exception in getMonthlyTrend', { error: error.message, userId })
    return { data: [], error }
  }
}

// ============================================================================
// Insights Management
// ============================================================================

/**
 * Get all insights for a user
 */
export async function getFinancialInsights(
  userId: string,
  filters?: {
    type?: InsightType
    impact?: InsightImpact
    status?: string
  }
): Promise<{ data: FinancialInsight[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    let query = supabase
      .from('financial_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.impact) {
      query = query.eq('impact', filters.impact)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching insights', { error: error.message, userId, duration })
      return { data: [], error }
    }

    logger.info('Insights fetched successfully', { userId, count: data.length, duration })
    return { data: data as FinancialInsight[], error: null }
  } catch (error: any) {
    logger.error('Exception in getFinancialInsights', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Create a new insight
 */
export async function createFinancialInsight(
  userId: string,
  insight: {
    type: InsightType
    title: string
    description: string
    impact: InsightImpact
    potential_value?: number
    confidence?: number
    is_actionable?: boolean
    category: string
    action_steps?: any[]
  }
): Promise<{ data: FinancialInsight | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_insights')
      .insert({
        user_id: userId,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        potential_value: insight.potential_value || 0,
        confidence: insight.confidence || 0,
        is_actionable: insight.is_actionable ?? true,
        category: insight.category,
        action_steps: insight.action_steps || [],
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating insight', { error: error.message, userId, duration })
      return { data: null, error }
    }

    logger.info('Insight created successfully', { insightId: data.id, userId, type: insight.type, duration })
    return { data: data as FinancialInsight, error: null }
  } catch (error: any) {
    logger.error('Exception in createFinancialInsight', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update insight status
 */
export async function updateInsightStatus(
  insightId: string,
  userId: string,
  status: 'active' | 'implemented' | 'dismissed' | 'archived'
): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const updates: any = { status }
    if (status === 'implemented') {
      updates.implemented_at = new Date().toISOString()
    } else if (status === 'dismissed') {
      updates.dismissed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('financial_insights')
      .update(updates)
      .eq('id', insightId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating insight status', { error: error.message, insightId, userId, status, duration })
      return { success: false, error }
    }

    logger.info('Insight status updated successfully', { insightId, userId, status, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in updateInsightStatus', { error: error.message, insightId, userId })
    return { success: false, error }
  }
}

// ============================================================================
// Goals Management
// ============================================================================

/**
 * Get all goals for a user
 */
export async function getFinancialGoals(
  userId: string,
  filters?: {
    status?: string
    goal_type?: string
  }
): Promise<{ data: FinancialGoal[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    let query = supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.goal_type) {
      query = query.eq('goal_type', filters.goal_type)
    }

    const { data, error } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching goals', { error: error.message, userId, duration })
      return { data: [], error }
    }

    logger.info('Goals fetched successfully', { userId, count: data.length, duration })
    return { data: data as FinancialGoal[], error: null }
  } catch (error: any) {
    logger.error('Exception in getFinancialGoals', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Create a new goal
 */
export async function createFinancialGoal(
  userId: string,
  goal: {
    name: string
    description?: string
    goal_type: string
    target_amount: number
    current_amount?: number
    start_date?: string
    target_date: string
  }
): Promise<{ data: FinancialGoal | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: userId,
        name: goal.name,
        description: goal.description,
        goal_type: goal.goal_type,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        start_date: goal.start_date || new Date().toISOString().split('T')[0],
        target_date: goal.target_date,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating goal', { error: error.message, userId, duration })
      return { data: null, error }
    }

    logger.info('Goal created successfully', { goalId: data.id, userId, name: goal.name, duration })
    return { data: data as FinancialGoal, error: null }
  } catch (error: any) {
    logger.error('Exception in createFinancialGoal', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(
  goalId: string,
  userId: string,
  currentAmount: number
): Promise<{ data: FinancialGoal | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financial_goals')
      .update({ current_amount: currentAmount })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating goal progress', { error: error.message, goalId, userId, duration })
      return { data: null, error }
    }

    logger.info('Goal progress updated successfully', { goalId, userId, currentAmount, progress: data.progress_percentage, duration })
    return { data: data as FinancialGoal, error: null }
  } catch (error: any) {
    logger.error('Exception in updateGoalProgress', { error: error.message, goalId, userId })
    return { data: null, error }
  }
}
