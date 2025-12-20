'use server'

/**
 * Extended Modeling Server Actions - Covers all 10 Modeling-related tables (3D)
 */

import { createClient } from '@/lib/supabase/server'

export async function getModelingAnimations(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_animations').select('*').eq('project_id', projectId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingAnimation(projectId: string, input: { name: string; duration: number; fps?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_animations').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingAnimation(animationId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_animations').update(updates).eq('id', animationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModelingAnimation(animationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_animations').delete().eq('id', animationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingCameras(sceneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_cameras').select('*').eq('scene_id', sceneId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingCamera(sceneId: string, input: { name: string; type: string; position: any; rotation: any; fov?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_cameras').insert({ scene_id: sceneId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingCamera(cameraId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_cameras').update(updates).eq('id', cameraId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingKeyframes(animationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_keyframes').select('*').eq('animation_id', animationId).order('frame', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingKeyframe(animationId: string, input: { frame: number; object_id: string; property: string; value: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_keyframes').insert({ animation_id: animationId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModelingKeyframe(keyframeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_keyframes').delete().eq('id', keyframeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingLights(sceneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_lights').select('*').eq('scene_id', sceneId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingLight(sceneId: string, input: { name: string; type: string; color?: string; intensity?: number; position?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_lights').insert({ scene_id: sceneId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingLight(lightId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_lights').update(updates).eq('id', lightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingMaterials(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_materials').select('*').eq('project_id', projectId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingMaterial(projectId: string, input: { name: string; type: string; properties: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_materials').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingMaterial(materialId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_materials').update(updates).eq('id', materialId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingObjectMaterials(objectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_object_materials').select('*').eq('object_id', objectId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignMaterialToObject(objectId: string, materialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_object_materials').insert({ object_id: objectId, material_id: materialId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMaterialFromObject(objectId: string, materialId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_object_materials').delete().eq('object_id', objectId).eq('material_id', materialId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingObjects(sceneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_objects').select('*').eq('scene_id', sceneId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingObject(sceneId: string, input: { name: string; type: string; geometry?: any; position?: any; rotation?: any; scale?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_objects').insert({ scene_id: sceneId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingObject(objectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_objects').update(updates).eq('id', objectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModelingObject(objectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_objects').delete().eq('id', objectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingProjects(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingProject(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_projects').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingProject(projectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModelingProject(projectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_projects').delete().eq('id', projectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingRenderJobs(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_render_jobs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRenderJob(projectId: string, sceneId: string, input: { settings: any; output_format?: string; resolution?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_render_jobs').insert({ project_id: projectId, scene_id: sceneId, ...input, status: 'queued' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRenderJobStatus(jobId: string, status: string, resultUrl?: string, progress?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_render_jobs').update({ status, result_url: resultUrl, progress, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRenderJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_render_jobs').update({ status: 'cancelled' }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelingScenes(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_scenes').select('*').eq('project_id', projectId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelingScene(projectId: string, input: { name: string; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_scenes').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModelingScene(sceneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modeling_scenes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sceneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModelingScene(sceneId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('modeling_scenes').delete().eq('id', sceneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
