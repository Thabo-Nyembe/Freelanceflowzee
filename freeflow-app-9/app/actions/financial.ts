'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('financial-actions')

export async function createFinancialRecord(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: record, error } = await supabase
      .from('financial')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create financial record', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/financial-v2')
    logger.info('Financial record created successfully', { recordId: record.id })
    return actionSuccess(record, 'Financial record created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating financial record', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFinancialRecord(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: record, error } = await supabase
      .from('financial')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update financial record', { error, recordId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/financial-v2')
    logger.info('Financial record updated successfully', { recordId: id })
    return actionSuccess(record, 'Financial record updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating financial record', { error, recordId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteFinancialRecord(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('financial')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete financial record', { error, recordId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/financial-v2')
    logger.info('Financial record deleted successfully', { recordId: id })
    return actionSuccess(undefined, 'Financial record deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting financial record', { error, recordId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveFinancialRecord(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: record, error } = await supabase
      .from('financial')
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
      logger.error('Failed to approve financial record', { error, recordId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/financial-v2')
    logger.info('Financial record approved successfully', { recordId: id })
    return actionSuccess(record, 'Financial record approved successfully')
  } catch (error: any) {
    logger.error('Unexpected error approving financial record', { error, recordId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function processFinancialRecord(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: record, error } = await supabase
      .from('financial')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to process financial record', { error, recordId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/financial-v2')
    logger.info('Financial record processed successfully', { recordId: id })
    return actionSuccess(record, 'Financial record processed successfully')
  } catch (error: any) {
    logger.error('Unexpected error processing financial record', { error, recordId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
