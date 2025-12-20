'use server'

/**
 * Extended QA Server Actions - Covers all QA-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getQATestCases(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('qa_test_cases').select('*').order('created_at', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getQATestCase(testCaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_cases').select('*').eq('id', testCaseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createQATestCase(input: { title: string; description?: string; project_id?: string; priority: string; test_type: string; preconditions?: string; steps: any[]; expected_result: string; created_by: string }) {
  try { const supabase = await createClient(); const testCaseNumber = `TC-${Date.now()}`; const { data, error } = await supabase.from('qa_test_cases').insert({ test_case_number: testCaseNumber, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateQATestCase(testCaseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_cases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', testCaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveQATestCase(testCaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_cases').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', testCaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQATestCase(testCaseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('qa_test_cases').delete().eq('id', testCaseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQATestRuns(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('qa_test_runs').select('*').order('started_at', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createQATestRun(input: { name: string; project_id?: string; test_case_ids: string[]; environment?: string; build_version?: string; run_by: string }) {
  try { const supabase = await createClient(); const runNumber = `TR-${Date.now()}`; const { data, error } = await supabase.from('qa_test_runs').insert({ run_number: runNumber, ...input, status: 'pending', total_tests: input.test_case_ids.length, passed_tests: 0, failed_tests: 0, skipped_tests: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startQATestRun(runId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTestRunResults(runId: string, results: { passed: number; failed: number; skipped: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_runs').update({ passed_tests: results.passed, failed_tests: results.failed, skipped_tests: results.skipped }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeQATestRun(runId: string) {
  try { const supabase = await createClient(); const { data: run, error: runError } = await supabase.from('qa_test_runs').select('passed_tests, total_tests').eq('id', runId).single(); if (runError) throw runError; const passRate = run.total_tests > 0 ? (run.passed_tests / run.total_tests) * 100 : 0; const { data, error } = await supabase.from('qa_test_runs').update({ status: 'completed', completed_at: new Date().toISOString(), pass_rate: passRate }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function abortQATestRun(runId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_runs').update({ status: 'aborted', completed_at: new Date().toISOString(), abort_reason: reason }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQATestRunSummary(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('qa_test_runs').select('status, pass_rate').eq('project_id', projectId).order('completed_at', { ascending: false }).limit(10); if (error) throw error; const avgPassRate = data?.length ? data.reduce((sum, r) => sum + (r.pass_rate || 0), 0) / data.length : 0; return { success: true, data: { total_runs: data?.length || 0, average_pass_rate: avgPassRate, recent_runs: data || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
