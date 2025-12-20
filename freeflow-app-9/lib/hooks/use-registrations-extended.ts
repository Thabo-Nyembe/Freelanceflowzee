'use client'

/**
 * Extended Registrations Hooks
 * Tables: registrations, registration_fields, registration_responses, registration_confirmations, registration_waitlists
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRegistration(registrationId?: string) {
  const [registration, setRegistration] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!registrationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('registrations').select('*, registration_responses(*), users(*), events(*)').eq('id', registrationId).single(); setRegistration(data) } finally { setIsLoading(false) }
  }, [registrationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registration, isLoading, refresh: fetch }
}

export function useRegistrations(options?: { event_id?: string; entity_type?: string; entity_id?: string; user_id?: string; status?: string; search?: string; limit?: number }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('registrations').select('*, registration_responses(count), users(*)')
      if (options?.event_id) query = query.eq('event_id', options.event_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,confirmation_code.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRegistrations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.event_id, options?.entity_type, options?.entity_id, options?.user_id, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registrations, isLoading, refresh: fetch }
}

export function useRegistrationByCode(confirmationCode?: string) {
  const [registration, setRegistration] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!confirmationCode) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('registrations').select('*, registration_responses(*), users(*), events(*)').eq('confirmation_code', confirmationCode.toUpperCase()).single(); setRegistration(data) } finally { setIsLoading(false) }
  }, [confirmationCode, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registration, isLoading, refresh: fetch }
}

export function useRegistrationFields(entityType?: string, entityId?: string) {
  const [fields, setFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('registration_fields').select('*').eq('entity_type', entityType)
      if (entityId) query = query.eq('entity_id', entityId)
      const { data } = await query.order('order', { ascending: true })
      setFields(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { fields, isLoading, refresh: fetch }
}

export function useRegistrationResponses(registrationId?: string) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!registrationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('registration_responses').select('*, registration_fields(*)').eq('registration_id', registrationId); setResponses(data || []) } finally { setIsLoading(false) }
  }, [registrationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { responses, isLoading, refresh: fetch }
}

export function useMyRegistrations(userId?: string, options?: { status?: string; limit?: number }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('registrations').select('*, events(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRegistrations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registrations, isLoading, refresh: fetch }
}

export function useWaitlist(options?: { event_id?: string; entity_type?: string; entity_id?: string; status?: string; limit?: number }) {
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('registration_waitlists').select('*')
      if (options?.event_id) query = query.eq('event_id', options.event_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100)
      setWaitlist(data || [])
    } finally { setIsLoading(false) }
  }, [options?.event_id, options?.entity_type, options?.entity_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { waitlist, isLoading, refresh: fetch }
}

export function useRegistrationStats(options?: { event_id?: string; entity_type?: string; entity_id?: string }) {
  const [stats, setStats] = useState<{ total: number; pending: number; confirmed: number; checkedIn: number; cancelled: number; checkInRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('registrations').select('status')
      if (options?.event_id) query = query.eq('event_id', options.event_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query
      const registrations = data || []
      const total = registrations.length
      const pending = registrations.filter(r => r.status === 'pending').length
      const confirmed = registrations.filter(r => r.status === 'confirmed').length
      const checkedIn = registrations.filter(r => r.status === 'checked_in').length
      const cancelled = registrations.filter(r => r.status === 'cancelled').length
      const checkInRate = confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0
      setStats({ total, pending, confirmed, checkedIn, cancelled, checkInRate })
    } finally { setIsLoading(false) }
  }, [options?.event_id, options?.entity_type, options?.entity_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useConfirmedRegistrations(options?: { event_id?: string; entity_id?: string; limit?: number }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('registrations').select('*, users(*)').eq('status', 'confirmed')
      if (options?.event_id) query = query.eq('event_id', options.event_id)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query.order('confirmed_at', { ascending: false }).limit(options?.limit || 100)
      setRegistrations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.event_id, options?.entity_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registrations, isLoading, refresh: fetch }
}

export function usePendingRegistrations(options?: { event_id?: string; entity_id?: string; limit?: number }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('registrations').select('*, users(*)').eq('status', 'pending')
      if (options?.event_id) query = query.eq('event_id', options.event_id)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50)
      setRegistrations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.event_id, options?.entity_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { registrations, isLoading, refresh: fetch }
}
