'use client'

/**
 * Extended Learning Hooks
 * Tables: learning_paths, learning_modules, learning_progress, learning_assessments, learning_certificates, learning_resources
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLearningPath(pathId?: string) {
  const [path, setPath] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pathId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_paths').select('*, learning_modules(*)').eq('id', pathId).single(); setPath(data) } finally { setIsLoading(false) }
  }, [pathId])
  useEffect(() => { fetch() }, [fetch])
  return { path, isLoading, refresh: fetch }
}

export function useLearningPaths(options?: { category?: string; difficulty?: string; status?: string; limit?: number }) {
  const [paths, setPaths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('learning_paths').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPaths(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.difficulty, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { paths, isLoading, refresh: fetch }
}

export function useLearningModules(pathId?: string) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pathId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_modules').select('*').eq('path_id', pathId).order('order', { ascending: true }); setModules(data || []) } finally { setIsLoading(false) }
  }, [pathId])
  useEffect(() => { fetch() }, [fetch])
  return { modules, isLoading, refresh: fetch }
}

export function useMyLearningProgress(userId?: string, options?: { status?: string }) {
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('learning_progress').select('*, learning_paths(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false })
      setProgress(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function usePathProgress(userId?: string, pathId?: string) {
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !pathId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_progress').select('*, learning_paths(*)').eq('user_id', userId).eq('path_id', pathId).single(); setProgress(data) } finally { setIsLoading(false) }
  }, [userId, pathId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useLearningAssessments(moduleId?: string) {
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_assessments').select('*').eq('module_id', moduleId); setAssessments(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { assessments, isLoading, refresh: fetch }
}

export function useMyCertificates(userId?: string) {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_certificates').select('*, learning_paths(*)').eq('user_id', userId).order('issued_at', { ascending: false }); setCertificates(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { certificates, isLoading, refresh: fetch }
}

export function useLearningSearch(query?: string, options?: { category?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('learning_paths').select('*').eq('status', 'published').ilike('title', `%${query}%`)
      if (options?.category) dbQuery = dbQuery.eq('category', options.category)
      const { data } = await dbQuery.order('enrollment_count', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.category, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function usePopularPaths(options?: { limit?: number }) {
  const [paths, setPaths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_paths').select('*').eq('status', 'published').order('enrollment_count', { ascending: false }).limit(options?.limit || 10); setPaths(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { paths, isLoading, refresh: fetch }
}

export function useModuleCompletions(userId?: string, pathId?: string) {
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !pathId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: modules } = await supabase.from('learning_modules').select('id').eq('path_id', pathId)
      const moduleIds = modules?.map(m => m.id) || []
      const { data: completions } = await supabase.from('learning_module_completions').select('module_id').eq('user_id', userId).in('module_id', moduleIds)
      setCompletedModules(completions?.map(c => c.module_id) || [])
    } finally { setIsLoading(false) }
  }, [userId, pathId])
  useEffect(() => { fetch() }, [fetch])
  return { completedModules, isLoading, refresh: fetch }
}

export function useLearningResources(moduleId?: string) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('learning_resources').select('*').eq('module_id', moduleId).order('order', { ascending: true }); setResources(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}
