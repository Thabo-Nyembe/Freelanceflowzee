'use client'

/**
 * Extended Micro Hooks
 * Tables: microservices, micro_deployments, micro_endpoints, micro_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMicroservice(serviceId?: string) {
  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('microservices').select('*').eq('id', serviceId).single(); setService(data) } finally { setIsLoading(false) }
  }, [serviceId])
  useEffect(() => { fetch() }, [fetch])
  return { service, isLoading, refresh: fetch }
}

export function useMicroservices(options?: { type?: string; status?: string; limit?: number }) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('microservices').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setServices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useMicroDeployments(serviceId?: string, options?: { status?: string; limit?: number }) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('micro_deployments').select('*').eq('service_id', serviceId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('deployed_at', { ascending: false }).limit(options?.limit || 20)
      setDeployments(data || [])
    } finally { setIsLoading(false) }
  }, [serviceId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { deployments, isLoading, refresh: fetch }
}

export function useMicroEndpoints(serviceId?: string) {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('micro_endpoints').select('*').eq('service_id', serviceId).order('path', { ascending: true }); setEndpoints(data || []) } finally { setIsLoading(false) }
  }, [serviceId])
  useEffect(() => { fetch() }, [fetch])
  return { endpoints, isLoading, refresh: fetch }
}

export function useMicroLogs(serviceId?: string, options?: { level?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('micro_logs').select('*').eq('service_id', serviceId)
      if (options?.level) query = query.eq('level', options.level)
      const { data } = await query.order('timestamp', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [serviceId, options?.level, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useRunningMicroservices() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('microservices').select('*').eq('status', 'running').order('name', { ascending: true }); setServices(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}
