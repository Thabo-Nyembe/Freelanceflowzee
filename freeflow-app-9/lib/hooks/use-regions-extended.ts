'use client'

/**
 * Extended Regions Hooks
 * Tables: regions, region_settings, region_languages, region_currencies, region_taxes, region_shipping
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRegion(regionId?: string) {
  const [region, setRegion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*), region_taxes(*), region_shipping(*)').eq('id', regionId).single(); setRegion(data) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { region, isLoading, refresh: fetch }
}

export function useRegions(options?: { country_code?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('regions').select('*, region_currencies(*), region_languages(*)')
      if (options?.country_code) query = query.eq('country_code', options.country_code)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.country_code, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { regions, isLoading, refresh: fetch }
}

export function useRegionByCode(code?: string) {
  const [region, setRegion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*)').eq('code', code.toUpperCase()).single(); setRegion(data) } finally { setIsLoading(false) }
  }, [code, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { region, isLoading, refresh: fetch }
}

export function useRegionLanguages(regionId?: string) {
  const [languages, setLanguages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_languages').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); setLanguages(data || []) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { languages, isLoading, refresh: fetch }
}

export function useRegionCurrencies(regionId?: string) {
  const [currencies, setCurrencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_currencies').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); setCurrencies(data || []) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { currencies, isLoading, refresh: fetch }
}

export function useRegionTaxes(regionId?: string) {
  const [taxes, setTaxes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_taxes').select('*').eq('region_id', regionId).order('name', { ascending: true }); setTaxes(data || []) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { taxes, isLoading, refresh: fetch }
}

export function useRegionShipping(regionId?: string) {
  const [shipping, setShipping] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_shipping').select('*').eq('region_id', regionId).order('name', { ascending: true }); setShipping(data || []) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shipping, isLoading, refresh: fetch }
}

export function useRegionSettings(regionId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_settings').select('*').eq('region_id', regionId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [regionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useActiveRegions() {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('regions').select('*').eq('is_active', true).order('name', { ascending: true })
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { regions, isLoading, refresh: fetch }
}

export function useRegionsByCountry(countryCode?: string) {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!countryCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('regions').select('*').eq('country_code', countryCode).eq('is_active', true).order('name', { ascending: true })
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [countryCode, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { regions, isLoading, refresh: fetch }
}

export function useAllCurrencies() {
  const [currencies, setCurrencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('region_currencies').select('*, regions(*)').order('currency_code', { ascending: true })
      const unique = [...new Map(data?.map(c => [c.currency_code, c])).values()]
      setCurrencies(unique || [])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { currencies, isLoading, refresh: fetch }
}
