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
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// LOGGER
// ============================================

const logger = createSimpleLogger('team-management')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  member_ids: z.array(z.string()).optional(),
  member_count: z.number().int().min(0).default(0),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional()
})

const updateTeamSchema = createTeamSchema.partial()

// ============================================
// TYPE DEFINITIONS
// ============================================

interface TeamData {
  id: string
  user_id: string
  name: string
  description?: string | null
  member_ids?: string[]
  member_count: number
  settings?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  created_by: string
  deleted_at?: string | null
}

type CreateTeamInput = z.infer<typeof createTeamSchema>
type UpdateTeamInput = z.infer<typeof updateTeamSchema>

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new team
 */
export async function createTeam(
  data: CreateTeamInput
): Promise<ActionResult<TeamData>> {
  try {
    // Validate input
    const validation = createTeamSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Team creation validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Team creation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('Team creation permission denied', { userId: user.id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Create team
    const { data: team, error } = await supabase
      .from('team_management')
      .insert({
        ...validation.data,
        user_id: user.id,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create team', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Team created successfully', {
      teamId: team.id,
      userId: user.id,
      teamName: team.name
    })

    revalidatePath('/dashboard/team-management-v2')
    return actionSuccess(team as TeamData, 'Team created successfully')
  } catch (error) {
    logger.error('Unexpected error creating team', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing team
 */
export async function updateTeam(
  id: string,
  data: UpdateTeamInput
): Promise<ActionResult<TeamData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid team ID format', 'VALIDATION_ERROR')
    }

    // Validate input
    const validation = updateTeamSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Team update validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Team update attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('Team update permission denied', { userId: user.id, teamId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('team_management', id)
    if (!canAccess) {
      logger.warn('Team update access denied', { userId: user.id, teamId: id })
      return actionError('Access denied: you cannot modify this team', 'FORBIDDEN')
    }

    // Update team
    const { data: team, error } = await supabase
      .from('team_management')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update team', { error, userId: user.id, teamId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Team updated successfully', {
      teamId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/team-management-v2')
    return actionSuccess(team as TeamData, 'Team updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating team', { error, teamId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a team (soft delete)
 */
export async function deleteTeam(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid team ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Team deletion attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('Team deletion permission denied', { userId: user.id, teamId: id })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('team_management', id)
    if (!canAccess) {
      logger.warn('Team deletion access denied', { userId: user.id, teamId: id })
      return actionError('Access denied: you cannot delete this team', 'FORBIDDEN')
    }

    // Soft delete team
    const { error } = await supabase
      .from('team_management')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete team', { error, userId: user.id, teamId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Team deleted successfully', {
      teamId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/team-management-v2')
    return actionSuccess({ deleted: true }, 'Team deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting team', { error, teamId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Add a member to a team
 */
export async function addTeamMember(
  teamId: string,
  memberId: string
): Promise<ActionResult<TeamData>> {
  try {
    // Validate IDs
    const teamIdValidation = uuidSchema.safeParse(teamId)
    const memberIdValidation = uuidSchema.safeParse(memberId)

    if (!teamIdValidation.success || !memberIdValidation.success) {
      return actionError('Invalid ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Add team member attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('Add team member permission denied', { userId: user.id, teamId })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('team_management', teamId)
    if (!canAccess) {
      logger.warn('Add team member access denied', { userId: user.id, teamId })
      return actionError('Access denied: you cannot modify this team', 'FORBIDDEN')
    }

    // Get current team
    const { data: team, error: fetchError } = await supabase
      .from('team_management')
      .select('member_ids, member_count')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !team) {
      logger.error('Failed to fetch team', { error: fetchError, userId: user.id, teamId })
      return actionError('Team not found', 'NOT_FOUND')
    }

    // Add member if not already present
    const memberIds = team.member_ids || []
    if (!memberIds.includes(memberId)) {
      memberIds.push(memberId)
    }

    // Update team
    const { data: updatedTeam, error: updateError } = await supabase
      .from('team_management')
      .update({
        member_ids: memberIds,
        member_count: memberIds.length
      })
      .eq('id', teamId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to add team member', {
        error: updateError,
        userId: user.id,
        teamId,
        memberId
      })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    logger.info('Team member added successfully', {
      teamId,
      memberId,
      userId: user.id
    })

    revalidatePath('/dashboard/team-management-v2')
    return actionSuccess(updatedTeam as TeamData, 'Team member added successfully')
  } catch (error) {
    logger.error('Unexpected error adding team member', { error, teamId, memberId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(
  teamId: string,
  memberId: string
): Promise<ActionResult<TeamData>> {
  try {
    // Validate IDs
    const teamIdValidation = uuidSchema.safeParse(teamId)
    const memberIdValidation = uuidSchema.safeParse(memberId)

    if (!teamIdValidation.success || !memberIdValidation.success) {
      return actionError('Invalid ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Remove team member attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check team management permission
    const canManageTeam = await hasPermission('manage_team')
    if (!canManageTeam) {
      logger.warn('Remove team member permission denied', { userId: user.id, teamId })
      return actionError('Permission denied: team management access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('team_management', teamId)
    if (!canAccess) {
      logger.warn('Remove team member access denied', { userId: user.id, teamId })
      return actionError('Access denied: you cannot modify this team', 'FORBIDDEN')
    }

    // Get current team
    const { data: team, error: fetchError } = await supabase
      .from('team_management')
      .select('member_ids')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !team) {
      logger.error('Failed to fetch team', { error: fetchError, userId: user.id, teamId })
      return actionError('Team not found', 'NOT_FOUND')
    }

    // Remove member
    const memberIds = (team.member_ids || []).filter((id: string) => id !== memberId)

    // Update team
    const { data: updatedTeam, error: updateError } = await supabase
      .from('team_management')
      .update({
        member_ids: memberIds,
        member_count: memberIds.length
      })
      .eq('id', teamId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to remove team member', {
        error: updateError,
        userId: user.id,
        teamId,
        memberId
      })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    logger.info('Team member removed successfully', {
      teamId,
      memberId,
      userId: user.id
    })

    revalidatePath('/dashboard/team-management-v2')
    return actionSuccess(updatedTeam as TeamData, 'Team member removed successfully')
  } catch (error) {
    logger.error('Unexpected error removing team member', { error, teamId, memberId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
