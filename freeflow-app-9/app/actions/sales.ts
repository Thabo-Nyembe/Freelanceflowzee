'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createSalesDeal(input: SalesDealInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function updateSalesDeal(id: string, updates: Partial<SalesDealInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sales_deals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function deleteSalesDeal(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('sales_deals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return { success: true }
}

export async function moveDealToStage(id: string, stage: string, probability?: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function winDeal(id: string) {
  return moveDealToStage(id, 'closed_won', 100)
}

export async function loseDeal(id: string, reason?: string, competitor?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function getSalesDeals() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('sales_deals')
    .select('*')
    .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSalesDeal(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sales_deals')
    .select('*')
    .eq('id', id)
    .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
    .single()

  if (error) throw error
  return data
}

// Activity Actions
export async function logSalesActivity(input: SalesActivityInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sales_activities')
    .insert([{
      ...input,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) throw error

  // Update last contact on the deal
  await supabase
    .from('sales_deals')
    .update({ last_contact_at: new Date().toISOString() })
    .eq('id', input.deal_id)

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function getSalesActivities(dealId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('sales_activities')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Pipeline Stage Actions
export async function createPipelineStage(input: {
  name: string
  stage_order: number
  probability?: number
  color?: string
  is_won_stage?: boolean
  is_lost_stage?: boolean
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sales_pipeline_stages')
    .insert([{
      ...input,
      user_id: user.id,
      probability: input.probability || 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/sales-v2')
  return data
}

export async function getPipelineStages() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('sales_pipeline_stages')
    .select('*')
    .eq('user_id', user.id)
    .order('stage_order', { ascending: true })

  if (error) throw error
  return data || []
}
