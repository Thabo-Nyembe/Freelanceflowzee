'use client'

/**
 * Extended Trusted/Security Hooks - Covers all Trusted Device & Two-Factor tables
 * Tables: trusted_devices, two_factor_backup_codes, secure_file_deliveries
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrustedDevice(deviceId?: string) {
  const [device, setDevice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!deviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('trusted_devices').select('*').eq('id', deviceId).single()
      setDevice(data)
    } finally { setIsLoading(false) }
  }, [deviceId])
  useEffect(() => { fetch() }, [fetch])
  return { device, isLoading, refresh: fetch }
}

export function useTrustedDevices(userId?: string, options?: { onlyActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('trusted_devices').select('*').eq('user_id', userId)
      if (options?.onlyActive) query = query.eq('is_trusted', true)
      const { data: result } = await query.order('last_used_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.onlyActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDeviceTrustCheck(userId?: string, deviceFingerprint?: string) {
  const [isTrusted, setIsTrusted] = useState(false)
  const [device, setDevice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !deviceFingerprint) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('trusted_devices').select('*').eq('user_id', userId).eq('device_fingerprint', deviceFingerprint).eq('is_trusted', true).single()
      setIsTrusted(!!data)
      setDevice(data)
    } finally { setIsLoading(false) }
  }, [userId, deviceFingerprint, supabase])
  useEffect(() => { check() }, [check])
  return { isTrusted, device, isLoading, recheck: check }
}

export function useTwoFactorBackupCodesCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('two_factor_backup_codes').select('id').eq('user_id', userId).eq('is_used', false)
      setCount(data?.length || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useSecureFileDelivery(deliveryId?: string) {
  const [delivery, setDelivery] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!deliveryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).single()
      setDelivery(data)
    } finally { setIsLoading(false) }
  }, [deliveryId])
  useEffect(() => { fetch() }, [fetch])
  return { delivery, isLoading, refresh: fetch }
}

export function useSecureFileDeliveries(userId?: string, options?: { isActive?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('secure_file_deliveries').select('*').eq('sender_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSecureDeliveryValidation(deliveryId?: string, accessCode?: string) {
  const [isValid, setIsValid] = useState(false)
  const [delivery, setDelivery] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const validate = useCallback(async () => {
    if (!deliveryId || !accessCode) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).eq('access_code', accessCode).eq('is_active', true).single()
      if (!data) { setError('Invalid access code or delivery not found'); setIsValid(false); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setError('Delivery has expired'); setIsValid(false); return }
      if (data.max_downloads && data.download_count >= data.max_downloads) { setError('Maximum downloads reached'); setIsValid(false); return }
      setDelivery(data)
      setIsValid(true)
    } finally { setIsLoading(false) }
  }, [deliveryId, accessCode, supabase])
  useEffect(() => { validate() }, [validate])
  return { isValid, delivery, error, isLoading, revalidate: validate }
}

export function useCurrentDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  useEffect(() => {
    const generateFingerprint = () => {
      const nav = window.navigator
      const screen = window.screen
      const components = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!nav.cookieEnabled,
        nav.hardwareConcurrency || 'unknown'
      ]
      const hash = components.join('|').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
      setFingerprint(Math.abs(hash).toString(36))
    }
    generateFingerprint()
  }, [])
  return fingerprint
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<{ browser: string; os: string; deviceType: string } | null>(null)
  useEffect(() => {
    const ua = window.navigator.userAgent
    let browser = 'Unknown'
    let os = 'Unknown'
    let deviceType = 'desktop'
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) { os = 'Android'; deviceType = 'mobile' }
    else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; deviceType = ua.includes('iPad') ? 'tablet' : 'mobile' }
    setDeviceInfo({ browser, os, deviceType })
  }, [])
  return deviceInfo
}
