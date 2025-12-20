'use server'

/**
 * Extended Territories Server Actions
 * Tables: territories, territory_assignments, territory_boundaries, territory_metrics, territory_history, territory_rules
 */

import { createClient } from '@/lib/supabase/server'

export async function getTerritory(territoryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territories').select('*, territory_assignments(*, users(*)), territory_boundaries(*), territory_metrics(*), territory_rules(*)').eq('id', territoryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTerritory(territoryData: { name: string; code: string; description?: string; territory_type: string; parent_id?: string; region?: string; country?: string; boundaries?: any; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territories').insert({ ...territoryData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTerritory(territoryId: string, updates: Partial<{ name: string; code: string; description: string; territory_type: string; parent_id: string; region: string; country: string; status: string; boundaries: any; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', territoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTerritory(territoryId: string) {
  try { const supabase = await createClient(); await supabase.from('territory_assignments').delete().eq('territory_id', territoryId); await supabase.from('territory_boundaries').delete().eq('territory_id', territoryId); await supabase.from('territory_metrics').delete().eq('territory_id', territoryId); await supabase.from('territory_history').delete().eq('territory_id', territoryId); await supabase.from('territory_rules').delete().eq('territory_id', territoryId); const { error } = await supabase.from('territories').delete().eq('id', territoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTerritories(options?: { territory_type?: string; parent_id?: string | null; region?: string; country?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('territories').select('*, territory_assignments(count)'); if (options?.territory_type) query = query.eq('territory_type', options.territory_type); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } if (options?.region) query = query.eq('region', options.region); if (options?.country) query = query.eq('country', options.country); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignTerritory(territoryId: string, userId: string, assignmentData: { role?: string; is_primary?: boolean; effective_from?: string; effective_to?: string; assigned_by?: string }) {
  try { const supabase = await createClient(); if (assignmentData.is_primary) { await supabase.from('territory_assignments').update({ is_primary: false }).eq('user_id', userId) } const { data, error } = await supabase.from('territory_assignments').insert({ territory_id: territoryId, user_id: userId, role: assignmentData.role || 'representative', is_primary: assignmentData.is_primary ?? false, effective_from: assignmentData.effective_from || new Date().toISOString(), effective_to: assignmentData.effective_to, assigned_by: assignmentData.assigned_by, status: 'active', created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await logHistory(territoryId, 'assignment_added', { user_id: userId, role: assignmentData.role }, assignmentData.assigned_by); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignTerritory(territoryId: string, userId: string, unassignedBy?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('territory_assignments').delete().eq('territory_id', territoryId).eq('user_id', userId); if (error) throw error; await logHistory(territoryId, 'assignment_removed', { user_id: userId }, unassignedBy); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAssignments(territoryId: string, options?: { role?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('territory_assignments').select('*, users(*)').eq('territory_id', territoryId); if (options?.role) query = query.eq('role', options.role); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserTerritories(userId: string, options?: { role?: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('territory_assignments').select('*, territories(*)').eq('user_id', userId).eq('status', 'active'); if (options?.role) query = query.eq('role', options.role); if (options?.is_primary !== undefined) query = query.eq('is_primary', options.is_primary); const { data, error } = await query.order('is_primary', { ascending: false }); if (error) throw error; return { success: true, data: (data || []).map(a => ({ ...a.territories, assignment: a })) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateBoundaries(territoryId: string, boundaries: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territory_boundaries').upsert({ territory_id: territoryId, boundaries, boundary_type: boundaries.type || 'polygon', updated_at: new Date().toISOString() }, { onConflict: 'territory_id' }).select().single(); if (error) throw error; await logHistory(territoryId, 'boundaries_updated', { boundary_type: boundaries.type }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordMetrics(territoryId: string, metrics: { period: string; revenue?: number; orders?: number; customers?: number; visits?: number; opportunities?: number; custom_metrics?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territory_metrics').upsert({ territory_id: territoryId, ...metrics, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }, { onConflict: 'territory_id,period' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(territoryId: string, options?: { from_period?: string; to_period?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('territory_metrics').select('*').eq('territory_id', territoryId); if (options?.from_period) query = query.gte('period', options.from_period); if (options?.to_period) query = query.lte('period', options.to_period); const { data, error } = await query.order('period', { ascending: false }).limit(options?.limit || 12); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function logHistory(territoryId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('territory_history').insert({ territory_id: territoryId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getHistory(territoryId: string, options?: { action?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('territory_history').select('*, users(*)').eq('territory_id', territoryId); if (options?.action) query = query.eq('action', options.action); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRule(territoryId: string, ruleData: { name: string; rule_type: string; conditions: any; actions?: any; priority?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territory_rules').insert({ territory_id: territoryId, ...ruleData, is_active: ruleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(territoryId: string, options?: { rule_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('territory_rules').select('*').eq('territory_id', territoryId); if (options?.rule_type) query = query.eq('rule_type', options.rule_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getChildTerritories(parentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('territories').select('*, territory_assignments(count)').eq('parent_id', parentId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
