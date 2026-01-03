'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('renewals-actions')

export interface CreateRenewalInput {
  customer_name: string
  customer_id?: string
  current_arr?: number
  proposed_arr?: number
  currency?: string
  renewal_date?: string
  contract_term?: number
  csm_name?: string
  csm_email?: string
  priority?: string
  notes?: string
  tags?: string[]
}

export interface UpdateRenewalInput {
  customer_name?: string
  status?: string
  renewal_type?: string
  priority?: string
  current_arr?: number
  proposed_arr?: number
  expansion_value?: number
  renewal_date?: string
  days_to_renewal?: number
  contract_term?: number
  probability?: number
  health_score?: number
  csm_name?: string
  csm_email?: string
  last_contact_date?: string
  meetings_scheduled?: number
  proposal_sent?: boolean
  proposal_sent_date?: string
  notes?: string
  tags?: string[]
}

export async function createRenewal(input: CreateRenewalInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const renewalCode = `REN-${Date.now().toString(36).toUpperCase()}`

    // Calculate expansion value
    const currentArr = input.current_arr || 0
    const proposedArr = input.proposed_arr || currentArr
    const expansionValue = proposedArr - currentArr

    // Calculate days to renewal
    let daysToRenewal = 0
    if (input.renewal_date) {
      const renewalDate = new Date(input.renewal_date)
      const today = new Date()
      daysToRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Determine renewal type
    let renewalType = 'flat'
    if (expansionValue > 0) renewalType = 'expansion'
    else if (expansionValue < 0) renewalType = 'contraction'

    const { data, error } = await supabase
      .from('renewals')
      .insert({
        user_id: user.id,
        renewal_code: renewalCode,
        customer_name: input.customer_name,
        customer_id: input.customer_id,
        status: 'upcoming',
        renewal_type: renewalType,
        priority: input.priority || 'medium',
        current_arr: currentArr,
        proposed_arr: proposedArr,
        expansion_value: expansionValue,
        currency: input.currency || 'USD',
        renewal_date: input.renewal_date,
        days_to_renewal: daysToRenewal,
        contract_term: input.contract_term || 12,
        probability: 50,
        health_score: 0,
        csm_name: input.csm_name,
        csm_email: input.csm_email,
        notes: input.notes,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create renewal', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal created successfully', { renewalCode })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess(data, 'Renewal created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating renewal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRenewal(id: string, input: UpdateRenewalInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Recalculate expansion if ARR changed
    if (input.current_arr !== undefined || input.proposed_arr !== undefined) {
      const { data: current } = await supabase
        .from('renewals')
        .select('current_arr, proposed_arr')
        .eq('id', id)
        .single()

      if (current) {
        const currentArr = input.current_arr ?? current.current_arr
        const proposedArr = input.proposed_arr ?? current.proposed_arr
        input.expansion_value = proposedArr - currentArr

        if (input.expansion_value > 0) input.renewal_type = 'expansion'
        else if (input.expansion_value < 0) input.renewal_type = 'contraction'
        else input.renewal_type = 'flat'
      }
    }

    const { data, error } = await supabase
      .from('renewals')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update renewal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal updated successfully', { id })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess(data, 'Renewal updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating renewal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markRenewalAtRisk(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal at-risk marking attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('renewals')
      .update({
        status: 'at-risk',
        priority: 'critical'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark renewal at risk', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal marked at risk', { id })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess(data, 'Renewal marked at risk')
  } catch (error: any) {
    logger.error('Unexpected error marking renewal at risk', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function winRenewal(id: string, finalArr?: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal win attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('renewals')
      .select('current_arr, proposed_arr')
      .eq('id', id)
      .single()

    const proposedArr = finalArr || current?.proposed_arr || 0

    const { data, error } = await supabase
      .from('renewals')
      .update({
        status: 'renewed',
        probability: 100,
        proposed_arr: proposedArr,
        expansion_value: proposedArr - (current?.current_arr || 0)
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to win renewal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal won', { id, finalArr: proposedArr })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess(data, 'Renewal marked as won')
  } catch (error: any) {
    logger.error('Unexpected error winning renewal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function loseRenewal(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal loss attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('renewals')
      .select('current_arr')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('renewals')
      .update({
        status: 'churned',
        renewal_type: 'downgrade',
        probability: 0,
        proposed_arr: 0,
        expansion_value: -(current?.current_arr || 0)
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark renewal as lost', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal marked as lost', { id })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess(data, 'Renewal marked as churned')
  } catch (error: any) {
    logger.error('Unexpected error losing renewal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteRenewal(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewal deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('renewals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete renewal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewal deleted successfully', { id })
    revalidatePath('/dashboard/renewals-v2')
    return actionSuccess({ success: true }, 'Renewal deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting renewal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getRenewals(filters?: {
  status?: string
  priority?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized renewals fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('renewals')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('renewal_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query.limit(200)

    if (error) {
      logger.error('Failed to fetch renewals', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Renewals fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Renewals fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching renewals', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
