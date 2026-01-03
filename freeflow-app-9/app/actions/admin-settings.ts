'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/permissions'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// TYPES
// ============================================

interface AdminSetting {
  id: string
  user_id: string
  [key: string]: unknown
}

interface CreateAdminSettingInput {
  [key: string]: unknown
}

interface UpdateAdminSettingInput {
  version?: number
  [key: string]: unknown
}

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('admin-settings')

// ============================================
// ADMIN SETTINGS ACTIONS
// ============================================

/**
 * Create a new admin setting
 */
export async function createAdminSetting(
  data: CreateAdminSettingInput
): Promise<ActionResult<AdminSetting>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create admin setting failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Admin settings require admin role
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn('Create admin setting failed: Insufficient permissions', {
        userId: user.id,
        role: currentUser?.role
      })
      return actionError('Permission denied: admin access required', 'FORBIDDEN')
    }

    const { data: setting, error } = await supabase
      .from('admin_settings')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create admin setting', {
        error,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Admin setting created successfully', {
      settingId: setting.id,
      userId: user.id
    })

    revalidatePath('/dashboard/admin-v2')
    return actionSuccess(setting as AdminSetting)
  } catch (error) {
    logger.error('Unexpected error creating admin setting', { error })
    return actionError('Failed to create admin setting', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing admin setting
 */
export async function updateAdminSetting(
  id: string,
  data: UpdateAdminSettingInput
): Promise<ActionResult<AdminSetting>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid setting ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Update admin setting failed: User not authenticated', { settingId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Admin settings require admin role
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn('Update admin setting failed: Insufficient permissions', {
        userId: user.id,
        role: currentUser?.role,
        settingId: id
      })
      return actionError('Permission denied: admin access required', 'FORBIDDEN')
    }

    const { data: setting, error } = await supabase
      .from('admin_settings')
      .update({
        ...data,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        version: data.version ? data.version + 1 : 2
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update admin setting', {
        error,
        settingId: id,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Admin setting updated successfully', {
      settingId: id,
      userId: user.id,
      version: setting.version
    })

    revalidatePath('/dashboard/admin-v2')
    return actionSuccess(setting as AdminSetting)
  } catch (error) {
    logger.error('Unexpected error updating admin setting', { error, settingId: id })
    return actionError('Failed to update admin setting', 'INTERNAL_ERROR')
  }
}

/**
 * Delete an admin setting (soft delete)
 */
export async function deleteAdminSetting(
  id: string
): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid setting ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Delete admin setting failed: User not authenticated', { settingId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Admin settings require admin role
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn('Delete admin setting failed: Insufficient permissions', {
        userId: user.id,
        role: currentUser?.role,
        settingId: id
      })
      return actionError('Permission denied: admin access required', 'FORBIDDEN')
    }

    const { error } = await supabase
      .from('admin_settings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete admin setting', {
        error,
        settingId: id,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Admin setting deleted successfully', {
      settingId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/admin-v2')
    return actionSuccess({ success: true })
  } catch (error) {
    logger.error('Unexpected error deleting admin setting', { error, settingId: id })
    return actionError('Failed to delete admin setting', 'INTERNAL_ERROR')
  }
}
