'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('releases-actions')

// Release Types
type ReleaseStatus = 'draft' | 'scheduled' | 'rolling' | 'deployed' | 'failed' | 'rolled_back'
type Environment = 'development' | 'staging' | 'production' | 'all'
type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled' | 'rolled_back'

// Create Release
export async function createRelease(data: {
  version: string
  release_name: string
  description?: string
  environment?: Environment
  scheduled_for?: string
  changelog?: any[]
  breaking_changes?: string[]
  git_branch?: string
  git_tag?: string
  build_number?: string
  metadata?: Record<string, any>
}): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const status: ReleaseStatus = data.scheduled_for ? 'scheduled' : 'draft'

    const { data: release, error } = await supabase
      .from('releases')
      .insert({
        user_id: user.id,
        version: data.version,
        release_name: data.release_name,
        description: data.description,
        status,
        environment: data.environment || 'production',
        scheduled_for: data.scheduled_for,
        changelog: data.changelog || [],
        breaking_changes: data.breaking_changes || [],
        git_branch: data.git_branch,
        git_tag: data.git_tag,
        build_number: data.build_number,
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create release', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Release created successfully', { releaseId: release.id, version: data.version })
    return actionSuccess(release, 'Release created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating release', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Release
export async function updateRelease(releaseId: string, data: Partial<{
  version: string
  release_name: string
  description: string
  status: ReleaseStatus
  environment: Environment
  scheduled_for: string
  commits_count: number
  contributors_count: number
  changelog: any[]
  breaking_changes: string[]
  git_branch: string
  git_tag: string
  build_number: string
  metadata: Record<string, any>
}>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: release, error } = await supabase
      .from('releases')
      .update(data)
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update release', { error, releaseId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Release updated successfully', { releaseId })
    return actionSuccess(release, 'Release updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating release', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Deploy Release
export async function deployRelease(releaseId: string, environment: Environment = 'production'): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Update release status
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .update({
        status: 'rolling',
        environment,
        coverage_percentage: 0
      })
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (releaseError) {
      logger.error('Failed to update release for deployment', { error: releaseError, releaseId })
      return actionError(releaseError.message, 'DATABASE_ERROR')
    }

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        release_id: releaseId,
        user_id: user.id,
        environment,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (deploymentError) {
      logger.error('Failed to create deployment', { error: deploymentError, releaseId })
      return actionError(deploymentError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Release deployment started', { releaseId, deploymentId: deployment.id, environment })
    return actionSuccess({ release, deployment }, 'Release deployment started successfully')
  } catch (error: any) {
    logger.error('Unexpected error deploying release', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Complete Deployment
export async function completeDeployment(deploymentId: string, success: boolean = true, errorMessage?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get deployment to find release
    const { data: deployment } = await supabase
      .from('deployments')
      .select('release_id, started_at')
      .eq('id', deploymentId)
      .single()

    if (!deployment) {
      logger.error('Deployment not found', { deploymentId })
      return actionError('Deployment not found', 'NOT_FOUND')
    }

    const completedAt = new Date().toISOString()
    const startedAt = new Date(deployment.started_at)
    const durationMinutes = (new Date(completedAt).getTime() - startedAt.getTime()) / 60000

    // Update deployment
    const { error: depError } = await supabase
      .from('deployments')
      .update({
        status: success ? 'success' : 'failed',
        completed_at: completedAt,
        duration_minutes: durationMinutes,
        health_percentage: success ? 100 : 0,
        error_message: errorMessage
      })
      .eq('id', deploymentId)
      .eq('user_id', user.id)

    if (depError) {
      logger.error('Failed to update deployment', { error: depError, deploymentId })
      return actionError(depError.message, 'DATABASE_ERROR')
    }

    // Update release
    const { data: release, error: relError } = await supabase
      .from('releases')
      .update({
        status: success ? 'deployed' : 'failed',
        deployed_at: success ? completedAt : null,
        deploy_time_minutes: durationMinutes,
        coverage_percentage: success ? 100 : 0
      })
      .eq('id', deployment.release_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (relError) {
      logger.error('Failed to update release after deployment', { error: relError, releaseId: deployment.release_id })
      return actionError(relError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Deployment completed', { deploymentId, releaseId: deployment.release_id, success })
    return actionSuccess(release, success ? 'Deployment completed successfully' : 'Deployment failed')
  } catch (error: any) {
    logger.error('Unexpected error completing deployment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Rollback Release
export async function rollbackRelease(releaseId: string, reason?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Update release status
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .update({
        status: 'rolled_back',
        metadata: { rollback_reason: reason }
      })
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (releaseError) {
      logger.error('Failed to rollback release', { error: releaseError, releaseId })
      return actionError(releaseError.message, 'DATABASE_ERROR')
    }

    // Update any active deployments
    await supabase
      .from('deployments')
      .update({ status: 'rolled_back' })
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])

    revalidatePath('/dashboard/releases-v2')
    logger.info('Release rolled back', { releaseId, reason })
    return actionSuccess(release, 'Release rolled back successfully')
  } catch (error: any) {
    logger.error('Unexpected error rolling back release', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Pause Rolling Deployment
export async function pauseRollingDeployment(releaseId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get current coverage
    const { data: currentRelease } = await supabase
      .from('releases')
      .select('coverage_percentage')
      .eq('id', releaseId)
      .single()

    const { data: release, error } = await supabase
      .from('releases')
      .update({
        status: 'scheduled',
        metadata: { paused_at_coverage: currentRelease?.coverage_percentage }
      })
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause rolling deployment', { error, releaseId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Rolling deployment paused', { releaseId, coverage: currentRelease?.coverage_percentage })
    return actionSuccess(release, 'Rolling deployment paused successfully')
  } catch (error: any) {
    logger.error('Unexpected error pausing rolling deployment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete Release (soft delete)
export async function deleteRelease(releaseId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('releases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', releaseId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete release', { error, releaseId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/releases-v2')
    logger.info('Release deleted successfully', { releaseId })
    return actionSuccess({ success: true }, 'Release deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting release', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get Release Stats
export async function getReleaseStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: releases, error } = await supabase
      .from('releases')
      .select('status, deploy_time_minutes, commits_count, coverage_percentage')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch release stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const deployedReleases = releases?.filter(r => r.deploy_time_minutes) || []

    const stats = {
      totalReleases: releases?.length || 0,
      deployedReleases: releases?.filter(r => r.status === 'deployed').length || 0,
      successRate: releases?.length
        ? (releases.filter(r => r.status === 'deployed').length / releases.length) * 100
        : 0,
      averageDeployTime: deployedReleases.length
        ? deployedReleases.reduce((sum, r) => sum + (r.deploy_time_minutes || 0), 0) / deployedReleases.length
        : 0,
      totalCommits: releases?.reduce((sum, r) => sum + (r.commits_count || 0), 0) || 0
    }

    logger.info('Release stats fetched successfully', { totalReleases: stats.totalReleases })
    return actionSuccess(stats, 'Release statistics retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching release stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
