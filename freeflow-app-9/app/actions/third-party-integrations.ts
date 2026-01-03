'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('third-party-integrations-actions')

export interface ThirdPartyIntegrationInput {
  name: string
  description?: string
  provider?: string
  logo?: string
  category?: 'saas' | 'database' | 'cloud' | 'messaging' | 'ecommerce' | 'collaboration' | 'monitoring' | 'deployment'
  auth_method?: 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'custom'
  status?: 'active' | 'pending' | 'inactive' | 'error' | 'testing'
  version?: string
  endpoints_count?: number
  rate_limit?: string
  documentation_url?: string
  features?: string[]
  tags?: string[]
  config?: Record<string, any>
}

export async function createThirdPartyIntegration(input: ThirdPartyIntegrationInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('third_party_integrations')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create third party integration', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Third party integration created successfully', { name: input.name })
    revalidatePath('/dashboard/third-party-integrations-v2')
    return actionSuccess(data, 'Integration created successfully')
  } catch (error) {
    logger.error('Unexpected error creating third party integration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateThirdPartyIntegration(id: string, input: Partial<ThirdPartyIntegrationInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('third_party_integrations')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update third party integration', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Third party integration updated successfully', { id })
    revalidatePath('/dashboard/third-party-integrations-v2')
    return actionSuccess(data, 'Integration updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating third party integration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteThirdPartyIntegration(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('third_party_integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete third party integration', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Third party integration deleted successfully', { id })
    revalidatePath('/dashboard/third-party-integrations-v2')
    return actionSuccess({ success: true }, 'Integration deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting third party integration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function activateIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'active' })
}

export async function deactivateIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'inactive' })
}

export async function syncIntegration(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: integration } = await supabase
      .from('third_party_integrations')
      .select('api_calls_count')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('third_party_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        api_calls_count: (integration?.api_calls_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to sync integration', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Integration synced successfully', { id })
    revalidatePath('/dashboard/third-party-integrations-v2')
    return actionSuccess(data, 'Integration synced successfully')
  } catch (error) {
    logger.error('Unexpected error syncing integration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function testIntegration(id: string) {
  return updateThirdPartyIntegration(id, { status: 'testing' })
}

export async function getThirdPartyIntegrations(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get third party integrations', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Third party integrations retrieved successfully')
    return actionSuccess(data, 'Integrations retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting third party integrations', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
