'use server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { Capacity } from '@/lib/hooks/use-capacity'

const logger = createFeatureLogger('capacity-actions')

export async function createCapacity(data: Partial<Capacity>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: capacity, error } = await supabase
      .from('capacity')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create capacity', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Capacity created successfully', { capacityId: capacity.id })
    return actionSuccess(capacity, 'Capacity created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating capacity', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCapacity(id: string, data: Partial<Capacity>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: capacity, error } = await supabase
      .from('capacity')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update capacity', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Capacity updated successfully', { capacityId: id })
    return actionSuccess(capacity, 'Capacity updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating capacity', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCapacity(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('capacity')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete capacity', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Capacity deleted successfully', { capacityId: id })
    return actionSuccess({ success: true }, 'Capacity deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting capacity', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateUtilization(id: string, allocated: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: resource, error: fetchError } = await supabase
      .from('capacity')
      .select('total_capacity, allocated_capacity')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !resource) {
      logger.error('Resource not found', { capacityId: id })
      return actionError('Resource not found', 'DATABASE_ERROR')
    }

    const newAllocated = (resource.allocated_capacity || 0) + allocated
    const utilization = (newAllocated / resource.total_capacity) * 100
    const isOverallocated = newAllocated > resource.total_capacity
    const overallocationPercentage = isOverallocated ? ((newAllocated - resource.total_capacity) / resource.total_capacity) * 100 : 0

    const { data: capacity, error } = await supabase
      .from('capacity')
      .update({
        allocated_capacity: newAllocated,
        available_capacity: resource.total_capacity - newAllocated,
        utilization_percentage: parseFloat(utilization.toFixed(2)),
        is_overallocated: isOverallocated,
        overallocation_percentage: parseFloat(overallocationPercentage.toFixed(2))
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update utilization', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Utilization updated successfully', { capacityId: id, newAllocated })
    return actionSuccess(capacity, 'Utilization updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating utilization', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markUnavailable(id: string, from: string, until: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: capacity, error } = await supabase
      .from('capacity')
      .update({
        status: 'unavailable',
        availability_status: 'unavailable',
        available_from: from,
        available_until: until
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark capacity unavailable', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Capacity marked unavailable successfully', { capacityId: id, from, until })
    return actionSuccess(capacity, 'Capacity marked unavailable successfully')
  } catch (error: any) {
    logger.error('Unexpected error marking capacity unavailable', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resetCapacity(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: resource, error: fetchError } = await supabase
      .from('capacity')
      .select('total_capacity')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !resource) {
      logger.error('Resource not found', { capacityId: id })
      return actionError('Resource not found', 'DATABASE_ERROR')
    }

    const { data: capacity, error } = await supabase
      .from('capacity')
      .update({
        allocated_capacity: 0,
        available_capacity: resource.total_capacity,
        utilization_percentage: 0,
        is_overallocated: false,
        overallocation_percentage: 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to reset capacity', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/capacity-v2')
    logger.info('Capacity reset successfully', { capacityId: id })
    return actionSuccess(capacity, 'Capacity reset successfully')
  } catch (error: any) {
    logger.error('Unexpected error resetting capacity', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
