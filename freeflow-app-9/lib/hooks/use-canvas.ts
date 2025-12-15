'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type CanvasType = 'whiteboard' | 'design' | 'diagram' | 'mindmap' | 'flowchart' | 'wireframe' | 'mockup' | 'prototype' | 'presentation'
export type CanvasStatus = 'active' | 'archived' | 'locked' | 'read_only'

export interface Canvas {
  id: string
  user_id: string
  canvas_name: string
  description?: string
  canvas_type: CanvasType
  canvas_data: any
  objects?: any[]
  shapes?: any[]
  text_elements?: any[]
  images?: any[]
  width: number
  height: number
  zoom_level: number
  pan_x: number
  pan_y: number
  background_type: string
  background_color: string
  background_image?: string
  background_pattern?: string
  grid_enabled: boolean
  grid_size: number
  grid_color?: string
  layers?: any[]
  active_layer: number
  layer_count: number
  active_tool?: string
  tool_settings?: any
  drawing_settings?: any
  selected_objects?: string[]
  clipboard_data?: any
  undo_stack?: any[]
  redo_stack?: any[]
  is_shared: boolean
  shared_with?: string[]
  collaborators?: any[]
  collaboration_mode?: string
  real_time_cursors?: any
  comments?: any[]
  annotations?: any[]
  sticky_notes?: any[]
  version: number
  version_history?: any[]
  snapshots?: any[]
  auto_save: boolean
  last_auto_saved_at?: string
  template_id?: string
  is_template: boolean
  preset_styles?: any
  export_formats?: string[]
  published_url?: string
  embed_code?: string
  is_published: boolean
  published_at?: string
  ai_suggestions?: any[]
  smart_guides: boolean
  auto_align: boolean
  snap_to_grid: boolean
  object_count: number
  file_size_bytes?: number
  render_cache?: any
  tags?: string[]
  category?: string
  folder?: string
  status: CanvasStatus
  custom_properties?: any
  metadata?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCanvasOptions {
  canvasType?: CanvasType | 'all'
  status?: CanvasStatus | 'all'
  limit?: number
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const { canvasType, status, limit } = options

  const filters: Record<string, any> = {}
  if (canvasType && canvasType !== 'all') filters.canvas_type = canvasType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'canvas',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Canvas>(queryOptions)

  const { mutate: createCanvas } = useSupabaseMutation({
    table: 'canvas',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateCanvas } = useSupabaseMutation({
    table: 'canvas',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteCanvas } = useSupabaseMutation({
    table: 'canvas',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    canvases: data,
    loading,
    error,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    refetch
  }
}
