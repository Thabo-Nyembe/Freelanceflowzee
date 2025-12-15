'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createPricingPlan(input: PricingPlanInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { data }
}

export async function updatePricingPlan(id: string, updates: Partial<PricingPlanInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('pricing_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { data }
}

export async function deletePricingPlan(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('pricing_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { success: true }
}

export async function togglePlanActive(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: plan } = await supabase
    .from('pricing_plans')
    .select('is_active')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) {
    return { error: 'Plan not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { data }
}

export async function setFeaturedPlan(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { data }
}

export async function updatePlanSubscribers(id: string, count: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: plan } = await supabase
    .from('pricing_plans')
    .select('monthly_price, annual_price')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) {
    return { error: 'Plan not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/pricing-v2')
  return { data }
}

export async function getPricingPlans() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
