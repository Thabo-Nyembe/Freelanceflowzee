'use client'

/**
 * Extended Submissions Hooks
 * Tables: submissions, submission_files, submission_reviews, submission_feedback, submission_versions, submission_scores
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubmission(submissionId?: string) {
  const [submission, setSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('submissions').select('*, submission_files(*), submission_reviews(*), submission_versions(*), users(*)').eq('id', submissionId).single(); setSubmission(data) } finally { setIsLoading(false) }
  }, [submissionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { submission, isLoading, refresh: fetch }
}

export function useSubmissions(options?: { assignment_id?: string; submitter_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('submissions').select('*, submission_files(count), submission_reviews(count), users(*)')
      if (options?.assignment_id) query = query.eq('assignment_id', options.assignment_id)
      if (options?.submitter_id) query = query.eq('submitter_id', options.submitter_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('submitted_at', options.from_date)
      if (options?.to_date) query = query.lte('submitted_at', options.to_date)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 50)
      setSubmissions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.assignment_id, options?.submitter_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { submissions, isLoading, refresh: fetch }
}

export function useSubmissionFiles(submissionId?: string) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('submission_files').select('*').eq('submission_id', submissionId).order('uploaded_at', { ascending: false }); setFiles(data || []) } finally { setIsLoading(false) }
  }, [submissionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { files, isLoading, refresh: fetch }
}

export function useSubmissionReviews(submissionId?: string) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('submission_reviews').select('*, users(*), submission_scores(*)').eq('submission_id', submissionId).order('reviewed_at', { ascending: false }); setReviews(data || []) } finally { setIsLoading(false) }
  }, [submissionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useSubmissionFeedback(submissionId?: string, options?: { include_private?: boolean }) {
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('submission_feedback').select('*, users(*)').eq('submission_id', submissionId)
      if (!options?.include_private) query = query.eq('is_private', false)
      const { data } = await query.order('created_at', { ascending: true })
      setFeedback(data || [])
    } finally { setIsLoading(false) }
  }, [submissionId, options?.include_private, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { feedback, isLoading, refresh: fetch }
}

export function useSubmissionVersions(submissionId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('submission_versions').select('*').eq('submission_id', submissionId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [submissionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useSubmissionScores(submissionId?: string) {
  const [scores, setScores] = useState<any[]>([])
  const [summary, setSummary] = useState<{ totalScore: number; maxScore: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('submission_scores').select('*').eq('submission_id', submissionId)
      const scoreList = data || []
      setScores(scoreList)
      const totalScore = scoreList.reduce((sum, s) => sum + (s.score || 0), 0)
      const maxScore = scoreList.reduce((sum, s) => sum + (s.max_score || 0), 0)
      setSummary({ totalScore, maxScore, percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0 })
    } finally { setIsLoading(false) }
  }, [submissionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { scores, summary, isLoading, refresh: fetch }
}

export function useMySubmissions(userId?: string, options?: { status?: string; limit?: number }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('submissions').select('*, submission_reviews(count), assignments(*)').eq('submitter_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 50)
      setSubmissions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { submissions, isLoading, refresh: fetch }
}

export function usePendingReviews(reviewerId?: string, options?: { limit?: number }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reviewerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      // Get submissions that need review
      const { data } = await supabase.from('submissions').select('*, users(*), assignments(*)').eq('status', 'submitted').order('submitted_at', { ascending: true }).limit(options?.limit || 50)
      setSubmissions(data || [])
    } finally { setIsLoading(false) }
  }, [reviewerId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { submissions, isLoading, refresh: fetch }
}

export function useSubmissionStats(options?: { assignment_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; pending: number; approved: number; rejected: number; revisionRequested: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('submissions').select('status')
      if (options?.assignment_id) query = query.eq('assignment_id', options.assignment_id)
      if (options?.from_date) query = query.gte('submitted_at', options.from_date)
      if (options?.to_date) query = query.lte('submitted_at', options.to_date)
      const { data } = await query
      const submissions = data || []
      setStats({
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'submitted').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        revisionRequested: submissions.filter(s => s.status === 'revision_requested').length
      })
    } finally { setIsLoading(false) }
  }, [options?.assignment_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

