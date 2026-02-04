'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('user-settings-actions')

export interface UserSettingsInput {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  timezone?: string
  locale?: string
  email_notifications?: boolean
  push_notifications?: boolean
  marketing_emails?: boolean
  weekly_digest?: boolean
  two_factor_enabled?: boolean
  two_factor_method?: string
  theme?: 'light' | 'dark' | 'system'
  accent_color?: string
  compact_mode?: boolean
  api_rate_limit?: number
}

export async function getUserSettings(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get user settings', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Create default settings if none exist
    if (!data) {
      const { data: newData, error: createError } = await supabase
        .from('user_settings')
        .insert([{ user_id: user.id }])
        .select()
        .single()

      if (createError) {
        logger.error('Failed to create default settings', { error: createError, userId: user.id })
        return actionError(createError.message, 'DATABASE_ERROR')
      }
      logger.info('Default user settings created', { userId: user.id })
      return actionSuccess(newData, 'User settings created successfully')
    }

    logger.info('User settings retrieved', { userId: user.id })
    return actionSuccess(data, 'User settings retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getUserSettings', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateUserSettings(updates: UserSettingsInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user settings', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/settings-v2')
    logger.info('User settings updated', { userId: user.id })
    return actionSuccess(data, 'User settings updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateUserSettings', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateProfile(profile: {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
}): Promise<ActionResult<any>> {
  return updateUserSettings(profile)
}

export async function updateNotificationSettings(notifications: {
  email_notifications?: boolean
  push_notifications?: boolean
  marketing_emails?: boolean
  weekly_digest?: boolean
}): Promise<ActionResult<any>> {
  return updateUserSettings(notifications)
}

export async function updateSecuritySettings(security: {
  two_factor_enabled?: boolean
  two_factor_method?: string
}): Promise<ActionResult<any>> {
  return updateUserSettings(security)
}

export async function updateAppearanceSettings(appearance: {
  theme?: 'light' | 'dark' | 'system'
  accent_color?: string
  compact_mode?: boolean
}): Promise<ActionResult<any>> {
  return updateUserSettings(appearance)
}

export async function generateApiKey(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const newApiKey = `kazi_${crypto.randomUUID().replace(/-/g, '')}`

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        api_key: newApiKey,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to generate API key', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/settings-v2')
    logger.info('API key generated', { userId: user.id })
    return actionSuccess(data, 'API key generated successfully')
  } catch (error) {
    logger.error('Unexpected error in generateApiKey', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function revokeApiKey(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        api_key: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to revoke API key', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/settings-v2')
    logger.info('API key revoked', { userId: user.id })
    return actionSuccess(data, 'API key revoked successfully')
  } catch (error) {
    logger.error('Unexpected error in revokeApiKey', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
