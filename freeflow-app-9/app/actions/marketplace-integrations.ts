'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('marketplace-integrations-actions')

export interface MarketplaceIntegrationInput {
  name: string
  description?: string
  provider?: string
  logo?: string
  category?: 'crm' | 'marketing' | 'productivity' | 'communication' | 'analytics' | 'payment' | 'storage' | 'social'
  integration_type?: 'native' | 'api' | 'webhook' | 'oauth' | 'zapier'
  status?: 'connected' | 'available' | 'disconnected' | 'configuring' | 'error'
  version?: string
  pricing?: string
  sync_frequency?: string
  data_direction?: string
  setup_time?: string
  features?: string[]
  tags?: string[]
  config?: Record<string, any>
}

export async function createMarketplaceIntegration(input: MarketplaceIntegrationInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createMarketplaceIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating marketplace integration', { userId: user.id, name: input.name })

    const { data, error } = await supabase
      .from('marketplace_integrations')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create marketplace integration', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Marketplace integration created successfully', { id: data.id, userId: user.id })
    return actionSuccess(data, 'Marketplace integration created successfully')
  } catch (error) {
    logger.error('Unexpected error in createMarketplaceIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMarketplaceIntegration(id: string, input: Partial<MarketplaceIntegrationInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateMarketplaceIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating marketplace integration', { userId: user.id, integrationId: id })

    const { data, error } = await supabase
      .from('marketplace_integrations')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update marketplace integration', { error: error.message, integrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Marketplace integration updated successfully', { id: data.id, userId: user.id })
    return actionSuccess(data, 'Marketplace integration updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateMarketplaceIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteMarketplaceIntegration(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteMarketplaceIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting marketplace integration', { userId: user.id, integrationId: id })

    const { error } = await supabase
      .from('marketplace_integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete marketplace integration', { error: error.message, integrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Marketplace integration deleted successfully', { integrationId: id, userId: user.id })
    return actionSuccess({ success: true }, 'Marketplace integration deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteMarketplaceIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function connectIntegration(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to connectIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Connecting integration', { userId: user.id, integrationId: id })

    // First set to configuring
    await supabase
      .from('marketplace_integrations')
      .update({ status: 'configuring' })
      .eq('id', id)
      .eq('user_id', user.id)

    // Then complete connection
    const { data, error } = await supabase
      .from('marketplace_integrations')
      .update({
        status: 'connected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to connect integration', { error: error.message, integrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Integration connected successfully', { id: data.id, userId: user.id })
    return actionSuccess(data, 'Integration connected successfully')
  } catch (error) {
    logger.error('Unexpected error in connectIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disconnectIntegration(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to disconnectIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Disconnecting integration', { userId: user.id, integrationId: id })

    const { data, error } = await supabase
      .from('marketplace_integrations')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to disconnect integration', { error: error.message, integrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Integration disconnected successfully', { id: data.id, userId: user.id })
    return actionSuccess(data, 'Integration disconnected successfully')
  } catch (error) {
    logger.error('Unexpected error in disconnectIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateIntegration(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to rateIntegration')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Rating integration', { userId: user.id, integrationId: id, rating })

    const { data: integration } = await supabase
      .from('marketplace_integrations')
      .select('rating, reviews_count')
      .eq('id', id)
      .single()

    if (!integration) {
      logger.warn('Integration not found', { integrationId: id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    const newReviewsCount = (integration.reviews_count || 0) + 1
    const currentTotal = (integration.rating || 0) * (integration.reviews_count || 0)
    const newRating = (currentTotal + rating) / newReviewsCount

    const { data, error } = await supabase
      .from('marketplace_integrations')
      .update({
        rating: Math.round(newRating * 100) / 100,
        reviews_count: newReviewsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate integration', { error: error.message, integrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/integrations-marketplace-v2')
    logger.info('Integration rated successfully', { id: data.id, newRating: data.rating })
    return actionSuccess(data, 'Integration rated successfully')
  } catch (error) {
    logger.error('Unexpected error in rateIntegration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getMarketplaceIntegrations(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getMarketplaceIntegrations')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching marketplace integrations', { userId: user.id })

    const { data, error } = await supabase
      .from('marketplace_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch marketplace integrations', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Marketplace integrations fetched successfully', { count: data?.length || 0, userId: user.id })
    return actionSuccess(data || [], 'Marketplace integrations fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getMarketplaceIntegrations', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
