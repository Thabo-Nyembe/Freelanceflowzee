'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/releases-v2')
  return release
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
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: release, error } = await supabase
    .from('releases')
    .update(data)
    .eq('id', releaseId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/releases-v2')
  return release
}

// Deploy Release
export async function deployRelease(releaseId: string, environment: Environment = 'production') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (releaseError) throw releaseError

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

  if (deploymentError) throw deploymentError

  revalidatePath('/dashboard/releases-v2')
  return { release, deployment }
}

// Complete Deployment
export async function completeDeployment(deploymentId: string, success: boolean = true, errorMessage?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get deployment to find release
  const { data: deployment } = await supabase
    .from('deployments')
    .select('release_id, started_at')
    .eq('id', deploymentId)
    .single()

  if (!deployment) throw new Error('Deployment not found')

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

  if (depError) throw depError

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

  if (relError) throw relError

  revalidatePath('/dashboard/releases-v2')
  return release
}

// Rollback Release
export async function rollbackRelease(releaseId: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (releaseError) throw releaseError

  // Update any active deployments
  await supabase
    .from('deployments')
    .update({ status: 'rolled_back' })
    .eq('release_id', releaseId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])

  revalidatePath('/dashboard/releases-v2')
  return release
}

// Pause Rolling Deployment
export async function pauseRollingDeployment(releaseId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/releases-v2')
  return release
}

// Delete Release (soft delete)
export async function deleteRelease(releaseId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('releases')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', releaseId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/releases-v2')
  return { success: true }
}

// Get Release Stats
export async function getReleaseStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: releases } = await supabase
    .from('releases')
    .select('status, deploy_time_minutes, commits_count, coverage_percentage')
    .eq('user_id', user.id)
    .is('deleted_at', null)

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

  return stats
}
