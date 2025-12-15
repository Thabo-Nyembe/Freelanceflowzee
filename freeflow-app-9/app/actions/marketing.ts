'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface MarketingCampaignInput {
  name: string
  description?: string
  channel?: string
  campaign_type?: string
  status?: string
  priority?: string
  target_audience?: string
  target_segments?: string[]
  target_locations?: string[]
  target_demographics?: Record<string, any>
  budget?: number
  start_date?: string
  end_date?: string
  landing_page_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface MarketingChannelInput {
  name: string
  channel_type: string
  is_active?: boolean
  api_credentials?: Record<string, any>
  settings?: Record<string, any>
}

// Campaign Actions
export async function createMarketingCampaign(input: MarketingCampaignInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.status || 'draft',
      spent: 0,
      reach: 0,
      impressions: 0,
      clicks: 0,
      engagement_rate: 0,
      conversions: 0,
      conversion_rate: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return data
}

export async function updateMarketingCampaign(id: string, updates: Partial<MarketingCampaignInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return data
}

export async function deleteMarketingCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('marketing_campaigns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return { success: true }
}

export async function startCampaign(id: string) {
  return updateMarketingCampaign(id, {
    status: 'active',
    start_date: new Date().toISOString()
  } as any)
}

export async function pauseCampaign(id: string) {
  return updateMarketingCampaign(id, { status: 'paused' } as any)
}

export async function completeCampaign(id: string) {
  return updateMarketingCampaign(id, {
    status: 'completed',
    end_date: new Date().toISOString()
  } as any)
}

export async function updateCampaignMetrics(
  id: string,
  metrics: {
    reach?: number
    impressions?: number
    clicks?: number
    conversions?: number
    spent?: number
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Calculate rates
  const engagementRate = metrics.impressions && metrics.clicks
    ? (metrics.clicks / metrics.impressions) * 100
    : undefined
  const conversionRate = metrics.clicks && metrics.conversions
    ? (metrics.conversions / metrics.clicks) * 100
    : undefined

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({
      ...metrics,
      ...(engagementRate !== undefined ? { engagement_rate: engagementRate } : {}),
      ...(conversionRate !== undefined ? { conversion_rate: conversionRate } : {}),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return data
}

export async function getMarketingCampaigns() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Channel Actions
export async function createMarketingChannel(input: MarketingChannelInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('marketing_channels')
    .insert([{
      ...input,
      user_id: user.id,
      is_active: input.is_active ?? true,
      total_reach: 0,
      total_engagement: 0,
      total_conversions: 0,
      total_cost: 0,
      avg_engagement_rate: 0,
      avg_conversion_rate: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return data
}

export async function updateMarketingChannel(id: string, updates: Partial<MarketingChannelInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('marketing_channels')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/marketing-v2')
  return data
}

export async function getMarketingChannels() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('marketing_channels')
    .select('*')
    .eq('user_id', user.id)
    .order('total_reach', { ascending: false })

  if (error) throw error
  return data || []
}
