'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('builds-actions')

// Pipeline types
export interface CreatePipelineInput {
  pipeline_name: string
  pipeline_type?: string
  description?: string
  repository_url?: string
  branch_pattern?: string
  trigger_on?: string[]
  configuration?: Record<string, unknown>
}

export interface UpdatePipelineInput extends Partial<CreatePipelineInput> {
  id: string
  is_active?: boolean
}

// Build types
export interface TriggerBuildInput {
  pipeline_id?: string
  branch: string
  commit_hash?: string
  commit_message?: string
  author_name?: string
  author_email?: string
}

export interface UpdateBuildInput {
  id: string
  status?: string
  duration_seconds?: number
  tests_passed?: number
  tests_failed?: number
  tests_total?: number
  coverage_percentage?: number
  artifacts_count?: number
  completed_at?: string
  logs_url?: string
  artifacts_url?: string
}

// Pipeline Actions
export async function createPipeline(input: CreatePipelineInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('build_pipelines')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create pipeline', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Pipeline created successfully', { pipelineId: data.id })
    return actionSuccess(data, 'Pipeline created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating pipeline', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePipeline(input: UpdatePipelineInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('build_pipelines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update pipeline', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Pipeline updated successfully', { pipelineId: id })
    return actionSuccess(data, 'Pipeline updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating pipeline', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePipeline(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('build_pipelines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete pipeline', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Pipeline deleted successfully', { pipelineId: id })
    return actionSuccess({ success: true }, 'Pipeline deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting pipeline', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function togglePipeline(id: string, isActive: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('build_pipelines')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle pipeline', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Pipeline toggled successfully', { pipelineId: id, isActive })
    return actionSuccess(data, 'Pipeline status updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error toggling pipeline', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Build Actions
export async function triggerBuild(input: TriggerBuildInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get next build number
    const { data: lastBuild } = await supabase
      .from('builds')
      .select('build_number')
      .eq('user_id', user.id)
      .order('build_number', { ascending: false })
      .limit(1)
      .single()

    const buildNumber = (lastBuild?.build_number || 0) + 1

    const { data, error } = await supabase
      .from('builds')
      .insert({
        ...input,
        user_id: user.id,
        build_number: buildNumber,
        status: 'pending',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to trigger build', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Build triggered successfully', { buildId: data.id, buildNumber })
    return actionSuccess(data, 'Build triggered successfully')
  } catch (error: any) {
    logger.error('Unexpected error triggering build', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBuild(input: UpdateBuildInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('builds')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update build', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Build updated successfully', { buildId: id })
    return actionSuccess(data, 'Build updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating build', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function cancelBuild(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('builds')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel build', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Build cancelled successfully', { buildId: id })
    return actionSuccess(data, 'Build cancelled successfully')
  } catch (error: any) {
    logger.error('Unexpected error cancelling build', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function retryBuild(buildId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get original build
    const { data: originalBuild, error: fetchError } = await supabase
      .from('builds')
      .select('*')
      .eq('id', buildId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalBuild) {
      logger.error('Build not found for retry', { buildId })
      return actionError('Build not found', 'DATABASE_ERROR')
    }

    // Get next build number
    const { data: lastBuild } = await supabase
      .from('builds')
      .select('build_number')
      .eq('user_id', user.id)
      .order('build_number', { ascending: false })
      .limit(1)
      .single()

    const buildNumber = (lastBuild?.build_number || 0) + 1

    // Create new build
    const { data, error } = await supabase
      .from('builds')
      .insert({
        user_id: user.id,
        pipeline_id: originalBuild.pipeline_id,
        build_number: buildNumber,
        branch: originalBuild.branch,
        commit_hash: originalBuild.commit_hash,
        commit_message: originalBuild.commit_message,
        author_name: originalBuild.author_name,
        author_email: originalBuild.author_email,
        status: 'pending',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to retry build', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/builds-v2')
    logger.info('Build retried successfully', { originalBuildId: buildId, newBuildId: data.id })
    return actionSuccess(data, 'Build retried successfully')
  } catch (error: any) {
    logger.error('Unexpected error retrying build', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getBuildStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: builds, error } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to get build stats', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const total = builds.length
    const success = builds.filter(b => b.status === 'success').length
    const failed = builds.filter(b => b.status === 'failed').length
    const running = builds.filter(b => b.status === 'running').length
    const completed = success + failed
    const successRate = completed > 0 ? (success / completed) * 100 : 0

    const completedBuilds = builds.filter(b => b.duration_seconds > 0)
    const avgDuration = completedBuilds.length > 0
      ? completedBuilds.reduce((sum, b) => sum + b.duration_seconds, 0) / completedBuilds.length
      : 0

    const stats = {
      total,
      success,
      failed,
      running,
      successRate: Math.round(successRate * 10) / 10,
      avgDuration: Math.round(avgDuration)
    }

    logger.info('Build stats retrieved successfully')
    return actionSuccess(stats, 'Build stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting build stats', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Artifact Actions
export async function createArtifact(input: {
  build_id: string
  artifact_name: string
  artifact_type?: string
  file_path?: string
  file_size?: number
  download_url?: string
  checksum?: string
  expires_at?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('build_artifacts')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create artifact', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update artifact count on build
    await supabase
      .from('builds')
      .update({
        artifacts_count: supabase.rpc('increment_artifacts', { build_id: input.build_id })
      })
      .eq('id', input.build_id)

    revalidatePath('/dashboard/builds-v2')
    logger.info('Artifact created successfully', { artifactId: data.id, buildId: input.build_id })
    return actionSuccess(data, 'Artifact created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating artifact', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function downloadArtifact(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Increment download count
    const { data, error } = await supabase
      .from('build_artifacts')
      .update({
        download_count: supabase.rpc('increment_download_count', { artifact_id: id })
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to download artifact', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Artifact downloaded successfully', { artifactId: id })
    return actionSuccess(data, 'Artifact downloaded successfully')
  } catch (error: any) {
    logger.error('Unexpected error downloading artifact', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
