'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  type ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('user-management')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createManagedUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(['admin', 'owner', 'manager', 'member', 'viewer', 'guest']).default('member'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  metadata: z.record(z.unknown()).optional()
})

const updateManagedUserSchema = createManagedUserSchema.partial()

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ManagedUserData {
  id: string
  user_id: string
  email: string
  name: string
  role: string
  status: string
  phone?: string | null
  avatar_url?: string | null
  department?: string | null
  position?: string | null
  notes?: string | null
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  created_by: string
  deleted_at?: string | null
}

type CreateManagedUserInput = z.infer<typeof createManagedUserSchema>
type UpdateManagedUserInput = z.infer<typeof updateManagedUserSchema>

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new managed user
 */
export async function createManagedUser(
  data: CreateManagedUserInput
): Promise<ActionResult<ManagedUserData>> {
  try {
    // Validate input
    const validation = createManagedUserSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('User creation validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('User creation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('User creation permission denied', { userId: user.id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Create managed user
    const { data: managedUser, error } = await supabase
      .from('user_management')
      .insert({
        ...validation.data,
        user_id: user.id,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create managed user', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Managed user created successfully', {
      managedUserId: managedUser.id,
      userId: user.id,
      email: managedUser.email
    })

    revalidatePath('/dashboard/user-management-v2')
    return actionSuccess(managedUser as ManagedUserData, 'User created successfully')
  } catch (error) {
    logger.error('Unexpected error creating managed user', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing managed user
 */
export async function updateManagedUser(
  id: string,
  data: UpdateManagedUserInput
): Promise<ActionResult<ManagedUserData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid user ID format', 'VALIDATION_ERROR')
    }

    // Validate input
    const validation = updateManagedUserSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('User update validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('User update attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('User update permission denied', { userId: user.id, managedUserId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('user_management', id)
    if (!canAccess) {
      logger.warn('User update access denied', { userId: user.id, managedUserId: id })
      return actionError('Access denied: you cannot modify this user', 'FORBIDDEN')
    }

    // Update managed user
    const { data: managedUser, error } = await supabase
      .from('user_management')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update managed user', { error, userId: user.id, managedUserId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Managed user updated successfully', {
      managedUserId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/user-management-v2')
    return actionSuccess(managedUser as ManagedUserData, 'User updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating managed user', { error, managedUserId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a managed user (soft delete)
 */
export async function deleteManagedUser(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid user ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('User deletion attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('User deletion permission denied', { userId: user.id, managedUserId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('user_management', id)
    if (!canAccess) {
      logger.warn('User deletion access denied', { userId: user.id, managedUserId: id })
      return actionError('Access denied: you cannot delete this user', 'FORBIDDEN')
    }

    // Soft delete managed user
    const { error } = await supabase
      .from('user_management')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete managed user', { error, userId: user.id, managedUserId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Managed user deleted successfully', {
      managedUserId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/user-management-v2')
    return actionSuccess({ deleted: true }, 'User deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting managed user', { error, managedUserId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Suspend a managed user
 */
export async function suspendUser(
  id: string,
  reason?: string
): Promise<ActionResult<ManagedUserData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid user ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('User suspension attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('User suspension permission denied', { userId: user.id, managedUserId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('user_management', id)
    if (!canAccess) {
      logger.warn('User suspension access denied', { userId: user.id, managedUserId: id })
      return actionError('Access denied: you cannot suspend this user', 'FORBIDDEN')
    }

    // Suspend user
    const { data: managedUser, error } = await supabase
      .from('user_management')
      .update({
        status: 'suspended',
        notes: reason || 'Suspended by administrator'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to suspend user', { error, userId: user.id, managedUserId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('User suspended successfully', {
      managedUserId: id,
      userId: user.id,
      reason
    })

    revalidatePath('/dashboard/user-management-v2')
    return actionSuccess(managedUser as ManagedUserData, 'User suspended successfully')
  } catch (error) {
    logger.error('Unexpected error suspending user', { error, managedUserId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Activate a managed user
 */
export async function activateUser(id: string): Promise<ActionResult<ManagedUserData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid user ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('User activation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('User activation permission denied', { userId: user.id, managedUserId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('user_management', id)
    if (!canAccess) {
      logger.warn('User activation access denied', { userId: user.id, managedUserId: id })
      return actionError('Access denied: you cannot activate this user', 'FORBIDDEN')
    }

    // Activate user
    const { data: managedUser, error } = await supabase
      .from('user_management')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate user', { error, userId: user.id, managedUserId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('User activated successfully', {
      managedUserId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/user-management-v2')
    return actionSuccess(managedUser as ManagedUserData, 'User activated successfully')
  } catch (error) {
    logger.error('Unexpected error activating user', { error, managedUserId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
