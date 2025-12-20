'use server'

/**
 * Extended KPIs Server Actions
 * Tables: kpis, kpi_targets, kpi_values, kpi_categories, kpi_dashboards, kpi_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getKpi(kpiId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpis').select('*, kpi_targets(*), kpi_values(*)').eq('id', kpiId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKpi(kpiData: { name: string; description?: string; organization_id?: string; category_id?: string; unit?: string; target_value?: number; calculation_type?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpis').insert({ ...kpiData, current_value: 0, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKpi(kpiId: string, updates: Partial<{ name: string; description: string; unit: string; target_value: number; status: string; calculation_type: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpis').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', kpiId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteKpi(kpiId: string) {
  try { const supabase = await createClient(); await supabase.from('kpi_values').delete().eq('kpi_id', kpiId); await supabase.from('kpi_targets').delete().eq('kpi_id', kpiId); const { error } = await supabase.from('kpis').delete().eq('id', kpiId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKpis(options?: { organization_id?: string; category_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('kpis').select('*, kpi_categories(*)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordKpiValue(valueData: { kpi_id: string; value: number; period_start: string; period_end: string; notes?: string; recorded_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_values').insert({ ...valueData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('kpis').update({ current_value: valueData.value, updated_at: new Date().toISOString() }).eq('id', valueData.kpi_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKpiValues(kpiId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('kpi_values').select('*').eq('kpi_id', kpiId); if (options?.from_date) query = query.gte('period_start', options.from_date); if (options?.to_date) query = query.lte('period_end', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setKpiTarget(targetData: { kpi_id: string; target_value: number; period: string; start_date: string; end_date: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_targets').insert({ ...targetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKpiTargets(kpiId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_targets').select('*').eq('kpi_id', kpiId).order('start_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getKpiCategories(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('kpi_categories').select('*'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKpiAlert(alertData: { kpi_id: string; condition: string; threshold: number; notification_channels: string[]; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_alerts').insert({ ...alertData, is_enabled: alertData.is_enabled ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKpiDashboard(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_dashboards').select('*, kpis(*)').eq('id', dashboardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKpiDashboard(dashboardData: { name: string; description?: string; organization_id?: string; kpi_ids: string[]; layout?: any; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kpi_dashboards').insert({ ...dashboardData, is_public: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
