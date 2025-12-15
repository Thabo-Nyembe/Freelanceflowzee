'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createPipeline(input: CreatePipelineInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('build_pipelines')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function updatePipeline(input: UpdatePipelineInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('build_pipelines')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function deletePipeline(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('build_pipelines')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { success: true }
}

export async function togglePipeline(id: string, isActive: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('build_pipelines')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

// Build Actions
export async function triggerBuild(input: TriggerBuildInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function updateBuild(input: UpdateBuildInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('builds')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function cancelBuild(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function retryBuild(buildId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get original build
  const { data: originalBuild, error: fetchError } = await supabase
    .from('builds')
    .select('*')
    .eq('id', buildId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !originalBuild) {
    return { error: 'Build not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function getBuildStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: builds, error } = await supabase
    .from('builds')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
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

  return {
    data: {
      total,
      success,
      failed,
      running,
      successRate: Math.round(successRate * 10) / 10,
      avgDuration: Math.round(avgDuration)
    }
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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('build_artifacts')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update artifact count on build
  await supabase
    .from('builds')
    .update({
      artifacts_count: supabase.rpc('increment_artifacts', { build_id: input.build_id })
    })
    .eq('id', input.build_id)

  revalidatePath('/dashboard/builds-v2')
  return { data }
}

export async function downloadArtifact(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  return { data }
}
