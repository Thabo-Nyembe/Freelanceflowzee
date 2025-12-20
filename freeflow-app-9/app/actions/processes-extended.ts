'use server'

/**
 * Extended Processes Server Actions
 * Tables: processes, process_steps, process_instances, process_tasks, process_variables, process_history, process_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getProcess(processId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('processes').select('*, process_steps(*), process_variables(*), process_instances(count)').eq('id', processId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProcess(processData: { name: string; description?: string; organization_id?: string; category?: string; owner_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('processes').insert({ ...processData, version: 1, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProcess(processId: string, updates: Partial<{ name: string; description: string; category: string; status: string; owner_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('processes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', processId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishProcess(processId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('processes').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', processId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProcess(processId: string) {
  try { const supabase = await createClient(); await supabase.from('process_tasks').delete().eq('process_id', processId); await supabase.from('process_variables').delete().eq('process_id', processId); await supabase.from('process_steps').delete().eq('process_id', processId); await supabase.from('process_history').delete().eq('process_id', processId); await supabase.from('process_instances').delete().eq('process_id', processId); const { error } = await supabase.from('processes').delete().eq('id', processId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProcesses(options?: { organization_id?: string; status?: string; category?: string; owner_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('processes').select('*, process_steps(count), process_instances(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.category) query = query.eq('category', options.category); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStep(processId: string, stepData: { name: string; type: string; order: number; config?: any; assignee_type?: string; assignee_id?: string; timeout_hours?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_steps').insert({ process_id: processId, ...stepData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStep(stepId: string, updates: Partial<{ name: string; type: string; order: number; config: any; assignee_type: string; assignee_id: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_steps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stepId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSteps(processId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_steps').select('*').eq('process_id', processId).eq('is_active', true).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startInstance(processId: string, instanceData: { started_by: string; variables?: any; metadata?: any }) {
  try { const supabase = await createClient(); const { data: process } = await supabase.from('processes').select('*, process_steps(*)').eq('id', processId).single(); if (!process) return { success: false, error: 'Process not found' }; const firstStep = process.process_steps?.find((s: any) => s.order === 1); const { data, error } = await supabase.from('process_instances').insert({ process_id: processId, started_by: instanceData.started_by, variables: instanceData.variables || {}, metadata: instanceData.metadata, current_step_id: firstStep?.id, status: 'running', started_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('process_history').insert({ process_id: processId, instance_id: data.id, step_id: firstStep?.id, action: 'started', performed_by: instanceData.started_by, performed_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstance(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_instances').select('*, processes(*), process_steps(*), process_tasks(*)').eq('id', instanceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function advanceStep(instanceId: string, userId: string, variables?: any, notes?: string) {
  try { const supabase = await createClient(); const { data: instance } = await supabase.from('process_instances').select('*, processes(*, process_steps(*))').eq('id', instanceId).single(); if (!instance) return { success: false, error: 'Instance not found' }; const steps = instance.processes?.process_steps?.sort((a: any, b: any) => a.order - b.order) || []; const currentStepIndex = steps.findIndex((s: any) => s.id === instance.current_step_id); const nextStep = steps[currentStepIndex + 1]; await supabase.from('process_history').insert({ process_id: instance.process_id, instance_id: instanceId, step_id: instance.current_step_id, action: 'completed', performed_by: userId, notes, variables, performed_at: new Date().toISOString() }); if (nextStep) { const { data, error } = await supabase.from('process_instances').update({ current_step_id: nextStep.id, variables: { ...(instance.variables || {}), ...(variables || {}) }, updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data, isComplete: false } } const { data, error } = await supabase.from('process_instances').update({ status: 'completed', current_step_id: null, completed_at: new Date().toISOString(), variables: { ...(instance.variables || {}), ...(variables || {}) }, updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data, isComplete: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstances(options?: { process_id?: string; status?: string; started_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('process_instances').select('*, processes(*), process_steps(*)'); if (options?.process_id) query = query.eq('process_id', options.process_id); if (options?.status) query = query.eq('status', options.status); if (options?.started_by) query = query.eq('started_by', options.started_by); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTask(taskData: { process_id: string; instance_id: string; step_id: string; title: string; description?: string; assignee_id: string; due_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_tasks').insert({ ...taskData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeTask(taskId: string, userId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_tasks').update({ status: 'completed', result, completed_by: userId, completed_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistory(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('process_history').select('*, process_steps(*), users(*)').eq('instance_id', instanceId).order('performed_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveAsTemplate(processId: string, templateData: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data: process } = await supabase.from('processes').select('*, process_steps(*), process_variables(*)').eq('id', processId).single(); if (!process) return { success: false, error: 'Process not found' }; const { data, error } = await supabase.from('process_templates').insert({ ...templateData, process_definition: { steps: process.process_steps, variables: process.process_variables }, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
