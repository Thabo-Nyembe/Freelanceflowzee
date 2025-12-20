'use server'

/**
 * Extended Education Server Actions
 * Tables: education_programs, education_materials, education_quizzes, education_certificates, education_progress
 */

import { createClient } from '@/lib/supabase/server'

export async function getEducationProgram(programId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_programs').select('*, education_materials(*), education_quizzes(*)').eq('id', programId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEducationProgram(programData: { title: string; description?: string; category?: string; level?: string; duration_hours?: number; instructor_id?: string; is_published?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_programs').insert({ ...programData, enrollment_count: 0, is_published: programData.is_published ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEducationProgram(programId: string, updates: Partial<{ title: string; description: string; category: string; level: string; duration_hours: number; is_published: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_programs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', programId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEducationPrograms(options?: { category?: string; level?: string; is_published?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('education_programs').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.level) query = query.eq('level', options.level); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEducationMaterial(materialData: { program_id: string; title: string; type: string; content?: string; file_url?: string; order: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_materials').insert({ ...materialData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProgramMaterials(programId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_materials').select('*').eq('program_id', programId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createQuiz(quizData: { program_id: string; title: string; questions: any; passing_score?: number; time_limit_minutes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_quizzes').insert({ ...quizData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitQuizAttempt(attemptData: { quiz_id: string; user_id: string; answers: any; score: number; passed: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_quiz_attempts').insert({ ...attemptData, completed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function issueCertificate(certData: { program_id: string; user_id: string; issued_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_certificates').insert({ ...certData, certificate_number: `CERT-${Date.now()}`, issued_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserProgress(progressData: { program_id: string; user_id: string; material_id: string; completed: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('education_progress').upsert({ ...progressData, completed_at: progressData.completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: 'program_id,user_id,material_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
