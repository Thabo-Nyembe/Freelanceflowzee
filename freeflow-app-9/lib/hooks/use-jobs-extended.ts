'use client'

/**
 * Extended Jobs Hooks
 * Tables: jobs, job_applications, job_postings, job_categories, job_requirements, job_benefits
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useJob(jobId?: string) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('jobs').select('*, job_requirements(*), job_benefits(*)').eq('id', jobId).single(); setJob(data) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])
  return { job, isLoading, refresh: fetch }
}

export function useJobs(options?: { company_id?: string; status?: string; type?: string; location?: string; experience_level?: string; category_id?: string; search?: string; limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('jobs').select('*')
      if (options?.company_id) query = query.eq('company_id', options.company_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.location) query = query.ilike('location', `%${options.location}%`)
      if (options?.experience_level) query = query.eq('experience_level', options.experience_level)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.company_id, options?.status, options?.type, options?.location, options?.experience_level, options?.category_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}

export function usePublishedJobs(options?: { type?: string; location?: string; limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('jobs').select('*').eq('status', 'published')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.location) query = query.ilike('location', `%${options.location}%`)
      const { data } = await query.order('published_at', { ascending: false }).limit(options?.limit || 50)
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.location, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}

export function useJobApplications(jobId?: string, options?: { status?: string; limit?: number }) {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('job_applications').select('*').eq('job_id', jobId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('applied_at', { ascending: false }).limit(options?.limit || 100)
      setApplications(data || [])
    } finally { setIsLoading(false) }
  }, [jobId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}

export function useUserApplications(userId?: string, options?: { status?: string }) {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('job_applications').select('*, jobs(*)').eq('applicant_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('applied_at', { ascending: false })
      setApplications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}

export function useJobRequirements(jobId?: string) {
  const [requirements, setRequirements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('job_requirements').select('*').eq('job_id', jobId).order('order', { ascending: true }); setRequirements(data || []) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])
  return { requirements, isLoading, refresh: fetch }
}

export function useJobBenefits(jobId?: string) {
  const [benefits, setBenefits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('job_benefits').select('*').eq('job_id', jobId); setBenefits(data || []) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])
  return { benefits, isLoading, refresh: fetch }
}

export function useJobCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('job_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useHasApplied(jobId?: string, userId?: string) {
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!jobId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('job_applications').select('*').eq('job_id', jobId).eq('applicant_id', userId).single(); setHasApplied(!!data); setApplication(data) } finally { setIsLoading(false) }
  }, [jobId, userId, supabase])
  useEffect(() => { check() }, [check])
  return { hasApplied, application, isLoading, recheck: check }
}

export function useCompanyJobs(companyId?: string, options?: { status?: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!companyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('jobs').select('*').eq('company_id', companyId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [companyId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}
