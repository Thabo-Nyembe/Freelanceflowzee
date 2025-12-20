'use server'

/**
 * Extended Learning Server Actions
 * Tables: learning_paths, learning_modules, learning_progress, learning_assessments, learning_certificates, learning_resources
 */

import { createClient } from '@/lib/supabase/server'

export async function getLearningPath(pathId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_paths').select('*, learning_modules(*)').eq('id', pathId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLearningPath(pathData: { title: string; description?: string; category?: string; difficulty?: string; duration_hours?: number; created_by: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_paths').insert({ ...pathData, module_count: 0, enrollment_count: 0, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLearningPath(pathId: string, updates: Partial<{ title: string; description: string; category: string; difficulty: string; status: string; cover_image: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_paths').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pathId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLearningPaths(options?: { category?: string; difficulty?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('learning_paths').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.difficulty) query = query.eq('difficulty', options.difficulty); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLearningModule(moduleData: { path_id: string; title: string; description?: string; content?: string; order: number; duration_minutes?: number; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_modules').insert({ ...moduleData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: path } = await supabase.from('learning_paths').select('module_count').eq('id', moduleData.path_id).single(); await supabase.from('learning_paths').update({ module_count: (path?.module_count || 0) + 1 }).eq('id', moduleData.path_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLearningModule(moduleId: string, updates: Partial<{ title: string; description: string; content: string; order: number; duration_minutes: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_modules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', moduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function enrollInPath(pathId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_progress').insert({ path_id: pathId, user_id: userId, status: 'enrolled', progress_percentage: 0, enrolled_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: path } = await supabase.from('learning_paths').select('enrollment_count').eq('id', pathId).single(); await supabase.from('learning_paths').update({ enrollment_count: (path?.enrollment_count || 0) + 1 }).eq('id', pathId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProgress(progressId: string, updates: Partial<{ current_module_id: string; progress_percentage: number; status: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('learning_progress').update(updateData).eq('id', progressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLearningProgress(userId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('learning_progress').select('*, learning_paths(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function completeModule(userId: string, moduleId: string, pathId: string) {
  try { const supabase = await createClient(); await supabase.from('learning_module_completions').insert({ user_id: userId, module_id: moduleId, completed_at: new Date().toISOString() }); const { data: modules } = await supabase.from('learning_modules').select('id').eq('path_id', pathId); const { data: completions } = await supabase.from('learning_module_completions').select('module_id').eq('user_id', userId).in('module_id', modules?.map(m => m.id) || []); const progress = Math.round((completions?.length || 0) / (modules?.length || 1) * 100); await supabase.from('learning_progress').update({ progress_percentage: progress, current_module_id: moduleId, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('path_id', pathId); return { success: true, data: { progress } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAssessment(assessmentData: { module_id: string; title: string; questions: any[]; passing_score?: number; time_limit_minutes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_assessments').insert({ ...assessmentData, passing_score: assessmentData.passing_score || 70, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitAssessment(submissionData: { assessment_id: string; user_id: string; answers: any[]; score: number }) {
  try { const supabase = await createClient(); const { data: assessment } = await supabase.from('learning_assessments').select('passing_score').eq('id', submissionData.assessment_id).single(); const passed = submissionData.score >= (assessment?.passing_score || 70); const { data, error } = await supabase.from('learning_assessment_submissions').insert({ ...submissionData, passed, submitted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { ...data, passed } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function issueCertificate(certificateData: { path_id: string; user_id: string; issued_by?: string }) {
  try { const supabase = await createClient(); const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`; const { data, error } = await supabase.from('learning_certificates').insert({ ...certificateData, certificate_number: certificateNumber, issued_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserCertificates(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('learning_certificates').select('*, learning_paths(*)').eq('user_id', userId).order('issued_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
