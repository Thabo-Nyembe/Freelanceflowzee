'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('sales-actions')

// Types
export interface SalesDealInput {
  title: string
  description?: string
  company_name?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  contact_title?: string
  deal_value: number
  currency?: string
  stage?: string
  probability?: number
  priority?: string
  deal_type?: string
  expected_close_date?: string
  assigned_to?: string
  team_id?: string
  lead_source?: string
  campaign_id?: string
  referral_source?: string
  tags?: string[]
  notes?: string
  metadata?: Record<string, any>
}

export interface SalesActivityInput {
  deal_id: string
  activity_type: string
  subject?: string
  description?: string
  outcome?: string
  duration_minutes?: number
  scheduled_at?: string
  completed_at?: string
  metadata?: Record<string, any>
}

// Deal Actions
export async function createSalesDeal(input: SalesDealInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales deal creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .insert([{
        ...input,
        user_id: user.id,
        stage: input.stage || 'lead',
        probability: input.probability || 0,
        currency: input.currency || 'USD'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create sales deal', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales deal created successfully', { title: input.title })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Sales deal created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating sales deal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSalesDeal(id: string, updates: Partial<SalesDealInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales deal update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update sales deal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales deal updated successfully', { id })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Sales deal updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating sales deal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSalesDeal(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales deal deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('sales_deals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete sales deal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales deal deleted successfully', { id })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess({ success: true }, 'Sales deal deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting sales deal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function moveDealToStage(id: string, stage: string, probability?: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized deal stage move attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updates: Record<string, any> = {
      stage,
      updated_at: new Date().toISOString()
    }

    if (probability !== undefined) {
      updates.probability = probability
    }

    if (stage === 'closed_won') {
      updates.won_at = new Date().toISOString()
      updates.actual_close_date = new Date().toISOString().split('T')[0]
      updates.probability = 100
    }

    if (stage === 'closed_lost') {
      updates.lost_at = new Date().toISOString()
      updates.actual_close_date = new Date().toISOString().split('T')[0]
      updates.probability = 0
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .update(updates)
      .eq('id', id)
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .select()
      .single()

    if (error) {
      logger.error('Failed to move deal to stage', { error: error.message, id, stage })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Deal moved to stage successfully', { id, stage })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Deal stage updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error moving deal to stage', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function winDeal(id: string) {
  return moveDealToStage(id, 'closed_won', 100)
}

export async function loseDeal(id: string, reason?: string, competitor?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized deal loss attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .update({
        stage: 'closed_lost',
        probability: 0,
        lost_at: new Date().toISOString(),
        lost_reason: reason,
        competitor,
        actual_close_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark deal as lost', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Deal marked as lost', { id, reason })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Deal marked as lost')
  } catch (error: any) {
    logger.error('Unexpected error losing deal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSalesDeals(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales deals fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .select('*')
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch sales deals', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales deals fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Sales deals fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching sales deals', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSalesDeal(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales deal fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_deals')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .single()

    if (error) {
      logger.error('Failed to fetch sales deal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales deal fetched successfully', { id })
    return actionSuccess(data, 'Sales deal fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching sales deal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Activity Actions
export async function logSalesActivity(input: SalesActivityInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized sales activity log attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_activities')
      .insert([{
        ...input,
        user_id: user.id
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to log sales activity', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update last contact on the deal
    await supabase
      .from('sales_deals')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', input.deal_id)

    logger.info('Sales activity logged successfully', { dealId: input.deal_id })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Sales activity logged successfully')
  } catch (error: any) {
    logger.error('Unexpected error logging sales activity', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSalesActivities(dealId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch sales activities', { error: error.message, dealId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sales activities fetched successfully', { dealId, count: data?.length || 0 })
    return actionSuccess(data || [], 'Sales activities fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching sales activities', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Pipeline Stage Actions
export async function createPipelineStage(input: {
  name: string
  stage_order: number
  probability?: number
  color?: string
  is_won_stage?: boolean
  is_lost_stage?: boolean
}): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized pipeline stage creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_pipeline_stages')
      .insert([{
        ...input,
        user_id: user.id,
        probability: input.probability || 0
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create pipeline stage', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Pipeline stage created successfully', { name: input.name })
    revalidatePath('/dashboard/sales-v2')
    return actionSuccess(data, 'Pipeline stage created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating pipeline stage', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getPipelineStages(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized pipeline stages fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('sales_pipeline_stages')
      .select('*')
      .eq('user_id', user.id)
      .order('stage_order', { ascending: true })

    if (error) {
      logger.error('Failed to fetch pipeline stages', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Pipeline stages fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Pipeline stages fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching pipeline stages', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
