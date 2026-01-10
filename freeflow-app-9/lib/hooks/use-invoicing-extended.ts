'use client'

/**
 * Extended Invoicing Hooks
 * Tables: invoicing_templates, invoicing_settings, invoicing_schedules, invoicing_reminders, invoicing_disputes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvoicingTemplate(templateId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoicing_templates').select('*').eq('id', templateId).single(); setTemplate(data) } finally { setIsLoading(false) }
  }, [templateId])
  useEffect(() => { fetch() }, [fetch])
  return { template, isLoading, refresh: fetch }
}

export function useInvoicingTemplates(options?: { user_id?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invoicing_templates').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('is_default', { ascending: false }).order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useInvoicingSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoicing_settings').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useInvoicingSchedules(userId?: string, options?: { client_id?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('invoicing_schedules').select('*').eq('user_id', userId)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_invoice_date', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.client_id, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useInvoicingReminders(invoiceId?: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoicing_reminders').select('*').eq('invoice_id', invoiceId).order('scheduled_date', { ascending: true }); setReminders(data || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { reminders, isLoading, refresh: fetch }
}

export function useInvoicingDisputes(options?: { invoice_id?: string; client_id?: string; status?: string }) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invoicing_disputes').select('*')
      if (options?.invoice_id) query = query.eq('invoice_id', options.invoice_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setDisputes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.invoice_id, options?.client_id, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { disputes, isLoading, refresh: fetch }
}

export function useDefaultInvoicingTemplate(userId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoicing_templates').select('*').eq('user_id', userId).eq('is_default', true).single(); setTemplate(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { template, isLoading, refresh: fetch }
}

export function useUpcomingScheduledInvoices(userId?: string, daysAhead?: number) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + (daysAhead || 30))
      const { data } = await supabase.from('invoicing_schedules').select('*').eq('user_id', userId).eq('is_active', true).lte('next_invoice_date', futureDate.toISOString()).order('next_invoice_date', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [userId, daysAhead])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useOpenDisputes(options?: { client_id?: string }) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invoicing_disputes').select('*').eq('status', 'open')
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      const { data } = await query.order('created_at', { ascending: false })
      setDisputes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.client_id])
  useEffect(() => { fetch() }, [fetch])
  return { disputes, isLoading, refresh: fetch }
}
