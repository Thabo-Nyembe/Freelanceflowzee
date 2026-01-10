'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('allocations-actions')

export interface CreateAllocationInput {
  resource_id?: string
  resource_name: string
  resource_role?: string
  project_name: string
  project_id?: string
  allocation_type?: string
  priority?: string
  hours_per_week?: number
  allocated_hours?: number
  start_date?: string
  end_date?: string
  billable_rate?: number
  currency?: string
  manager_name?: string
  manager_email?: string
  skills?: string[]
  notes?: string
}

export interface UpdateAllocationInput {
  resource_name?: string
  resource_role?: string
  project_name?: string
  allocation_type?: string
  status?: string
  priority?: string
  hours_per_week?: number
  allocated_hours?: number
  utilization?: number
  start_date?: string
  end_date?: string
  weeks_remaining?: number
  billable_rate?: number
  project_value?: number
  manager_name?: string
  skills?: string[]
  notes?: string
}

export async function createAllocation(input: CreateAllocationInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const allocationCode = `ALL-${Date.now().toString(36).toUpperCase()}`

    // Calculate utilization
    const hoursPerWeek = input.hours_per_week || 40
    const allocatedHours = input.allocated_hours || 0
    const utilization = hoursPerWeek > 0 ? (allocatedHours / hoursPerWeek) * 100 : 0

    // Calculate weeks remaining
    let weeksRemaining = 0
    if (input.end_date) {
      const end = new Date(input.end_date)
      const now = new Date()
      weeksRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)))
    }

    // Calculate project value
    const billableRate = input.billable_rate || 0
    const projectValue = allocatedHours * billableRate * weeksRemaining

    const { data, error } = await supabase
      .from('allocations')
      .insert({
        user_id: user.id,
        allocation_code: allocationCode,
        resource_id: input.resource_id,
        resource_name: input.resource_name,
        resource_role: input.resource_role,
        project_name: input.project_name,
        project_id: input.project_id,
        allocation_type: input.allocation_type || 'full-time',
        status: 'pending',
        priority: input.priority || 'medium',
        hours_per_week: hoursPerWeek,
        allocated_hours: allocatedHours,
        utilization,
        start_date: input.start_date,
        end_date: input.end_date,
        weeks_remaining: weeksRemaining,
        billable_rate: billableRate,
        project_value: projectValue,
        currency: input.currency || 'USD',
        manager_name: input.manager_name,
        manager_email: input.manager_email,
        skills: input.skills || [],
        notes: input.notes
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create allocation', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation created successfully', { allocationId: data.id })
    return actionSuccess(data, 'Allocation created successfully')
  } catch (error) {
    logger.error('Unexpected error creating allocation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAllocation(id: string, input: UpdateAllocationInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('allocations')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update allocation', { error, allocationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation updated successfully', { allocationId: id })
    return actionSuccess(data, 'Allocation updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating allocation', { error, allocationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function activateAllocation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('allocations')
      .update({
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate allocation', { error, allocationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation activated successfully', { allocationId: id })
    return actionSuccess(data, 'Allocation activated successfully')
  } catch (error) {
    logger.error('Unexpected error activating allocation', { error, allocationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeAllocation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('allocations')
      .update({
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0],
        weeks_remaining: 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete allocation', { error, allocationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation completed successfully', { allocationId: id })
    return actionSuccess(data, 'Allocation completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing allocation', { error, allocationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function cancelAllocation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('allocations')
      .update({
        status: 'cancelled',
        project_value: 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel allocation', { error, allocationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation cancelled successfully', { allocationId: id })
    return actionSuccess(data, 'Allocation cancelled successfully')
  } catch (error) {
    logger.error('Unexpected error cancelling allocation', { error, allocationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAllocation(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('allocations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete allocation', { error, allocationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/allocation-v2')
    logger.info('Allocation deleted successfully', { allocationId: id })
    return actionSuccess(undefined, 'Allocation deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting allocation', { error, allocationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAllocations(filters?: {
  status?: string
  allocationType?: string
  priority?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('allocations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.allocationType) {
      query = query.eq('allocation_type', filters.allocationType)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query.limit(200)

    if (error) {
      logger.error('Failed to fetch allocations', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Allocations fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, 'Allocations fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching allocations', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
