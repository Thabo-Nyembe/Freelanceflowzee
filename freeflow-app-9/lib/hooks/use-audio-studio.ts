'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface AudioTrack {
  id: string
  user_id: string
  track_code: string
  title: string
  description: string | null
  artist: string | null
  album: string | null
  genre: string | null
  file_url: string | null
  file_name: string | null
  file_size_bytes: number
  format: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg'
  quality: 'low' | 'medium' | 'high' | 'studio' | 'lossless'
  duration_seconds: number
  sample_rate: number
  bit_rate: number
  channels: number
  waveform_url: string | null
  waveform_data: Record<string, unknown>
  is_processed: boolean
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress: number
  effects_applied: string[]
  project_id: string | null
  track_order: number
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AudioProject {
  id: string
  user_id: string
  project_code: string
  name: string
  description: string | null
  sample_rate: number
  bit_depth: number
  channels: number
  total_duration_seconds: number
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  export_format: string | null
  export_url: string | null
  exported_at: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAudioStudioOptions {
  projectId?: string
  format?: AudioTrack['format']
  status?: AudioTrack['processing_status']
}

interface AudioStudioStats {
  totalTracks: number
  totalProjects: number
  totalDuration: number
  totalSize: number
  processedTracks: number
  avgProcessingTime: number
}

export function useAudioStudio(initialTracks: AudioTrack[] = [], options: UseAudioStudioOptions = {}) {
  const [tracks, setTracks] = useState<AudioTrack[]>(initialTracks)
  const [projects, setProjects] = useState<AudioProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const stats: AudioStudioStats = {
    totalTracks: tracks.length,
    totalProjects: projects.length,
    totalDuration: tracks.reduce((sum, t) => sum + t.duration_seconds, 0),
    totalSize: tracks.reduce((sum, t) => sum + t.file_size_bytes, 0),
    processedTracks: tracks.filter(t => t.is_processed).length,
    avgProcessingTime: 2.3 // seconds
  }

  const fetchTracks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('audio_tracks')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options.projectId) {
        query = query.eq('project_id', options.projectId)
      }
      if (options.format) {
        query = query.eq('format', options.format)
      }
      if (options.status) {
        query = query.eq('processing_status', options.status)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setTracks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracks')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.projectId, options.format, options.status])

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('audio_projects')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    setProjects(data || [])
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel('audio_tracks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audio_tracks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTracks(prev => [payload.new as AudioTrack, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTracks(prev => prev.map(t =>
              t.id === payload.new.id ? payload.new as AudioTrack : t
            ))
          } else if (payload.eventType === 'DELETE') {
            setTracks(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const uploadTrack = useCallback(async (trackData: {
    title: string
    description?: string
    artist?: string
    file_url?: string
    file_name?: string
    file_size_bytes?: number
    format?: AudioTrack['format']
    duration_seconds?: number
    project_id?: string
    tags?: string[]
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('audio_tracks')
      .insert({
        user_id: user.id,
        title: trackData.title,
        description: trackData.description,
        artist: trackData.artist,
        file_url: trackData.file_url,
        file_name: trackData.file_name,
        file_size_bytes: trackData.file_size_bytes || 0,
        format: trackData.format || 'mp3',
        duration_seconds: trackData.duration_seconds || 0,
        project_id: trackData.project_id,
        tags: trackData.tags || [],
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    setTracks(prev => [data, ...prev])
    return data
  }, [supabase])

  const updateTrack = useCallback(async (
    trackId: string,
    updates: Partial<Pick<AudioTrack, 'title' | 'description' | 'artist' | 'tags' | 'project_id'>>
  ) => {
    const { error } = await supabase
      .from('audio_tracks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', trackId)

    if (error) throw error
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, ...updates } : t
    ))
  }, [supabase])

  const deleteTrack = useCallback(async (trackId: string) => {
    const { error } = await supabase
      .from('audio_tracks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', trackId)

    if (error) throw error
    setTracks(prev => prev.filter(t => t.id !== trackId))
  }, [supabase])

  const applyEffect = useCallback(async (trackId: string, effectType: string) => {
    const track = tracks.find(t => t.id === trackId)
    if (!track) return

    const { error } = await supabase
      .from('audio_tracks')
      .update({
        effects_applied: [...track.effects_applied, effectType],
        processing_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', trackId)

    if (error) throw error

    setTracks(prev => prev.map(t =>
      t.id === trackId ? {
        ...t,
        effects_applied: [...t.effects_applied, effectType],
        processing_status: 'processing' as const
      } : t
    ))

    // Simulate processing completion
    setTimeout(async () => {
      await supabase
        .from('audio_tracks')
        .update({
          processing_status: 'completed',
          is_processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackId)

      setTracks(prev => prev.map(t =>
        t.id === trackId ? {
          ...t,
          processing_status: 'completed' as const,
          is_processed: true
        } : t
      ))
    }, 2000)
  }, [supabase, tracks])

  const createProject = useCallback(async (projectData: {
    name: string
    description?: string
    sample_rate?: number
    tags?: string[]
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('audio_projects')
      .insert({
        user_id: user.id,
        name: projectData.name,
        description: projectData.description,
        sample_rate: projectData.sample_rate || 44100,
        tags: projectData.tags || [],
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    setProjects(prev => [data, ...prev])
    return data
  }, [supabase])

  const exportProject = useCallback(async (projectId: string, format: string) => {
    const { error } = await supabase
      .from('audio_projects')
      .update({
        export_format: format,
        exported_at: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) throw error
    setProjects(prev => prev.map(p =>
      p.id === projectId ? {
        ...p,
        export_format: format,
        exported_at: new Date().toISOString(),
        status: 'completed' as const
      } : p
    ))
  }, [supabase])

  return {
    tracks,
    projects,
    stats,
    isLoading,
    error,
    fetchTracks,
    fetchProjects,
    uploadTrack,
    updateTrack,
    deleteTrack,
    applyEffect,
    createProject,
    exportProject
  }
}

export function getQualityColor(quality: AudioTrack['quality']): string {
  switch (quality) {
    case 'lossless':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'studio':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'high':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getFormatColor(format: AudioTrack['format']): string {
  switch (format) {
    case 'wav':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'flac':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'mp3':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'aac':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'ogg':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function getProcessingStatusColor(status: AudioTrack['processing_status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`
  } else if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}
