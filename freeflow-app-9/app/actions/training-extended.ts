'use server'

/**
 * Extended Training Server Actions - Covers all Training-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrainingCourses(category?: string, publishedOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('training_courses').select('*').order('title', { ascending: true }); if (publishedOnly) query = query.eq('is_published', true); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTrainingCourse(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_courses').select('*').eq('id', courseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrainingCourse(input: { title: string; description?: string; category?: string; duration_hours?: number; modules?: any[]; instructor_id?: string; prerequisites?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_courses').insert({ ...input, is_published: false, enrollment_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrainingCourse(courseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_courses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', courseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishTrainingCourse(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_courses').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', courseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishTrainingCourse(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_courses').update({ is_published: false }).eq('id', courseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTrainingCourse(courseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('training_courses').delete().eq('id', courseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrainingEnrollments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCourseEnrollments(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_enrollments').select('*').eq('course_id', courseId).order('enrolled_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function enrollInTrainingCourse(userId: string, courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_enrollments').insert({ user_id: userId, course_id: courseId, status: 'enrolled', progress: 0, enrolled_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment', { table_name: 'training_courses', column_name: 'enrollment_count', row_id: courseId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEnrollmentProgress(enrollmentId: string, progress: number, completedModules?: string[]) {
  try { const supabase = await createClient(); const updates: any = { progress, updated_at: new Date().toISOString() }; if (completedModules) updates.completed_modules = completedModules; if (progress === 100) { updates.status = 'completed'; updates.completed_at = new Date().toISOString(); } else if (progress > 0) { updates.status = 'in_progress'; } const { data, error } = await supabase.from('training_enrollments').update(updates).eq('id', enrollmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeTrainingEnrollment(enrollmentId: string, score?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_enrollments').update({ status: 'completed', progress: 100, score, completed_at: new Date().toISOString() }).eq('id', enrollmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unenrollFromTrainingCourse(enrollmentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('training_enrollments').delete().eq('id', enrollmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCourseCompletionStats(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('training_enrollments').select('status, progress, score').eq('course_id', courseId); if (error) throw error; const total = data?.length || 0; const completed = data?.filter(e => e.status === 'completed').length || 0; const avgScore = data?.filter(e => e.score).reduce((sum, e) => sum + (e.score || 0), 0) / (completed || 1); return { success: true, data: { total_enrollments: total, completions: completed, completion_rate: total > 0 ? (completed / total) * 100 : 0, average_score: avgScore } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
