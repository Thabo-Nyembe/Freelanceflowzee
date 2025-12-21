'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('team-actions')

export interface TeamMemberInput {
  name: string
  email?: string
  role?: string
  department?: string
  avatar_url?: string
  phone?: string
  status?: 'active' | 'inactive' | 'pending' | 'on_leave'
  is_lead?: boolean
  projects_count?: number
  tasks_completed?: number
  performance_score?: number
  hire_date?: string
  hourly_rate?: number
  skills?: string[]
  metadata?: Record<string, any>
}

export async function getTeamMembers(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to fetch team members', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Team members fetched', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Team members retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching team members', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTeamMember(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch team member', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Team member fetched', { memberId: id })
    return actionSuccess(data, 'Team member retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching team member', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createTeamMember(input: TeamMemberInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        ...input,
        user_id: user.id,
        skills: input.skills || [],
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create team member', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/team-hub-v2')
    logger.info('Team member created', { memberId: data.id })
    return actionSuccess(data, 'Team member created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating team member', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTeamMember(id: string, input: Partial<TeamMemberInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('team_members')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update team member', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/team-hub-v2')
    logger.info('Team member updated', { memberId: id })
    return actionSuccess(data, 'Team member updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating team member', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete team member', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/team-hub-v2')
    logger.info('Team member deleted', { memberId: id })
    return actionSuccess({ success: true }, 'Team member deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting team member', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTeamMemberStatus(id: string, status: TeamMemberInput['status']) {
  return updateTeamMember(id, { status })
}

export async function toggleTeamMemberLead(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // First get current state
    const { data: member, error: fetchError } = await supabase
      .from('team_members')
      .select('is_lead')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch team member for toggle', { error: fetchError.message, id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    // Toggle lead status
    const { data, error } = await supabase
      .from('team_members')
      .update({
        is_lead: !member.is_lead,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle team member lead status', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/team-hub-v2')
    logger.info('Team member lead status toggled', { memberId: id, isLead: data.is_lead })
    return actionSuccess(data, 'Team member lead status updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error toggling team member lead status', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTeamMemberPerformance(id: string, score: number) {
  const validScore = Math.min(100, Math.max(0, score))
  return updateTeamMember(id, { performance_score: validScore })
}

export async function bulkUpdateTeamMembers(ids: string[], updates: Partial<TeamMemberInput>): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk update team members', { error: error.message, count: ids.length })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/team-hub-v2')
    logger.info('Team members bulk updated', { count: ids.length })
    return actionSuccess({ success: true }, `${ids.length} team members updated successfully`)
  } catch (error: any) {
    logger.error('Unexpected error bulk updating team members', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTeamStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: members, error } = await supabase
      .from('team_members')
      .select('status, is_lead, performance_score')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch team stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const active = members?.filter(m => m.status === 'active') || []
    const stats = {
      total: members?.length || 0,
      active: active.length,
      inactive: members?.filter(m => m.status === 'inactive').length || 0,
      pending: members?.filter(m => m.status === 'pending').length || 0,
      onLeave: members?.filter(m => m.status === 'on_leave').length || 0,
      leads: members?.filter(m => m.is_lead).length || 0,
      avgPerformance: active.length > 0
        ? Math.round(active.reduce((sum, m) => sum + (m.performance_score || 0), 0) / active.length)
        : 0
    }

    logger.info('Team stats fetched', { total: stats.total })
    return actionSuccess(stats, 'Team stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching team stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
