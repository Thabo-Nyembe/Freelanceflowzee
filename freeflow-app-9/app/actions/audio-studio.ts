'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function getAudioTracks(options?: {
  projectId?: string
  format?: string
  status?: string
  limit?: number
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  let query = supabase
    .from('audio_tracks')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (options?.projectId) {
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
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getAudioTrack(trackId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('audio_tracks')
    .select('*')
    .eq('id', trackId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function uploadAudioTrack(input: AudioTrackInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function updateAudioTrack(
  trackId: string,
  updates: Partial<AudioTrackInput> & {
    processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
    processing_progress?: number
    is_processed?: boolean
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function deleteAudioTrack(trackId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { error } = await supabase
    .from('audio_tracks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', trackId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, success: true }
}

export async function applyAudioEffect(
  trackId: string,
  effectType: string,
  parameters?: Record<string, unknown>
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get track to update effects_applied array
  const { data: track } = await supabase
    .from('audio_tracks')
    .select('effects_applied')
    .eq('id', trackId)
    .eq('user_id', user.id)
    .single()

  if (!track) {
    return { error: 'Track not found', data: null }
  }

  // Create effect record
  await supabase
    .from('audio_effects')
    .insert({
      track_id: trackId,
      effect_type: effectType,
      parameters: parameters || {},
      effect_order: (track.effects_applied || []).length,
      is_applied: false
    })

  // Update track status to processing
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function completeProcessing(trackId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  // Mark all effects as applied
  await supabase
    .from('audio_effects')
    .update({
      is_applied: true,
      applied_at: new Date().toISOString()
    })
    .eq('track_id', trackId)

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

// Audio Projects

export async function getAudioProjects(options?: {
  status?: string
  limit?: number
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getAudioProject(projectId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('audio_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createAudioProject(input: AudioProjectInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function updateAudioProject(
  projectId: string,
  updates: Partial<AudioProjectInput> & {
    status?: 'draft' | 'in_progress' | 'completed' | 'archived'
    export_format?: string
    export_url?: string
    exported_at?: string
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function exportAudioProject(projectId: string, format: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, data }
}

export async function deleteAudioProject(projectId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { error } = await supabase
    .from('audio_projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/audio-studio-v2')
  return { error: null, success: true }
}

export async function getAudioStudioStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
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

  const stats = {
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

  return { error: null, data: stats }
}
