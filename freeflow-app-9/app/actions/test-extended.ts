'use server'

/**
 * Extended Test Server Actions - Covers all Test-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTestSuites(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('test_suites').select('*').order('name', { ascending: true }); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTestSuite(suiteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_suites').select('*').eq('id', suiteId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTestSuite(input: { name: string; description?: string; project_id?: string; test_type: string; configuration?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_suites').insert({ ...input, status: 'active', test_count: 0, last_run_status: null }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTestSuite(suiteId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_suites').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', suiteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTestSuite(suiteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('test_suites').delete().eq('id', suiteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function runTestSuite(suiteId: string, triggeredBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_suites').update({ status: 'running', last_run_at: new Date().toISOString(), last_run_by: triggeredBy }).eq('id', suiteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeTestSuite(suiteId: string, status: string, summary: { passed: number; failed: number; skipped: number; duration_ms: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_suites').update({ status: 'active', last_run_status: status, last_run_summary: summary, last_run_completed_at: new Date().toISOString() }).eq('id', suiteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTestResults(suiteId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_results').select('*').eq('suite_id', suiteId).order('executed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTestResult(suiteId: string, input: { test_name: string; status: string; duration_ms?: number; error_message?: string; stack_trace?: string; screenshots?: string[]; logs?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_results').insert({ suite_id: suiteId, ...input, executed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTestResult(resultId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('test_results').update(updates).eq('id', resultId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTestResult(resultId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('test_results').delete().eq('id', resultId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTestResultsSummary(suiteId: string, days = 30) {
  try { const supabase = await createClient(); const startDate = new Date(); startDate.setDate(startDate.getDate() - days); const { data, error } = await supabase.from('test_results').select('status, executed_at').eq('suite_id', suiteId).gte('executed_at', startDate.toISOString()); if (error) throw error; const summary = { total: data?.length || 0, passed: data?.filter(r => r.status === 'passed').length || 0, failed: data?.filter(r => r.status === 'failed').length || 0, skipped: data?.filter(r => r.status === 'skipped').length || 0 }; return { success: true, data: { ...summary, pass_rate: summary.total > 0 ? (summary.passed / summary.total) * 100 : 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearTestResults(suiteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('test_results').delete().eq('suite_id', suiteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
