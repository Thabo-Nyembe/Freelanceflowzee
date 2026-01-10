'use client'

/**
 * Extended Students Hooks
 * Tables: students, student_enrollments, student_grades, student_attendance, student_progress, student_achievements
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStudent(studentId?: string) {
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('students').select('*, student_enrollments(*), student_achievements(*), users(*)').eq('id', studentId).single(); setStudent(data) } finally { setIsLoading(false) }
  }, [studentId])
  useEffect(() => { fetch() }, [fetch])
  return { student, isLoading, refresh: fetch }
}

export function useStudents(options?: { program_id?: string; status?: string; level?: string; search?: string; limit?: number }) {
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('students').select('*, users(*), programs(*)')
      if (options?.program_id) query = query.eq('program_id', options.program_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.search) query = query.ilike('student_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setStudents(data || [])
    } finally { setIsLoading(false) }
  }, [options?.program_id, options?.status, options?.level, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { students, isLoading, refresh: fetch }
}

export function useStudentEnrollments(studentId?: string, options?: { status?: string; semester?: string }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('student_enrollments').select('*, courses(*)').eq('student_id', studentId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.semester) query = query.eq('semester', options.semester)
      const { data } = await query.order('enrolled_at', { ascending: false })
      setEnrollments(data || [])
    } finally { setIsLoading(false) }
  }, [studentId, options?.status, options?.semester, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { enrollments, isLoading, refresh: fetch }
}

export function useStudentGrades(studentId?: string, options?: { course_id?: string; grade_type?: string; limit?: number }) {
  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('student_grades').select('*, courses(*)').eq('student_id', studentId)
      if (options?.course_id) query = query.eq('course_id', options.course_id)
      if (options?.grade_type) query = query.eq('grade_type', options.grade_type)
      const { data } = await query.order('graded_at', { ascending: false }).limit(options?.limit || 100)
      setGrades(data || [])
    } finally { setIsLoading(false) }
  }, [studentId, options?.course_id, options?.grade_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { grades, isLoading, refresh: fetch }
}

export function useStudentGPA(studentId?: string) {
  const [gpa, setGPA] = useState<{ gpa: number; totalCredits: number; letterGrade: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('student_grades').select('percentage, courses(credits)').eq('student_id', studentId).eq('grade_type', 'final')
      const grades = data || []
      if (grades.length === 0) { setGPA(null); return }
      let totalPoints = 0
      let totalCredits = 0
      grades.forEach(g => {
        const credits = (g.courses as any)?.credits || 3
        const gradePoint = g.percentage >= 90 ? 4.0 : g.percentage >= 80 ? 3.0 : g.percentage >= 70 ? 2.0 : g.percentage >= 60 ? 1.0 : 0
        totalPoints += gradePoint * credits
        totalCredits += credits
      })
      const gpaValue = totalCredits > 0 ? totalPoints / totalCredits : 0
      const letterGrade = gpaValue >= 3.7 ? 'A' : gpaValue >= 2.7 ? 'B' : gpaValue >= 1.7 ? 'C' : gpaValue >= 0.7 ? 'D' : 'F'
      setGPA({ gpa: Math.round(gpaValue * 100) / 100, totalCredits, letterGrade })
    } finally { setIsLoading(false) }
  }, [studentId])
  useEffect(() => { fetch() }, [fetch])
  return { gpa, isLoading, refresh: fetch }
}

export function useStudentAttendance(studentId?: string, options?: { course_id?: string; from_date?: string; to_date?: string }) {
  const [attendance, setAttendance] = useState<any[]>([])
  const [stats, setStats] = useState<{ total: number; present: number; absent: number; late: number; rate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('student_attendance').select('*, courses(*)').eq('student_id', studentId)
      if (options?.course_id) query = query.eq('course_id', options.course_id)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: false })
      const records = data || []
      setAttendance(records)
      const total = records.length
      const present = records.filter(r => r.status === 'present').length
      const absent = records.filter(r => r.status === 'absent').length
      const late = records.filter(r => r.status === 'late').length
      setStats({ total, present, absent, late, rate: total > 0 ? (present / total) * 100 : 0 })
    } finally { setIsLoading(false) }
  }, [studentId, options?.course_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { attendance, stats, isLoading, refresh: fetch }
}

export function useStudentProgress(studentId?: string, courseId?: string) {
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId || !courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('student_progress').select('*').eq('student_id', studentId).eq('course_id', courseId).single()
      setProgress(data)
    } finally { setIsLoading(false) }
  }, [studentId, courseId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useStudentAchievements(studentId?: string, options?: { achievement_type?: string; limit?: number }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!studentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('student_achievements').select('*').eq('student_id', studentId)
      if (options?.achievement_type) query = query.eq('achievement_type', options.achievement_type)
      const { data } = await query.order('awarded_at', { ascending: false }).limit(options?.limit || 50)
      const achievementList = data || []
      setAchievements(achievementList)
      setTotalPoints(achievementList.reduce((sum, a) => sum + (a.points || 0), 0))
    } finally { setIsLoading(false) }
  }, [studentId, options?.achievement_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { achievements, totalPoints, isLoading, refresh: fetch }
}

export function useCourseStudents(courseId?: string, options?: { status?: string }) {
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('student_enrollments').select('*, students(*, users(*))').eq('course_id', courseId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('enrolled_at', { ascending: false })
      setStudents((data || []).map(e => ({ ...e.students, enrollment: e })))
    } finally { setIsLoading(false) }
  }, [courseId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { students, isLoading, refresh: fetch }
}

