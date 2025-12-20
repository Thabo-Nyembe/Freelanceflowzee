'use server'

/**
 * Extended Courses Server Actions
 * Tables: courses, course_modules, course_lessons, course_enrollments, course_progress
 */

import { createClient } from '@/lib/supabase/server'

export async function getCourse(courseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('courses').select('*, course_modules(*, course_lessons(*))').eq('id', courseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCourse(courseData: { instructor_id: string; title: string; description?: string; category?: string; level?: string; duration_hours?: number; price?: number; thumbnail?: string; is_published?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('courses').insert({ ...courseData, is_published: courseData.is_published ?? false, enrollment_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCourse(courseId: string, updates: Partial<{ title: string; description: string; category: string; level: string; duration_hours: number; price: number; thumbnail: string; is_published: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('courses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', courseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCourses(options?: { instructor_id?: string; category?: string; level?: string; is_published?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('courses').select('*'); if (options?.instructor_id) query = query.eq('instructor_id', options.instructor_id); if (options?.category) query = query.eq('category', options.category); if (options?.level) query = query.eq('level', options.level); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCourseModule(moduleData: { course_id: string; title: string; description?: string; order: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('course_modules').insert({ ...moduleData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCourseLesson(lessonData: { module_id: string; title: string; content?: string; type?: string; video_url?: string; duration_minutes?: number; order: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('course_lessons').insert({ ...lessonData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function enrollInCourse(courseId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('course_enrollments').insert({ course_id: courseId, user_id: userId, status: 'enrolled', progress_percent: 0, enrolled_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('courses').update({ enrollment_count: supabase.rpc('increment_enrollment', { course_id: courseId }) }).eq('id', courseId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLessonProgress(enrollmentId: string, lessonId: string, completed: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('course_progress').upsert({ enrollment_id: enrollmentId, lesson_id: lessonId, completed, completed_at: completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: 'enrollment_id,lesson_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEnrollmentProgress(enrollmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('course_progress').select('*').eq('enrollment_id', enrollmentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserEnrollments(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('course_enrollments').select('*, courses(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('enrolled_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
