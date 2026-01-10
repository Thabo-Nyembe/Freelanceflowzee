'use client'

/**
 * Extended Account Hooks - Covers all Account-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAccount(accountId?: string) {
  const [account, setAccount] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('accounts').select('*').eq('id', accountId).single()
      setAccount(data)
    } finally { setIsLoading(false) }
  }, [accountId])
  useEffect(() => { fetch() }, [fetch])
  return { account, isLoading, refresh: fetch }
}

export function useAccounts(options?: { accountType?: string; status?: string; ownerId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('accounts').select('*')
      if (options?.accountType) query = query.eq('account_type', options.accountType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.ownerId) query = query.eq('owner_id', options.ownerId)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.accountType, options?.status, options?.ownerId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAccountContacts(accountId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('account_contacts').select('*').eq('account_id', accountId).order('is_primary', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [accountId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAccountNotes(accountId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('account_notes').select('*, users(id, full_name, avatar_url)').eq('account_id', accountId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [accountId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAccountActivities(accountId?: string, limit = 50) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('account_activities').select('*, users(id, full_name, avatar_url)').eq('account_id', accountId).order('created_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [accountId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
