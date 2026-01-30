'use client'

/**
 * Extended CRM Hooks - Covers all 6 CRM-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useCRMActivities(contactId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!contactId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_activities').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [contactId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCRMContacts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_contacts').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCRMDealProducts(dealId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!dealId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_deal_products').select('*').eq('deal_id', dealId); setData(result || []) } finally { setIsLoading(false) }
  }, [dealId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCRMDeals(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_deals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCRMLeads(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCRMNotes(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('crm_notes').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
