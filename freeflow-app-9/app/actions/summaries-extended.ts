'use server'

/**
 * Extended Summaries Server Actions
 * Tables: summaries, summary_sections, summary_metrics, summary_schedules, summary_recipients, summary_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getSummary(summaryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summaries').select('*, summary_sections(*), summary_metrics(*), summary_recipients(*)').eq('id', summaryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSummary(summaryData: { name: string; description?: string; summary_type: string; entity_type?: string; entity_id?: string; period?: string; period_start?: string; period_end?: string; data?: any; sections?: any[]; created_by?: string; is_public?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { sections, ...summaryInfo } = summaryData; const { data: summary, error: summaryError } = await supabase.from('summaries').insert({ ...summaryInfo, status: 'draft', is_public: summaryInfo.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (summaryError) throw summaryError; if (sections && sections.length > 0) { const sectionsData = sections.map((s, i) => ({ summary_id: summary.id, ...s, order_index: i, created_at: new Date().toISOString() })); await supabase.from('summary_sections').insert(sectionsData) } return { success: true, data: summary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSummary(summaryId: string, updates: Partial<{ name: string; description: string; data: any; status: string; is_public: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summaries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', summaryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSummary(summaryId: string) {
  try { const supabase = await createClient(); await supabase.from('summary_sections').delete().eq('summary_id', summaryId); await supabase.from('summary_metrics').delete().eq('summary_id', summaryId); await supabase.from('summary_recipients').delete().eq('summary_id', summaryId); const { error } = await supabase.from('summaries').delete().eq('id', summaryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSummaries(options?: { summary_type?: string; entity_type?: string; entity_id?: string; period?: string; status?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('summaries').select('*, summary_sections(count), users(*)'); if (options?.summary_type) query = query.eq('summary_type', options.summary_type); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.period) query = query.eq('period', options.period); if (options?.status) query = query.eq('status', options.status); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSection(summaryId: string, sectionData: { title: string; content?: string; section_type?: string; data?: any; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summary_sections').insert({ summary_id: summaryId, ...sectionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSection(sectionId: string, updates: Partial<{ title: string; content: string; section_type: string; data: any; order_index: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summary_sections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addMetric(summaryId: string, metricData: { metric_name: string; metric_value: number; previous_value?: number; unit?: string; trend?: 'up' | 'down' | 'stable'; metadata?: any }) {
  try { const supabase = await createClient(); const change = metricData.previous_value !== undefined ? metricData.metric_value - metricData.previous_value : null; const changePercent = metricData.previous_value && metricData.previous_value !== 0 ? ((metricData.metric_value - metricData.previous_value) / metricData.previous_value) * 100 : null; const { data, error } = await supabase.from('summary_metrics').insert({ summary_id: summaryId, ...metricData, change, change_percent: changePercent, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(summaryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summary_metrics').select('*').eq('summary_id', summaryId).order('metric_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleSummary(scheduleData: { summary_type: string; entity_type?: string; entity_id?: string; schedule_type: 'daily' | 'weekly' | 'monthly'; schedule_time?: string; recipients?: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { recipients, ...scheduleInfo } = scheduleData; const { data: schedule, error: scheduleError } = await supabase.from('summary_schedules').insert({ ...scheduleInfo, is_active: scheduleInfo.is_active ?? true, next_run_at: calculateNextRun(scheduleData.schedule_type, scheduleData.schedule_time), created_at: new Date().toISOString() }).select().single(); if (scheduleError) throw scheduleError; if (recipients && recipients.length > 0) { const recipientsData = recipients.map(r => ({ schedule_id: schedule.id, user_id: r, created_at: new Date().toISOString() })); await supabase.from('summary_recipients').insert(recipientsData) } return { success: true, data: schedule } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateNextRun(scheduleType: string, scheduleTime?: string): string {
  const now = new Date()
  const time = scheduleTime?.split(':') || ['08', '00']
  const next = new Date(now)
  next.setHours(parseInt(time[0]), parseInt(time[1]), 0, 0)
  if (next <= now) {
    switch (scheduleType) {
      case 'daily': next.setDate(next.getDate() + 1); break
      case 'weekly': next.setDate(next.getDate() + 7); break
      case 'monthly': next.setMonth(next.getMonth() + 1); break
    }
  }
  return next.toISOString()
}

export async function getSchedules(options?: { summary_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('summary_schedules').select('*, summary_recipients(count)'); if (options?.summary_type) query = query.eq('summary_type', options.summary_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('next_run_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishSummary(summaryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('summaries').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', summaryId).select().single(); if (error) throw error; await supabase.from('summary_history').insert({ summary_id: summaryId, action: 'published', occurred_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

