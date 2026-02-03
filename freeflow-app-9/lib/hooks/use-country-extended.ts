'use client'

/**
 * Extended Country Hooks - Covers all Country-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCountry(countryId?: string) {
  const [country, setCountry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!countryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('countries').select('*').eq('id', countryId).single()
      setCountry(data)
    } finally { setIsLoading(false) }
  }, [countryId])
  useEffect(() => { loadData() }, [loadData])
  return { country, isLoading, refresh: loadData }
}

export function useCountries(options?: { continent?: string; region?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('countries').select('*')
      if (options?.continent) query = query.eq('continent', options.continent)
      if (options?.region) query = query.eq('region', options.region)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.continent, options?.region, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCountryStates(countryCode?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!countryCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('country_states').select('*').eq('country_code', countryCode).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [countryCode])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCountryCities(countryCode?: string, stateCode?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!countryCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('country_cities').select('*').eq('country_code', countryCode)
      if (stateCode) query = query.eq('state_code', stateCode)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [countryCode, stateCode])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCountrySearch(searchTerm: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('countries').select('*').or(`name.ilike.%${searchTerm}%,native_name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`).eq('is_active', true).order('name', { ascending: true }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [searchTerm])
  useEffect(() => { const timer = setTimeout(search, 300); return () => clearTimeout(timer) }, [search])
  return { data, isLoading }
}
