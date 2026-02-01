'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('pricing-plans-actions')

export interface PricingPlanInput {
  name: string
  description?: string
  monthly_price?: number
  annual_price?: number
  currency?: string
  is_active?: boolean
  is_featured?: boolean
  sort_order?: number
  features?: any[]
  limits?: Record<string, any>
}

export async function createPricingPlan(input: PricingPlanInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get max sort order
    const { data: existingPlans } = await supabase
      .from('pricing_plans')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const maxOrder = existingPlans && existingPlans.length > 0 ? existingPlans[0].sort_order : 0

    const { data, error } = await supabase
      .from('pricing_plans')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description || null,
        monthly_price: input.monthly_price || 0,
        annual_price: input.annual_price || (input.monthly_price || 0) * 10,
        currency: input.currency || 'USD',
        is_active: input.is_active ?? true,
        is_featured: input.is_featured ?? false,
        sort_order: input.sort_order ?? maxOrder + 1,
        features: input.features || [],
        limits: input.limits || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create pricing plan', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Pricing plan created successfully', { planId: data.id })
    return actionSuccess(data, 'Pricing plan created successfully')
  } catch (error) {
    logger.error('Unexpected error creating pricing plan', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePricingPlan(id: string, updates: Partial<PricingPlanInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update pricing plan', { error, planId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Pricing plan updated successfully', { planId: id })
    return actionSuccess(data, 'Pricing plan updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating pricing plan', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePricingPlan(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete pricing plan', { error, planId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Pricing plan deleted successfully', { planId: id })
    return actionSuccess({ success: true }, 'Pricing plan deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting pricing plan', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function togglePlanActive(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!plan) {
      logger.error('Plan not found', { planId: id })
      return actionError('Plan not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({
        is_active: !plan.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle plan active status', { error, planId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Plan active status toggled successfully', { planId: id, isActive: data.is_active })
    return actionSuccess(data, 'Plan status updated successfully')
  } catch (error) {
    logger.error('Unexpected error toggling plan active status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function setFeaturedPlan(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Unset all featured first
    await supabase
      .from('pricing_plans')
      .update({ is_featured: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    // Set the new featured plan
    const { data, error } = await supabase
      .from('pricing_plans')
      .update({
        is_featured: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to set featured plan', { error, planId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Featured plan set successfully', { planId: id })
    return actionSuccess(data, 'Featured plan set successfully')
  } catch (error) {
    logger.error('Unexpected error setting featured plan', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePlanSubscribers(id: string, count: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('monthly_price, annual_price')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!plan) {
      logger.error('Plan not found', { planId: id })
      return actionError('Plan not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({
        subscribers_count: count,
        revenue_monthly: count * plan.monthly_price,
        revenue_annual: count * plan.annual_price,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update plan subscribers', { error, planId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/pricing-v2')
    logger.info('Plan subscribers updated successfully', { planId: id, count })
    return actionSuccess(data, 'Subscribers count updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating plan subscribers', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getPricingPlans(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      logger.error('Failed to fetch pricing plans', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Pricing plans fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Pricing plans retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching pricing plans', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
