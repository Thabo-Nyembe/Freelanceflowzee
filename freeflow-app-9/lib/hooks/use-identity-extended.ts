'use client'

/**
 * Extended Identity Hooks
 * Tables: identity_verifications, identity_documents, identity_providers, identity_sessions, identity_mfa
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useIdentityVerification(verificationId?: string) {
  const [verification, setVerification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!verificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('identity_verifications').select('*, identity_documents(*)').eq('id', verificationId).single(); setVerification(data) } finally { setIsLoading(false) }
  }, [verificationId])
  useEffect(() => { loadData() }, [loadData])
  return { verification, isLoading, refresh: loadData }
}

export function useUserVerifications(userId?: string, options?: { type?: string; status?: string }) {
  const [verifications, setVerifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('identity_verifications').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setVerifications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { verifications, isLoading, refresh: loadData }
}

export function useVerificationDocuments(verificationId?: string) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!verificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('identity_documents').select('*').eq('verification_id', verificationId).order('uploaded_at', { ascending: false }); setDocuments(data || []) } finally { setIsLoading(false) }
  }, [verificationId])
  useEffect(() => { loadData() }, [loadData])
  return { documents, isLoading, refresh: loadData }
}

export function useIdentityProviders(options?: { is_active?: boolean }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('identity_providers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { providers, isLoading, refresh: loadData }
}

export function useActiveSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('identity_sessions').select('*').eq('user_id', userId).eq('is_active', true).order('started_at', { ascending: false }); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useSessionHistory(userId?: string, options?: { limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('identity_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(options?.limit || 50); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useUserMFAMethods(userId?: string) {
  const [methods, setMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('identity_mfa').select('*').eq('user_id', userId).eq('is_enabled', true); setMethods(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { methods, isLoading, refresh: loadData }
}

export function useIsMFAEnabled(userId?: string) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [methods, setMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('identity_mfa').select('*').eq('user_id', userId).eq('is_enabled', true)
      setMethods(data || [])
      setIsEnabled((data?.length || 0) > 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { check() }, [check])
  return { isEnabled, methods, isLoading, recheck: check }
}

export function useIsVerified(userId?: string, verificationType?: string) {
  const [isVerified, setIsVerified] = useState(false)
  const [verification, setVerification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('identity_verifications').select('*').eq('user_id', userId).eq('status', 'verified')
      if (verificationType) query = query.eq('type', verificationType)
      const { data } = await query.order('verified_at', { ascending: false }).limit(1).single()
      setVerification(data)
      setIsVerified(!!data)
    } finally { setIsLoading(false) }
  }, [userId, verificationType])
  useEffect(() => { check() }, [check])
  return { isVerified, verification, isLoading, recheck: check }
}
