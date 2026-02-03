'use client'

/**
 * Extended Address Hooks - Covers all Address-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAddresses(userId?: string, addressType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('addresses').select('*').order('is_default', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (addressType) query = query.eq('address_type', addressType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, addressType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDefaultAddress(userId?: string, addressType?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('addresses').select('*').eq('user_id', userId).eq('is_default', true)
      if (addressType) query = query.eq('address_type', addressType)
      const { data: result } = await query.single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [userId, addressType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCountries() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('countries').select('*').eq('is_active', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useStates(countryCode?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('states').select('*').order('name', { ascending: true })
      if (countryCode) query = query.eq('country_code', countryCode)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [countryCode])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
