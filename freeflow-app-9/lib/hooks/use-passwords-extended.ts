'use client'

/**
 * Extended Passwords Hooks
 * Tables: password_resets, password_history, password_policies, password_requirements
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePasswordPolicy(organizationId?: string) {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('password_policies').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      else query = query.is('organization_id', null)
      const { data } = await query.single()
      setPolicy(data || {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: false,
        max_age_days: 90,
        history_count: 5
      })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { policy, isLoading, refresh: fetch }
}

export function usePasswordHistory(userId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('password_history').select('id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 10); setHistory(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePasswordReset(token?: string) {
  const [resetData, setResetData] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!token) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('password_resets').select('*').eq('token', token).eq('status', 'pending').single()
      if (data && new Date(data.expires_at) > new Date()) {
        setResetData(data)
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    } finally { setIsLoading(false) }
  }, [token])
  useEffect(() => { fetch() }, [fetch])
  return { resetData, isValid, isLoading, refresh: fetch }
}

export function usePendingResets(options?: { limit?: number }) {
  const [resets, setResets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('password_resets').select('*').eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(options?.limit || 50); setResets(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { resets, isLoading, refresh: fetch }
}

export function usePasswordRequirements(organizationId?: string) {
  const [requirements, setRequirements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('password_requirements').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('priority', { ascending: true })
      setRequirements(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { requirements, isLoading, refresh: fetch }
}

export function usePasswordValidation(password: string, policy?: any) {
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[]; strength: number }>({ isValid: false, errors: [], strength: 0 })

  useEffect(() => {
    const errors: string[] = []
    let strength = 0
    const p = policy || { min_length: 8, require_uppercase: true, require_lowercase: true, require_number: true, require_special: false }

    if (password.length >= (p.min_length || 8)) strength += 20; else errors.push(`Must be at least ${p.min_length || 8} characters`)
    if (p.max_length && password.length > p.max_length) errors.push(`Must be at most ${p.max_length} characters`)
    if (/[A-Z]/.test(password)) strength += 20; else if (p.require_uppercase) errors.push('Must contain uppercase letter')
    if (/[a-z]/.test(password)) strength += 20; else if (p.require_lowercase) errors.push('Must contain lowercase letter')
    if (/[0-9]/.test(password)) strength += 20; else if (p.require_number) errors.push('Must contain number')
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20; else if (p.require_special) errors.push('Must contain special character')

    setValidation({ isValid: errors.length === 0, errors, strength: Math.min(strength, 100) })
  }, [password, policy])

  return validation
}

export function useUserResetRequests(email?: string) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('password_resets').select('*').eq('email', email).order('created_at', { ascending: false }).limit(10); setRequests(data || []) } finally { setIsLoading(false) }
  }, [email])
  useEffect(() => { fetch() }, [fetch])
  return { requests, isLoading, refresh: fetch }
}

export function usePasswordExpiry(userId?: string, policy?: any) {
  const [expiryInfo, setExpiryInfo] = useState<{ isExpired: boolean; daysUntilExpiry: number; lastChanged: string | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('password_history').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
      const maxAgeDays = policy?.max_age_days || 90
      if (data) {
        const lastChanged = new Date(data.created_at)
        const expiryDate = new Date(lastChanged.getTime() + maxAgeDays * 24 * 60 * 60 * 1000)
        const now = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        setExpiryInfo({
          isExpired: daysUntilExpiry <= 0,
          daysUntilExpiry: Math.max(0, daysUntilExpiry),
          lastChanged: data.created_at
        })
      } else {
        setExpiryInfo({ isExpired: false, daysUntilExpiry: maxAgeDays, lastChanged: null })
      }
    } finally { setIsLoading(false) }
  }, [userId, policy, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { expiryInfo, isLoading, refresh: fetch }
}
