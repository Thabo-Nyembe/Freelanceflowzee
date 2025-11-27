/**
 * Motion Graphics Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type LayerType = 'shape' | 'text' | 'image' | 'video' | 'solid' | 'group'
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'elastic' | 'custom'
export type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface MotionProject {
  id: string
  user_id: string
  name: string
  description?: string
  width: number
  height: number
  frame_rate: number
  duration_seconds: number
  background_color: string
  thumbnail_url?: string
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface MotionLayer {
  id: string
  project_id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  position_x: number
  position_y: number
  scale_x: number
  scale_y: number
  rotation: number
  blend_mode: string
  start_time: number
  end_time: number
  layer_order: number
  parent_id?: string
  properties: Record<string, any>
  created_at: string
  updated_at: string
}

// PROJECTS
export async function getMotionProjects(userId: string, filters?: { is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('motion_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function createMotionProject(userId: string, project: Partial<MotionProject>) {
  const supabase = createClient()
  return await supabase.from('motion_projects').insert({ user_id: userId, ...project }).select().single()
}

export async function updateMotionProject(projectId: string, updates: Partial<MotionProject>) {
  const supabase = createClient()
  return await supabase.from('motion_projects').update(updates).eq('id', projectId).select().single()
}

export async function deleteMotionProject(projectId: string) {
  const supabase = createClient()
  return await supabase.from('motion_projects').delete().eq('id', projectId)
}

// LAYERS
export async function getMotionLayers(projectId: string) {
  const supabase = createClient()
  return await supabase.from('motion_layers').select('*').eq('project_id', projectId).order('layer_order')
}

export async function createMotionLayer(projectId: string, layer: Partial<MotionLayer>) {
  const supabase = createClient()
  return await supabase.from('motion_layers').insert({ project_id: projectId, ...layer }).select().single()
}

export async function updateMotionLayer(layerId: string, updates: Partial<MotionLayer>) {
  const supabase = createClient()
  return await supabase.from('motion_layers').update(updates).eq('id', layerId).select().single()
}

export async function deleteMotionLayer(layerId: string) {
  const supabase = createClient()
  return await supabase.from('motion_layers').delete().eq('id', layerId)
}

// ANIMATIONS
export async function getMotionAnimations(layerId: string) {
  const supabase = createClient()
  return await supabase.from('motion_animations').select('*').eq('layer_id', layerId).order('start_time')
}

export async function createMotionAnimation(layerId: string, animation: any) {
  const supabase = createClient()
  return await supabase.from('motion_animations').insert({ layer_id: layerId, ...animation }).select().single()
}

export async function deleteMotionAnimation(animationId: string) {
  const supabase = createClient()
  return await supabase.from('motion_animations').delete().eq('id', animationId)
}

// EXPORTS
export async function getMotionExports(userId: string) {
  const supabase = createClient()
  return await supabase.from('motion_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createMotionExport(projectId: string, userId: string, exportData: any) {
  const supabase = createClient()
  return await supabase.from('motion_exports').insert({ project_id: projectId, user_id: userId, ...exportData }).select().single()
}

export async function updateExportStatus(exportId: string, status: ExportStatus, fileUrl?: string, error?: string) {
  const supabase = createClient()
  const updates: any = { status }
  if (fileUrl) updates.file_url = fileUrl
  if (error) updates.error_message = error
  return await supabase.from('motion_exports').update(updates).eq('id', exportId).select().single()
}

// STATS
export async function getMotionStats(userId: string) {
  const supabase = createClient()
  const [projectsResult, exportsResult] = await Promise.all([
    supabase.from('motion_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('motion_exports').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed')
  ])

  return {
    data: {
      total_projects: projectsResult.count || 0,
      total_exports: exportsResult.count || 0
    },
    error: projectsResult.error || exportsResult.error
  }
}
