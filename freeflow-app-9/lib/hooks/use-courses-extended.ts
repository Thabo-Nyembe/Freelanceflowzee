'use client'

/**
 * Extended Courses Hooks
 * Tables: courses, course_modules, course_lessons, course_enrollments, course_progress
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCourse(courseId?: string) {
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('courses').select('*, course_modules(*, course_lessons(*))').eq('id', courseId).single(); setCourse(data) } finally { setIsLoading(false) }
  }, [courseId])
  useEffect(() => { fetch() }, [fetch])
  return { course, isLoading, refresh: fetch }
}

export function useCourses(options?: { instructor_id?: string; category?: string; level?: string; is_published?: boolean; search?: string; limit?: number }) {
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('courses').select('*')
      if (options?.instructor_id) query = query.eq('instructor_id', options.instructor_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCourses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.instructor_id, options?.category, options?.level, options?.is_published, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { courses, isLoading, refresh: fetch }
}

export function useCourseModules(courseId?: string) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('course_modules').select('*, course_lessons(*)').eq('course_id', courseId).order('order', { ascending: true }); setModules(data || []) } finally { setIsLoading(false) }
  }, [courseId])
  useEffect(() => { fetch() }, [fetch])
  return { modules, isLoading, refresh: fetch }
}

export function useCourseLessons(moduleId?: string) {
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('course_lessons').select('*').eq('module_id', moduleId).order('order', { ascending: true }); setLessons(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { lessons, isLoading, refresh: fetch }
}

export function useUserEnrollments(userId?: string, options?: { status?: string }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('course_enrollments').select('*, courses(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('enrolled_at', { ascending: false })
      setEnrollments(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { enrollments, isLoading, refresh: fetch }
}

export function useEnrollmentProgress(enrollmentId?: string) {
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!enrollmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('course_progress').select('*').eq('enrollment_id', enrollmentId); setProgress(data || []) } finally { setIsLoading(false) }
  }, [enrollmentId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useIsEnrolled(userId?: string, courseId?: string) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('course_enrollments').select('*').eq('user_id', userId).eq('course_id', courseId).single(); setIsEnrolled(!!data); setEnrollment(data) } finally { setIsLoading(false) }
  }, [userId, courseId, supabase])
  useEffect(() => { check() }, [check])
  return { isEnrolled, enrollment, isLoading, recheck: check }
}

export function usePopularCourses(limit?: number) {
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('enrollment_count', { ascending: false }).limit(limit || 10); setCourses(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { courses, isLoading, refresh: fetch }
}

export function useCourseStats(courseId?: string) {
  const [stats, setStats] = useState<{ enrollments: number; avgProgress: number; completions: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!courseId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('course_enrollments').select('status, progress_percent').eq('course_id', courseId)
      if (!data) { setStats(null); return }
      const enrollments = data.length
      const avgProgress = enrollments > 0 ? data.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments : 0
      const completions = data.filter(e => e.status === 'completed').length
      setStats({ enrollments, avgProgress, completions })
    } finally { setIsLoading(false) }
  }, [courseId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
