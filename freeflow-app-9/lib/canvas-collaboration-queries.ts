/**
 * Canvas Collaboration Queries
 *
 * Complete CRUD operations for canvas collaboration features:
 * - Canvas Projects
 * - Canvas Layers
 * - Canvas Elements
 * - Canvas Collaborators
 * - Canvas Versions
 * - Canvas Comments
 * - Canvas Sessions
 *
 * All queries use Supabase client and include error handling
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createSimpleLogger('CanvasCollaboration')

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type LayerType = 'drawing' | 'text' | 'shape' | 'image' | 'group'
export type CanvasStatus = 'active' | 'archived' | 'template'
export type CollaboratorPermission = 'view' | 'edit' | 'admin'
export type ToolType = 'select' | 'hand' | 'brush' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'pen' | 'highlighter'

// Canvas-specific type definitions
export interface CanvasPoint {
  x: number
  y: number
  pressure?: number
}

export interface CanvasData {
  layers?: JsonValue
  elements?: JsonValue
  settings?: Record<string, JsonValue>
  [key: string]: JsonValue | undefined
}

export interface CanvasProject {
  id: string
  user_id: string
  name: string
  description?: string
  thumbnail?: string
  width: number
  height: number
  background_color: string
  status: CanvasStatus
  is_public: boolean
  version: number
  tags: string[]
  last_modified: string
  created_at: string
  updated_at: string
}

export interface CanvasLayer {
  id: string
  canvas_id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  z_index: number
  blend_mode: string
  created_at: string
  updated_at: string
}

export interface CanvasElement {
  id: string
  layer_id: string
  element_type: string
  points: CanvasPoint[]
  text_content?: string
  shape_type?: string
  color: string
  stroke_width: number
  opacity: number
  position: { x: number; y: number }
  size?: { width: number; height: number }
  rotation: number
  created_at: string
  updated_at: string
}

export interface CanvasCollaborator {
  id: string
  canvas_id: string
  user_id: string
  permission: CollaboratorPermission
  is_active: boolean
  cursor_position?: { x: number; y: number }
  current_tool?: ToolType
  color?: string
  last_seen: string
  joined_at: string
  created_at: string
  updated_at: string
}

export interface CanvasVersion {
  id: string
  canvas_id: string
  version: number
  thumbnail?: string
  comment?: string
  canvas_data: CanvasData
  created_by: string
  created_at: string
}

export interface CanvasTemplate {
  id: string
  name: string
  description?: string
  thumbnail?: string
  category: string
  width: number
  height: number
  canvas_data: CanvasData
  downloads: number
  rating: number
  review_count: number
  is_verified: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CanvasComment {
  id: string
  canvas_id: string
  user_id: string
  position: { x: number; y: number }
  text_content: string
  resolved: boolean
  created_at: string
  updated_at: string
}

export interface CanvasCommentReply {
  id: string
  comment_id: string
  user_id: string
  text_content: string
  created_at: string
}

export interface CanvasSession {
  id: string
  canvas_id: string
  started_at: string
  last_activity: string
  video_call_active: boolean
  audio_call_active: boolean
  active_users: number
  created_at: string
  updated_at: string
}

// ============================================================
// CANVAS PROJECTS
// ============================================================

export async function getCanvasProjects(
  userId: string,
  filters?: {
    status?: CanvasStatus
    is_public?: boolean
    search?: string
    tags?: string[]
  }
): Promise<{ data: CanvasProject[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas projects', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('canvas_projects')
      .select('*')
      .eq('user_id', userId)
      .order('last_modified', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch canvas projects', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas projects fetched successfully', {
      count: data?.length || 0,
      userId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas projects', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

export async function getCanvasProject(
  canvasId: string,
  userId: string
): Promise<{ data: CanvasProject | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas project', { canvasId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_projects')
      .select('*')
      .eq('id', canvasId)
      .single()

    if (error) {
      logger.error('Failed to fetch canvas project', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas project fetched successfully', { canvasId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas project', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function createCanvasProject(
  userId: string,
  project: {
    name: string
    description?: string
    width?: number
    height?: number
    background_color?: string
    tags?: string[]
  }
): Promise<{ data: CanvasProject | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating canvas project', { userId, project_name: project.name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_projects')
      .insert({
        user_id: userId,
        name: project.name,
        description: project.description,
        width: project.width || 1920,
        height: project.height || 1080,
        background_color: project.background_color || '#FFFFFF',
        tags: project.tags || [],
        status: 'active',
        is_public: false,
        version: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create canvas project', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas project created successfully', {
      canvasId: data.id,
      project_name: project.name
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating canvas project', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

export async function updateCanvasProject(
  canvasId: string,
  userId: string,
  updates: Partial<CanvasProject>
): Promise<{ data: CanvasProject | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating canvas project', { canvasId, userId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_projects')
      .update(updates)
      .eq('id', canvasId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update canvas project', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas project updated successfully', { canvasId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating canvas project', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteCanvasProject(
  canvasId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting canvas project', { canvasId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('canvas_projects')
      .delete()
      .eq('id', canvasId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete canvas project', { error, canvasId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Canvas project deleted successfully', { canvasId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting canvas project', { error, canvasId })
    return { success: false, error: toDbError(error) }
  }
}

export async function duplicateCanvasProject(
  canvasId: string,
  userId: string,
  newName: string
): Promise<{ data: CanvasProject | null; error: DatabaseError | null }> {
  try {
    logger.info('Duplicating canvas project', { canvasId, userId, newName })

    const supabase = createClient()

    // Get original canvas
    const { data: original, error: fetchError } = await getCanvasProject(canvasId, userId)
    if (fetchError || !original) {
      return { data: null, error: fetchError }
    }

    // Create duplicate
    const { data, error } = await supabase
      .from('canvas_projects')
      .insert({
        user_id: userId,
        name: newName,
        description: original.description,
        width: original.width,
        height: original.height,
        background_color: original.background_color,
        tags: original.tags,
        status: 'active',
        is_public: false,
        version: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to duplicate canvas project', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas project duplicated successfully', {
      originalId: canvasId,
      newId: data.id,
      newName
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception duplicating canvas project', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS LAYERS
// ============================================================

export async function getCanvasLayers(
  canvasId: string
): Promise<{ data: CanvasLayer[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas layers', { canvasId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_layers')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('z_index', { ascending: true })

    if (error) {
      logger.error('Failed to fetch canvas layers', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas layers fetched successfully', {
      count: data?.length || 0,
      canvasId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas layers', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function createCanvasLayer(
  canvasId: string,
  layer: {
    name: string
    type: LayerType
    z_index?: number
  }
): Promise<{ data: CanvasLayer | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating canvas layer', { canvasId, layer_name: layer.name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_layers')
      .insert({
        canvas_id: canvasId,
        name: layer.name,
        type: layer.type,
        visible: true,
        locked: false,
        opacity: 100,
        z_index: layer.z_index || 0,
        blend_mode: 'normal'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create canvas layer', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas layer created successfully', {
      layerId: data.id,
      canvasId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating canvas layer', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function updateCanvasLayer(
  layerId: string,
  updates: Partial<CanvasLayer>
): Promise<{ data: CanvasLayer | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating canvas layer', { layerId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_layers')
      .update(updates)
      .eq('id', layerId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update canvas layer', { error, layerId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas layer updated successfully', { layerId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating canvas layer', { error, layerId })
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteCanvasLayer(
  layerId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting canvas layer', { layerId })

    const supabase = createClient()
    const { error } = await supabase
      .from('canvas_layers')
      .delete()
      .eq('id', layerId)

    if (error) {
      logger.error('Failed to delete canvas layer', { error, layerId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Canvas layer deleted successfully', { layerId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting canvas layer', { error, layerId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS ELEMENTS
// ============================================================

export async function getCanvasElements(
  layerId: string
): Promise<{ data: CanvasElement[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas elements', { layerId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_elements')
      .select('*')
      .eq('layer_id', layerId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch canvas elements', { error, layerId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas elements fetched successfully', {
      count: data?.length || 0,
      layerId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas elements', { error, layerId })
    return { data: null, error: toDbError(error) }
  }
}

export async function createCanvasElement(
  layerId: string,
  element: {
    element_type: string
    points?: CanvasPoint[]
    text_content?: string
    shape_type?: string
    color: string
    stroke_width?: number
    position: { x: number; y: number }
    size?: { width: number; height: number }
  }
): Promise<{ data: CanvasElement | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating canvas element', { layerId, element_type: element.element_type })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_elements')
      .insert({
        layer_id: layerId,
        element_type: element.element_type,
        points: element.points || [],
        text_content: element.text_content,
        shape_type: element.shape_type,
        color: element.color,
        stroke_width: element.stroke_width || 2,
        opacity: 100,
        position: element.position,
        size: element.size,
        rotation: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create canvas element', { error, layerId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas element created successfully', {
      elementId: data.id,
      layerId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating canvas element', { error, layerId })
    return { data: null, error: toDbError(error) }
  }
}

export async function updateCanvasElement(
  elementId: string,
  updates: Partial<CanvasElement>
): Promise<{ data: CanvasElement | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating canvas element', { elementId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_elements')
      .update(updates)
      .eq('id', elementId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update canvas element', { error, elementId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas element updated successfully', { elementId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating canvas element', { error, elementId })
    return { data: null, error: toDbError(error) }
  }
}

export async function deleteCanvasElement(
  elementId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting canvas element', { elementId })

    const supabase = createClient()
    const { error } = await supabase
      .from('canvas_elements')
      .delete()
      .eq('id', elementId)

    if (error) {
      logger.error('Failed to delete canvas element', { error, elementId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Canvas element deleted successfully', { elementId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting canvas element', { error, elementId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS COLLABORATORS
// ============================================================

export async function getCanvasCollaborators(
  canvasId: string
): Promise<{ data: CanvasCollaborator[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas collaborators', { canvasId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_collaborators')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('is_active', { ascending: false })
      .order('last_seen', { ascending: false })

    if (error) {
      logger.error('Failed to fetch canvas collaborators', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas collaborators fetched successfully', {
      count: data?.length || 0,
      active: data?.filter((c: CanvasCollaborator) => c.is_active).length || 0,
      canvasId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas collaborators', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function joinCanvas(
  canvasId: string,
  userId: string,
  permission: CollaboratorPermission = 'edit'
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Joining canvas', { canvasId, userId, permission })

    const supabase = createClient()
    const { error } = await supabase.rpc('join_canvas_session', {
      p_canvas_id: canvasId,
      p_user_id: userId,
      p_permission: permission
    })

    if (error) {
      logger.error('Failed to join canvas', { error, canvasId, userId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Joined canvas successfully', { canvasId, userId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception joining canvas', { error, canvasId, userId })
    return { success: false, error: toDbError(error) }
  }
}

export async function leaveCanvas(
  canvasId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Leaving canvas', { canvasId, userId })

    const supabase = createClient()
    const { error } = await supabase.rpc('leave_canvas_session', {
      p_canvas_id: canvasId,
      p_user_id: userId
    })

    if (error) {
      logger.error('Failed to leave canvas', { error, canvasId, userId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Left canvas successfully', { canvasId, userId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception leaving canvas', { error, canvasId, userId })
    return { success: false, error: toDbError(error) }
  }
}

export async function updateCursorPosition(
  canvasId: string,
  userId: string,
  x: number,
  y: number,
  tool?: ToolType
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.rpc('update_cursor_position', {
      p_canvas_id: canvasId,
      p_user_id: userId,
      p_x: x,
      p_y: y,
      p_tool: tool
    })

    if (error) {
      logger.error('Failed to update cursor position', { error, canvasId, userId })
      return { success: false, error: toDbError(error) }
    }

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating cursor position', { error, canvasId, userId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS COMMENTS
// ============================================================

export async function getCanvasComments(
  canvasId: string,
  includeReplies: boolean = true
): Promise<{ data: CanvasComment[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas comments', { canvasId, includeReplies })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_comments')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch canvas comments', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas comments fetched successfully', {
      count: data?.length || 0,
      canvasId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas comments', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function createCanvasComment(
  canvasId: string,
  userId: string,
  comment: {
    text_content: string
    position: { x: number; y: number }
  }
): Promise<{ data: CanvasComment | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating canvas comment', { canvasId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('canvas_comments')
      .insert({
        canvas_id: canvasId,
        user_id: userId,
        text_content: comment.text_content,
        position: comment.position,
        resolved: false
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create canvas comment', { error, canvasId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas comment created successfully', {
      commentId: data.id,
      canvasId
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating canvas comment', { error, canvasId })
    return { data: null, error: toDbError(error) }
  }
}

export async function resolveCanvasComment(
  commentId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Resolving canvas comment', { commentId })

    const supabase = createClient()
    const { error } = await supabase
      .from('canvas_comments')
      .update({ resolved: true })
      .eq('id', commentId)

    if (error) {
      logger.error('Failed to resolve canvas comment', { error, commentId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Canvas comment resolved successfully', { commentId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception resolving canvas comment', { error, commentId })
    return { success: false, error: toDbError(error) }
  }
}

export async function deleteCanvasComment(
  commentId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting canvas comment', { commentId })

    const supabase = createClient()
    const { error } = await supabase
      .from('canvas_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      logger.error('Failed to delete canvas comment', { error, commentId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Canvas comment deleted successfully', { commentId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting canvas comment', { error, commentId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS TEMPLATES
// ============================================================

export async function getCanvasTemplates(
  filters?: {
    category?: string
    is_verified?: boolean
    limit?: number
  }
): Promise<{ data: CanvasTemplate[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching canvas templates', { filters })

    const supabase = createClient()
    let query = supabase
      .from('canvas_templates')
      .select('*')
      .order('downloads', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch canvas templates', { error })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Canvas templates fetched successfully', {
      count: data?.length || 0
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching canvas templates', { error })
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================
// CANVAS STATISTICS
// ============================================================

/**
 * Get total drawing count for a canvas project
 * Counts all elements across all layers
 */
export async function getCanvasDrawingCount(
  canvasId: string
): Promise<{ count: number; error: DatabaseError | null }> {
  try {
    logger.info('Counting canvas drawings', { canvasId })

    const supabase = createClient()

    // Get all layers for this canvas
    const { data: layers, error: layersError } = await supabase
      .from('canvas_layers')
      .select('id')
      .eq('canvas_id', canvasId)

    if (layersError) {
      logger.error('Failed to fetch layers for counting', { error: layersError, canvasId })
      return { count: 0, error: toDbError(layersError) }
    }

    if (!layers || layers.length === 0) {
      return { count: 0, error: null }
    }

    // Count elements across all layers
    const layerIds = layers.map((l: { id: string }) => l.id)
    const { count, error: countError } = await supabase
      .from('canvas_elements')
      .select('*', { count: 'exact', head: true })
      .in('layer_id', layerIds)

    if (countError) {
      logger.error('Failed to count canvas elements', { error: countError, canvasId })
      return { count: 0, error: toDbError(countError) }
    }

    logger.info('Canvas drawing count retrieved', {
      canvasId,
      totalDrawings: count || 0
    })

    return { count: count || 0, error: null }
  } catch (error: unknown) {
    logger.error('Exception counting canvas drawings', { error, canvasId })
    return { count: 0, error: toDbError(error) }
  }
}
