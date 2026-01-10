'use client'

/**
 * Extended Surveys Hooks
 * Tables: surveys, survey_questions, survey_responses, survey_answers, survey_analytics, survey_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSurvey(surveyId?: string) {
  const [survey, setSurvey] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('surveys').select('*, survey_questions(*)').eq('id', surveyId).single(); setSurvey(data) } finally { setIsLoading(false) }
  }, [surveyId])
  useEffect(() => { fetch() }, [fetch])
  return { survey, isLoading, refresh: fetch }
}

export function useSurveys(options?: { survey_type?: string; category?: string; status?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [surveys, setSurveys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('surveys').select('*, survey_questions(count), survey_responses(count)')
      if (options?.survey_type) query = query.eq('survey_type', options.survey_type)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSurveys(data || [])
    } finally { setIsLoading(false) }
  }, [options?.survey_type, options?.category, options?.status, options?.created_by, options?.is_public, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { surveys, isLoading, refresh: fetch }
}

export function useSurveyQuestions(surveyId?: string) {
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('survey_questions').select('*').eq('survey_id', surveyId).order('order_index', { ascending: true }); setQuestions(data || []) } finally { setIsLoading(false) }
  }, [surveyId])
  useEffect(() => { fetch() }, [fetch])
  return { questions, isLoading, refresh: fetch }
}

export function useSurveyResponses(surveyId?: string, options?: { respondent_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('survey_responses').select('*, survey_answers(*), users(*)').eq('survey_id', surveyId)
      if (options?.respondent_id) query = query.eq('respondent_id', options.respondent_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('submitted_at', options.from_date)
      if (options?.to_date) query = query.lte('submitted_at', options.to_date)
      const { data } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 100)
      setResponses(data || [])
    } finally { setIsLoading(false) }
  }, [surveyId, options?.respondent_id, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { responses, isLoading, refresh: fetch }
}

export function useSurveyAnalytics(surveyId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [responsesRes, questionsRes] = await Promise.all([
        supabase.from('survey_responses').select('status').eq('survey_id', surveyId),
        supabase.from('survey_questions').select('*, survey_answers(answer_value)').eq('survey_id', surveyId)
      ])
      const responses = responsesRes.data || []
      const questions = questionsRes.data || []
      const questionAnalytics = questions.map(q => {
        const answers = q.survey_answers || []
        const summary: any = { question_id: q.id, question_text: q.question_text, question_type: q.question_type, total_answers: answers.length }
        if (q.question_type === 'rating' || q.question_type === 'scale') {
          const values = answers.map((a: any) => parseFloat(a.answer_value)).filter((v: number) => !isNaN(v))
          summary.average = values.length > 0 ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length : 0
        } else if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
          const counts: Record<string, number> = {}
          answers.forEach((a: any) => {
            const val = Array.isArray(a.answer_value) ? a.answer_value : [a.answer_value]
            val.forEach((v: string) => { counts[v] = (counts[v] || 0) + 1 })
          })
          summary.distribution = counts
        }
        return summary
      })
      setAnalytics({
        totalResponses: responses.length,
        completionRate: responses.length > 0 ? (responses.filter(r => r.status === 'completed').length / responses.length) * 100 : 0,
        questionAnalytics
      })
    } finally { setIsLoading(false) }
  }, [surveyId])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useMyResponses(userId?: string, options?: { status?: string; limit?: number }) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('survey_responses').select('*, surveys(*)').eq('respondent_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 50)
      setResponses(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { responses, isLoading, refresh: fetch }
}

export function useActiveSurveys(options?: { category?: string; limit?: number }) {
  const [surveys, setSurveys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      let query = supabase.from('surveys').select('*, survey_questions(count)').eq('status', 'active').or(`end_date.is.null,end_date.gte.${now}`)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSurveys(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { surveys, isLoading, refresh: fetch }
}

export function useSurveyCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('surveys').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useHasRespondedToSurvey(surveyId?: string, userId?: string) {
  const [hasResponded, setHasResponded] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('survey_responses').select('id').eq('survey_id', surveyId).eq('respondent_id', userId).limit(1)
      setHasResponded((data?.length || 0) > 0)
    } finally { setIsLoading(false) }
  }, [surveyId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { hasResponded, isLoading, refresh: fetch }
}

