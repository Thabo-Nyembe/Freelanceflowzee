'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('budgets')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface BudgetData {
  name?: string
  description?: string
  total_amount?: number
  spent_amount?: number
  remaining_amount?: number
  available_amount?: number
  category?: string
  start_date?: string
  end_date?: string
  status?: 'draft' | 'active' | 'approved' | 'closed' | 'exceeded'
  utilization_percent?: number
  is_exceeded?: boolean
  approved_by?: string
  approved_at?: string
  exceeded_at?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

interface Budget extends BudgetData {
  id: string
  user_id: string
  owner_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new budget
 */
export async function createBudget(data: BudgetData): Promise<ActionResult<Budget>> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget creation attempt', { error: authError })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Create budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        ...data,
        user_id: user.id,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create budget', { error, userId: user.id })
      return actionError('Failed to create budget', 'DATABASE_ERROR')
    }

    logger.info('Budget created successfully', { budgetId: budget.id, userId: user.id })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(budget, 'Budget created successfully')
  } catch (error) {
    logger.error('Unexpected error creating budget', { error })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  data: BudgetData
): Promise<ActionResult<Budget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid budget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget update attempt', { error: authError, budgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Update budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update budget', { error, budgetId: id, userId: user.id })
      return actionError('Failed to update budget', 'DATABASE_ERROR')
    }

    if (!budget) {
      logger.warn('Budget not found for update', { budgetId: id, userId: user.id })
      return actionError('Budget not found', 'NOT_FOUND')
    }

    logger.info('Budget updated successfully', { budgetId: id, userId: user.id })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(budget, 'Budget updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating budget', { error, budgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Soft delete a budget
 */
export async function deleteBudget(id: string): Promise<ActionResult<void>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid budget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget deletion attempt', { error: authError, budgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Soft delete budget
    const { error } = await supabase
      .from('budgets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete budget', { error, budgetId: id, userId: user.id })
      return actionError('Failed to delete budget', 'DATABASE_ERROR')
    }

    logger.info('Budget deleted successfully', { budgetId: id, userId: user.id })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(undefined, 'Budget deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting budget', { error, budgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Approve a budget
 */
export async function approveBudget(id: string): Promise<ActionResult<Budget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid budget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget approval attempt', { error: authError, budgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Approve budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve budget', { error, budgetId: id, userId: user.id })
      return actionError('Failed to approve budget', 'DATABASE_ERROR')
    }

    if (!budget) {
      logger.warn('Budget not found for approval', { budgetId: id, userId: user.id })
      return actionError('Budget not found', 'NOT_FOUND')
    }

    logger.info('Budget approved successfully', { budgetId: id, userId: user.id })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(budget, 'Budget approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving budget', { error, budgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Update budget utilization
 */
export async function updateBudgetUtilization(
  id: string,
  spentAmount: number
): Promise<ActionResult<Budget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid budget ID format', 'VALIDATION_ERROR')
    }

    // Validate spent amount
    if (typeof spentAmount !== 'number' || spentAmount < 0) {
      return actionError('Spent amount must be a positive number', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget utilization update', { error: authError, budgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Fetch current budget to calculate remaining and utilization
    const { data: currentBudget, error: fetchError } = await supabase
      .from('budgets')
      .select('total_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentBudget) {
      logger.error('Failed to fetch budget for utilization', {
        error: fetchError,
        budgetId: id,
        userId: user.id
      })
      return actionError('Budget not found', 'NOT_FOUND')
    }

    const totalAmount = currentBudget.total_amount || 0
    const remainingAmount = totalAmount - spentAmount
    const utilizationPercent = totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0
    const isExceeded = spentAmount > totalAmount

    // Update budget utilization
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({
        spent_amount: spentAmount,
        remaining_amount: remainingAmount,
        available_amount: remainingAmount,
        utilization_percent: utilizationPercent,
        is_exceeded: isExceeded,
        exceeded_at: isExceeded ? new Date().toISOString() : null
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update budget utilization', {
        error,
        budgetId: id,
        userId: user.id
      })
      return actionError('Failed to update budget utilization', 'DATABASE_ERROR')
    }

    logger.info('Budget utilization updated', {
      budgetId: id,
      userId: user.id,
      spentAmount,
      utilizationPercent,
      isExceeded
    })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(budget, 'Budget utilization updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating budget utilization', { error, budgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Close a budget
 */
export async function closeBudget(id: string): Promise<ActionResult<Budget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid budget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized budget closure attempt', { error: authError, budgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Close budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({ status: 'closed' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close budget', { error, budgetId: id, userId: user.id })
      return actionError('Failed to close budget', 'DATABASE_ERROR')
    }

    if (!budget) {
      logger.warn('Budget not found for closure', { budgetId: id, userId: user.id })
      return actionError('Budget not found', 'NOT_FOUND')
    }

    logger.info('Budget closed successfully', { budgetId: id, userId: user.id })
    revalidatePath('/dashboard/budgets-v2')

    return actionSuccess(budget, 'Budget closed successfully')
  } catch (error) {
    logger.error('Unexpected error closing budget', { error, budgetId: id })
    return actionError('An unexpected error occurred')
  }
}
