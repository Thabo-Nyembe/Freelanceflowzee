'use client'

/**
 * Extended Licenses Hooks
 * Tables: licenses, license_keys, license_activations, license_types, license_renewals
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLicense(licenseId?: string) {
  const [license, setLicense] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!licenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('licenses').select('*, license_types(*), license_activations(*)').eq('id', licenseId).single(); setLicense(data) } finally { setIsLoading(false) }
  }, [licenseId])
  useEffect(() => { loadData() }, [loadData])
  return { license, isLoading, refresh: loadData }
}

export function useUserLicenses(userId?: string, options?: { status?: string; product_id?: string }) {
  const [licenses, setLicenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('licenses').select('*, license_types(*), license_activations(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.product_id) query = query.eq('product_id', options.product_id)
      const { data } = await query.order('created_at', { ascending: false })
      setLicenses(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.product_id])
  useEffect(() => { loadData() }, [loadData])
  return { licenses, isLoading, refresh: loadData }
}

export function useLicenseActivations(licenseId?: string) {
  const [activations, setActivations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!licenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('license_activations').select('*').eq('license_id', licenseId).order('activated_at', { ascending: false }); setActivations(data || []) } finally { setIsLoading(false) }
  }, [licenseId])
  useEffect(() => { loadData() }, [loadData])
  return { activations, isLoading, refresh: loadData }
}

export function useLicenseTypes() {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('license_types').select('*').order('name', { ascending: true }); setTypes(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useLicenseValidation(licenseKey?: string) {
  const [validation, setValidation] = useState<{ isValid: boolean; license: any } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const validate = useCallback(async () => {
    if (!licenseKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('licenses').select('*, license_types(*)').eq('license_key', licenseKey).single()
      if (data) {
        const isValid = data.status === 'active' && (!data.expires_at || new Date(data.expires_at) > new Date())
        setValidation({ isValid, license: data })
      } else {
        setValidation({ isValid: false, license: null })
      }
    } finally { setIsLoading(false) }
  }, [licenseKey])
  useEffect(() => { validate() }, [validate])
  return { validation, isLoading, revalidate: validate }
}

export function useActiveLicenses(userId?: string) {
  const [licenses, setLicenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('licenses').select('*, license_types(*)').eq('user_id', userId).eq('status', 'active').order('expires_at', { ascending: true }); setLicenses(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { licenses, isLoading, refresh: loadData }
}

export function useExpiringLicenses(userId?: string, options?: { days?: number }) {
  const [licenses, setLicenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const daysAhead = options?.days || 30
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + daysAhead)
      const { data } = await supabase.from('licenses').select('*, license_types(*)').eq('user_id', userId).eq('status', 'active').lte('expires_at', futureDate.toISOString()).gte('expires_at', new Date().toISOString()).order('expires_at', { ascending: true })
      setLicenses(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.days])
  useEffect(() => { loadData() }, [loadData])
  return { licenses, isLoading, refresh: loadData }
}

export function useLicenseRenewals(licenseId?: string) {
  const [renewals, setRenewals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!licenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('license_renewals').select('*').eq('license_id', licenseId).order('renewed_at', { ascending: false }); setRenewals(data || []) } finally { setIsLoading(false) }
  }, [licenseId])
  useEffect(() => { loadData() }, [loadData])
  return { renewals, isLoading, refresh: loadData }
}
