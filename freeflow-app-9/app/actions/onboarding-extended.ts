'use server'

/**
 * Extended Onboarding Server Actions - Covers all Onboarding-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getOnboardingFlows(activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('onboarding_flows').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOnboardingFlow(flowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_flows').select('*').eq('id', flowId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOnboardingFlow(input: { name: string; description?: string; steps: any[]; target_audience?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_flows').insert({ ...input, is_active: true, total_steps: input.steps.length }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOnboardingFlow(flowId: string, updates: any) {
  try { const supabase = await createClient(); if (updates.steps) updates.total_steps = updates.steps.length; const { data, error } = await supabase.from('onboarding_flows').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', flowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleOnboardingFlow(flowId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_flows').update({ is_active: isActive }).eq('id', flowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOnboardingFlow(flowId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('onboarding_flows').delete().eq('id', flowId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserOnboardingProgress(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_progress').select('*').eq('user_id', userId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startOnboarding(userId: string, flowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_progress').insert({ user_id: userId, flow_id: flowId, current_step: 0, completed_steps: [], started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeOnboardingStep(progressId: string, stepIndex: number) {
  try { const supabase = await createClient(); const { data: progress, error: progressError } = await supabase.from('onboarding_progress').select('completed_steps, flow_id').eq('id', progressId).single(); if (progressError) throw progressError; const completedSteps = [...(progress?.completed_steps || []), stepIndex]; const { data: flow } = await supabase.from('onboarding_flows').select('total_steps').eq('id', progress.flow_id).single(); const isComplete = completedSteps.length >= (flow?.total_steps || 0); const updates: any = { completed_steps: completedSteps, current_step: stepIndex + 1, updated_at: new Date().toISOString() }; if (isComplete) updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('onboarding_progress').update(updates).eq('id', progressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function skipOnboardingStep(progressId: string, stepIndex: number) {
  try { const supabase = await createClient(); const { data: progress, error: progressError } = await supabase.from('onboarding_progress').select('skipped_steps').eq('id', progressId).single(); if (progressError) throw progressError; const skippedSteps = [...(progress?.skipped_steps || []), stepIndex]; const { data, error } = await supabase.from('onboarding_progress').update({ skipped_steps: skippedSteps, current_step: stepIndex + 1, updated_at: new Date().toISOString() }).eq('id', progressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetOnboardingProgress(progressId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_progress').update({ current_step: 0, completed_steps: [], skipped_steps: [], completed_at: null, updated_at: new Date().toISOString() }).eq('id', progressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOnboardingStats(flowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('onboarding_progress').select('completed_at').eq('flow_id', flowId); if (error) throw error; const total = data?.length || 0; const completed = data?.filter(p => p.completed_at).length || 0; return { success: true, data: { total_started: total, total_completed: completed, completion_rate: total > 0 ? (completed / total) * 100 : 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
