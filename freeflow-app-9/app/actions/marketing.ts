'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('marketing-actions')

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
export async function createMarketingCampaign(input: MarketingCampaignInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create marketing campaign', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketing campaign created successfully', { campaignId: data.id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess(data, 'Marketing campaign created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating marketing campaign', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMarketingCampaign(id: string, updates: Partial<MarketingCampaignInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update marketing campaign', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketing campaign updated successfully', { campaignId: id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess(data, 'Marketing campaign updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating marketing campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteMarketingCampaign(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('marketing_campaigns')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete marketing campaign', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketing campaign deleted successfully', { campaignId: id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess({ success: true }, 'Marketing campaign deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting marketing campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startCampaign(id: string): Promise<ActionResult<any>> {
  return updateMarketingCampaign(id, {
    status: 'active',
    start_date: new Date().toISOString()
  } as any)
}

export async function pauseCampaign(id: string): Promise<ActionResult<any>> {
  return updateMarketingCampaign(id, { status: 'paused' } as any)
}

export async function completeCampaign(id: string): Promise<ActionResult<any>> {
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
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update campaign metrics', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Campaign metrics updated successfully', { campaignId: id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess(data, 'Campaign metrics updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating campaign metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getMarketingCampaigns(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get marketing campaigns', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Marketing campaigns retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting marketing campaigns', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Channel Actions
export async function createMarketingChannel(input: MarketingChannelInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create marketing channel', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketing channel created successfully', { channelId: data.id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess(data, 'Marketing channel created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating marketing channel', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMarketingChannel(id: string, updates: Partial<MarketingChannelInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('marketing_channels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update marketing channel', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketing channel updated successfully', { channelId: id })
    revalidatePath('/dashboard/marketing-v2')
    return actionSuccess(data, 'Marketing channel updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating marketing channel', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getMarketingChannels(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('marketing_channels')
      .select('*')
      .eq('user_id', user.id)
      .order('total_reach', { ascending: false })

    if (error) {
      logger.error('Failed to get marketing channels', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Marketing channels retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting marketing channels', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
