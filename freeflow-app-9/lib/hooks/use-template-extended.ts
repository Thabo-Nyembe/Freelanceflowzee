'use client'

/**
 * Extended Template Hooks - Covers all 8 Template-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTemplateDeliverables(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_deliverables').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateFavorites(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateItems(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_items').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateMilestones(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_milestones').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplatePricing(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_pricing').select('*').eq('template_id', templateId); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateRatings(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_ratings').select('*').eq('template_id', templateId); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateReviews(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_reviews').select('*').eq('template_id', templateId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTemplateTasks(templateId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('template_tasks').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [templateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
