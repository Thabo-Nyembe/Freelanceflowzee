'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('mobile-app-actions')

export interface MobileAppFeatureInput {
  title: string
  description?: string
  feature_type?: 'core' | 'standard' | 'premium' | 'beta' | 'experimental'
  status?: 'active' | 'inactive' | 'beta' | 'deprecated' | 'coming-soon'
  platform?: 'all' | 'ios' | 'android'
  version?: string
  icon_color?: string
  tags?: string[]
  config?: Record<string, any>
}

export interface MobileAppVersionInput {
  version: string
  platform?: 'all' | 'ios' | 'android'
  status?: 'stable' | 'beta' | 'deprecated' | 'archived'
  release_notes?: string
  features?: string[]
  min_os_version?: string
  size_mb?: number
}

export async function createMobileFeature(input: MobileAppFeatureInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createMobileFeature')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating mobile feature', { userId: user.id, title: input.title })

    const { data, error } = await supabase
      .from('mobile_app_features')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create mobile feature', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/mobile-app-v2')
    logger.info('Mobile feature created successfully', { featureId: data.id })
    return actionSuccess(data, 'Mobile feature created successfully')
  } catch (error) {
    logger.error('Unexpected error in createMobileFeature', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMobileFeature(id: string, input: Partial<MobileAppFeatureInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateMobileFeature')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating mobile feature', { userId: user.id, featureId: id })

    const { data, error } = await supabase
      .from('mobile_app_features')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update mobile feature', { error: error.message, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/mobile-app-v2')
    logger.info('Mobile feature updated successfully', { featureId: data.id })
    return actionSuccess(data, 'Mobile feature updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateMobileFeature', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteMobileFeature(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteMobileFeature')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting mobile feature', { userId: user.id, featureId: id })

    const { error } = await supabase
      .from('mobile_app_features')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete mobile feature', { error: error.message, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/mobile-app-v2')
    logger.info('Mobile feature deleted successfully', { featureId: id })
    return actionSuccess({ success: true }, 'Mobile feature deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteMobileFeature', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function activateFeature(id: string): Promise<ActionResult<any>> {
  return updateMobileFeature(id, { status: 'active' })
}

export async function deactivateFeature(id: string): Promise<ActionResult<any>> {
  return updateMobileFeature(id, { status: 'inactive' })
}

export async function createMobileVersion(input: MobileAppVersionInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createMobileVersion')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating mobile version', { userId: user.id, version: input.version })

    const { data, error } = await supabase
      .from('mobile_app_versions')
      .insert([{
        ...input,
        user_id: user.id,
        release_date: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create mobile version', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/mobile-app-v2')
    logger.info('Mobile version created successfully', { versionId: data.id })
    return actionSuccess(data, 'Mobile version created successfully')
  } catch (error) {
    logger.error('Unexpected error in createMobileVersion', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMobileVersion(id: string, input: Partial<MobileAppVersionInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateMobileVersion')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating mobile version', { userId: user.id, versionId: id })

    const { data, error } = await supabase
      .from('mobile_app_versions')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update mobile version', { error: error.message, versionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/mobile-app-v2')
    logger.info('Mobile version updated successfully', { versionId: data.id })
    return actionSuccess(data, 'Mobile version updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateMobileVersion', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deprecateVersion(id: string): Promise<ActionResult<any>> {
  return updateMobileVersion(id, { status: 'deprecated' })
}

export async function getMobileAppData(): Promise<ActionResult<{ features: any[], versions: any[] }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getMobileAppData')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching mobile app data', { userId: user.id })

    const [featuresResult, versionsResult] = await Promise.all([
      supabase
        .from('mobile_app_features')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('mobile_app_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    const result = {
      features: featuresResult.data || [],
      versions: versionsResult.data || []
    }

    logger.info('Mobile app data fetched successfully', {
      featuresCount: result.features.length,
      versionsCount: result.versions.length
    })
    return actionSuccess(result, 'Mobile app data fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getMobileAppData', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
