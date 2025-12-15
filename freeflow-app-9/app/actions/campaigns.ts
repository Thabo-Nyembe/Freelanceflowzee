'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Campaign } from '@/lib/hooks/use-campaigns'

export async function createCampaign(data: Partial<Campaign>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert([{ ...data, user_id: user.id, created_by: user.id, owner_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({ ...data, updated_by: user.id })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function deleteCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('campaigns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return { success: true }
}

export async function launchCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      status: 'running',
      phase: 'running',
      launched_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function pauseCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      status: 'paused',
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function completeCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      status: 'completed',
      phase: 'completed',
      completed_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function updateCampaignMetrics(id: string, metrics: Partial<Pick<Campaign, 'impressions' | 'clicks' | 'conversions' | 'revenue_generated'>>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Calculate rates if we have the data
  const updateData: any = { ...metrics }

  if (metrics.clicks !== undefined && metrics.impressions !== undefined && metrics.impressions > 0) {
    updateData.click_through_rate = parseFloat(((metrics.clicks / metrics.impressions) * 100).toFixed(2))
  }

  if (metrics.conversions !== undefined && metrics.clicks !== undefined && metrics.clicks > 0) {
    updateData.conversion_rate = parseFloat(((metrics.conversions / metrics.clicks) * 100).toFixed(2))
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}

export async function approveCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/campaigns-v2')
  return campaign
}
