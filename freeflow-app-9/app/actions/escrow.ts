'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('escrow-actions')

export interface EscrowInput {
  client_id?: string
  project_id?: string
  project_title: string
  client_name?: string
  client_email?: string
  client_avatar?: string
  amount: number
  currency?: string
  status?: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
}

export interface MilestoneInput {
  escrow_id: string
  title: string
  description?: string
  amount: number
  due_date?: string
  sort_order?: number
}

export async function createEscrowDeposit(input: EscrowInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_deposits')
      .insert([{
        ...input,
        user_id: user.id,
        status: input.status || 'pending'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create escrow deposit', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Escrow deposit created successfully', { id: data.id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Escrow deposit created successfully')
  } catch (error) {
    logger.error('Unexpected error creating escrow deposit', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEscrowDeposit(id: string, updates: Partial<EscrowInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_deposits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update escrow deposit', { error, id, updates })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Escrow deposit updated successfully', { id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Escrow deposit updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating escrow deposit', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function activateEscrow(id: string) {
  return updateEscrowDeposit(id, { status: 'active' })
}

export async function completeEscrow(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_deposits')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete escrow', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Escrow completed successfully', { id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Escrow completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing escrow', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function releaseFunds(id: string, amount: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get current deposit
    const { data: deposit } = await supabase
      .from('escrow_deposits')
      .select('released_amount, amount')
      .eq('id', id)
      .single()

    if (!deposit) {
      return actionError('Deposit not found', 'NOT_FOUND')
    }

    const newReleasedAmount = (deposit.released_amount || 0) + amount
    const isComplete = newReleasedAmount >= deposit.amount

    const { data, error } = await supabase
      .from('escrow_deposits')
      .update({
        released_amount: newReleasedAmount,
        status: isComplete ? 'completed' : 'active',
        progress_percentage: Math.round((newReleasedAmount / deposit.amount) * 100),
        completed_at: isComplete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to release funds', { error, id, amount })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Funds released successfully', { id, amount, isComplete })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Funds released successfully')
  } catch (error) {
    logger.error('Unexpected error releasing funds', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteEscrowDeposit(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('escrow_deposits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete escrow deposit', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Escrow deposit deleted successfully', { id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess({ success: true }, 'Escrow deposit deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting escrow deposit', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getEscrowDeposits(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_deposits')
      .select(`
        *,
        milestones:escrow_milestones(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get escrow deposits', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Escrow deposits retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting escrow deposits', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createMilestone(input: MilestoneInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_milestones')
      .insert([{ ...input, status: 'pending' }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create milestone', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Milestone created successfully', { id: data.id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Milestone created successfully')
  } catch (error) {
    logger.error('Unexpected error creating milestone', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeMilestone(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('escrow_milestones')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete milestone', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Milestone completed successfully', { id })
    revalidatePath('/dashboard/escrow-v2')
    return actionSuccess(data, 'Milestone completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing milestone', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
