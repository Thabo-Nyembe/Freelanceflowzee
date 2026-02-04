'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('roadmap-actions')

// Roadmap Types
type InitiativeStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
type InitiativePriority = 'low' | 'medium' | 'high' | 'critical'
type InitiativeImpact = 'low' | 'medium' | 'high' | 'very_high' | 'critical'
type InitiativeEffort = 'small' | 'medium' | 'large' | 'extra_large'
type MilestoneStatus = 'planned' | 'on_track' | 'at_risk' | 'delayed' | 'completed'

// Create Initiative
export async function createRoadmapInitiative(data: {
  title: string
  description?: string
  quarter?: string
  year?: number
  theme?: string
  team?: string
  priority?: InitiativePriority
  impact?: InitiativeImpact
  effort?: InitiativeEffort
  stakeholders?: string[]
  owner_id?: string
  start_date?: string
  target_date?: string
  tags?: string[]
  dependencies?: string[]
  metadata?: Record<string, any>
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap initiative creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: initiative, error } = await supabase
      .from('roadmap_initiatives')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        quarter: data.quarter,
        year: data.year || new Date().getFullYear(),
        theme: data.theme,
        team: data.team,
        status: 'planned',
        priority: data.priority || 'medium',
        impact: data.impact || 'medium',
        effort: data.effort || 'medium',
        stakeholders: data.stakeholders || [],
        owner_id: data.owner_id,
        start_date: data.start_date,
        target_date: data.target_date,
        tags: data.tags || [],
        dependencies: data.dependencies || [],
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create roadmap initiative', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap initiative created successfully', { title: data.title })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess(initiative, 'Roadmap initiative created successfully')
  } catch (error) {
    logger.error('Unexpected error creating roadmap initiative', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Initiative
export async function updateRoadmapInitiative(initiativeId: string, data: Partial<{
  title: string
  description: string
  quarter: string
  year: number
  theme: string
  team: string
  status: InitiativeStatus
  priority: InitiativePriority
  progress_percentage: number
  impact: InitiativeImpact
  effort: InitiativeEffort
  stakeholders: string[]
  owner_id: string
  start_date: string
  target_date: string
  completed_date: string
  tags: string[]
  dependencies: string[]
  metadata: Record<string, any>
}>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap initiative update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // If status is completed, set completed_date
    if (data.status === 'completed' && !data.completed_date) {
      data.completed_date = new Date().toISOString().split('T')[0]
    }

    const { data: initiative, error } = await supabase
      .from('roadmap_initiatives')
      .update(data)
      .eq('id', initiativeId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update roadmap initiative', { error: error.message, initiativeId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap initiative updated successfully', { initiativeId })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess(initiative, 'Roadmap initiative updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating roadmap initiative', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Initiative Status
export async function updateInitiativeStatus(initiativeId: string, status: InitiativeStatus) {
  return updateRoadmapInitiative(initiativeId, { status })
}

// Update Initiative Progress
export async function updateInitiativeProgress(initiativeId: string, progress: number) {
  const status: InitiativeStatus = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planned'
  return updateRoadmapInitiative(initiativeId, { progress_percentage: progress, status })
}

// Delete Initiative (soft delete)
export async function deleteRoadmapInitiative(initiativeId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap initiative deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('roadmap_initiatives')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', initiativeId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete roadmap initiative', { error: error.message, initiativeId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap initiative deleted successfully', { initiativeId })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess({ success: true }, 'Roadmap initiative deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting roadmap initiative', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create Milestone
export async function createRoadmapMilestone(data: {
  milestone_name: string
  description?: string
  target_date: string
  metadata?: Record<string, any>
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap milestone creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: milestone, error } = await supabase
      .from('roadmap_milestones')
      .insert({
        user_id: user.id,
        milestone_name: data.milestone_name,
        description: data.description,
        target_date: data.target_date,
        status: 'planned',
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create roadmap milestone', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap milestone created successfully', { milestone_name: data.milestone_name })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess(milestone, 'Roadmap milestone created successfully')
  } catch (error) {
    logger.error('Unexpected error creating roadmap milestone', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Milestone
export async function updateRoadmapMilestone(milestoneId: string, data: Partial<{
  milestone_name: string
  description: string
  target_date: string
  completed_date: string
  status: MilestoneStatus
  initiatives_count: number
  completion_percentage: number
  metadata: Record<string, any>
}>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap milestone update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // If status is completed, set completed_date
    if (data.status === 'completed' && !data.completed_date) {
      data.completed_date = new Date().toISOString().split('T')[0]
    }

    const { data: milestone, error } = await supabase
      .from('roadmap_milestones')
      .update(data)
      .eq('id', milestoneId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update roadmap milestone', { error: error.message, milestoneId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap milestone updated successfully', { milestoneId })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess(milestone, 'Roadmap milestone updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating roadmap milestone', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Milestone Status
export async function updateMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
  return updateRoadmapMilestone(milestoneId, { status })
}

// Delete Milestone (soft delete)
export async function deleteRoadmapMilestone(milestoneId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap milestone deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('roadmap_milestones')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', milestoneId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete roadmap milestone', { error: error.message, milestoneId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Roadmap milestone deleted successfully', { milestoneId })
    revalidatePath('/dashboard/roadmap-v2')
    return actionSuccess({ success: true }, 'Roadmap milestone deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting roadmap milestone', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Calculate Milestone Progress
export async function calculateMilestoneProgress(milestoneId: string, initiativeIds: string[]): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized milestone progress calculation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get initiatives progress
    const { data: initiatives } = await supabase
      .from('roadmap_initiatives')
      .select('progress_percentage')
      .in('id', initiativeIds)
      .is('deleted_at', null)

    const initiativesCount = initiatives?.length || 0
    const completionPercentage = initiativesCount > 0
      ? initiatives!.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / initiativesCount
      : 0

    // Determine status based on completion
    let status: MilestoneStatus = 'planned'
    if (completionPercentage >= 100) {
      status = 'completed'
    } else if (completionPercentage > 0) {
      status = 'on_track'
    }

    logger.info('Calculating milestone progress', { milestoneId, completionPercentage })
    return updateRoadmapMilestone(milestoneId, {
      initiatives_count: initiativesCount,
      completion_percentage: completionPercentage,
      status
    })
  } catch (error) {
    logger.error('Unexpected error calculating milestone progress', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get Roadmap Stats
export async function getRoadmapStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized roadmap stats fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: initiatives } = await supabase
      .from('roadmap_initiatives')
      .select('status, priority, progress_percentage, theme')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const stats = {
      totalInitiatives: initiatives?.length || 0,
      completedInitiatives: initiatives?.filter(i => i.status === 'completed').length || 0,
      inProgressInitiatives: initiatives?.filter(i => i.status === 'in_progress').length || 0,
      averageProgress: initiatives?.length
        ? initiatives.reduce((sum, i) => sum + (i.progress_percentage || 0), 0) / initiatives.length
        : 0,
      highPriorityCount: initiatives?.filter(i => i.priority === 'high' || i.priority === 'critical').length || 0
    }

    logger.info('Roadmap stats fetched successfully', { totalInitiatives: stats.totalInitiatives })
    return actionSuccess(stats, 'Roadmap stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching roadmap stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
