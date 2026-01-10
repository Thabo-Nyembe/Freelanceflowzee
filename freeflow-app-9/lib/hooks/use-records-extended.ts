'use client'

/**
 * Extended Records Hooks
 * Tables: records, record_types, record_fields, record_values, record_history, record_templates, record_permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRecord(recordId?: string) {
  const [record, setRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!recordId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('records').select('*, record_types(*), record_values(*), users(*)').eq('id', recordId).single(); setRecord(data) } finally { setIsLoading(false) }
  }, [recordId])
  useEffect(() => { fetch() }, [fetch])
  return { record, isLoading, refresh: fetch }
}

export function useRecords(options?: { type_id?: string; owner_id?: string; organization_id?: string; parent_id?: string; status?: string; search?: string; limit?: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('records').select('*, record_types(*), users(*)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.parent_id) query = query.eq('parent_id', options.parent_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRecords(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.owner_id, options?.organization_id, options?.parent_id, options?.status, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}

export function useRecordValues(recordId?: string) {
  const [values, setValues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!recordId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('record_values').select('*, record_fields(*)').eq('record_id', recordId); setValues(data || []) } finally { setIsLoading(false) }
  }, [recordId])
  useEffect(() => { fetch() }, [fetch])
  return { values, isLoading, refresh: fetch }
}

export function useRecordTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('record_types').select('*, record_fields(*)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useRecordFields(typeId?: string) {
  const [fields, setFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('record_fields').select('*').eq('type_id', typeId).order('order', { ascending: true }); setFields(data || []) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { fetch() }, [fetch])
  return { fields, isLoading, refresh: fetch }
}

export function useRecordHistory(recordId?: string, options?: { action?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!recordId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('record_history').select('*, users(*)').eq('record_id', recordId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [recordId, options?.action, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useChildRecords(parentId?: string, options?: { type_id?: string; status?: string }) {
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('records').select('*, record_types(*)').eq('parent_id', parentId)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setChildren(data || [])
    } finally { setIsLoading(false) }
  }, [parentId, options?.type_id, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { children, isLoading, refresh: fetch }
}

export function useMyRecords(userId?: string, options?: { type_id?: string; status?: string; limit?: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('records').select('*, record_types(*)').eq('owner_id', userId)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRecords(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}

export function useRecentRecords(options?: { organization_id?: string; type_id?: string; limit?: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('records').select('*, record_types(*), users(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 20)
      setRecords(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.type_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}

export function useArchivedRecords(options?: { owner_id?: string; type_id?: string; limit?: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('records').select('*, record_types(*)').eq('status', 'archived')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      const { data } = await query.order('archived_at', { ascending: false }).limit(options?.limit || 50)
      setRecords(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.type_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}

export function useRecordTemplates(options?: { type_id?: string; category?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('record_templates').select('*, record_types(*)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.category])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}
