'use server'

/**
 * Extended Roadmap Server Actions - Covers all Roadmap-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRoadmaps(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('roadmaps').select('*').order('created_at', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoadmap(roadmapId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmaps').select('*').eq('id', roadmapId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoadmap(userId: string, input: { name: string; description?: string; project_id?: string; start_date?: string; end_date?: string; visibility?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmaps').insert({ created_by: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoadmap(roadmapId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmaps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roadmapId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveRoadmap(roadmapId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmaps').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', roadmapId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRoadmap(roadmapId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('roadmaps').delete().eq('id', roadmapId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoadmapItems(roadmapId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('roadmap_items').select('*').eq('roadmap_id', roadmapId).order('order_index', { ascending: true }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoadmapItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmap_items').select('*').eq('id', itemId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoadmapItem(roadmapId: string, input: { title: string; description?: string; category?: string; priority?: string; target_date?: string; order_index?: number; assignee_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmap_items').insert({ roadmap_id: roadmapId, ...input, status: 'planned', progress: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoadmapItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmap_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoadmapItemProgress(itemId: string, progress: number) {
  try { const supabase = await createClient(); const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planned'; const updates: any = { progress, status, updated_at: new Date().toISOString() }; if (progress === 100) updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('roadmap_items').update(updates).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderRoadmapItems(roadmapId: string, itemOrders: { id: string; order_index: number }[]) {
  try { const supabase = await createClient(); for (const item of itemOrders) { await supabase.from('roadmap_items').update({ order_index: item.order_index }).eq('id', item.id).eq('roadmap_id', roadmapId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRoadmapItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('roadmap_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoadmapProgress(roadmapId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roadmap_items').select('status, progress').eq('roadmap_id', roadmapId); if (error) throw error; const total = data?.length || 0; const completed = data?.filter(i => i.status === 'completed').length || 0; const avgProgress = total > 0 ? data.reduce((sum, i) => sum + (i.progress || 0), 0) / total : 0; return { success: true, data: { total_items: total, completed_items: completed, average_progress: avgProgress } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
