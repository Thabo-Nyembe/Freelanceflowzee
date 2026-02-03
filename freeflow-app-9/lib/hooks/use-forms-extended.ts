'use client'

/**
 * Extended Forms Hooks
 * Tables: forms, form_fields, form_submissions, form_responses, form_templates, form_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForm(formId?: string) {
  const [form, setForm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forms').select('*, form_fields(*)').eq('id', formId).single(); setForm(data) } finally { setIsLoading(false) }
  }, [formId])
  useEffect(() => { loadData() }, [loadData])
  return { form, isLoading, refresh: loadData }
}

export function useForms(options?: { created_by?: string; status?: string; type?: string; limit?: number }) {
  const [forms, setForms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forms').select('*')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setForms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.status, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { forms, isLoading, refresh: loadData }
}

export function useFormFields(formId?: string) {
  const [fields, setFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('form_fields').select('*').eq('form_id', formId).order('order', { ascending: true }); setFields(data || []) } finally { setIsLoading(false) }
  }, [formId])
  useEffect(() => { loadData() }, [loadData])
  return { fields, isLoading, refresh: loadData }
}

export function useFormSubmissions(formId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('form_submissions').select('*, form_responses(*)').eq('form_id', formId)
      if (options?.from_date) query = query.gte('submitted_at', options.from_date)
      if (options?.to_date) query = query.lte('submitted_at', options.to_date)
      const { data } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 100)
      setSubmissions(data || [])
    } finally { setIsLoading(false) }
  }, [formId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { submissions, isLoading, refresh: loadData }
}

export function useFormSubmission(submissionId?: string) {
  const [submission, setSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!submissionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('form_submissions').select('*, form_responses(*), forms(*)').eq('id', submissionId).single(); setSubmission(data) } finally { setIsLoading(false) }
  }, [submissionId])
  useEffect(() => { loadData() }, [loadData])
  return { submission, isLoading, refresh: loadData }
}

export function useFormTemplates(options?: { category?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('form_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useFormAnalytics(formId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('form_analytics').select('*').eq('form_id', formId).order('date', { ascending: false }).limit(30); setAnalytics(data || []) } finally { setIsLoading(false) }
  }, [formId])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useUserForms(userId?: string, options?: { status?: string }) {
  const [forms, setForms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('forms').select('*').eq('created_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setForms(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { forms, isLoading, refresh: loadData }
}

export function usePublishedForms(limit?: number) {
  const [forms, setForms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('forms').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(limit || 20); setForms(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { loadData() }, [loadData])
  return { forms, isLoading, refresh: loadData }
}
