'use client'

/**
 * Extended Education Hooks
 * Tables: education_programs, education_materials, education_quizzes, education_certificates, education_progress
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEducationProgram(programId?: string) {
  const [program, setProgram] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('education_programs').select('*, education_materials(*), education_quizzes(*)').eq('id', programId).single(); setProgram(data) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { fetch() }, [fetch])
  return { program, isLoading, refresh: fetch }
}

export function useEducationPrograms(options?: { category?: string; level?: string; is_published?: boolean; search?: string; limit?: number }) {
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('education_programs').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPrograms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.level, options?.is_published, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { programs, isLoading, refresh: fetch }
}

export function useProgramMaterials(programId?: string) {
  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('education_materials').select('*').eq('program_id', programId).order('order', { ascending: true }); setMaterials(data || []) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { fetch() }, [fetch])
  return { materials, isLoading, refresh: fetch }
}

export function useProgramQuizzes(programId?: string) {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('education_quizzes').select('*').eq('program_id', programId).order('created_at', { ascending: true }); setQuizzes(data || []) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { fetch() }, [fetch])
  return { quizzes, isLoading, refresh: fetch }
}

export function useUserProgress(userId?: string, programId?: string) {
  const [progress, setProgress] = useState<any[]>([])
  const [completionPercent, setCompletionPercent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !programId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: progressData } = await supabase.from('education_progress').select('*').eq('user_id', userId).eq('program_id', programId)
      const { count: totalMaterials } = await supabase.from('education_materials').select('*', { count: 'exact', head: true }).eq('program_id', programId)
      setProgress(progressData || [])
      const completed = progressData?.filter(p => p.completed).length || 0
      setCompletionPercent(totalMaterials && totalMaterials > 0 ? (completed / totalMaterials) * 100 : 0)
    } finally { setIsLoading(false) }
  }, [userId, programId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, completionPercent, isLoading, refresh: fetch }
}

export function useUserCertificates(userId?: string) {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('education_certificates').select('*, education_programs(*)').eq('user_id', userId).order('issued_at', { ascending: false }); setCertificates(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { certificates, isLoading, refresh: fetch }
}

export function useQuizAttempts(userId?: string, quizId?: string) {
  const [attempts, setAttempts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !quizId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('education_quiz_attempts').select('*').eq('user_id', userId).eq('quiz_id', quizId).order('completed_at', { ascending: false }); setAttempts(data || []) } finally { setIsLoading(false) }
  }, [userId, quizId])
  useEffect(() => { fetch() }, [fetch])
  return { attempts, isLoading, refresh: fetch }
}

export function usePopularPrograms(limit?: number) {
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('education_programs').select('*').eq('is_published', true).order('enrollment_count', { ascending: false }).limit(limit || 10); setPrograms(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { programs, isLoading, refresh: fetch }
}

export function useEducationStats(userId?: string) {
  const [stats, setStats] = useState<{ enrolledPrograms: number; completedPrograms: number; certificates: number; totalHours: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: progress } = await supabase.from('education_progress').select('program_id').eq('user_id', userId)
      const uniquePrograms = [...new Set(progress?.map(p => p.program_id))]
      const { count: certificates } = await supabase.from('education_certificates').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      const { data: programs } = await supabase.from('education_programs').select('duration_hours').in('id', uniquePrograms)
      const totalHours = programs?.reduce((sum, p) => sum + (p.duration_hours || 0), 0) || 0
      setStats({ enrolledPrograms: uniquePrograms.length, completedPrograms: certificates || 0, certificates: certificates || 0, totalHours })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
