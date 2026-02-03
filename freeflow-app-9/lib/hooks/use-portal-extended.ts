'use client'

/**
 * Extended Portal Hooks - Covers all 11 Portal-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePortalClientActivities(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_client_activities').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalClientMetrics(clientId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_client_metrics').select('*').eq('client_id', clientId).single(); setData(result) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalClients(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_clients').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalCommunications(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_communications').select('*').eq('client_id', clientId).order('sent_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalFileVersions(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [fileId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalFiles(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalInvoiceItems(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_invoice_items').select('*').eq('invoice_id', invoiceId); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalInvoices(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalProjectMilestones(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_project_milestones').select('*').eq('project_id', projectId).order('due_date', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalProjectRisks(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_project_risks').select('*').eq('project_id', projectId).order('severity', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePortalProjects(clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('portal_projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
