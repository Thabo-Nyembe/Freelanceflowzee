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
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*), region_taxes(*), region_shipping(*)').eq('id', regionId).single(); setRegion(data) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { region, isLoading, refresh: loadData }
}

export function useRegions(options?: { country_code?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('regions').select('*, region_currencies(*), region_languages(*)')
      if (options?.country_code) query = query.eq('country_code', options.country_code)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.country_code, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { regions, isLoading, refresh: loadData }
}

export function useRegionByCode(code?: string) {
  const [region, setRegion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*)').eq('code', code.toUpperCase()).single(); setRegion(data) } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { loadData() }, [loadData])
  return { region, isLoading, refresh: loadData }
}

export function useRegionLanguages(regionId?: string) {
  const [languages, setLanguages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_languages').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); setLanguages(data || []) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { languages, isLoading, refresh: loadData }
}

export function useRegionCurrencies(regionId?: string) {
  const [currencies, setCurrencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_currencies').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); setCurrencies(data || []) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { currencies, isLoading, refresh: loadData }
}

export function useRegionTaxes(regionId?: string) {
  const [taxes, setTaxes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_taxes').select('*').eq('region_id', regionId).order('name', { ascending: true }); setTaxes(data || []) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { taxes, isLoading, refresh: loadData }
}

export function useRegionShipping(regionId?: string) {
  const [shipping, setShipping] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_shipping').select('*').eq('region_id', regionId).order('name', { ascending: true }); setShipping(data || []) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { shipping, isLoading, refresh: loadData }
}

export function useRegionSettings(regionId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!regionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('region_settings').select('*').eq('region_id', regionId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [regionId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useActiveRegions() {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('regions').select('*').eq('is_active', true).order('name', { ascending: true })
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { regions, isLoading, refresh: loadData }
}

export function useRegionsByCountry(countryCode?: string) {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!countryCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('regions').select('*').eq('country_code', countryCode).eq('is_active', true).order('name', { ascending: true })
      setRegions(data || [])
    } finally { setIsLoading(false) }
  }, [countryCode])
  useEffect(() => { loadData() }, [loadData])
  return { regions, isLoading, refresh: loadData }
}

export function useAllCurrencies() {
  const [currencies, setCurrencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('region_currencies').select('*, regions(*)').order('currency_code', { ascending: true })
      const unique = [...new Map(data?.map(c => [c.currency_code, c])).values()]
      setCurrencies(unique || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { currencies, isLoading, refresh: loadData }
}
