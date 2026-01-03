'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('audio-studio')

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AudioTrackInput {
  title: string
  description?: string
  artist?: string
  album?: string
  genre?: string
  file_url?: string
  file_name?: string
  file_size_bytes?: number
  format?: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg'
  quality?: 'low' | 'medium' | 'high' | 'studio' | 'lossless'
  duration_seconds?: number
  sample_rate?: number
  bit_rate?: number
  channels?: number
  project_id?: string
  track_order?: number
  tags?: string[]
}

export interface AudioProjectInput {
  name: string
  description?: string
  sample_rate?: number
  bit_depth?: number
  channels?: number
  tags?: string[]
}

interface AudioTrackFilters {
  projectId?: string
  format?: string
  status?: string
  limit?: number
}

interface AudioProjectFilters {
  status?: string
  limit?: number
}

interface AudioTrackUpdates extends Partial<AudioTrackInput> {
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: number
  is_processed?: boolean
}

interface AudioProjectUpdates extends Partial<AudioProjectInput> {
  status?: 'draft' | 'in_progress' | 'completed' | 'archived'
  export_format?: string
  export_url?: string
  exported_at?: string
}

interface AudioStudioStats {
  totalTracks: number
  totalProjects: number
  totalDuration: number
  totalSize: number
  processedTracks: number
  pendingTracks: number
  formats: {
    mp3: number
    wav: number
    flac: number
    aac: number
    ogg: number
  }
  projectStatuses: {
    draft: number
    in_progress: number
    completed: number
    archived: number
  }
}

// ============================================
// AUDIO TRACK ACTIONS
// ============================================

export async function getAudioTracks(
  options?: AudioTrackFilters
): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getAudioTracks')
      return actionError('Not authenticated')
    }

    let query = supabase
      .from('audio_tracks')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.projectId) {
      const validationResult = uuidSchema.safeParse(options.projectId)
      if (!validationResult.success) {
        return actionError('Invalid project ID format')
      }
      query = query.eq('project_id', options.projectId)
    }
    if (options?.format) {
      query = query.eq('format', options.format)
    }
    if (options?.status) {
      query = query.eq('processing_status', options.status)
    }

    const { data, error } = await query.limit(options?.limit || 100)

    if (error) {
      logger.error('Failed to fetch audio tracks', { error, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Audio tracks fetched successfully', { userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getAudioTracks', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function getAudioTrack(trackId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(trackId)
    if (!validationResult.success) {
      return actionError('Invalid track ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getAudioTrack', { trackId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('id', trackId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch audio track', { error, trackId, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Audio track fetched successfully', { trackId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in getAudioTrack', { error, trackId })
    return actionError('An unexpected error occurred')
  }
}

export async function uploadAudioTrack(input: AudioTrackInput): Promise<ActionResult<unknown>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to uploadAudioTrack')
      return actionError('Not authenticated')
    }

    if (input.project_id) {
      const validationResult = uuidSchema.safeParse(input.project_id)
      if (!validationResult.success) {
        return actionError('Invalid project ID format')
      }
    }

    const { data, error } = await supabase
      .from('audio_tracks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description,
        artist: input.artist,
        album: input.album,
        genre: input.genre,
        file_url: input.file_url,
        file_name: input.file_name,
        file_size_bytes: input.file_size_bytes || 0,
        format: input.format || 'mp3',
        quality: input.quality || 'high',
        duration_seconds: input.duration_seconds || 0,
        sample_rate: input.sample_rate || 44100,
        bit_rate: input.bit_rate || 128,
        channels: input.channels || 2,
        project_id: input.project_id,
        track_order: input.track_order || 0,
        tags: input.tags || [],
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to upload audio track', { error, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio track uploaded successfully', { trackId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in uploadAudioTrack', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function updateAudioTrack(
  trackId: string,
  updates: AudioTrackUpdates
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(trackId)
    if (!validationResult.success) {
      return actionError('Invalid track ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to updateAudioTrack', { trackId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_tracks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', trackId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update audio track', { error, trackId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio track updated successfully', { trackId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in updateAudioTrack', { error, trackId })
    return actionError('An unexpected error occurred')
  }
}

export async function deleteAudioTrack(trackId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(trackId)
    if (!validationResult.success) {
      return actionError('Invalid track ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to deleteAudioTrack', { trackId })
      return actionError('Not authenticated')
    }

    const { error } = await supabase
      .from('audio_tracks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', trackId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete audio track', { error, trackId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio track deleted successfully', { trackId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in deleteAudioTrack', { error, trackId })
    return actionError('An unexpected error occurred')
  }
}

export async function applyAudioEffect(
  trackId: string,
  effectType: string,
  parameters?: Record<string, unknown>
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(trackId)
    if (!validationResult.success) {
      return actionError('Invalid track ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to applyAudioEffect', { trackId })
      return actionError('Not authenticated')
    }

    const { data: track } = await supabase
      .from('audio_tracks')
      .select('effects_applied')
      .eq('id', trackId)
      .eq('user_id', user.id)
      .single()

    if (!track) {
      logger.warn('Track not found for effect application', { trackId, userId: user.id })
      return actionError('Track not found')
    }

    await supabase
      .from('audio_effects')
      .insert({
        track_id: trackId,
        effect_type: effectType,
        parameters: parameters || {},
        effect_order: (track.effects_applied || []).length,
        is_applied: false
      })

    const { data, error } = await supabase
      .from('audio_tracks')
      .update({
        effects_applied: [...(track.effects_applied || []), effectType],
        processing_status: 'processing',
        processing_progress: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', trackId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to apply audio effect', { error, trackId, effectType, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio effect applied successfully', { trackId, effectType, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in applyAudioEffect', { error, trackId, effectType })
    return actionError('An unexpected error occurred')
  }
}

export async function completeProcessing(trackId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(trackId)
    if (!validationResult.success) {
      return actionError('Invalid track ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to completeProcessing', { trackId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_tracks')
      .update({
        processing_status: 'completed',
        processing_progress: 100,
        is_processed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', trackId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete processing', { error, trackId, userId: user.id })
      return actionError(error.message)
    }

    await supabase
      .from('audio_effects')
      .update({
        is_applied: true,
        applied_at: new Date().toISOString()
      })
      .eq('track_id', trackId)

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio processing completed successfully', { trackId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in completeProcessing', { error, trackId })
    return actionError('An unexpected error occurred')
  }
}

// ============================================
// AUDIO PROJECT ACTIONS
// ============================================

export async function getAudioProjects(
  options?: AudioProjectFilters
): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getAudioProjects')
      return actionError('Not authenticated')
    }

    let query = supabase
      .from('audio_projects')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query.limit(options?.limit || 50)

    if (error) {
      logger.error('Failed to fetch audio projects', { error, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Audio projects fetched successfully', { userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getAudioProjects', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function getAudioProject(projectId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(projectId)
    if (!validationResult.success) {
      return actionError('Invalid project ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getAudioProject', { projectId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch audio project', { error, projectId, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Audio project fetched successfully', { projectId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in getAudioProject', { error, projectId })
    return actionError('An unexpected error occurred')
  }
}

export async function createAudioProject(input: AudioProjectInput): Promise<ActionResult<unknown>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to createAudioProject')
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_projects')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description,
        sample_rate: input.sample_rate || 44100,
        bit_depth: input.bit_depth || 16,
        channels: input.channels || 2,
        tags: input.tags || [],
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create audio project', { error, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio project created successfully', { projectId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in createAudioProject', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function updateAudioProject(
  projectId: string,
  updates: AudioProjectUpdates
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(projectId)
    if (!validationResult.success) {
      return actionError('Invalid project ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to updateAudioProject', { projectId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update audio project', { error, projectId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio project updated successfully', { projectId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in updateAudioProject', { error, projectId })
    return actionError('An unexpected error occurred')
  }
}

export async function exportAudioProject(
  projectId: string,
  format: string
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(projectId)
    if (!validationResult.success) {
      return actionError('Invalid project ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to exportAudioProject', { projectId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('audio_projects')
      .update({
        export_format: format,
        exported_at: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to export audio project', { error, projectId, format, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio project exported successfully', { projectId, format, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in exportAudioProject', { error, projectId, format })
    return actionError('An unexpected error occurred')
  }
}

export async function deleteAudioProject(projectId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(projectId)
    if (!validationResult.success) {
      return actionError('Invalid project ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to deleteAudioProject', { projectId })
      return actionError('Not authenticated')
    }

    const { error } = await supabase
      .from('audio_projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete audio project', { error, projectId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/audio-studio-v2')
    logger.info('Audio project deleted successfully', { projectId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in deleteAudioProject', { error, projectId })
    return actionError('An unexpected error occurred')
  }
}

export async function getAudioStudioStats(): Promise<ActionResult<AudioStudioStats | null>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getAudioStudioStats')
      return actionError('Not authenticated')
    }

    const [{ data: tracks }, { data: projects }] = await Promise.all([
      supabase
        .from('audio_tracks')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null),
      supabase
        .from('audio_projects')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
    ])

    const stats: AudioStudioStats = {
      totalTracks: tracks?.length || 0,
      totalProjects: projects?.length || 0,
      totalDuration: tracks?.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) || 0,
      totalSize: tracks?.reduce((sum, t) => sum + (t.file_size_bytes || 0), 0) || 0,
      processedTracks: tracks?.filter(t => t.is_processed).length || 0,
      pendingTracks: tracks?.filter(t => t.processing_status === 'pending' || t.processing_status === 'processing').length || 0,
      formats: {
        mp3: tracks?.filter(t => t.format === 'mp3').length || 0,
        wav: tracks?.filter(t => t.format === 'wav').length || 0,
        flac: tracks?.filter(t => t.format === 'flac').length || 0,
        aac: tracks?.filter(t => t.format === 'aac').length || 0,
        ogg: tracks?.filter(t => t.format === 'ogg').length || 0
      },
      projectStatuses: {
        draft: projects?.filter(p => p.status === 'draft').length || 0,
        in_progress: projects?.filter(p => p.status === 'in_progress').length || 0,
        completed: projects?.filter(p => p.status === 'completed').length || 0,
        archived: projects?.filter(p => p.status === 'archived').length || 0
      }
    }

    logger.info('Audio studio stats fetched successfully', { userId: user.id })
    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error in getAudioStudioStats', { error })
    return actionError('An unexpected error occurred')
  }
}
