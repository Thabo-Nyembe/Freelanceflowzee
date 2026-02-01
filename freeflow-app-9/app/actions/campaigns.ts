'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { Campaign } from '@/lib/hooks/use-campaigns'

const logger = createFeatureLogger('campaigns-actions')

export async function createCampaign(data: Partial<Campaign>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert([{ ...data, user_id: user.id, created_by: user.id, owner_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign created successfully', { campaignId: campaign.id })
    return actionSuccess(campaign, 'Campaign created successfully')
  } catch (error) {
    logger.error('Unexpected error creating campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({ ...data, updated_by: user.id })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign updated successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCampaign(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('campaigns')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign deleted successfully', { campaignId: id })
    return actionSuccess({ success: true }, 'Campaign deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function launchCampaign(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to launch campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign launched successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign launched successfully')
  } catch (error) {
    logger.error('Unexpected error launching campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pauseCampaign(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to pause campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign paused successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign paused successfully')
  } catch (error) {
    logger.error('Unexpected error pausing campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeCampaign(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to complete campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign completed successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCampaignMetrics(id: string, metrics: Partial<Pick<Campaign, 'impressions' | 'clicks' | 'conversions' | 'revenue_generated'>>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update campaign metrics', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign metrics updated successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating campaign metrics', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveCampaign(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to approve campaign', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/campaigns-v2')
    logger.info('Campaign approved successfully', { campaignId: id })
    return actionSuccess(campaign, 'Campaign approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving campaign', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
