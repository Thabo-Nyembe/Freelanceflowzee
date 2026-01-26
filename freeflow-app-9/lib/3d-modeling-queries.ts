/**
 * 3D Modeling Query Library
 *
 * Comprehensive CRUD operations for 3D Modeling feature:
 * - Projects (create, read, update, delete)
 * - Scenes (create, read, update, delete)
 * - Objects (create, read, update, delete, transform)
 * - Materials (create, read, update, delete)
 * - Lights (create, read, update, delete)
 * - Cameras (create, read, update, delete)
 * - Render Jobs (create, read, update status)
 * - Export Jobs (create, read, update status)
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type ObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'pyramid' | 'prism'
export type MaterialType = 'standard' | 'metallic' | 'glass' | 'plastic' | 'fabric' | 'wood' | 'stone' | 'emission'
export type LightType = 'directional' | 'point' | 'spot' | 'ambient' | 'area'
export type ProjectionType = 'perspective' | 'orthographic'
export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra'
export type ExportFormat = 'obj' | 'fbx' | 'gltf' | 'stl' | 'dae' | 'blend'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ModelingProject {
  id: string
  user_id: string
  name: string
  description?: string
  thumbnail_url?: string
  tags: string[]
  is_public: boolean
  active_scene_id?: string
  created_at: string
  updated_at: string
}

export interface ModelingScene {
  id: string
  project_id: string
  user_id: string
  name: string
  description?: string
  background_color: string
  grid_size: number
  grid_divisions: number
  created_at: string
  updated_at: string
}

export interface SceneObject {
  id: string
  scene_id: string
  name: string
  type: ObjectType
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale_x: number
  scale_y: number
  scale_z: number
  material_id?: string
  visible: boolean
  locked: boolean
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  scene_id: string
  name: string
  type: MaterialType
  color: string
  roughness: number
  metallic: number
  emission: number
  opacity: number
  texture_url?: string
  normal_map_url?: string
  bump_map_url?: string
  created_at: string
  updated_at: string
}

export interface Light {
  id: string
  scene_id: string
  name: string
  type: LightType
  intensity: number
  color: string
  position_x: number
  position_y: number
  position_z: number
  rotation_x?: number
  rotation_y?: number
  rotation_z?: number
  cast_shadow: boolean
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface Camera {
  id: string
  scene_id: string
  name: string
  type: ProjectionType
  position_x: number
  position_y: number
  position_z: number
  target_x: number
  target_y: number
  target_z: number
  fov: number
  near_plane: number
  far_plane: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RenderJob {
  id: string
  scene_id: string
  user_id: string
  quality: RenderQuality
  resolution_width: number
  resolution_height: number
  samples: number
  max_bounces: number
  enable_shadows: boolean
  enable_reflections: boolean
  enable_ambient_occlusion: boolean
  background_color: string
  output_format: string
  status: JobStatus
  progress: number
  output_url?: string
  error_message?: string
  estimated_time?: number
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ExportJob {
  id: string
  scene_id: string
  user_id: string
  format: ExportFormat
  include_textures: boolean
  include_materials: boolean
  include_lights: boolean
  include_camera: boolean
  scale: number
  status: JobStatus
  output_url?: string
  error_message?: string
  file_size?: number
  created_at: string
  completed_at?: string
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects(
  userId: string,
  filters?: {
    is_public?: boolean
    search?: string
  }
): Promise<{ data: ModelingProject[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('modeling_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function getProject(
  projectId: string
): Promise<{ data: ModelingProject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function createProject(
  userId: string,
  project: {
    name: string
    description?: string
    thumbnail_url?: string
    tags?: string[]
    is_public?: boolean
  }
): Promise<{ data: ModelingProject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_projects')
    .insert({
      user_id: userId,
      ...project
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<ModelingProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ModelingProject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteProject(
  projectId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('modeling_projects')
    .delete()
    .eq('id', projectId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// SCENES
// ============================================================================

export async function getScenes(
  projectId: string
): Promise<{ data: ModelingScene[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return { data, error: error ? toDbError(error) : null }
}

export async function getScene(
  sceneId: string
): Promise<{ data: ModelingScene | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_scenes')
    .select('*')
    .eq('id', sceneId)
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function createScene(
  projectId: string,
  userId: string,
  scene: {
    name: string
    description?: string
    background_color?: string
    grid_size?: number
    grid_divisions?: number
  }
): Promise<{ data: ModelingScene | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_scenes')
    .insert({
      project_id: projectId,
      user_id: userId,
      ...scene
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateScene(
  sceneId: string,
  updates: Partial<Omit<ModelingScene, 'id' | 'project_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ModelingScene | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modeling_scenes')
    .update(updates)
    .eq('id', sceneId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteScene(
  sceneId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('modeling_scenes')
    .delete()
    .eq('id', sceneId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// SCENE OBJECTS
// ============================================================================

export async function getSceneObjects(
  sceneId: string,
  filters?: {
    type?: ObjectType
    visible?: boolean
  }
): Promise<{ data: SceneObject[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('scene_objects')
    .select('*')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: true })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.visible !== undefined) query = query.eq('visible', filters.visible)

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function createSceneObject(
  sceneId: string,
  object: {
    name: string
    type: ObjectType
    position_x?: number
    position_y?: number
    position_z?: number
    rotation_x?: number
    rotation_y?: number
    rotation_z?: number
    scale_x?: number
    scale_y?: number
    scale_z?: number
    material_id?: string
    parent_id?: string
  }
): Promise<{ data: SceneObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('scene_objects')
    .insert({
      scene_id: sceneId,
      ...object
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateSceneObject(
  objectId: string,
  updates: Partial<Omit<SceneObject, 'id' | 'scene_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: SceneObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('scene_objects')
    .update(updates)
    .eq('id', objectId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

// Interface for transform updates
interface TransformUpdates {
  position_x?: number
  position_y?: number
  position_z?: number
  rotation_x?: number
  rotation_y?: number
  rotation_z?: number
  scale_x?: number
  scale_y?: number
  scale_z?: number
}

export async function updateObjectTransform(
  objectId: string,
  transform: {
    position?: { x: number; y: number; z: number }
    rotation?: { x: number; y: number; z: number }
    scale?: { x: number; y: number; z: number }
  }
): Promise<{ data: SceneObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const updates: TransformUpdates = {}

  if (transform.position) {
    updates.position_x = transform.position.x
    updates.position_y = transform.position.y
    updates.position_z = transform.position.z
  }

  if (transform.rotation) {
    updates.rotation_x = transform.rotation.x
    updates.rotation_y = transform.rotation.y
    updates.rotation_z = transform.rotation.z
  }

  if (transform.scale) {
    updates.scale_x = transform.scale.x
    updates.scale_y = transform.scale.y
    updates.scale_z = transform.scale.z
  }

  const { data, error } = await supabase
    .from('scene_objects')
    .update(updates)
    .eq('id', objectId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function toggleObjectVisibility(
  objectId: string,
  visible: boolean
): Promise<{ data: SceneObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('scene_objects')
    .update({ visible })
    .eq('id', objectId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function toggleObjectLock(
  objectId: string,
  locked: boolean
): Promise<{ data: SceneObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('scene_objects')
    .update({ locked })
    .eq('id', objectId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteSceneObject(
  objectId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('scene_objects')
    .delete()
    .eq('id', objectId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// MATERIALS
// ============================================================================

export async function getMaterials(
  sceneId: string,
  filters?: {
    type?: MaterialType
  }
): Promise<{ data: Material[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('materials')
    .select('*')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: true })

  if (filters?.type) query = query.eq('type', filters.type)

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function createMaterial(
  sceneId: string,
  material: {
    name: string
    type: MaterialType
    color: string
    roughness?: number
    metallic?: number
    emission?: number
    opacity?: number
    texture_url?: string
    normal_map_url?: string
    bump_map_url?: string
  }
): Promise<{ data: Material | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materials')
    .insert({
      scene_id: sceneId,
      ...material
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateMaterial(
  materialId: string,
  updates: Partial<Omit<Material, 'id' | 'scene_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Material | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materials')
    .update(updates)
    .eq('id', materialId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteMaterial(
  materialId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// LIGHTS
// ============================================================================

export async function getLights(
  sceneId: string,
  filters?: {
    type?: LightType
    enabled?: boolean
  }
): Promise<{ data: Light[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('lights')
    .select('*')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: true })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.enabled !== undefined) query = query.eq('enabled', filters.enabled)

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function createLight(
  sceneId: string,
  light: {
    name: string
    type: LightType
    intensity?: number
    color?: string
    position_x?: number
    position_y?: number
    position_z?: number
    rotation_x?: number
    rotation_y?: number
    rotation_z?: number
    cast_shadow?: boolean
  }
): Promise<{ data: Light | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lights')
    .insert({
      scene_id: sceneId,
      ...light
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateLight(
  lightId: string,
  updates: Partial<Omit<Light, 'id' | 'scene_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Light | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lights')
    .update(updates)
    .eq('id', lightId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function toggleLight(
  lightId: string,
  enabled: boolean
): Promise<{ data: Light | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lights')
    .update({ enabled })
    .eq('id', lightId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteLight(
  lightId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('lights')
    .delete()
    .eq('id', lightId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// CAMERAS
// ============================================================================

export async function getCameras(
  sceneId: string
): Promise<{ data: Camera[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: true })

  return { data, error: error ? toDbError(error) : null }
}

export async function createCamera(
  sceneId: string,
  camera: {
    name: string
    type?: ProjectionType
    position_x?: number
    position_y?: number
    position_z?: number
    target_x?: number
    target_y?: number
    target_z?: number
    fov?: number
    near_plane?: number
    far_plane?: number
  }
): Promise<{ data: Camera | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cameras')
    .insert({
      scene_id: sceneId,
      ...camera
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateCamera(
  cameraId: string,
  updates: Partial<Omit<Camera, 'id' | 'scene_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Camera | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cameras')
    .update(updates)
    .eq('id', cameraId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function setActiveCamera(
  sceneId: string,
  cameraId: string
): Promise<{ data: Camera | null; error: DatabaseError | null }> {
  const supabase = createClient()

  // First, deactivate all cameras in the scene
  await supabase
    .from('cameras')
    .update({ is_active: false })
    .eq('scene_id', sceneId)

  // Then activate the selected camera
  const { data, error } = await supabase
    .from('cameras')
    .update({ is_active: true })
    .eq('id', cameraId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteCamera(
  cameraId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('cameras')
    .delete()
    .eq('id', cameraId)

  return { error: error ? toDbError(error) : null }
}

// ============================================================================
// RENDER JOBS
// ============================================================================

export async function getRenderJobs(
  userId: string,
  filters?: {
    scene_id?: string
    status?: JobStatus
  }
): Promise<{ data: RenderJob[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('render_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.scene_id) query = query.eq('scene_id', filters.scene_id)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function createRenderJob(
  sceneId: string,
  userId: string,
  renderSettings: {
    quality?: RenderQuality
    resolution_width?: number
    resolution_height?: number
    samples?: number
    max_bounces?: number
    enable_shadows?: boolean
    enable_reflections?: boolean
    enable_ambient_occlusion?: boolean
    background_color?: string
    output_format?: string
  }
): Promise<{ data: RenderJob | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('render_jobs')
    .insert({
      scene_id: sceneId,
      user_id: userId,
      ...renderSettings
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

// Interface for render job status updates
interface RenderJobStatusUpdates {
  status: JobStatus
  progress?: number
  output_url?: string
  error_message?: string
}

export async function updateRenderJobStatus(
  jobId: string,
  status: JobStatus,
  progress?: number,
  output_url?: string,
  error_message?: string
): Promise<{ data: RenderJob | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const updates: RenderJobStatusUpdates = { status }

  if (progress !== undefined) updates.progress = progress
  if (output_url) updates.output_url = output_url
  if (error_message) updates.error_message = error_message

  const { data, error } = await supabase
    .from('render_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

// ============================================================================
// EXPORT JOBS
// ============================================================================

export async function getExportJobs(
  userId: string,
  filters?: {
    scene_id?: string
    status?: JobStatus
  }
): Promise<{ data: ExportJob[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('export_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.scene_id) query = query.eq('scene_id', filters.scene_id)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function createExportJob(
  sceneId: string,
  userId: string,
  exportSettings: {
    format: ExportFormat
    include_textures?: boolean
    include_materials?: boolean
    include_lights?: boolean
    include_camera?: boolean
    scale?: number
  }
): Promise<{ data: ExportJob | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('export_jobs')
    .insert({
      scene_id: sceneId,
      user_id: userId,
      ...exportSettings
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

// Interface for export job status updates
interface ExportJobStatusUpdates {
  status: JobStatus
  output_url?: string
  error_message?: string
  file_size?: number
}

export async function updateExportJobStatus(
  jobId: string,
  status: JobStatus,
  output_url?: string,
  error_message?: string,
  file_size?: number
): Promise<{ data: ExportJob | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const updates: ExportJobStatusUpdates = { status }

  if (output_url) updates.output_url = output_url
  if (error_message) updates.error_message = error_message
  if (file_size !== undefined) updates.file_size = file_size

  const { data, error } = await supabase
    .from('export_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getProjectStats(
  userId: string
): Promise<{
  data: {
    total_projects: number
    total_scenes: number
    total_objects: number
    total_renders: number
  } | null
  error: DatabaseError | null
}> {
  const supabase = createClient()

  const [projectsResult, scenesResult, objectsResult, rendersResult] = await Promise.all([
    supabase.from('modeling_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('modeling_scenes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('scene_objects').select('id', { count: 'exact', head: true }).in('scene_id',
      supabase.from('modeling_scenes').select('id').eq('user_id', userId)
    ),
    supabase.from('render_jobs').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  const firstError = projectsResult.error || scenesResult.error || objectsResult.error || rendersResult.error
  if (firstError) {
    return {
      data: null,
      error: toDbError(firstError)
    }
  }

  return {
    data: {
      total_projects: projectsResult.count || 0,
      total_scenes: scenesResult.count || 0,
      total_objects: objectsResult.count || 0,
      total_renders: rendersResult.count || 0
    },
    error: null
  }
}
