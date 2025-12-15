'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ProjectType = 'document' | 'presentation' | 'video' | 'audio' | 'design' | 'animation' | 'interactive' | 'multi_media'
export type ProjectStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'published' | 'archived'

export interface ContentStudio {
  id: string
  user_id: string
  project_name: string
  description?: string
  project_type: ProjectType
  content_data: any
  raw_content?: string
  rendered_output?: string
  canvas_state?: any
  editor_state?: any
  layers?: any[]
  elements?: any[]
  width?: number
  height?: number
  aspect_ratio?: string
  resolution?: string
  background_color?: string
  theme?: string
  assets?: any[]
  media_files?: string[]
  fonts_used?: string[]
  color_palette?: any[]
  template_id?: string
  template_name?: string
  preset_id?: string
  style_preset?: any
  collaborators?: string[]
  shared_with?: string[]
  permissions?: any
  is_collaborative: boolean
  status: ProjectStatus
  completion_percentage: number
  version: number
  version_history?: any[]
  auto_save_enabled: boolean
  last_auto_saved_at?: string
  timeline?: any[]
  scenes?: any[]
  duration_seconds?: number
  frame_rate?: number
  audio_tracks?: any[]
  voice_over?: any
  background_music?: string
  effects?: any[]
  transitions?: any[]
  filters?: any[]
  export_formats?: string[]
  export_quality?: string
  export_settings?: any
  last_exported_at?: string
  ai_suggestions?: any[]
  ai_enhancements?: any
  auto_generated_content?: string
  tags?: string[]
  category?: string
  folder?: string
  custom_data?: any
  metadata?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseContentStudioOptions {
  projectType?: ProjectType | 'all'
  status?: ProjectStatus | 'all'
  limit?: number
}

export function useContentStudio(options: UseContentStudioOptions = {}) {
  const { projectType, status, limit } = options

  const filters: Record<string, any> = {}
  if (projectType && projectType !== 'all') filters.project_type = projectType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'content_studio',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<ContentStudio>(queryOptions)

  const { mutate: createProject } = useSupabaseMutation({
    table: 'content_studio',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateProject } = useSupabaseMutation({
    table: 'content_studio',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteProject } = useSupabaseMutation({
    table: 'content_studio',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    projects: data,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch
  }
}
