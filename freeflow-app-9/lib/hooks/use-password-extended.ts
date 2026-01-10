'use client'

/**
 * Extended Password Hooks - Covers all Password-related tables
 * Tables: password_history, password_reset_tokens
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePasswordHistory(userId?: string, limit?: number) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('password_history').select('id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 10)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePasswordResetTokens(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('password_reset_tokens').select('id, email, created_at, expires_at, is_used, used_at').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePasswordResetToken(token?: string) {
  const [tokenData, setTokenData] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const validate = useCallback(async () => {
    if (!token) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('password_reset_tokens').select('*').eq('token', token).eq('is_used', false).single()
      if (data && new Date(data.expires_at) > new Date()) {
        setTokenData({ userId: data.user_id, email: data.email, expiresAt: data.expires_at })
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    } finally { setIsLoading(false) }
  }, [token])
  useEffect(() => { validate() }, [validate])
  return { tokenData, isValid, isLoading, revalidate: validate }
}

export function usePasswordStrength() {
  const [strength, setStrength] = useState<{ score: number; label: string; suggestions: string[] }>({ score: 0, label: 'Weak', suggestions: [] })
  const checkStrength = useCallback((password: string) => {
    let score = 0
    const suggestions: string[] = []
    if (password.length >= 8) score += 1
    else suggestions.push('Use at least 8 characters')
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
    else suggestions.push('Mix uppercase and lowercase letters')
    if (/\d/.test(password)) score += 1
    else suggestions.push('Add numbers')
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else suggestions.push('Add special characters')
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    setStrength({ score, label: labels[Math.min(score, 4)], suggestions })
    return { score, label: labels[Math.min(score, 4)], suggestions }
  }, [])
  return { strength, checkStrength }
}

export function usePasswordLastChanged(userId?: string) {
  const [lastChanged, setLastChanged] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('password_history').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
      setLastChanged(data?.created_at || null)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { lastChanged, isLoading, refresh: fetch }
}
