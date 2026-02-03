'use client'

/**
 * Extended Lead Gen Hooks - Covers all 7 Lead-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLeadGenCampaigns(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadGenFormFields(formId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_form_fields').select('*').eq('form_id', formId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [formId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadGenFormSubmissions(formId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!formId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_form_submissions').select('*').eq('form_id', formId).order('submitted_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [formId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadGenForms(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_forms').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadGenLandingPages(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_landing_pages').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadGenLeads(campaignId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_gen_leads').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLeadScores(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('lead_scores').select('*').eq('user_id', userId).order('score', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
