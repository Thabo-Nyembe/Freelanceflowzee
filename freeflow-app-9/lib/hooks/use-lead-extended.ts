'use client'

/**
 * Extended Lead Gen Hooks - Covers all 7 Lead-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLeadGenCampaigns(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadGenFormFields(formId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_form_fields').select('*').eq('form_id', formId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [formId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadGenFormSubmissions(formId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_form_submissions').select('*').eq('form_id', formId).order('submitted_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [formId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadGenForms(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_forms').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadGenLandingPages(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_landing_pages').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadGenLeads(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_leads').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLeadScores(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_scores').select('*').eq('user_id', userId).order('score', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
