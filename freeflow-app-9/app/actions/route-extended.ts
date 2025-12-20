'use server'

/**
 * Extended Route Server Actions
 * Tables: routes, route_permissions, route_middleware, route_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getRoute(routeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('routes').select('*').eq('id', routeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoute(routeData: { path: string; name?: string; method?: string; handler?: string; is_protected?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('routes').insert({ ...routeData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoute(routeId: string, updates: Partial<{ path: string; name: string; method: string; handler: string; is_active: boolean; is_protected: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('routes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', routeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRoute(routeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('routes').delete().eq('id', routeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoutes(options?: { method?: string; is_active?: boolean; is_protected?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('routes').select('*'); if (options?.method) query = query.eq('method', options.method); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_protected !== undefined) query = query.eq('is_protected', options.is_protected); const { data, error } = await query.order('path', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoutePermissions(routeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_permissions').select('*').eq('route_id', routeId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRouteMiddleware(routeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_middleware').select('*').eq('route_id', routeId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRouteAnalytics(routeId: string, options?: { days?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data, error } = await supabase.from('route_analytics').select('*').eq('route_id', routeId).gte('created_at', since.toISOString()).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
