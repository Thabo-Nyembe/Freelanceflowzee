'use client'

/**
 * Extended Clients Hooks
 * Tables: clients, client_contacts, client_projects, client_notes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useClient(clientId?: string) {
  const [client, setClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('clients').select('*, client_contacts(*), client_projects(*)').eq('id', clientId).single(); setClient(data) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { client, isLoading, refresh: loadData }
}

export function useClients(options?: { user_id?: string; status?: string; industry?: string; search?: string; limit?: number }) {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('clients').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.industry) query = query.eq('industry', options.industry)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,company.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setClients(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.industry, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { clients, isLoading, refresh: loadData }
}

export function useClientContacts(clientId?: string) {
  const [contacts, setContacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('client_contacts').select('*').eq('client_id', clientId).order('is_primary', { ascending: false }).order('name', { ascending: true }); setContacts(data || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { contacts, isLoading, refresh: loadData }
}

export function useClientNotes(clientId?: string, options?: { type?: string; limit?: number }) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('client_notes').select('*').eq('client_id', clientId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNotes(data || [])
    } finally { setIsLoading(false) }
  }, [clientId, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { notes, isLoading, refresh: loadData }
}

export function useClientProjects(clientId?: string) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('client_projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); setProjects(data || []) } finally { setIsLoading(false) }
  }, [clientId])
  useEffect(() => { loadData() }, [loadData])
  return { projects, isLoading, refresh: loadData }
}

export function useActiveClients(userId?: string) {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('clients').select('*').eq('user_id', userId).eq('status', 'active').order('name', { ascending: true }); setClients(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { clients, isLoading, refresh: loadData }
}

export function useClientStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; byIndustry: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('clients').select('status, industry').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, c) => { acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1; return acc }, {})
      const byIndustry = data.reduce((acc: Record<string, number>, c) => { if (c.industry) acc[c.industry] = (acc[c.industry] || 0) + 1; return acc }, {})
      setStats({ total, byStatus, byIndustry })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useClientSearch(userId?: string, searchTerm?: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!userId || !searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('clients').select('id, name, email, company').eq('user_id', userId).or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`).limit(10)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [userId, searchTerm])
  useEffect(() => { search() }, [search])
  return { results, isLoading }
}
