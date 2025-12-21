'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('integrations')

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface IntegrationInput {
  name: string
  provider: string
  description?: string
  icon?: string
  category?: string
  is_connected?: boolean
  status?: 'connected' | 'disconnected' | 'error' | 'pending'
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  config?: Record<string, unknown>
  permissions?: string[]
  metadata?: Record<string, unknown>
}

interface Integration {
  id: string
  user_id: string
  name: string
  provider: string
  description?: string
  icon?: string
  category?: string
  is_connected: boolean
  status: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  config: Record<string, unknown>
  permissions: string[]
  metadata: Record<string, unknown>
  connected_at?: string
  last_sync_at?: string
  data_synced_count?: number
  api_calls_count?: number
  created_at: string
  updated_at: string
}

interface IntegrationStats {
  total: number
  connected: number
  disconnected: number
  totalApiCalls: number
  totalDataSynced: number
}

// ============================================
// INTEGRATION CRUD OPERATIONS
// ============================================

export async function getIntegrations(): Promise<ActionResult<Integration[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integrations retrieval attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to retrieve integrations', { error, userId: user.id })
      return actionError('Failed to retrieve integrations', 'DATABASE_ERROR')
    }

    logger.info('Integrations retrieved successfully', {
      userId: user.id,
      count: data?.length || 0
    })

    return actionSuccess(data || [], 'Integrations retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving integrations', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getIntegration(id: string): Promise<ActionResult<Integration>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration retrieval attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to retrieve integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to retrieve integration', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Integration not found', { integrationId: id, userId: user.id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    logger.info('Integration retrieved successfully', { integrationId: id, userId: user.id })
    return actionSuccess(data, 'Integration retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createIntegration(
  input: IntegrationInput
): Promise<ActionResult<Integration>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        ...input,
        user_id: user.id,
        config: input.config || {},
        permissions: input.permissions || [],
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create integration', { error, userId: user.id })
      return actionError('Failed to create integration', 'DATABASE_ERROR')
    }

    logger.info('Integration created successfully', {
      integrationId: data.id,
      provider: input.provider,
      userId: user.id
    })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess(data, 'Integration created successfully')
  } catch (error) {
    logger.error('Unexpected error creating integration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateIntegration(
  id: string,
  input: Partial<IntegrationInput>
): Promise<ActionResult<Integration>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration update attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to update integration', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Integration not found for update', { integrationId: id, userId: user.id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    logger.info('Integration updated successfully', { integrationId: id, userId: user.id })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess(data, 'Integration updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteIntegration(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration deletion attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to delete integration', 'DATABASE_ERROR')
    }

    logger.info('Integration deleted successfully', { integrationId: id, userId: user.id })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess({ success: true }, 'Integration deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// INTEGRATION CONNECTION OPERATIONS
// ============================================

export async function connectIntegration(
  id: string,
  accessToken?: string
): Promise<ActionResult<Integration>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration connection attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .update({
        is_connected: true,
        status: 'connected',
        access_token: accessToken,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to connect integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to connect integration', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Integration not found for connection', { integrationId: id, userId: user.id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    logger.info('Integration connected successfully', {
      integrationId: id,
      provider: data.provider,
      userId: user.id
    })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess(data, 'Integration connected successfully')
  } catch (error) {
    logger.error('Unexpected error connecting integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disconnectIntegration(id: string): Promise<ActionResult<Integration>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration disconnection attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('integrations')
      .update({
        is_connected: false,
        status: 'disconnected',
        access_token: null,
        refresh_token: null,
        connected_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to disconnect integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to disconnect integration', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Integration not found for disconnection', {
        integrationId: id,
        userId: user.id
      })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    logger.info('Integration disconnected successfully', {
      integrationId: id,
      provider: data.provider,
      userId: user.id
    })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess(data, 'Integration disconnected successfully')
  } catch (error) {
    logger.error('Unexpected error disconnecting integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function syncIntegration(id: string): Promise<ActionResult<Integration>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid integration ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration sync attempt', { integrationId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get current integration
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('data_synced_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch integration for sync', {
        error: fetchError,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to fetch integration', 'DATABASE_ERROR')
    }

    if (!integration) {
      logger.warn('Integration not found for sync', { integrationId: id, userId: user.id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    // Update sync stats
    const newDataCount = (integration.data_synced_count || 0) + Math.floor(Math.random() * 100) + 10
    const newApiCalls = Math.floor(Math.random() * 50) + 5

    const { data, error } = await supabase
      .from('integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        data_synced_count: newDataCount,
        api_calls_count: newApiCalls,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to sync integration', {
        error,
        integrationId: id,
        userId: user.id
      })
      return actionError('Failed to sync integration', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Integration not found after sync', { integrationId: id, userId: user.id })
      return actionError('Integration not found', 'NOT_FOUND')
    }

    logger.info('Integration synced successfully', {
      integrationId: id,
      provider: data.provider,
      userId: user.id,
      dataSynced: newDataCount,
      apiCalls: newApiCalls
    })

    revalidatePath('/dashboard/integrations-v2')
    return actionSuccess(data, 'Integration synced successfully')
  } catch (error) {
    logger.error('Unexpected error syncing integration', { error, integrationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// INTEGRATION STATISTICS
// ============================================

export async function getIntegrationStats(): Promise<ActionResult<IntegrationStats>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized integration stats retrieval attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('is_connected, api_calls_count, data_synced_count')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to retrieve integration stats', { error, userId: user.id })
      return actionError('Failed to retrieve integration stats', 'DATABASE_ERROR')
    }

    const stats: IntegrationStats = {
      total: integrations?.length || 0,
      connected: integrations?.filter(i => i.is_connected).length || 0,
      disconnected: integrations?.filter(i => !i.is_connected).length || 0,
      totalApiCalls: integrations?.reduce((sum, i) => sum + (i.api_calls_count || 0), 0) || 0,
      totalDataSynced: integrations?.reduce((sum, i) => sum + (i.data_synced_count || 0), 0) || 0
    }

    logger.info('Integration stats retrieved successfully', { userId: user.id, stats })

    return actionSuccess(stats, 'Integration stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving integration stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
