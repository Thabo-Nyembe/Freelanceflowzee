'use client'

/**
 * Extended Client Hooks - Covers all 20 Client-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useClientActivities(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_activities').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientAnalytics(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_analytics').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientCategories(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_categories').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientCommunications(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_communications').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientContacts(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_contacts').select('*').eq('client_id', clientId); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientFeedback(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_feedback').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientFiles(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientGalleries(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_galleries').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientInvoices(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientMessages(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_messages').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientMetadata(clientId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_metadata').select('*').eq('client_id', clientId).single(); setData(result) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientNotes(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientNotifications(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_notifications').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientProjects(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientReviews(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_reviews').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientSatisfactionMetrics(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_satisfaction_metrics').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientSchedules(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_schedules').select('*').eq('client_id', clientId).order('scheduled_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientSegments(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_segments').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientShares(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_shares').select('*').eq('client_id', clientId); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useClientTags(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('client_tags').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
