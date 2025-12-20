'use server'

/**
 * Extended Students Server Actions
 * Tables: students, student_enrollments, student_grades, student_attendance, student_progress, student_achievements
 */

import { createClient } from '@/lib/supabase/server'

export async function getStudent(studentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('students').select('*, student_enrollments(*), student_achievements(*), users(*)').eq('id', studentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStudent(studentData: { user_id: string; student_number?: string; program_id?: string; enrollment_date?: string; graduation_date?: string; status?: string; level?: string; metadata?: any }) {
  try { const supabase = await createClient(); const studentNumber = studentData.student_number || `STU-${Date.now()}`; const { data, error } = await supabase.from('students').insert({ ...studentData, student_number: studentNumber, status: studentData.status || 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStudent(studentId: string, updates: Partial<{ program_id: string; graduation_date: string; status: string; level: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('students').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', studentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStudents(options?: { program_id?: string; status?: string; level?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('students').select('*, users(*), programs(*)'); if (options?.program_id) query = query.eq('program_id', options.program_id); if (options?.status) query = query.eq('status', options.status); if (options?.level) query = query.eq('level', options.level); if (options?.search) query = query.ilike('student_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function enrollInCourse(studentId: string, courseId: string, options?: { semester?: string; academic_year?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('student_enrollments').insert({ student_id: studentId, course_id: courseId, ...options, status: 'enrolled', enrolled_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dropCourse(studentId: string, courseId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('student_enrollments').update({ status: 'dropped', dropped_at: new Date().toISOString(), drop_reason: reason, updated_at: new Date().toISOString() }).eq('student_id', studentId).eq('course_id', courseId).eq('status', 'enrolled').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEnrollments(studentId: string, options?: { status?: string; semester?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('student_enrollments').select('*, courses(*)').eq('student_id', studentId); if (options?.status) query = query.eq('status', options.status); if (options?.semester) query = query.eq('semester', options.semester); const { data, error } = await query.order('enrolled_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordGrade(gradeData: { student_id: string; course_id: string; assignment_id?: string; grade_type: string; score: number; max_score: number; letter_grade?: string; graded_by: string; notes?: string }) {
  try { const supabase = await createClient(); const percentage = (gradeData.score / gradeData.max_score) * 100; const letterGrade = gradeData.letter_grade || calculateLetterGrade(percentage); const { data, error } = await supabase.from('student_grades').insert({ ...gradeData, percentage, letter_grade: letterGrade, graded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

export async function getGrades(studentId: string, options?: { course_id?: string; grade_type?: string; semester?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('student_grades').select('*, courses(*)').eq('student_id', studentId); if (options?.course_id) query = query.eq('course_id', options.course_id); if (options?.grade_type) query = query.eq('grade_type', options.grade_type); const { data, error } = await query.order('graded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordAttendance(attendanceData: { student_id: string; course_id: string; session_id?: string; date: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string; recorded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('student_attendance').insert({ ...attendanceData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAttendance(studentId: string, options?: { course_id?: string; from_date?: string; to_date?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('student_attendance').select('*, courses(*)').eq('student_id', studentId); if (options?.course_id) query = query.eq('course_id', options.course_id); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateProgress(studentId: string, courseId: string, progressData: { lesson_id?: string; module_id?: string; progress_percentage: number; completed_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('student_progress').upsert({ student_id: studentId, course_id: courseId, ...progressData, updated_at: new Date().toISOString() }, { onConflict: 'student_id,course_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function awardAchievement(studentId: string, achievementData: { achievement_type: string; title: string; description?: string; points?: number; badge_url?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('student_achievements').insert({ student_id: studentId, ...achievementData, awarded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAchievements(studentId: string, options?: { achievement_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('student_achievements').select('*').eq('student_id', studentId); if (options?.achievement_type) query = query.eq('achievement_type', options.achievement_type); const { data, error } = await query.order('awarded_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

