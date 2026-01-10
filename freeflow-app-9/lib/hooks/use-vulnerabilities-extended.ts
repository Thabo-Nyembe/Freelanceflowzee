'use client'

/**
 * Extended Vulnerabilities Hooks
 * Tables: vulnerabilities, vulnerability_scans, vulnerability_fixes, vulnerability_reports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVulnerability(vulnerabilityId?: string) {
  const [vulnerability, setVulnerability] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vulnerabilityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vulnerabilities').select('*').eq('id', vulnerabilityId).single(); setVulnerability(data) } finally { setIsLoading(false) }
  }, [vulnerabilityId])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerability, isLoading, refresh: fetch }
}

export function useVulnerabilities(options?: { severity?: string; status?: string; affected_component?: string; limit?: number }) {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vulnerabilities').select('*')
      if (options?.severity) query = query.eq('severity', options.severity)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.affected_component) query = query.eq('affected_component', options.affected_component)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setVulnerabilities(data || [])
    } finally { setIsLoading(false) }
  }, [options?.severity, options?.status, options?.affected_component, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerabilities, isLoading, refresh: fetch }
}

export function useVulnerabilityScans(options?: { status?: string; limit?: number }) {
  const [scans, setScans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('vulnerability_scans').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setScans(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { scans, isLoading, refresh: fetch }
}

export function useVulnerabilityFixes(vulnerabilityId?: string) {
  const [fixes, setFixes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vulnerabilityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('vulnerability_fixes').select('*').eq('vulnerability_id', vulnerabilityId).order('created_at', { ascending: false }); setFixes(data || []) } finally { setIsLoading(false) }
  }, [vulnerabilityId])
  useEffect(() => { fetch() }, [fetch])
  return { fixes, isLoading, refresh: fetch }
}

export function useOpenVulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('vulnerabilities').select('*').eq('status', 'open').order('severity', { ascending: false }); setVulnerabilities(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerabilities, isLoading, refresh: fetch }
}

export function useCriticalVulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('vulnerabilities').select('*').in('severity', ['critical', 'high']).eq('status', 'open').order('created_at', { ascending: false }); setVulnerabilities(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerabilities, isLoading, refresh: fetch }
}
